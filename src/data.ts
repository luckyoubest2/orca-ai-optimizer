import type { AIChatRepr, Block, ChatMessage, DbId } from "./orca.d.ts"
import { KEY_AI_TAG } from "./constants"
import { chatMsgCount, chatTitle, chatCtx, getRepr } from "./core"
import { removeManyFromHistory } from "./history"
import { isFavorite, removeManyFromFavorites } from "./favorites"

/** 对话列表项（供侧边栏与历史浮层共用） */
export interface ChatInfo {
  block: Block
  blockId: DbId
  title: string
  userMsgCount: number
  totalMsgCount: number
  isEmpty: boolean
  ctx: DbId[]
  modified: number
  created: number
}

/** 从块对象计算对话信息 */
export function chatInfoFromBlock(block: Block | undefined): ChatInfo | null {
  if (block == null) return null
  const repr = getRepr(block)
  if (repr?.type !== "aichat") return null
  const msgs: any[] = Array.isArray(repr.msgs) ? repr.msgs : []
  const userCount = msgs.filter((m) => m?.role === "user").length
  return {
    block,
    blockId: block.id,
    title: chatTitle(block),
    userMsgCount: userCount,
    totalMsgCount: msgs.length,
    isEmpty: userCount === 0,
    ctx: chatCtx(block),
    modified: new Date(block.modified).getTime(),
    created: new Date(block.created).getTime(),
  }
}

/** 是否任一面板当前正在显示该对话（清理白名单） */
export function isChatVisibleInAnyPanel(blockId: DbId): boolean {
  const stack: any[] = [orca.state.panels]
  while (stack.length > 0) {
    const node = stack.pop()
    if (node == null) continue
    if (node.children != null) {
      stack.push(...node.children)
      continue
    }
    if (
      node.view === "block" &&
      Number(node.viewArgs?.blockId) === Number(blockId)
    ) {
      return true
    }
  }
  return false
}

/** 是否最近被打开过（返回/前进历史中存在） */
export function isChatInNavigationHistory(blockId: DbId): boolean {
  const histories = [
    orca.state.panelBackHistory,
    orca.state.panelForwardHistory,
  ]
  return histories.some((h) =>
    h.some(
      (e: any) =>
        e?.view === "block" && Number(e?.viewArgs?.blockId) === Number(blockId),
    ),
  )
}

/** 当前 AI 标签（用户可改） */
export function currentAITag(): string {
  return orca.state.settings[KEY_AI_TAG] || "AI Result"
}

/**
 * 列出当前仓库全部 aichat 对话。
 * 优先按 AI 标签查询；标签缺失/被改名时兜底扫描全部块。
 */
export async function listChats(): Promise<ChatInfo[]> {
  let blocks: Block[] = []
  try {
    const tagged = await orca.invokeBackend(
      "get-blocks-with-tags",
      [currentAITag()],
    )
    blocks = (tagged ?? []).filter((b: Block) => {
      const repr = getRepr(b)
      return repr?.type === "aichat" || repr?.type === "mirror"
    })
  } catch (err) {
    console.error("[orca-ai-optimizer] 按标签查询对话失败", err)
    blocks = []
  }

  if (blocks.length === 0) {
    try {
      const all = await orca.invokeBackend("get-all-blocks")
      blocks = (all ?? []).filter((b: Block) => {
        const repr = getRepr(b)
        return repr?.type === "aichat"
      })
    } catch (err) {
      console.error("[orca-ai-optimizer] 全量扫描对话失败", err)
    }
  }

  const list: ChatInfo[] = []
  for (const b of blocks) {
    const info = chatInfoFromBlock(b)
    if (info != null) list.push(info)
  }
  list.sort((a, b) => b.modified - a.modified)
  return list
}

/** 预取对话所属文档根块，使列表能显示文档名 */
export async function preloadRootBlocks(chats: ChatInfo[]): Promise<void> {
  const ids = Array.from(
    new Set(
      chats
        .map((c) => c.ctx?.[0])
        .filter((id): id is DbId => id != null && Number.isFinite(Number(id))),
    ),
  )
  const missing = ids.filter((id) => orca.state.blocks[id] == null)
  if (missing.length === 0) return
  try {
    const blocks = await orca.invokeBackend("get-blocks", missing)
    for (const b of blocks ?? []) {
      if (b?.id != null) orca.state.blocks[b.id] = b
    }
  } catch (err) {
    console.error("[orca-ai-optimizer] 预取文档块失败", err)
  }
}

/** 根块标题：别名 > 文本内容；失败返回空串 */
export function rootBlockTitle(rootBlockId: DbId | undefined): string {
  if (rootBlockId == null) return ""
  const block = orca.state.blocks[rootBlockId]
  if (block == null) return ""
  if (block.aliases?.length > 0) return block.aliases[0]
  const text = Array.isArray(block.content)
    ? block.content.map((f: any) => (typeof f?.v === "string" ? f.v : "")).join("")
    : ""
  return text.trim().slice(0, 40)
}

/** 异步取根块标题（块未加载时先拉取） */
export async function rootBlockTitleAsync(
  rootBlockId: DbId | undefined,
): Promise<string> {
  if (rootBlockId == null) return ""
  let title = rootBlockTitle(rootBlockId)
  if (title) return title
  try {
    const block = await orca.invokeBackend("get-block", rootBlockId)
    if (block != null) {
      orca.state.blocks[block.id] = block
      title = rootBlockTitle(rootBlockId)
    }
  } catch {
    // ignore
  }
  return title
}

/**
 * 删除对话块（走 core.editor.deleteBlocks，可撤销），
 * 并同步清理历史注册表。
 */
export async function deleteChat(blockId: DbId): Promise<boolean> {
  // 收藏保护：收藏的对话不允许删除
  if (isFavorite(blockId)) {
    console.warn(`[orca-ai-optimizer] 对话 ${blockId} 已收藏，拒绝删除`)
    return false
  }
  try {
    await orca.commands.invokeEditorCommand(
      "core.editor.deleteBlocks",
      null,
      [blockId],
    )
    removeManyFromHistory([blockId])
    removeManyFromFavorites([blockId])
    return true
  } catch (err) {
    console.error("[orca-ai-optimizer] 编辑器删除失败，改用后端删除", err)
  }
  try {
    await orca.invokeBackend("delete-blocks", [blockId])
    ;(orca.state.blocks as Record<string | number, Block | undefined>)[
      blockId
    ] = undefined
    orca.broadcasts.broadcast("orca.delete-blocks", [blockId])
    removeManyFromHistory([blockId])
    removeManyFromFavorites([blockId])
    return true
  } catch (err2) {
    console.error("[orca-ai-optimizer] 删除对话失败", err2)
    return false
  }
}

/** 重命名对话：写 _repr.cap */
export async function renameChat(
  blockId: DbId,
  newTitle: string,
): Promise<boolean> {
  const block = orca.state.blocks[blockId]
  if (block == null) return false
  const repr = getRepr(block)
  if (repr?.type !== "aichat") return false
  const next = { ...repr }
  if (newTitle.trim().length > 0) {
    next.cap = newTitle.trim()
  } else {
    delete next.cap
  }
  try {
    await orca.commands.invokeTopEditorCommand(
      "core.editor.setProperties",
      null,
      [blockId],
      [{ name: "_repr", type: 0, value: next }],
    )
    return true
  } catch (err) {
    console.error("[orca-ai-optimizer] 重命名对话失败", err)
    return false
  }
}

/**
 * 导出对话为 Markdown 文本。
 * 内置 markdown 转换器只导出块 content/子块，不读 _repr.msgs，
 * 因此这里直接按消息数组拼装，确保复制/导出包含完整对话。
 */
export async function exportChatMarkdown(
  blockId: DbId,
): Promise<string | null> {
  try {
    // 块可能未被加载（如刚从管理面板打开），先确保拿到完整块数据
    let block = orca.state.blocks[blockId]
    if (block == null) {
      const fetched = await orca.invokeBackend("get-block", blockId)
      if (fetched != null) {
        orca.state.blocks[fetched.id] = fetched
        block = fetched
      }
    }
    const repr = getRepr(block) as AIChatRepr | undefined
    if (block == null || repr?.type !== "aichat") return null
    const msgs: ChatMessage[] = Array.isArray(repr.msgs) ? repr.msgs : []
    const parts: string[] = []
    for (const m of msgs) {
      if (m == null) continue
      // 跳过系统提示词与工具调用消息（与内置 buildAIChatTitleTranscript 一致）
      if (m.role === "system" || m.role === "tool") continue
      if (m.role === "user") {
        const body = `${m.content ?? ""}`.trim()
        const segs: string[] = []
        if (body) segs.push(body)
        const imageCount = Array.isArray(m.images) ? m.images.length : 0
        if (imageCount > 0) {
          segs.push(`${imageCount} attached image${imageCount > 1 ? "s" : ""}`)
        }
        const text = segs.join(" ").trim()
        if (text) parts.push(`**User**\n\n${text}`)
      } else if (m.role === "assistant") {
        const content = `${m.content ?? ""}`.trim()
        if (content) parts.push(`**Assistant**\n\n${content}`)
      }
    }
    if (parts.length === 0) return ""
    const title = repr.cap ? `# ${repr.cap}\n\n` : ""
    return title + parts.join("\n\n")
  } catch (err) {
    console.error("[orca-ai-optimizer] 导出对话失败", err)
    return null
  }
}

/** 清理候选判定：空对话 + 白名单保护 */
export function isCleanupCandidate(
  info: ChatInfo,
  opts: {
    minAgeMs?: number
  } = {},
): boolean {
  if (!info.isEmpty) return false
  if (isChatVisibleInAnyPanel(info.blockId)) return false
  if (isChatInNavigationHistory(info.blockId)) return false
  if (info.block.backRefs?.length > 0) return false
  if (info.block.children?.length > 0) return false
  if (isFavorite(info.blockId)) return false
  if (opts.minAgeMs != null && Date.now() - info.created < opts.minAgeMs) {
    return false
  }
  return true
}

/** 执行清理：返回候选/删除的 blockId 列表 */
export async function cleanupEmptyChats(opts: {
  minAgeMs?: number
  dryRun?: boolean
} = {}): Promise<DbId[]> {
  const list = await listChats()
  const candidates = list
    .filter((info) => isCleanupCandidate(info, opts))
    .map((info) => info.blockId)
  if (opts.dryRun || candidates.length === 0) return candidates

  const removed: DbId[] = []
  for (const blockId of candidates) {
    const ok = await deleteChat(blockId)
    if (ok) removed.push(blockId)
  }
  return removed
}
