import { t } from "./l10n"
import { SETTING_OPEN_LAST_ON_SIDE, SIDETOOL_ID } from "./constants"
import {
  aiConfigured,
  chatHasUserMessages,
  createNewChatBlock,
  getAIChatBlock,
  getRepr,
  notifyAIUnconfigured,
  openChat,
  pluginSetting,
  resolvePanel,
} from "./core"
import {
  getHistory,
  registerOpenedChat,
  type ChatHistoryEntry,
} from "./history"
import { chatInfoFromBlock } from "./data"
import { openManagerWithSource } from "./manager"

/** 类型化的 React（window.React 运行时是全局注入的 React 18） */
const React = window.React as typeof import("react")

let registered = false

/** 注册侧工具条按钮：所有面板显示「打开上次对话」，AI 对话面板另有管理入口 */
export function registerSidetool(): void {
  if (registered) return
  if (orca.state.editorSidetools?.[SIDETOOL_ID] == null) {
    orca.editorSidetools.registerEditorSidetool(SIDETOOL_ID, {
      render: renderSidetool,
    })
  }
  registered = true
}

export function unregisterSidetool(): void {
  if (orca.state.editorSidetools?.[SIDETOOL_ID] != null) {
    orca.editorSidetools.unregisterEditorSidetool(SIDETOOL_ID)
  }
  registered = false
}

function renderSidetool(
  rootBlockId: number,
  panelId: string,
): React.ReactElement | null {
  return React.createElement(ChatSidetool, {
    rootBlockId,
    panelId,
  })
}

function ChatSidetool(props: {
  rootBlockId: number
  panelId: string
}): React.ReactElement {
  const h = React.createElement
  const { Button, Tooltip } = orca.components

  const rootBlockId = props.rootBlockId
  const panelId = props.panelId
  const current = getAIChatBlock(rootBlockId)
  // 当前视图的来源文档：AI 对话取 ctx[0]，普通文档取自身
  const ctx = current != null ? getRepr(current)?.ctx : undefined
  const historyKey =
    current != null && Array.isArray(ctx) && ctx.length > 0
      ? Number(ctx[0])
      : rootBlockId

  const mainButton = h(
    Button,
    {
      className: "orca-block-editor-sidetools-btn",
      variant: "plain",
      title: t("Open last conversation"),
      onClick: (e: { shiftKey?: boolean }) => {
        void onMainClick(rootBlockId, panelId, !!e?.shiftKey)
      },
    },
    h("i", { className: "ti ti-message-chatbot" }),
  )

  // 管理入口：所有面板显示，拉起管理面板并自动筛选当前来源文档
  const managerButton = h(
    Tooltip,
    {
      text: t("Filter conversations of this panel"),
      placement: "horizontal",
    },
    h(
      Button,
      {
        className: "orca-block-editor-sidetools-btn orca-aio-history-btn",
        variant: "plain",
        onClick: (e: { stopPropagation?: () => void }) => {
          e?.stopPropagation?.()
          openManagerWithSource(Number.isFinite(historyKey) ? historyKey : null)
        },
      },
      h("i", { className: "ti ti-history" }),
    ),
  )

  const mainTooltip = h(
    Tooltip,
    {
      text: `${t("Open last conversation")}\nShift+${t("Open on the side")}`,
      placement: "horizontal",
    },
    mainButton,
  )

  return h(
    "span",
    {
      style: {
        position: "relative",
        display: "inline-flex",
        flexDirection: "column",
      },
    },
    mainTooltip,
    managerButton,
  )
}

/** 主按钮：打开该面板（来源文档）上次唤起的对话；无历史/失效则新建 */
async function onMainClick(
  rootBlockId: number,
  panelId: string,
  openOnSide: boolean,
): Promise<void> {
  const panel = resolvePanel(panelId)
  if (panel == null) return

  // 默认侧边打开：Shift 或设置项开启
  const finalSide =
    openOnSide || pluginSetting(SETTING_OPEN_LAST_ON_SIDE) === true

  const current = getAIChatBlock(rootBlockId)
  const ctx = current != null ? getRepr(current)?.ctx : undefined
  const historyKey =
    current != null && Array.isArray(ctx) && ctx.length > 0
      ? Number(ctx[0])
      : rootBlockId

  const history = getHistory(historyKey)
  const liveEntry = await findLiveHistoryEntry(history)
  if (liveEntry != null) {
    registerOpenedChat(historyKey, liveEntry.blockId, liveEntry.title)
    openChat(liveEntry.blockId, panel.id, finalSide)
    return
  }
  await onNewChatClick(rootBlockId, panelId, finalSide)
}

/** 系统命令：打开当前面板（来源文档）上次唤起的 AI 对话 */
export async function openLastInCurrentPanel(): Promise<void> {
  const panel = resolvePanel(undefined)
  if (panel == null) return
  const rootBlockId = Number(panel.viewArgs?.blockId)
  if (!Number.isFinite(rootBlockId)) return
  await onMainClick(
    rootBlockId,
    panel.id,
    pluginSetting(SETTING_OPEN_LAST_ON_SIDE) === true,
  )
}

/** 从历史中找第一条仍存在且有内容的对话 */
async function findLiveHistoryEntry(
  history: ChatHistoryEntry[],
): Promise<ChatHistoryEntry | null> {
  for (const entry of history) {
    try {
      const block = await orca.invokeBackend("get-block", entry.blockId)
      if (block == null) continue
      orca.state.blocks[block.id] = block
      const info = chatInfoFromBlock(block)
      if (info != null && !info.isEmpty) {
        return { ...entry, title: info.title || entry.title }
      }
    } catch {
      continue
    }
  }
  return null
}

/** 新建对话（当前面板替换）：供主按钮兜底、右键、系统命令调用 */
export async function newChatInCurrentPanel(
  panelId?: string,
  openOnSide = false,
): Promise<void> {
  const panel = resolvePanel(panelId)
  if (panel == null) return
  const rootBlockId = Number(panel.viewArgs?.blockId)
  if (!Number.isFinite(rootBlockId)) return
  const current = getAIChatBlock(rootBlockId)
  if (current == null) {
    // 系统命令仅对 AI 对话面板生效
    orca.notify("info", t("AI chat panel only"), {
      title: t("New conversation"),
    })
    return
  }
  await onNewChatClick(rootBlockId, panel.id, openOnSide)
}

/** 新建空对话并在当前面板替换 */
async function onNewChatClick(
  rootBlockId: number,
  panelId: string,
  openOnSide: boolean,
): Promise<void> {
  if (!aiConfigured()) {
    notifyAIUnconfigured()
    return
  }
  const current = getAIChatBlock(rootBlockId)
  if (
    current != null &&
    chatHasUserMessages(current) &&
    pluginSetting("confirmBeforeReplace") !== false
  ) {
    const confirmed = window.confirm(
      `${t("New conversation")}：${t("Replace current")}？`,
    )
    if (!confirmed) return
  }
  const panel = resolvePanel(panelId)
  const ctx =
    current != null && Array.isArray(getRepr(current)?.ctx)
      ? [...getRepr(current)!.ctx!]
      : [rootBlockId]
  const newId = await createNewChatBlock(ctx)
  if (newId == null) {
    orca.notify("error", t("Failed to create conversation"), {
      title: t("New conversation"),
    })
    return
  }
  const historyKey =
    Array.isArray(ctx) && ctx.length > 0 ? Number(ctx[0]) : rootBlockId
  registerOpenedChat(historyKey, newId)
  openChat(newId, panel?.id ?? panelId, openOnSide)
  orca.notify("success", t("New conversation opened"), {
    title: t("New conversation"),
  })
}
