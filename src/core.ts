import type {
  AIChatRepr,
  Block,
  ChatMessage,
  DbId,
  Repr,
  ViewPanel,
} from "./orca.d.ts"
import {
  KEY_AI_BASE_URL,
  KEY_AI_API_KEY,
  KEY_AI_MODEL,
  KEY_AI_TAG,
} from "./constants"

/** 当前插件注册名（Orca 调用 load 时注入） */
let pluginName = "orca-ai-optimizer"

export function setPluginName(name: string): void {
  pluginName = name
}

export function getPluginName(): string {
  return pluginName
}

/** 读取插件设置（含默认值） */
export function pluginSetting(key: string): any {
  return orca.state.plugins[pluginName]?.settings?.[key]
}

/** 读取块上的 _repr JSON 属性 */
export function getRepr(block: Block | undefined): Repr | undefined {
  return block?.properties?.find((p) => p.name === "_repr")?.value
}

/** 块是否为 AI 对话（aichat）块；镜像块会先解出真实块 */
export function getAIChatBlock(blockId: DbId | undefined): Block | undefined {
  if (blockId == null) return undefined
  const raw = orca.state.blocks[blockId]
  const repr = getRepr(raw)
  if (repr == null) return undefined
  if (repr.type === "aichat") return raw
  if (repr.type === "mirror") {
    const mirroredId = repr.mirroredId
    const mirrored =
      mirroredId != null ? orca.state.blocks[mirroredId] : undefined
    return getRepr(mirrored)?.type === "aichat" ? mirrored : undefined
  }
  return undefined
}

/** 对话是否有真实提问（存在 role === "user" 的消息） */
export function chatHasUserMessages(chat: Block | undefined): boolean {
  const repr = getRepr(chat) as AIChatRepr | undefined
  if (repr?.type !== "aichat" || !Array.isArray(repr.msgs)) return false
  return repr.msgs.some((m: ChatMessage) => m?.role === "user")
}

/** 对话消息数（含 system 提示词在内的完整条数） */
export function chatMsgCount(chat: Block | undefined): number {
  const repr = getRepr(chat) as AIChatRepr | undefined
  if (repr?.type !== "aichat" || !Array.isArray(repr.msgs)) return 0
  return repr.msgs.length
}

/** 对话标题：_repr.cap，空则回退“未命名” */
export function chatTitle(chat: Block | undefined): string {
  const repr = getRepr(chat) as AIChatRepr | undefined
  if (repr?.type === "aichat" && repr.cap) return repr.cap
  return ""
}

/** 对话 ctx（文档上下文根块） */
export function chatCtx(chat: Block | undefined): DbId[] {
  const repr = getRepr(chat) as AIChatRepr | undefined
  if (repr?.type === "aichat" && Array.isArray(repr.ctx)) return repr.ctx
  return []
}

/** 查找面板对象；找不到时按当前活动面板兜底 */
export function resolvePanel(panelId: string | undefined): ViewPanel | null {
  const id = panelId ?? orca.state.activePanel
  return orca.nav.findViewPanel(id, orca.state.panels)
}

/** 浅比较两个普通对象（与内置 equals 在视图参数上的行为一致即可） */
export function shallowEqual(
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
 * 在“当前面板内”打开某块，替换掉该面板旧视图（手动复刻内置 goTo 的面板内
 * 替换逻辑）。Orca Pinner 会劫持 goTo 到 aichat 块的调用改成浮动钉住窗口，
 * 因此这里不依赖 goTo，直接修改面板 view/viewArgs 并维护返回历史。
 */
export function openBlockInPanel(
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
    orca.nav.openInLastPanel("block", { blockId })
    return
  }

  const target = resolvePanel(panelId)
  if (target == null) {
    orca.nav.goTo("block", { blockId }, panelId)
    return
  }
  const nextArgs = { blockId }
  if (target.view !== "block" || !shallowEqual(target.viewArgs, nextArgs)) {
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

/** 打开对话：默认在当前面板替换，openOnSide 则在侧边新面板打开 */
export function openChat(blockId: DbId, panelId?: string, openOnSide = false): void {
  if (panelId != null) {
    openBlockInPanel(blockId, panelId, openOnSide)
  } else if (openOnSide) {
    orca.nav.openInLastPanel("block", { blockId })
  } else {
    orca.nav.goTo("block", { blockId })
  }
}

/** 新建一个空 AI 对话块，返回新块 ID；失败返回 null */
export async function createNewChatBlock(ctx: DbId[]): Promise<DbId | null> {
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
    return null
  }
  return newBlockId
}

/** AI 服务是否已配置（与内置 AI 按钮判定一致） */
export function aiConfigured(): boolean {
  return (
    !!orca.state.settings[KEY_AI_BASE_URL] &&
    !!orca.state.settings[KEY_AI_API_KEY] &&
    !!orca.state.settings[KEY_AI_MODEL]
  )
}

export function notifyAIUnconfigured(): void {
  orca.notify("error", "请先在设置中配置 AI 的 Base URL、API Key 与模型！", {
    title: "AI 对话",
    action: () => {
      orca.commands.invokeCommand("core.openSettings")
    },
  })
}
