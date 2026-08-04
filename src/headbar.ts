import { t } from "./l10n"
import { toggleManager } from "./manager"

const React = window.React as typeof import("react")

const HEADBAR_BUTTON_ID = "orcaAiOptimizer.openChatManager"

/** 顶栏快捷按钮：打开 AI 对话管理窗口 */
export function registerHeadbarButton(): void {
  if (orca.state.headbarButtons?.[HEADBAR_BUTTON_ID] != null) return
  orca.headbar.registerHeadbarButton(HEADBAR_BUTTON_ID, () => {
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
          className: "ti ti-message-chatbot orca-headbar-icon",
        }),
      ),
    )
  })
}

export function unregisterHeadbarButton(): void {
  if (orca.state.headbarButtons?.[HEADBAR_BUTTON_ID] != null) {
    orca.headbar.unregisterHeadbarButton(HEADBAR_BUTTON_ID)
  }
}
