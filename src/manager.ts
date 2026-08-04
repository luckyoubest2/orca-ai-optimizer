import { t } from "./l10n"
import {
  openChat,
  pluginSetting,
} from "./core"
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

/** 类型化的 React（window.React 运行时是全局注入的 React 18） */
const React = window.React as typeof import("react")

const Valtio: any = window.Valtio
const store = Valtio.proxy({ open: false })
let root: any = null
let holder: HTMLDivElement | null = null

/** 打开对话管理窗口 */
export function openManager(): void {
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
    // 应用初始化尚未完成时稍后重试
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
  const { open } = Valtio.useSnapshot(store)
  const visible = !!open
  const [chats, setChats] = React.useState<ChatInfo[]>([])
  const [filter, setFilter] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [renamingId, setRenamingId] = React.useState<number | null>(null)
  const busyRef = React.useRef(false)

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
  }, [])

  const query = filter.trim().toLowerCase()
  const visibleChats = chats.filter((c) => {
    if (!query) return true
    const rootTitle = rootBlockTitle(c.ctx?.[0]).toLowerCase()
    return (
      c.title.toLowerCase().includes(query) ||
      rootTitle.includes(query) ||
      String(c.blockId).includes(query)
    )
  })

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
        className: "orca-aio-btn orca-aio-btn-primary",
        disabled: busy,
        onClick: () => void doClean(reload),
      },
      h("i", { className: "ti ti-broom" }),
      t("Clean empty chats"),
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
            : filter
              ? t("No conversations match")
              : t("No conversations yet"),
        )
      : visibleChats.map((info) =>
          buildRow(info, renamingId, setRenamingId, reload),
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
      summary,
      list,
    ),
  )
}

function buildRow(
  info: ChatInfo,
  renamingId: number | null,
  setRenamingId: (v: number | null) => void,
  reload: (force?: boolean) => Promise<void>,
): React.ReactElement {
  const h = React.createElement

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

  return h(
    "div",
    { className: "orca-aio-row" },
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
  if (done) await reload(true)
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

function formatTime(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
