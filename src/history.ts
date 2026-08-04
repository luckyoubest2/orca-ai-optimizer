import type { DbId } from "./orca.d.ts"
import { DATA_KEY_HISTORY } from "./constants"
import { getPluginName } from "./core"

/** 一条面板对话历史 */
export interface ChatHistoryEntry {
  blockId: DbId
  openedAt: number
  title?: string
}

/** 注册表：repoKey -> rootKey -> 该文档下打开过的对话（新→旧） */
type HistoryRegistry = Record<string, Record<string, ChatHistoryEntry[]>>

let registry: HistoryRegistry = {}
let loaded = false
let saveTimer: ReturnType<typeof setTimeout> | null = null

function repoKey(): string {
  return String(orca.state.repo ?? "")
}

function rootKey(rootBlockId: DbId): string {
  return String(rootBlockId)
}

function parseData(raw: any): HistoryRegistry {
  if (raw == null) return {}
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw)
      return parsed && typeof parsed === "object" ? parsed : {}
    } catch {
      return {}
    }
  }
  return raw && typeof raw === "object" ? raw : {}
}

/** 加载注册表（幂等，只加载一次） */
export async function loadHistory(): Promise<void> {
  if (loaded) return
  loaded = true
  try {
    const raw = await orca.plugins.getData(getPluginName(), DATA_KEY_HISTORY)
    registry = parseData(raw)
  } catch (err) {
    console.error("[orca-ai-optimizer] 读取对话历史失败", err)
    registry = {}
  }
}

/** 持久化（防抖） */
export function saveHistory(): void {
  if (saveTimer != null) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    saveTimer = null
    orca.plugins
      .setData(getPluginName(), DATA_KEY_HISTORY, JSON.stringify(registry))
      .catch((err) => {
        console.error("[orca-ai-optimizer] 保存对话历史失败", err)
      })
  }, 150)
}

/** 某文档下的对话历史（新→旧） */
export function getHistory(
  rootBlockId: DbId,
): ChatHistoryEntry[] {
  return registry[repoKey()]?.[rootKey(rootBlockId)] ?? []
}

/** 全部文档的对话历史（rootKey -> entries），供回填/清理使用 */
export function getAllHistory(): Record<string, ChatHistoryEntry[]> {
  return registry[repoKey()] ?? {}
}

/** 登记一次打开：rootBlockId 所属文档下记录 blockId */
export function registerOpenedChat(
  rootBlockId: DbId,
  blockId: DbId,
  title?: string,
): void {
  const rk = repoKey()
  if (registry[rk] == null) registry[rk] = {}
  const key = rootKey(rootBlockId)
  const list = registry[rk][key] ?? []
  const existing = list.find((e) => e.blockId === blockId)
  if (existing != null) {
    existing.openedAt = Date.now()
    if (title != null && title.length > 0) existing.title = title
  } else {
    list.unshift({ blockId, openedAt: Date.now(), title })
  }
  // 单文档最多保留 50 条，避免无限增长
  registry[rk][key] = list.slice(0, 50)
  saveHistory()
}

/** 删除块后同步移除注册表条目 */
export function removeFromHistory(blockId: DbId): void {
  const rk = repoKey()
  const roots = registry[rk]
  if (roots == null) return
  let changed = false
  for (const key of Object.keys(roots)) {
    const before = roots[key].length
    roots[key] = roots[key].filter((e) => e.blockId !== blockId)
    if (roots[key].length !== before) changed = true
    if (roots[key].length === 0) delete roots[key]
  }
  if (changed) saveHistory()
}

/** 批量移除（清理空对话后调用） */
export function removeManyFromHistory(blockIds: DbId[]): void {
  for (const id of blockIds) removeFromHistory(id)
}

/**
 * 校验并清理注册表中的失效条目（块已删除或不再是 aichat）。
 * 返回被移除的 blockId 列表。
 */
export async function pruneInvalidHistory(): Promise<DbId[]> {
  const rk = repoKey()
  const roots = registry[rk]
  if (roots == null) return []
  const allIds = new Set<DbId>()
  for (const key of Object.keys(roots)) {
    for (const e of roots[key]) allIds.add(e.blockId)
  }
  if (allIds.size === 0) return []

  const removed: DbId[] = []
  try {
    const blocks = await orca.invokeBackend("get-blocks", Array.from(allIds))
    const valid = new Set<DbId>()
    for (const b of blocks ?? []) {
      const repr = b?.properties?.find((p: any) => p.name === "_repr")?.value
      if (repr?.type === "aichat") valid.add(b.id)
    }
    for (const id of allIds) {
      if (!valid.has(id)) removed.push(id)
    }
  } catch (err) {
    console.error("[orca-ai-optimizer] 校验对话历史失败", err)
    return []
  }
  if (removed.length > 0) removeManyFromHistory(removed)
  return removed
}
