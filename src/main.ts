import { setupL10N } from "./l10n"
import {
  PLUGIN_NAME,
  PLUGIN_VERSION,
  SETTING_AUTO_CLEAN,
  SETTING_CLEAN_AGE_HOURS,
  SETTING_CLEAN_CONFIRM,
  SETTING_CONFIRM,
  SETTING_SHOW_HEADBAR_BUTTON,
} from "./constants"
import { chatTitle, getAIChatBlock, getRepr, setPluginName } from "./core"
import { loadHistory, registerOpenedChat } from "./history"
import { loadFavorites } from "./favorites"
import {
  newChatInCurrentPanel,
  registerSidetool,
  unregisterSidetool,
} from "./sidetool"
import {
  mountManager,
  unmountManager,
  toggleManager,
} from "./manager"
import {
  applyHeadbarButton,
  unregisterHeadbarButton,
} from "./headbar"
import { maybeAutoClean } from "./autoClean"
import { injectStyles, removeStyles } from "./styles"

let unsubscribeNav: (() => void) | null = null
let unsubscribeSettings: (() => void) | null = null
const CMD_OPEN_MANAGER = "orca-ai-optimizer.openChatManager"
const CMD_NEW_CHAT = "orca-ai-optimizer.newChat"

/** 订阅面板状态：任一面板打开 aichat 对话时登记到注册表 */
function watchPanelNavigation(): void {
  if (unsubscribeNav != null) return
  const lastRegistered = new Map<string, number>()

  unsubscribeNav = window.Valtio.subscribe(orca.state, () => {
    const stack: any[] = [orca.state.panels]
    while (stack.length > 0) {
      const node = stack.pop()
      if (node == null) continue
      if (node.children != null) {
        stack.push(...node.children)
        continue
      }
      if (node.view !== "block") continue
      const blockId = Number(node.viewArgs?.blockId)
      if (!Number.isFinite(blockId) || lastRegistered.get(node.id) === blockId) {
        continue
      }
      const chat = getAIChatBlock(blockId)
      if (chat == null) continue
      lastRegistered.set(node.id, blockId)
      const ctx = getRepr(chat)?.ctx
      const rootKey =
        Array.isArray(ctx) && ctx.length > 0 ? Number(ctx[0]) : blockId
      if (Number.isFinite(rootKey)) {
        registerOpenedChat(rootKey, chat.id, chatTitle(chat))
      }
    }
  })
}

export async function load(name: string): Promise<void> {
  setPluginName(name || PLUGIN_NAME)
  setupL10N(orca.state.locale)

  await orca.plugins.setSettingsSchema(name || PLUGIN_NAME, {
    [SETTING_CONFIRM]: {
      label: "替换有内容的对话前先确认",
      description:
        "开启时，若当前面板正在显示已有提问的 AI 对话，点击「新对话」会先弹出确认框，避免误触丢失上下文。",
      type: "boolean",
      defaultValue: true,
    },
    [SETTING_SHOW_HEADBAR_BUTTON]: {
      label: "在顶栏显示「AI 对话」按钮",
      description:
        "关闭后顶栏不显示快捷按钮，仍可通过命令面板执行「AI 对话管理」。",
      type: "boolean",
      defaultValue: true,
    },
    [SETTING_AUTO_CLEAN]: {
      label: "自动清理空对话",
      description:
        "应用启动时扫描并清理从未产生用户消息的空 AI 对话（有引用、正在展示或最近打开过的不删）。",
      type: "boolean",
      defaultValue: false,
    },
    [SETTING_CLEAN_AGE_HOURS]: {
      label: "空对话保留时长（小时）",
      description:
        "自动清理时，创建不足该时长的空对话会被跳过；0 表示不按时间过滤。",
      type: "number",
      defaultValue: 24,
    },
    [SETTING_CLEAN_CONFIRM]: {
      label: "手动清理前先确认",
      description: "在对话管理窗口点击清理时先弹出确认框。",
      type: "boolean",
      defaultValue: true,
    },
  })

  injectStyles()
  registerSidetool()
  mountManager()
  applyHeadbarButton()
  unsubscribeSettings = window.Valtio.subscribe(
    orca.state.plugins[name || PLUGIN_NAME],
    () => applyHeadbarButton(),
  )

  if (orca.state.commands[CMD_OPEN_MANAGER] == null) {
    orca.commands.registerCommand(CMD_OPEN_MANAGER, () => {
      toggleManager()
    }, "AI 对话管理")
  }
  if (orca.state.commands[CMD_NEW_CHAT] == null) {
    orca.commands.registerCommand(CMD_NEW_CHAT, () => {
      void newChatInCurrentPanel(undefined, false)
    }, "新建 AI 对话（替换当前）")
  }

  await loadHistory()
  await loadFavorites()
  watchPanelNavigation()

  // 启动后稍等应用就绪再执行自动清理
  setTimeout(() => {
    void maybeAutoClean()
  }, 3000)

  console.log(
    `[orca-ai-optimizer] v${PLUGIN_VERSION} loaded (${name || PLUGIN_NAME}).`,
  )
}

export async function unload(): Promise<void> {
  unsubscribeNav?.()
  unsubscribeNav = null
  unsubscribeSettings?.()
  unsubscribeSettings = null
  unregisterSidetool()
  unregisterHeadbarButton()
  unmountManager()
  if (orca.state.commands[CMD_OPEN_MANAGER] != null) {
    orca.commands.unregisterCommand(CMD_OPEN_MANAGER)
  }
  if (orca.state.commands[CMD_NEW_CHAT] != null) {
    orca.commands.unregisterCommand(CMD_NEW_CHAT)
  }
  removeStyles()
  console.log(`[orca-ai-optimizer] v${PLUGIN_VERSION} unloaded.`)
}
