import { t } from "./l10n"
import { toggleManager } from "./manager"
import { pluginSetting } from "./core"
import { newChatInCurrentPanel } from "./sidetool"

const React = window.React as typeof import("react")

export const HEADBAR_MANAGER_ID = "orcaAiOptimizer.openChatManager"
export const HEADBAR_NEW_CHAT_ID = "orcaAiOptimizer.newChat"

/** 顶栏按钮：新建 AI 对话（替换当前） */
function registerNewChatButton(): void {
  if (orca.state.headbarButtons?.[HEADBAR_NEW_CHAT_ID] != null) return
  orca.headbar.registerHeadbarButton(HEADBAR_NEW_CHAT_ID, () => {
    return React.createElement(
      orca.components.Tooltip,
      {
        text: t("New AI conversation (replace current)"),
        defaultPlacement: "bottom",
      },
      React.createElement(
        orca.components.Button,
        {
          variant: "plain",
          className: "orca-headbar-btn",
          onClick: () => {
            void newChatInCurrentPanel(undefined, false)
          },
        },
        React.createElement("i", {
          className: "ti ti-message-plus orca-headbar-icon",
        }),
      ),
    )
  })
}

/** 顶栏按钮：打开 AI 对话管理窗口（跟随设置显示/隐藏） */
function registerManagerButton(): void {
  if (orca.state.headbarButtons?.[HEADBAR_MANAGER_ID] != null) return
  orca.headbar.registerHeadbarButton(HEADBAR_MANAGER_ID, () => {
    return React.createElement(
      orca.components.Tooltip,
      {
        text: t("AI chat manager"),
        defaultPlacement: "bottom",
      },
      React.createElement(
        orca.components.Button,
        {
          variant: "plain",
          className: "orca-headbar-btn",
          onClick: () => toggleManager(),
        },
        React.createElement("i", {
          className: "ti ti-folders orca-headbar-icon",
        }),
      ),
    )
  })
}

function unregisterManagerButton(): void {
  if (orca.state.headbarButtons?.[HEADBAR_MANAGER_ID] != null) {
    orca.headbar.unregisterHeadbarButton(HEADBAR_MANAGER_ID)
  }
}

/** 应用顶栏按钮：新建按钮常驻，管理按钮跟随设置 */
export function applyHeadbarButton(): void {
  registerNewChatButton()
  if (pluginSetting("showHeadbarButton") === false) {
    unregisterManagerButton()
    return
  }
  registerManagerButton()
}

export function unregisterHeadbarButton(): void {
  unregisterManagerButton()
  if (orca.state.headbarButtons?.[HEADBAR_NEW_CHAT_ID] != null) {
    orca.headbar.unregisterHeadbarButton(HEADBAR_NEW_CHAT_ID)
  }
}
