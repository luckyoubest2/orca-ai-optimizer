import type { DbId } from "./orca.d.ts"
import { DATA_KEY_FAVORITES } from "./constants"
import { getPluginName } from "./core"

/** 收藏注册表：repoKey -> blockId[] */
type FavoriteRegistry = Record<string, DbId[]>

let registry: FavoriteRegistry = {}
let loaded = false
let saveTimer: ReturnType<typeof setTimeout> | null = null

function repoKey(): string {
  return String(orca.state.repo ?? "")
}

function parseData(raw: any): FavoriteRegistry {
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

/** 加载收藏（幂等） */
export async function loadFavorites(): Promise<void> {
  if (loaded) return
  loaded = true
  try {
    const raw = await orca.plugins.getData(getPluginName(), DATA_KEY_FAVORITES)
    registry = parseData(raw)
  } catch (err) {
    console.error("[orca-ai-optimizer] 读取收藏失败", err)
    registry = {}
  }
}

function persist(): void {
  if (saveTimer != null) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    saveTimer = null
    orca.plugins
      .setData(getPluginName(), DATA_KEY_FAVORITES, JSON.stringify(registry))
      .catch((err) => {
        console.error("[orca-ai-optimizer] 保存收藏失败", err)
      })
  }, 150)
}

/** 是否已收藏 */
export function isFavorite(blockId: DbId): boolean {
  return (registry[repoKey()] ?? []).includes(Number(blockId))
}

/** 当前仓库全部收藏的 blockId 集合 */
export function getFavorites(): Set<DbId> {
  return new Set(registry[repoKey()] ?? [])
}

/** 切换收藏，返回切换后的状态 */
export function toggleFavorite(blockId: DbId): boolean {
  const rk = repoKey()
  const list = registry[rk] ?? []
  const id = Number(blockId)
  const idx = list.indexOf(id)
  if (idx >= 0) {
    list.splice(idx, 1)
    registry[rk] = list
    persist()
    return false
  }
  list.push(id)
  registry[rk] = list
  persist()
  return true
}

/** 批量设置收藏状态 */
export function setFavorites(blockIds: DbId[], value: boolean): void {
  const rk = repoKey()
  const list = registry[rk] ?? []
  const set = new Set(list)
  for (const id of blockIds) {
    if (value) set.add(Number(id))
    else set.delete(Number(id))
  }
  registry[rk] = Array.from(set)
  persist()
}

/** 删除块后清理收藏 */
export function removeFromFavorites(blockId: DbId): void {
  setFavorites([blockId], false)
}

/** 批量清理（删除对话后调用） */
export function removeManyFromFavorites(blockIds: DbId[]): void {
  setFavorites(blockIds, false)
}
