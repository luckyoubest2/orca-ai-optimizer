import { t } from "./l10n"
import {
  DEFAULT_CLEAN_AGE_HOURS,
  SETTING_AUTO_CLEAN,
  SETTING_CLEAN_AGE_HOURS,
} from "./constants"
import { pluginSetting } from "./core"
import { cleanupEmptyChats } from "./data"

/**
 * 自动清理：应用启动后执行一次（无每天一次的限制）。
 * 白名单保护与清理报告逻辑在 data.cleanupEmptyChats。
 */
export async function maybeAutoClean(): Promise<void> {
  if (pluginSetting(SETTING_AUTO_CLEAN) === false) return

  const ageHours =
    typeof pluginSetting(SETTING_CLEAN_AGE_HOURS) === "number"
      ? pluginSetting(SETTING_CLEAN_AGE_HOURS)
      : DEFAULT_CLEAN_AGE_HOURS
  const minAgeMs = Math.max(0, Number(ageHours) || 0) * 60 * 60 * 1000

  const removed = await cleanupEmptyChats({ minAgeMs })
  if (removed.length > 0) {
    orca.notify(
      "success",
      `${t("Cleanup report")}：${t("Deleted")} ${removed.length} ${t("Empty conversations")}`,
      { title: t("Clean empty chats") },
    )
  }
}
