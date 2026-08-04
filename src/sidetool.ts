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

/** 注册侧工具条「新对话」按钮（含历史下拉） */
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
  const pluginSettings = orca.state.plugins["orca-ai-optimizer"]?.settings
  if (pluginSettings?.showOnlyOnAIChat !== false) {
    const current = getAIChatBlock(rootBlockId)
    if (current == null) return null
  }
  return React.createElement(NewChatTool, {
    rootBlockId,
    panelId,
  })
}

function NewChatTool(props: {
  rootBlockId: number
  panelId: string
}): React.ReactElement {
  const h = React.createElement
  const { Button, Tooltip, Popup } = orca.components
  const [historyOpen, setHistoryOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const historyBtnRef = React.useRef<any>(null)
  const [anchorRect, setAnchorRect] = React.useState<{
    left: number
    top: number
    width: number
    height: number
  } | null>(null)

  const rootBlockId = props.rootBlockId
  const panelId = props.panelId

  const current = getAIChatBlock(rootBlockId)
  const icon = h(
    "span",
    {
      style: { position: "relative", display: "inline-flex" },
    },
    h("i", { className: "ti ti-message-chatbot" }),
    h(
      "span",
      {
        className: "orca-aio-newchat-badge",
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

  const mainButton = h(
    Button,
    {
      className: "orca-block-editor-sidetools-btn",
      variant: "plain",
      onClick: (e: { shiftKey?: boolean }) => {
        void onNewChatClick(rootBlockId, panelId, !!e?.shiftKey)
      },
    },
    icon,
  )

  const historyButton = h(
    Button,
    {
      className: "orca-block-editor-sidetools-btn orca-aio-history-btn",
      variant: "plain",
      onClick: (e: { stopPropagation?: () => void; shiftKey?: boolean }) => {
        e?.stopPropagation?.()
        const el = historyBtnRef.current
        if (el != null) {
          const r = el.getBoundingClientRect()
          setAnchorRect({
            left: r.left,
            top: r.top,
            width: r.width,
            height: r.height,
          })
        }
        setHistoryOpen((v: boolean) => !v)
        setSearch("")
      },
    },
    h("i", { className: "ti ti-history" }),
  )

  const historyPop = historyOpen
    ? h(HistoryPop, {
        rootBlockId,
        panelId,
        search,
        rect: anchorRect,
        onSearch: setSearch,
        onNewChat: () => {
          setHistoryOpen(false)
          void onNewChatClick(rootBlockId, panelId, false)
        },
        onClose: () => setHistoryOpen(false),
      })
    : null

  const mainTooltip = h(
    Tooltip,
    {
      text: `${t("New conversation")}（${t("Replace current")}）\nShift+${t("Open on the side")}`,
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
    h("span", { ref: historyBtnRef, style: { display: "inline-flex" } }, historyButton),
  )

  // 主按钮与历史按钮分开渲染（不并排）
  return h(
    "span",
    { style: { position: "relative", display: "inline-flex", flexDirection: "column" } },
    mainTooltip,
    historyTooltip,
    h(
      Popup,
      {
        rect: anchorRect ?? undefined,
        visible: historyOpen,
        onClose: () => setHistoryOpen(false),
        placement: "vertical",
        defaultPlacement: "left",
        alignment: "center",
        clickToClose: true,
        escapeToClose: true,
        offset: 6,
      },
      historyPop,
    ),
  )
}

/** 主按钮：快速新建对话并在当前面板替换旧窗口；Shift 则在侧边打开 */
async function onNewChatClick(
  rootBlockId: number,
  panelId: string,
  openOnSide: boolean,
): Promise<void> {
  // 当前面板已显示有内容的对话时先确认，避免误触丢失上下文
  const current = getAIChatBlock(rootBlockId)
  if (current != null) {
    const hasContent = chatHasUserMessages(current)
    if (hasContent && pluginSetting("confirmBeforeReplace") !== false) {
      const confirmed = window.confirm(
        `${t("New conversation")}：${t("Replace current")}？`,
      )
      if (!confirmed) return
    }
  }
  await openNewChatInPanel(rootBlockId, panelId, openOnSide)
}

/** 新建对话并在面板打开，同时登记历史 */
async function openNewChatInPanel(
  rootBlockId: number,
  panelId: string,
  openOnSide: boolean,
): Promise<void> {
  if (!aiConfigured()) {
    notifyAIUnconfigured()
    return
  }
  const panel = resolvePanel(panelId)
  const current = getAIChatBlock(rootBlockId)
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
  registerOpenedChat(rootBlockId, newId)
  openChat(newId, panel?.id ?? panelId, openOnSide)
  orca.notify("success", t("New conversation opened"), {
    title: t("New conversation"),
  })
}

/** 历史下拉浮层 */
function HistoryPop(props: {
  rootBlockId: number
  panelId: string
  search: string
  rect: {
    left: number
    top: number
    width: number
    height: number
  } | null
  onSearch: (v: string) => void
  onNewChat: () => void
  onClose: () => void
}): React.ReactElement {
  const h = React.createElement
  const [entries, setEntries] = React.useState<ChatHistoryEntry[] | null>(
    null,
  )
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    void (async () => {
      setLoading(true)
      const history = getHistory(props.rootBlockId)
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
      if (!cancelled) {
        setEntries(live)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [props.rootBlockId])

  const query = props.search.trim().toLowerCase()
  const visible = (entries ?? []).filter(
    (e: ChatHistoryEntry) =>
      !query || (e.title ?? "").toLowerCase().includes(query),
  )

  const list = h(
    "div",
    { className: "orca-aio-history-list" },
    loading
      ? h("div", { className: "orca-aio-history-empty" }, t("Loading…"))
      : visible.length === 0
        ? h(
            "div",
            { className: "orca-aio-history-empty" },
            t("No conversations yet"),
          )
        : visible.map((entry: ChatHistoryEntry) =>
            h(
              "div",
              {
                key: entry.blockId,
                className: "orca-aio-history-item",
                onClick: (e: { stopPropagation?: () => void }) => {
                  e?.stopPropagation?.()
                  registerOpenedChat(
                    props.rootBlockId,
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
    { className: "orca-aio-history-pop" },
    h(
      "div",
      {
        className: "orca-aio-history-item",
        onClick: (e: { stopPropagation?: () => void }) => {
          e?.stopPropagation?.()
          props.onNewChat()
        },
      },
      h("i", {
        className: "ti ti-plus",
        style: { marginRight: "4px" },
      }),
      h(
        "span",
        { className: "orca-aio-history-item-title" },
        t("New conversation"),
      ),
    ),
    h("input", {
      className: "orca-aio-history-search",
      placeholder: t("Search conversations"),
      value: props.search,
      onChange: (e: { target: { value: string } }) =>
        props.onSearch(e.target.value),
    }),
    list,
  )
}

function formatShortTime(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
