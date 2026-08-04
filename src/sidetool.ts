import { t } from "./l10n"
import { SIDETOOL_ID } from "./constants"
import {
  aiConfigured,
  chatHasUserMessages,
  chatTitle,
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

/** 类型化的 React（window.React 运行时是全局注入的 React 18） */
const React = window.React as typeof import("react")

let registered = false

/** 注册侧工具条按钮（新对话 + 历史浮层），仅出现在 AI 对话面板 */
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

/** 按钮只渲染在“当前面板显示 AI 对话”时 */
function renderSidetool(
  rootBlockId: number,
  panelId: string,
): React.ReactElement | null {
  const current = getAIChatBlock(rootBlockId)
  if (current == null) return null
  return React.createElement(ChatSidetool, {
    rootBlockId,
    panelId,
    currentBlockId: current.id,
  })
}

function ChatSidetool(props: {
  rootBlockId: number
  panelId: string
  currentBlockId: number
}): React.ReactElement {
  const h = React.createElement
  const { Button, Tooltip } = orca.components
  const [historyOpen, setHistoryOpen] = React.useState(false)
  const historyBtnRef = React.useRef<any>(null)

  const rootBlockId = props.rootBlockId
  const panelId = props.panelId

  const current = getAIChatBlock(rootBlockId)

  const mainButton = h(
    Button,
    {
      className: "orca-block-editor-sidetools-btn",
      variant: "plain",
      onClick: (e: { shiftKey?: boolean }) => {
        void onMainClick(rootBlockId, panelId, !!e?.shiftKey)
      },
      onContextMenu: (e: { preventDefault?: () => void }) => {
        e?.preventDefault?.()
        void onNewChatClick(rootBlockId, panelId, false)
      },
    },
    h("i", { className: "ti ti-message-chatbot" }),
  )

  const historyButton = h(
    Button,
    {
      className: "orca-block-editor-sidetools-btn orca-aio-history-btn",
      variant: "plain",
      onClick: (e: { stopPropagation?: () => void }) => {
        e?.stopPropagation?.()
        setHistoryOpen((v: boolean) => !v)
      },
    },
    h("i", { className: "ti ti-history" }),
  )

  const mainTooltip = h(
    Tooltip,
    {
      text: `${t("Open last conversation")}\n${t("Right click")}: ${t("New conversation")}\nShift+${t("Open on the side")}`,
      placement: "horizontal",
    },
    mainButton,
  )

  const historyTooltip = h(
    Tooltip,
    {
      text: t("Conversation history"),
      placement: "horizontal",
    },
    h(
      "span",
      { ref: historyBtnRef, style: { display: "inline-flex" } },
      historyButton,
    ),
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
    historyTooltip,
    historyOpen
      ? h(HistoryOverlay, {
          rootBlockId,
          panelId,
          anchorEl: historyBtnRef,
          onClose: () => setHistoryOpen(false),
          onNewChat: () => {
            setHistoryOpen(false)
            void onNewChatClick(rootBlockId, panelId, false)
          },
        })
      : null,
  )
}

/** 主按钮：打开该面板上次唤起的对话；无历史/失效则新建 */
async function onMainClick(
  rootBlockId: number,
  panelId: string,
  openOnSide: boolean,
): Promise<void> {
  const panel = resolvePanel(panelId)
  if (panel == null) return

  // 历史键 = 当前视图所属文档（aichat 用 ctx[0]，普通块用自身）
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
    openChat(liveEntry.blockId, panel.id, openOnSide)
    return
  }
  await onNewChatClick(rootBlockId, panelId, openOnSide)
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

/** 快速新建对话（当前面板替换）；右键/历史浮层入口触发 */
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

/** 历史浮层：自绘 fixed 定位，挂载到 body，避免 Popup 组件在侧工具条内失效 */
function HistoryOverlay(props: {
  rootBlockId: number
  panelId: string
  anchorEl: React.RefObject<any>
  onClose: () => void
  onNewChat: () => void
}): React.ReactElement {
  const h = React.createElement
  const [entries, setEntries] = React.useState<ChatHistoryEntry[] | null>(null)
  const [search, setSearch] = React.useState("")
  const [pos, setPos] = React.useState({ left: 0, top: 0 })
  const wrapRef = React.useRef<HTMLDivElement>(null)

  const current = getAIChatBlock(props.rootBlockId)
  const ctx = current != null ? getRepr(current)?.ctx : undefined
  const historyKey =
    current != null && Array.isArray(ctx) && ctx.length > 0
      ? Number(ctx[0])
      : props.rootBlockId

  React.useEffect(() => {
    const el = props.anchorEl.current
    if (el != null) {
      const r = el.getBoundingClientRect()
      const w = 300
      let left = r.right + 6
      if (left + w > window.innerWidth - 8) left = r.left - w - 6
      setPos({ left, top: r.top })
    }
  }, [props.anchorEl])

  React.useEffect(() => {
    let cancelled = false
    void (async () => {
      const history = getHistory(historyKey)
      const live: ChatHistoryEntry[] = []
      for (const entry of history) {
        try {
          const block = await orca.invokeBackend("get-block", entry.blockId)
          if (block == null) continue
          orca.state.blocks[block.id] = block
          const info = chatInfoFromBlock(block)
          if (info != null) {
            live.push({
              ...entry,
              title: info.title || entry.title || t("Untitled"),
            })
          }
        } catch {
          continue
        }
      }
      if (!cancelled) setEntries(live)
    })()
    return () => {
      cancelled = true
    }
  }, [historyKey])

  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (
        wrapRef.current != null &&
        !wrapRef.current.contains(e.target as Node) &&
        props.anchorEl.current != null &&
        !props.anchorEl.current.contains(e.target as Node)
      ) {
        props.onClose()
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose()
    }
    document.addEventListener("mousedown", onDown, true)
    document.addEventListener("keydown", onKey, true)
    return () => {
      document.removeEventListener("mousedown", onDown, true)
      document.removeEventListener("keydown", onKey, true)
    }
  }, [props])

  const query = search.trim().toLowerCase()
  const visible = (entries ?? []).filter(
    (e) => !query || (e.title ?? "").toLowerCase().includes(query),
  )

  const list = h(
    "div",
    { className: "orca-aio-history-list" },
    entries == null
      ? h("div", { className: "orca-aio-history-empty" }, t("Loading…"))
      : visible.length === 0
        ? h(
            "div",
            { className: "orca-aio-history-empty" },
            t("No conversations yet"),
          )
        : visible.map((entry) =>
            h(
              "div",
              {
                key: entry.blockId,
                className: "orca-aio-history-item",
                onClick: () => {
                  registerOpenedChat(
                    historyKey,
                    entry.blockId,
                    entry.title,
                  )
                  openChat(entry.blockId, props.panelId, false)
                  props.onClose()
                },
              },
              h(
                "span",
                { className: "orca-aio-history-item-title" },
                entry.title || t("Untitled"),
              ),
              h(
                "span",
                { className: "orca-aio-history-item-time" },
                formatShortTime(entry.openedAt),
              ),
            ),
          ),
  )

  return h(
    "div",
    {
      ref: wrapRef,
      className: "orca-aio-history-pop",
      style: { position: "fixed", left: pos.left, top: pos.top, zIndex: 99999 },
    },
    h(
      "div",
      {
        className: "orca-aio-history-item",
        onClick: () => props.onNewChat(),
      },
      h("i", { className: "ti ti-plus", style: { marginRight: "4px" } }),
      h(
        "span",
        { className: "orca-aio-history-item-title" },
        t("New conversation"),
      ),
    ),
    h("input", {
      className: "orca-aio-history-search",
      placeholder: t("Search conversations"),
      value: search,
      onChange: (e: { target: { value: string } }) => setSearch(e.target.value),
    }),
    list,
  )
}

function formatShortTime(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
