import { t } from "./l10n"
import { SIDEBAR_TAB_KEY } from "./constants"
import { openChat, pluginSetting } from "./core"
import {
  ChatInfo,
  cleanupEmptyChats,
  deleteChat,
  downloadText,
  exportChatMarkdown,
  listChats,
  preloadRootBlocks,
  renameChat,
  rootBlockTitle,
} from "./data"

const TAB_CLASS = "orca-aio-tab-item"
const CONTENT_CLASS = "orca-aio-sidebar-content"
const ACTIVE_CLASS = "orca-aio-active"

let injected = false
let observer: MutationObserver | null = null
let unsubscribe: (() => void) | null = null

let tabItem: HTMLElement | null = null
let contentContainer: HTMLElement | null = null

let searchInput: HTMLInputElement | null = null
let listEl: HTMLElement | null = null
let summaryEl: HTMLElement | null = null
let cleanBtn: HTMLButtonElement | null = null

let chats: ChatInfo[] = []
let filter = ""
let busy = false
let renamingId: number | null = null
let lastSignature = ""

// ---------- 生命周期 ----------

export function initSidebar(): void {
  injected = true
  ensureTabItem()
  ensureContent()
  refreshAll()

  if (observer == null) {
    observer = new MutationObserver(() => {
      ensureTabItem()
      ensureContent()
    })
    observer.observe(document.body, { childList: true, subtree: true })
  }

  if (unsubscribe == null) {
    unsubscribe = window.Valtio.subscribe(orca.state, () => refreshAll())
  }
}

export function destroySidebar(): void {
  injected = false
  observer?.disconnect()
  observer = null
  unsubscribe?.()
  unsubscribe = null
  tabItem?.remove()
  tabItem = null
  contentContainer?.remove()
  contentContainer = null
  document.querySelector("nav#sidebar")?.classList.remove(ACTIVE_CLASS)
  searchInput = null
  listEl = null
  summaryEl = null
  cleanBtn = null
  chats = []
  filter = ""
  renamingId = null
  lastSignature = ""
}

/** 外部触发刷新（如新开对话/清理后） */
export function refreshSidebar(): void {
  if (injected) void reloadChats(true)
}

// ---------- 注入 ----------

function ensureTabItem(): void {
  if (!injected) return
  const row = document.querySelector<HTMLElement>(".orca-sidebar-tab-options")
  if (row == null) return
  if (tabItem != null && tabItem.isConnected && tabItem.parentElement === row) {
    updateSelected()
    return
  }
  if (tabItem != null) {
    tabItem.remove()
    tabItem = null
  }

  const item = document.createElement("div")
  item.className = `orca-segmented-item ${TAB_CLASS}`
  item.title = t("AI chat manager")
  item.textContent = t("AI chats")
  item.addEventListener("mousedown", (e) => e.stopPropagation())
  item.addEventListener("click", (e) => {
    e.stopPropagation()
    orca.state.sidebarTab = SIDEBAR_TAB_KEY
  })
  row.appendChild(item)
  tabItem = item
  updateSelected()
}

function ensureContent(): void {
  if (!injected) return
  const nav = document.querySelector<HTMLElement>("nav#sidebar")
  if (nav == null) return
  if (
    contentContainer != null &&
    contentContainer.isConnected &&
    contentContainer.parentElement === nav
  ) {
    updateVisibility()
    return
  }
  if (contentContainer != null) {
    contentContainer.remove()
    contentContainer = null
  }

  const container = document.createElement("div")
  container.className = CONTENT_CLASS
  const section = nav.querySelector<HTMLElement>(".orca-sidebar-tabs")
  const resizer = nav.querySelector<HTMLElement>(".orca-sidebar-resizer")
  if (section != null) {
    section.after(container)
  } else if (resizer != null) {
    nav.insertBefore(container, resizer)
  } else {
    nav.appendChild(container)
  }
  contentContainer = container
  buildSkeleton()
  updateVisibility()
  void reloadChats(false)
}

// ---------- 状态刷新 ----------

function signature(): string {
  return `${orca.state.sidebarTab}|${chats.length}|${filter}|${busy}|${renamingId}`
}

function refreshAll(): void {
  updateSelected()
  updateVisibility()
  const sig = signature()
  if (sig !== lastSignature) {
    lastSignature = sig
    render()
  }
}

function updateSelected(): void {
  if (tabItem == null) return
  tabItem.classList.toggle(
    "orca-selected",
    orca.state.sidebarTab === SIDEBAR_TAB_KEY,
  )
}

function updateVisibility(): void {
  if (contentContainer == null) return
  const active = orca.state.sidebarTab === SIDEBAR_TAB_KEY
  contentContainer.style.display = active ? "flex" : "none"
  document
    .querySelector("nav#sidebar")
    ?.classList.toggle(ACTIVE_CLASS, active)
  if (active && chats.length === 0 && !busy) {
    void reloadChats(false)
  }
}

// ---------- 骨架 ----------

function buildSkeleton(): void {
  if (contentContainer == null) return

  const toolbar = document.createElement("div")
  toolbar.className = "orca-aio-toolbar"

  const search = document.createElement("input")
  search.type = "text"
  search.className = "orca-aio-search"
  search.placeholder = t("Search conversations")
  search.addEventListener("input", () => {
    filter = search.value.trim().toLowerCase()
    render()
  })
  searchInput = search

  const refreshBtn = makeBtn("ti ti-reload", t("Refresh"), () => {
    void reloadChats(true)
  })

  const clean = makeBtn(
    "ti ti-broom",
    t("Clean empty chats"),
    () => void doClean(),
  )
  clean.classList.add("orca-aio-btn-primary")
  cleanBtn = clean

  toolbar.append(search, refreshBtn, clean)

  const summary = document.createElement("div")
  summary.className = "orca-aio-summary"
  summaryEl = summary

  const list = document.createElement("div")
  list.className = "orca-aio-list"
  listEl = list

  contentContainer.append(toolbar, summary, list)
}

// ---------- 数据刷新 ----------

async function reloadChats(force: boolean): Promise<void> {
  if (busy && !force) return
  busy = true
  render()
  try {
    chats = await listChats()
    await preloadRootBlocks(chats)
  } catch (err) {
    console.error("[orca-ai-optimizer] 加载对话列表失败", err)
  } finally {
    busy = false
    render()
  }
}

// ---------- 渲染 ----------

function render(): void {
  if (summaryEl != null) {
    const total = chats.length
    const emptyCount = chats.filter((c) => c.isEmpty).length
    summaryEl.textContent = busy
      ? t("Loading…")
      : `${t("All conversations")}: ${total} · ${t("Empty conversations")}: ${emptyCount}`
  }
  if (cleanBtn != null) {
    cleanBtn.disabled = busy
  }
  if (listEl == null) return

  const visible = chats.filter((c) => {
    if (!filter) return true
    const rootTitle = rootBlockTitle(c.ctx?.[0]).toLowerCase()
    return (
      c.title.toLowerCase().includes(filter) ||
      rootTitle.includes(filter) ||
      String(c.blockId).includes(filter)
    )
  })

  if (visible.length === 0) {
    const empty = document.createElement("div")
    empty.className = "orca-aio-empty"
    empty.textContent = busy
      ? t("Loading…")
      : filter
        ? t("No conversations match")
        : t("No conversations yet")
    listEl.replaceChildren(empty)
    return
  }

  const fragment = document.createDocumentFragment()
  for (const info of visible) {
    fragment.appendChild(buildRow(info))
  }
  listEl.replaceChildren(fragment)
}

function buildRow(info: ChatInfo): HTMLElement {
  const row = document.createElement("div")
  row.className = "orca-aio-row"

  const main = document.createElement("div")
  main.className = "orca-aio-row-main"
  main.title = t("Open")
  main.addEventListener("click", (e) => {
    e.stopPropagation()
    void doOpen(info.blockId)
  })

  if (renamingId === info.blockId) {
    const renameRow = document.createElement("div")
    renameRow.className = "orca-aio-rename-row"
    const input = document.createElement("input")
    input.type = "text"
    input.className = "orca-aio-rename-input"
    input.value = info.title
    input.placeholder = t("New title")
    const ok = makeBtn("ti ti-check", t("Confirm"), () => {
      void doRename(info.blockId, input.value)
    })
    const cancel = makeBtn("ti ti-x", t("Cancel"), () => {
      renamingId = null
      render()
    })
    renameRow.append(input, ok, cancel)
    main.appendChild(renameRow)
    setTimeout(() => {
      input.focus()
      input.select()
    }, 0)
  } else {
    const title = document.createElement("div")
    title.className = `orca-aio-row-title${
      info.title ? "" : " orca-aio-row-title-empty"
    }`
    title.textContent = info.title || t("Untitled")

    const meta = document.createElement("div")
    meta.className = "orca-aio-row-meta"
    const rootName = document.createElement("span")
    rootName.textContent =
      rootBlockTitle(info.ctx?.[0]) || `#${info.ctx?.[0] ?? "?"}`
    const msg = document.createElement("span")
    msg.textContent = `${info.userMsgCount} ${t("Messages")}`
    const time = document.createElement("span")
    time.textContent = formatTime(info.modified)
    meta.append(rootName, msg, time)
    main.append(title, meta)
  }

  const actions = document.createElement("div")
  actions.className = "orca-aio-row-actions"
  if (renamingId !== info.blockId) {
    actions.append(
      makeBtn("ti ti-pencil", t("Rename"), () => {
        renamingId = info.blockId
        render()
      }),
      makeBtn(
        "ti ti-download",
        t("Export markdown"),
        () => void doExport(info),
      ),
      makeBtn(
        "ti ti-trash",
        t("Delete"),
        () => void doDelete(info.blockId),
        true,
      ),
    )
  }

  const badge = info.isEmpty
    ? makeBadge(t("Empty"), "orca-aio-badge-empty")
    : null

  if (badge != null) row.append(badge, main, actions)
  else row.append(main, actions)
  return row
}

// ---------- 操作 ----------

async function doOpen(blockId: number): Promise<void> {
  try {
    openChat(blockId)
  } catch (err) {
    console.error("[orca-ai-optimizer] 打开对话失败", err)
  }
}

async function doRename(blockId: number, title: string): Promise<void> {
  const ok = await renameChat(blockId, title)
  renamingId = null
  if (ok) await reloadChats(true)
  else render()
}

function doDelete(blockId: number): void {
  const ok = window.confirm(t("Delete conversation?"))
  if (!ok) return
  void (async () => {
    const done = await deleteChat(blockId)
    if (done) await reloadChats(true)
  })()
}

async function doExport(info: ChatInfo): Promise<void> {
  const text = await exportChatMarkdown(info.blockId)
  if (text == null) {
    orca.notify("error", t("Failed to export conversation"), {
      title: t("Export"),
    })
    return
  }
  const name = (info.title || `chat-${info.blockId}`)
    .replace(/[\\/:*?"<>|]/g, "_")
    .slice(0, 60)
  downloadText(`${name}.md`, text)
}

async function doClean(): Promise<void> {
  if (busy) return
  busy = true
  render()
  try {
    const candidates = await cleanupEmptyChats({
      dryRun: true,
      minAgeMs: 0,
    })
    if (candidates.length === 0) {
      orca.notify("info", t("No empty conversations"), {
        title: t("Clean empty chats"),
      })
      return
    }
    const confirmed = pluginSetting("confirmBeforeClean") !== false
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
      await reloadChats(true)
    }
  } catch (err) {
    console.error("[orca-ai-optimizer] 清理空对话失败", err)
  } finally {
    busy = false
    render()
  }
}

// ---------- 工具 ----------

function makeBtn(
  icon: string,
  title: string,
  onClick: () => void,
  danger = false,
): HTMLButtonElement {
  const btn = document.createElement("button")
  btn.type = "button"
  btn.className = "orca-aio-btn"
  if (danger) btn.classList.add("orca-aio-btn-danger")
  btn.title = title
  const i = document.createElement("i")
  i.className = icon
  btn.appendChild(i)
  btn.addEventListener("click", (e) => {
    e.preventDefault()
    e.stopPropagation()
    onClick()
  })
  btn.addEventListener("mousedown", (e) => e.stopPropagation())
  return btn
}

function makeBadge(text: string, cls: string): HTMLElement {
  const span = document.createElement("span")
  span.className = cls
  span.textContent = text
  return span
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
