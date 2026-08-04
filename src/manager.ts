import { t } from "./l10n"
import { openChat, pluginSetting } from "./core"
import {
  cleanupEmptyChats,
  deleteChat,
  exportChatMarkdown,
  listChats,
  preloadRootBlocks,
  renameChat,
  rootBlockTitle,
  type ChatInfo,
} from "./data"
import {
  getFavorites,
  isFavorite,
  setFavorites,
  toggleFavorite,
} from "./favorites"

/** 类型化的 React（window.React 运行时是全局注入的 React 18） */
const React = window.React as typeof import("react")

const Valtio: any = window.Valtio
const store = Valtio.proxy({ open: false, filterSource: null as number | null })
let root: any = null
let holder: HTMLDivElement | null = null

/** 打开对话管理窗口 */
export function openManager(): void {
  store.filterSource = null
  store.open = true
}

/** 打开对话管理窗口并自动筛选指定来源文档 */
export function openManagerWithSource(sourceRootId: number | null): void {
  store.filterSource = sourceRootId
  store.open = true
}

/** 关闭对话管理窗口 */
export function closeManager(): void {
  store.open = false
}

/** 命令入口：切换窗口显示状态 */
export function toggleManager(): void {
  if (store.open) closeManager()
  else openManager()
}

/** 挂载弹窗（在 load 中调用一次） */
export function mountManager(): void {
  if (root != null) return
  holder = document.createElement("div")
  holder.id = "orca-ai-optimizer-manager-root"
  document.body.appendChild(holder)
  const create = window.createRoot
  if (typeof create === "function") {
    root = create(holder)
    root.render(React.createElement(ManagerDialog))
  } else {
    setTimeout(() => {
      holder?.remove()
      holder = null
      mountManager()
    }, 1000)
  }
}

export function unmountManager(): void {
  root?.unmount()
  root = null
  holder?.remove()
  holder = null
  store.open = false
}

// ---------- 弹窗组件 ----------

function ManagerDialog(): React.ReactElement {
  const h = React.createElement
  const snap = Valtio.useSnapshot(store)
  const visible = !!snap.open
  const [chats, setChats] = React.useState<ChatInfo[]>([])
  const [filter, setFilter] = React.useState("")
  const [sourceFilter, setSourceFilter] = React.useState<number | null>(
    snap.filterSource ?? null,
  )
  const [minUserMsgs, setMinUserMsgs] = React.useState(0)
  const [msgCompare, setMsgCompare] = React.useState<"lte" | "gte">("gte")
  const [favFilter, setFavFilter] = React.useState<"all" | "fav" | "unfav">(
    "all",
  )
  const [activeFrom, setActiveFrom] = React.useState("")
  const [activeTo, setActiveTo] = React.useState("")
  const [sortBy, setSortBy] = React.useState<"modified" | "created" | "user">(
    "modified",
  )
  const [busy, setBusy] = React.useState(false)
  const [renamingId, setRenamingId] = React.useState<number | null>(null)
  const [favorites, setFavoritesState] = React.useState<Set<number>>(
    getFavorites(),
  )
  const [batchMode, setBatchMode] = React.useState(false)
  const [selected, setSelected] = React.useState<Set<number>>(new Set())
  const busyRef = React.useRef(false)

  React.useEffect(() => {
    setSourceFilter(snap.filterSource ?? null)
  }, [snap.filterSource])

  const reload = React.useCallback(async (force = false) => {
    if (busyRef.current && !force) return
    busyRef.current = true
    setBusy(true)
    try {
      const list = await listChats()
      await preloadRootBlocks(list)
      setChats(list)
    } catch (err) {
      console.error("[orca-ai-optimizer] 加载对话列表失败", err)
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }, [])

  React.useEffect(() => {
    if (visible) void reload(true)
  }, [visible, reload])

  const onClose = React.useCallback(() => {
    store.open = false
    setBatchMode(false)
    setSelected(new Set())
  }, [])

  const query = filter.trim().toLowerCase()
  const sources = Array.from(
    new Set(
      chats.map((c) => c.ctx?.[0]).filter((id): id is number => id != null),
    ),
  )

  let visibleChats = chats.filter((c) => {
    if (sourceFilter != null && Number(c.ctx?.[0]) !== Number(sourceFilter)) {
      return false
    }
    if (msgCompare === "gte" && c.userMsgCount < minUserMsgs) return false
    if (msgCompare === "lte" && c.userMsgCount > minUserMsgs) return false
    const fav = favorites.has(c.blockId)
    if (favFilter === "fav" && !fav) return false
    if (favFilter === "unfav" && fav) return false
    if (activeFrom) {
      const from = new Date(`${activeFrom}T00:00:00`).getTime()
      if (Number.isFinite(from) && c.modified < from) return false
    }
    if (activeTo) {
      const to = new Date(`${activeTo}T23:59:59.999`).getTime()
      if (Number.isFinite(to) && c.modified > to) return false
    }
    if (!query) return true
    const rootTitle = rootBlockTitle(c.ctx?.[0]).toLowerCase()
    return (
      c.title.toLowerCase().includes(query) ||
      rootTitle.includes(query) ||
      String(c.blockId).includes(query)
    )
  })
  visibleChats = [...visibleChats].sort((a, b) => {
    if (sortBy === "created") return b.created - a.created
    if (sortBy === "user") return b.userMsgCount - a.userMsgCount
    return b.modified - a.modified
  })

  const visibleIds = visibleChats.map((c) => c.blockId)
  const allSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allSelected) {
        for (const id of visibleIds) next.delete(id)
      } else {
        for (const id of visibleIds) next.add(id)
      }
      return next
    })
  }

  const doBatchFav = (value: boolean) => {
    const ids = Array.from(selected)
    if (ids.length === 0) return
    setFavorites(ids, value)
    setFavoritesState(getFavorites())
    orca.notify(
      "success",
      `${value ? t("Favorite") : t("Unfavorite")} ${ids.length} ${t("Conversations")}`,
      { title: t("Batch operations") },
    )
  }

  const emptyCount = chats.filter((c) => c.isEmpty).length

  const toolbar = h(
    "div",
    { className: "orca-aio-manager-toolbar" },
    h("input", {
      className: "orca-aio-search",
      placeholder: t("Search conversations"),
      value: filter,
      onChange: (e: { target: { value: string } }) => setFilter(e.target.value),
    }),
    h(
      "button",
      {
        type: "button",
        className: "orca-aio-btn",
        title: t("Refresh"),
        onClick: () => void reload(true),
      },
      h("i", { className: "ti ti-reload" }),
    ),
    h(
      "button",
      {
        type: "button",
        className: batchMode
          ? "orca-aio-btn orca-aio-btn-primary"
          : "orca-aio-btn",
        title: t("Batch operations"),
        onClick: () => {
          setBatchMode((v) => !v)
          setSelected(new Set())
        },
      },
      h("i", { className: "ti ti-list-check" }),
      t("Batch"),
    ),
    h(
      "button",
      {
        type: "button",
        className: "orca-aio-btn orca-aio-btn-primary",
        disabled: busy,
        onClick: () => void doClean(reload),
      },
      h("i", { className: "ti ti-broom" }),
      t("Clean empty chats"),
    ),
  )

  const batchBar = batchMode
    ? h(
        "div",
        { className: "orca-aio-batch-bar" },
        h(
          "label",
          { className: "orca-aio-filter-label" },
          h("input", {
            type: "checkbox",
            checked: allSelected,
            onChange: toggleSelectAll,
          }),
          t("Select all"),
        ),
        h(
          "span",
          { className: "orca-aio-batch-count" },
          `${selected.size} ${t("Selected")}`,
        ),
          h(
            "button",
            {
              type: "button",
              className: "orca-aio-btn orca-aio-btn-text orca-aio-btn-danger",
              disabled: selected.size === 0,
              onClick: () =>
                void doBatchDelete(selected, reload, () =>
                setFavoritesState(getFavorites()),
              ),
          },
          h("i", { className: "ti ti-trash" }),
          t("Delete"),
        ),
          h(
            "button",
            {
              type: "button",
              className: "orca-aio-btn orca-aio-btn-text",
              disabled: selected.size === 0,
              onClick: () => void doBatchCopyIds(selected),
          },
          h("i", { className: "ti ti-copy" }),
          t("Copy block IDs"),
        ),
          h(
            "button",
            {
              type: "button",
              className: "orca-aio-btn orca-aio-btn-text",
              disabled: selected.size === 0,
              onClick: () => doBatchFav(true),
          },
          h("i", { className: "ti ti-star" }),
          t("Favorite"),
        ),
          h(
            "button",
            {
              type: "button",
              className: "orca-aio-btn orca-aio-btn-text",
              disabled: selected.size === 0,
              onClick: () => doBatchFav(false),
          },
          h("i", { className: "ti ti-star-off" }),
          t("Unfavorite"),
        ),
      )
    : null

  const filters = h(
    "div",
    { className: "orca-aio-manager-filters" },
    h(
      "label",
      { className: "orca-aio-filter-label" },
      t("Source"),
      h(
        "select",
        {
          className: "orca-aio-select",
          value: sourceFilter == null ? "" : String(sourceFilter),
          onChange: (e: { target: { value: string } }) => {
            const v = e.target.value
            setSourceFilter(v ? Number(v) : null)
          },
        },
        h("option", { value: "" }, t("All sources")),
        sources.map((id) =>
          h(
            "option",
            { key: id, value: String(id) },
            rootBlockTitle(id) || `#${id}`,
          ),
        ),
      ),
    ),
    h(
      "label",
      { className: "orca-aio-filter-label" },
      t("Messages"),
      h(
        "select",
        {
          className: "orca-aio-select",
          value: msgCompare,
          onChange: (e: { target: { value: any } }) =>
            setMsgCompare(e.target.value),
        },
        h("option", { value: "lte" }, "≤"),
        h("option", { value: "gte" }, "≥"),
      ),
      h("input", {
        type: "number",
        min: 0,
        className: "orca-aio-select orca-aio-number",
        value: minUserMsgs,
        onChange: (e: { target: { value: string } }) =>
          setMinUserMsgs(Math.max(0, Number(e.target.value) || 0)),
      }),
    ),
    h(
      "label",
      { className: "orca-aio-filter-label" },
      t("Favorite"),
      h(
        "select",
        {
          className: "orca-aio-select",
          value: favFilter,
          onChange: (e: { target: { value: any } }) =>
            setFavFilter(e.target.value),
        },
        h("option", { value: "all" }, t("All")),
        h("option", { value: "fav" }, t("Favorited")),
        h("option", { value: "unfav" }, t("Not favorited")),
      ),
    ),
    h(
      "label",
      { className: "orca-aio-filter-label" },
      t("Last active"),
      h("input", {
        type: "date",
        className: "orca-aio-select orca-aio-date",
        value: activeFrom,
        onChange: (e: { target: { value: string } }) =>
          setActiveFrom(e.target.value),
      }),
      "–",
      h("input", {
        type: "date",
        className: "orca-aio-select orca-aio-date",
        value: activeTo,
        onChange: (e: { target: { value: string } }) =>
          setActiveTo(e.target.value),
      }),
    ),
    h(
      "label",
      { className: "orca-aio-filter-label" },
      t("Sort"),
      h(
        "select",
        {
          className: "orca-aio-select",
          value: sortBy,
          onChange: (e: { target: { value: any } }) =>
            setSortBy(e.target.value),
        },
        h("option", { value: "modified" }, t("Last active")),
        h("option", { value: "created" }, t("Created")),
        h("option", { value: "user" }, t("Message count")),
      ),
    ),
  )

  const summary = h(
    "div",
    { className: "orca-aio-summary" },
    busy
      ? t("Loading…")
      : `${t("All conversations")}: ${chats.length} · ${t("Empty conversations")}: ${emptyCount}`,
  )

  const list = h(
    "div",
    { className: "orca-aio-list" },
    visibleChats.length === 0
      ? h(
          "div",
          { className: "orca-aio-empty" },
          busy
            ? t("Loading…")
            : filter ||
                favFilter !== "all" ||
                sourceFilter != null ||
                !!activeFrom ||
                !!activeTo
              ? t("No conversations match")
              : t("No conversations yet"),
        )
      : visibleChats.map((info) =>
          buildRow({
            info,
            renamingId,
            setRenamingId,
            reload,
            favorites,
            onToggleFav: (id) => {
              const now = toggleFavorite(id)
              setFavoritesState(getFavorites())
              return now
            },
            batchMode,
            selected: selected.has(info.blockId),
            onSelect: () => toggleSelect(info.blockId),
          }),
        ),
  )

  return h(
    orca.components.ModalOverlay,
    {
      visible,
      onClose,
      className: "orca-aio-manager-overlay",
    },
    h(
      "div",
      { className: "orca-aio-manager" },
      h(
        "div",
        { className: "orca-aio-manager-header" },
        h("div", { className: "orca-aio-manager-title" }, t("AI chat manager")),
        h(
          "button",
          {
            type: "button",
            className: "orca-aio-btn",
            onClick: onClose,
            title: t("Close"),
          },
          h("i", { className: "ti ti-x" }),
        ),
      ),
      toolbar,
      batchBar,
      filters,
      summary,
      list,
    ),
  )
}

function buildRow(args: {
  info: ChatInfo
  renamingId: number | null
  setRenamingId: (v: number | null) => void
  reload: (force?: boolean) => Promise<void>
  favorites: Set<number>
  onToggleFav: (id: number) => boolean
  batchMode: boolean
  selected: boolean
  onSelect: () => void
}): React.ReactElement {
  const h = React.createElement
  const {
    info,
    renamingId,
    setRenamingId,
    reload,
    favorites,
    onToggleFav,
    batchMode,
    selected,
    onSelect,
  } = args
  const fav = favorites.has(info.blockId)

  const titleEl =
    renamingId === info.blockId
      ? h(RenameRow, {
          info,
          onDone: () => {
            setRenamingId(null)
            void reload(true)
          },
          onCancel: () => setRenamingId(null),
        })
      : h(
          "div",
          {
            className: `orca-aio-row-title${
              info.title ? "" : " orca-aio-row-title-empty"
            }`,
          },
          info.title || t("Untitled"),
        )

  const meta = h(
    "div",
    { className: "orca-aio-row-meta" },
    h(
      "span",
      {},
      rootBlockTitle(info.ctx?.[0]) || `#${info.ctx?.[0] ?? "?"}`,
    ),
    h("span", {}, `${info.userMsgCount} ${t("Messages")}`),
    h("span", {}, formatTime(info.modified)),
  )

  const main = h(
    "div",
    {
      className: "orca-aio-row-main",
      title: t("Preview"),
      onClick: (e: { currentTarget?: HTMLElement }) => {
        if (renamingId === info.blockId) return
        try {
          orca.utils.showBlockPreview(
            info.blockId,
            e.currentTarget,
            void 0,
            true,
          )
        } catch (err) {
          console.error("[orca-ai-optimizer] 预览对话失败", err)
        }
      },
    },
    titleEl,
    meta,
  )

  const actions =
    renamingId === info.blockId
      ? null
      : h(
          "div",
          { className: "orca-aio-row-actions" },
          h(
            "button",
            {
              type: "button",
              className: `orca-aio-btn${fav ? " orca-aio-btn-fav" : ""}`,
              title: fav ? t("Unfavorite") : t("Favorite"),
              onClick: (e: { stopPropagation?: () => void }) => {
                e?.stopPropagation?.()
                onToggleFav(info.blockId)
              },
            },
            h("i", { className: fav ? "ti ti-star-filled" : "ti ti-star" }),
          ),
          h(
            "button",
            {
              type: "button",
              className: "orca-aio-btn",
              title: t("Open"),
              onClick: (e: { stopPropagation?: () => void }) => {
                e?.stopPropagation?.()
                try {
                  openChat(info.blockId)
                } catch (err) {
                  console.error("[orca-ai-optimizer] 打开对话失败", err)
                }
              },
            },
            h("i", { className: "ti ti-external-link" }),
          ),
          h(
            "button",
            {
              type: "button",
              className: "orca-aio-btn",
              title: t("Rename"),
              onClick: (e: { stopPropagation?: () => void }) => {
                e?.stopPropagation?.()
                setRenamingId(info.blockId)
              },
            },
            h("i", { className: "ti ti-pencil" }),
          ),
          h(
            "button",
            {
              type: "button",
              className: "orca-aio-btn",
              title: t("Copy markdown"),
              onClick: (e: { stopPropagation?: () => void }) => {
                e?.stopPropagation?.()
                void doCopy(info)
              },
            },
            h("i", { className: "ti ti-copy" }),
          ),
          h(
            "button",
            {
              type: "button",
              className: "orca-aio-btn orca-aio-btn-danger",
              title: t("Delete"),
              onClick: (e: { stopPropagation?: () => void }) => {
                e?.stopPropagation?.()
                void doDelete(info.blockId, reload)
              },
            },
            h("i", { className: "ti ti-trash" }),
          ),
        )

  const badge = info.isEmpty
    ? h("span", { className: "orca-aio-badge-empty" }, t("Empty"))
    : null

  const checkbox = batchMode
    ? h("input", {
        type: "checkbox",
        className: "orca-aio-checkbox",
        checked: selected,
        onChange: () => onSelect(),
        onClick: (e: { stopPropagation?: () => void }) =>
          e?.stopPropagation?.(),
      })
    : null

  return h(
    "div",
    { className: "orca-aio-row" },
    checkbox,
    badge,
    main,
    actions,
  )
}

function RenameRow(props: {
  info: ChatInfo
  onDone: () => void
  onCancel: () => void
}): React.ReactElement {
  const h = React.createElement
  const [value, setValue] = React.useState(props.info.title)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  return h(
    "div",
    { className: "orca-aio-rename-row" },
    h("input", {
      ref: inputRef,
      className: "orca-aio-rename-input",
      value,
      placeholder: t("New title"),
      onChange: (e: { target: { value: string } }) => setValue(e.target.value),
      onKeyDown: (e: { key: string }) => {
        if (e.key === "Enter") {
          void (async () => {
            await renameChat(props.info.blockId, value)
            props.onDone()
          })()
        } else if (e.key === "Escape") {
          props.onCancel()
        }
      },
    }),
    h(
      "button",
      {
        type: "button",
        className: "orca-aio-btn",
        title: t("Confirm"),
        onClick: () => {
          void (async () => {
            await renameChat(props.info.blockId, value)
            props.onDone()
          })()
        },
      },
      h("i", { className: "ti ti-check" }),
    ),
    h(
      "button",
      {
        type: "button",
        className: "orca-aio-btn",
        title: t("Cancel"),
        onClick: props.onCancel,
      },
      h("i", { className: "ti ti-x" }),
    ),
  )
}

async function doDelete(
  blockId: number,
  reload: (force?: boolean) => Promise<void>,
): Promise<void> {
  if (!window.confirm(t("Delete conversation?"))) return
  const done = await deleteChat(blockId)
  if (!done) {
    orca.notify("warn", t("Favorited conversations cannot be deleted"), {
      title: t("Delete"),
    })
    return
  }
  await reload(true)
}

async function doClean(
  reload: (force?: boolean) => Promise<void>,
): Promise<void> {
  const candidates = await cleanupEmptyChats({ dryRun: true, minAgeMs: 0 })
  if (candidates.length === 0) {
    orca.notify("info", t("No empty conversations"), {
      title: t("Clean empty chats"),
    })
    return
  }
  const confirmed =
    pluginSetting("confirmBeforeClean") !== false
      ? window.confirm(
          `${t("Confirm cleanup")}：${candidates.length} ${t("Empty conversations")}`,
        )
      : true
  if (!confirmed) return
  const removed = await cleanupEmptyChats({ minAgeMs: 0 })
  if (removed.length > 0) {
    orca.notify(
      "success",
      `${t("Cleanup report")}：${t("Deleted")} ${removed.length} ${t("Empty conversations")}`,
      { title: t("Clean empty chats") },
    )
    await reload(true)
  }
}

/** 复制对话为 Markdown 到剪贴板 */
async function doCopy(info: ChatInfo): Promise<void> {
  const text = await exportChatMarkdown(info.blockId)
  if (text == null) {
    orca.notify("error", t("Failed to export conversation"), {
      title: t("Copy"),
    })
    return
  }
  try {
    await navigator.clipboard.writeText(text)
    orca.notify("success", t("Copied to clipboard"), {
      title: t("Copy"),
    })
  } catch (err) {
    console.error("[orca-ai-optimizer] 复制失败", err)
    orca.notify("error", t("Failed to export conversation"), {
      title: t("Copy"),
    })
  }
}

/** 批量删除 */
async function doBatchDelete(
  selected: Set<number>,
  reload: (force?: boolean) => Promise<void>,
  refreshFavs: () => void,
): Promise<void> {
  const ids = Array.from(selected)
  if (ids.length === 0) return
  if (!window.confirm(`${t("Delete")} ${ids.length} ${t("Conversations")}?`)) {
    return
  }
  let ok = 0
  let skipped = 0
  for (const id of ids) {
    if (await deleteChat(id)) ok++
    else skipped++
  }
  orca.notify(
    "success",
    `${t("Deleted")} ${ok} / ${ids.length}`,
    { title: t("Batch operations") },
  )
  if (skipped > 0) {
    orca.notify("warn", `${t("Favorited conversations cannot be deleted")}：${skipped}`, {
      title: t("Batch operations"),
    })
  }
  refreshFavs()
  await reload(true)
}

/** 批量复制块 ID（逗号分隔） */
async function doBatchCopyIds(selected: Set<number>): Promise<void> {
  const ids = Array.from(selected)
  if (ids.length === 0) return
  try {
    await navigator.clipboard.writeText(ids.join(", "))
    orca.notify("success", t("Copied to clipboard"), {
      title: t("Copy block IDs"),
    })
  } catch (err) {
    console.error("[orca-ai-optimizer] 复制块ID失败", err)
    orca.notify("error", t("Failed to export conversation"), {
      title: t("Copy block IDs"),
    })
  }
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
