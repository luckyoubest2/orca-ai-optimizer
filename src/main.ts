import type {
  AIChatRepr,
  Block,
  ChatMessage,
  DbId,
  Repr,
  ViewPanel,
} from "./orca.d.ts"

// 插件固定 ID：即插件目录名 / 注册名
let pluginName = "orca-ai-optimizer"

const SIDETOOL_ID = "orcaAiOptimizer.newChat"

// AppKeys（对照安装版 v1.88.0 渲染包确认）
// AIBaseURL=19, AIAPIKey=20, AITag=21, AIModel=22
const KEY_AI_BASE_URL = 19
const KEY_AI_API_KEY = 20
const KEY_AI_TAG = 21
const KEY_AI_MODEL = 22

// 设置键
const SETTING_CONFIRM = "confirmBeforeReplace"
const SETTING_ONLY_ON_CHAT = "showOnlyOnAIChat"

/** 读取块上的 _repr JSON 属性 */
function getRepr(block: Block | undefined): Repr | undefined {
  return block?.properties?.find((p) => p.name === "_repr")?.value
}

/** 块是否为 AI 对话（aichat）块；镜像块会先解出真实块 */
function getAIChatBlock(blockId: DbId | undefined): Block | undefined {
  if (blockId == null) return undefined
  const raw = orca.state.blocks[blockId]
  const repr = getRepr(raw)
  if (repr == null) return undefined
  if (repr.type === "aichat") return raw
  if (repr.type === "mirror") {
    const mirroredId = repr.mirroredId
    const mirrored = mirroredId != null ? orca.state.blocks[mirroredId] : undefined
    return getRepr(mirrored)?.type === "aichat" ? mirrored : undefined
  }
  return undefined
}

/** 对话是否有真实提问（存在 role === "user" 的消息） */
function chatHasUserMessages(chat: Block | undefined): boolean {
  const repr = getRepr(chat) as AIChatRepr | undefined
  if (repr?.type !== "aichat" || !Array.isArray(repr.msgs)) return false
  return repr.msgs.some((m: ChatMessage) => m?.role === "user")
}

/** 查找面板对象；找不到时按当前活动面板兜底 */
function resolvePanel(panelId: string | undefined): ViewPanel | null {
  const id = panelId ?? orca.state.activePanel
  return orca.nav.findViewPanel(id, orca.state.panels)
}

/**
 * 在“当前面板内”打开新对话，替换掉该面板旧视图。
 * 若用户安装了 Orca Pinner 且开启了 AI 面板重定向，pinner 会把 goTo 到
 * aichat 块的调用改成浮动钉住窗口。为保证“替换旧窗口”语义，这里手动复刻应用
 * 内置 goTo 的面板内替换逻辑（修改面板 view/viewArgs 并维护返回历史），
 * 从而绕过任何对 goTo 的全局包装；其余行为与内置导航一致。
 */
function navigateInPanel(
  blockId: DbId,
  panelId: string,
  openOnSide: boolean,
): void {
  if (openOnSide) {
    orca.nav.openInLastPanel("block", { blockId })
    return
  }

  const panel = resolvePanel(panelId)
  if (panel?.locked) {
    // 锁定面板不允许被替换：与内置 Shift+点击一致，在侧边新面板打开
    orca.nav.openInLastPanel("block", { blockId })
    return
  }

  // 复刻内置 goTo：先压入返回历史，再原地替换当前面板视图
  const target = resolvePanel(panelId)
  if (target == null) {
    orca.nav.goTo("block", { blockId }, panelId)
    return
  }
  const nextArgs = { blockId }
  if (
    target.view !== "block" ||
    !shallowEqual(target.viewArgs, nextArgs)
  ) {
    orca.state.panelBackHistory.push({
      activePanel: target.id,
      view: target.view,
      viewArgs: target.viewArgs ?? {},
    })
    target.view = "block"
    target.viewArgs = nextArgs
    target.viewState?.editor && (target.viewState.editor.showMindMap = false)
    if (orca.state.panelForwardHistory.length > 0) {
      orca.state.panelForwardHistory.length = 0
    }
  }
}

/** 浅比较两个普通对象（与内置 equals 在视图参数上的行为一致即可） */
function shallowEqual(
  a: Record<string, any> | undefined,
  b: Record<string, any> | undefined,
): boolean {
  if (a === b) return true
  if (a == null || b == null) return false
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  for (const k of keysA) {
    if (a[k] !== b[k]) return false
  }
  return true
}

/**
 * 新建一个空 AI 对话块并跳转。
 * - 当前视图本身是 AI 对话时，新对话沿用它的 ctx（同一文档上下文），
 *   并在当前面板替换掉旧对话；
 * - 否则以当前根块为 ctx 新建对话（与内置 AI 按钮行为一致）。
 */
async function openNewChat(
  panel: ViewPanel | null,
  rootBlockId: DbId,
  openOnSide: boolean,
): Promise<void> {
  const aiSettingsOk =
    !!orca.state.settings[KEY_AI_BASE_URL] &&
    !!orca.state.settings[KEY_AI_API_KEY] &&
    !!orca.state.settings[KEY_AI_MODEL]
  if (!aiSettingsOk) {
    orca.notify("error", "请先在设置中配置 AI 的 Base URL、API Key 与模型！", {
      title: "新对话",
      action: () => {
        orca.commands.invokeCommand("core.openSettings")
      },
    })
    return
  }

  const current = getAIChatBlock(rootBlockId)
  const currentRepr = current != null ? (getRepr(current) as AIChatRepr) : undefined
  // 沿用旧对话的 ctx；没有旧对话或 ctx 缺失时用当前根块
  const ctx: DbId[] =
    currentRepr?.type === "aichat" && Array.isArray(currentRepr.ctx) &&
    currentRepr.ctx.length > 0
      ? [...currentRepr.ctx]
      : [rootBlockId]

  const aiTag = orca.state.settings[KEY_AI_TAG] || "AI Result"
  let newBlockId: DbId | null = null

  try {
    await orca.commands.invokeGroup(async () => {
      newBlockId = await orca.commands.invokeEditorCommand(
        "core.editor.insertBlock",
        null,
        null,
        null,
        null,
        { type: "aichat", ctx, msgs: [] },
      )
      if (newBlockId != null) {
        await orca.commands.invokeEditorCommand(
          "core.editor.insertTag",
          null,
          newBlockId,
          aiTag,
        )
      }
    })
  } catch (err) {
    console.error("[orca-ai-optimizer] 创建新对话失败", err)
    orca.notify("error", "创建新对话失败，请重试。", { title: "新对话" })
    return
  }

  if (newBlockId == null) {
    orca.notify("error", "创建新对话失败，请重试。", { title: "新对话" })
    return
  }

  if (panel != null) {
    navigateInPanel(newBlockId, panel.id, openOnSide)
  } else {
    // 面板状态异常时退回与内置一致的行为
    if (openOnSide) {
      orca.nav.openInLastPanel("block", { blockId: newBlockId })
    } else {
      orca.nav.goTo("block", { blockId: newBlockId })
    }
  }

  orca.notify("success", "已打开新的 AI 对话窗口。", { title: "新对话" })
}

function handleClick(
  rootBlockId: DbId,
  panelId: string,
  event: { shiftKey?: boolean } | null,
): void {
  const panel = resolvePanel(panelId)
  const openOnSide = !!event?.shiftKey

  const current = getAIChatBlock(rootBlockId)
  const replacingExistingChat =
    current != null && chatHasUserMessages(current)

  const proceed = () => {
    void openNewChat(panel, rootBlockId, openOnSide)
  }

  if (replacingExistingChat) {
    const pluginSettings = orca.state.plugins[pluginName]?.settings
    if (pluginSettings?.[SETTING_CONFIRM] !== false) {
      const confirmed = window.confirm(
        "当前面板正在显示一段 AI 对话，确定要新建对话并替换掉当前窗口吗？（旧对话内容仍保留在文档中）",
      )
      if (!confirmed) return
    }
  }
  proceed()
}

function renderNewChatTool(
  rootBlockId: DbId,
  panelId: string,
): React.ReactElement | null {
  const current = getAIChatBlock(rootBlockId)
  const pluginSettings = orca.state.plugins[pluginName]?.settings
  if (pluginSettings?.[SETTING_ONLY_ON_CHAT] !== false && current == null) {
    return null
  }

  const h = window.React.createElement
  const { Button, Tooltip } = orca.components
  const hasHistory = chatHasUserMessages(current)

  const icon = h(
    "span",
    {
      className: "orca-ai-optimizer-newchat-icon",
      style: { position: "relative", display: "inline-flex" },
    },
    h("i", { className: "ti ti-message-chatbot" }),
    h(
      "span",
      {
        className: "orca-ai-optimizer-newchat-badge",
        style: {
          position: "absolute",
          right: "-4px",
          top: "-5px",
          fontSize: "9px",
          fontWeight: 700,
          lineHeight: 1,
          color: "var(--orca-color-primary-5, #3b82f6)",
          background: "var(--orca-color-canvas, #fff)",
          borderRadius: "6px",
          padding: "1px 2px",
          border: "1px solid currentColor",
        },
      },
      "+",
    ),
  )

  const button = h(
    Button,
    {
      className: "orca-block-editor-sidetools-btn",
      variant: "plain",
      onClick: (e: { shiftKey?: boolean }) => {
        handleClick(rootBlockId, panelId, e)
      },
    },
    icon,
  )

  return h(
    Tooltip,
    {
      text: hasHistory
        ? "新对话（替换当前对话）\nShift+点击在侧边打开"
        : "新对话\nShift+点击在侧边打开",
      placement: "horizontal",
    },
    button,
  )
}

export async function load(name: string): Promise<void> {
  pluginName = name

  await orca.plugins.setSettingsSchema(name, {
    [SETTING_CONFIRM]: {
      label: "替换有内容的对话前先确认",
      description:
        "开启时，若当前面板正在显示已有提问的 AI 对话，点击“新对话”会先弹出确认框，避免误触丢失上下文。",
      type: "boolean",
      defaultValue: true,
    },
    [SETTING_ONLY_ON_CHAT]: {
      label: "仅当当前面板显示 AI 对话时显示按钮",
      description:
        "开启后按钮只在 AI 对话窗口出现（“替换旧窗口”语义）；关闭后所有面板都会显示，便于随时手动新开对话。",
      type: "boolean",
      defaultValue: true,
    },
  })

  if (orca.state.editorSidetools?.[SIDETOOL_ID] == null) {
    orca.editorSidetools.registerEditorSidetool(SIDETOOL_ID, {
      render: renderNewChatTool,
    })
  }

  console.log(`[orca-ai-optimizer] v0.1.0 loaded (${name}).`)
}

export async function unload(): Promise<void> {
  if (orca.state.editorSidetools?.[SIDETOOL_ID] != null) {
    orca.editorSidetools.unregisterEditorSidetool(SIDETOOL_ID)
  }
  console.log(`[orca-ai-optimizer] v0.1.0 unloaded (${pluginName}).`)
}
