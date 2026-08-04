// 插件级常量：注册名、设置键、数据键

export const PLUGIN_NAME = "orca-ai-optimizer"
export const PLUGIN_VERSION = "0.2.0"

// AppKeys（对照安装版 v1.88.0 渲染包确认）
// AIBaseURL=19, AIAPIKey=20, AITag=21, AIModel=22
export const KEY_AI_BASE_URL = 19
export const KEY_AI_API_KEY = 20
export const KEY_AI_TAG = 21
export const KEY_AI_MODEL = 22

// 侧工具条（F0/F1）设置键
export const SETTING_CONFIRM = "confirmBeforeReplace"
export const SETTING_ONLY_ON_CHAT = "showOnlyOnAIChat"

// 侧边栏对话管理（F2）设置键
export const SETTING_AUTO_CLEAN = "autoCleanEmptyChats"
export const SETTING_CLEAN_AGE_HOURS = "autoCleanEmptyChatsAfterHours"
export const SETTING_CLEAN_CONFIRM = "confirmBeforeClean"

// 持久化数据键（按仓库隔离）
export const DATA_KEY_HISTORY = "panelChatHistory"
export const DATA_KEY_LAST_CLEAN = "lastAutoCleanAt"

// 侧工具条注册 ID（F0/F1 新对话 + 历史）
export const SIDETOOL_ID = "orcaAiOptimizer.newChat"

// 自动清理默认值
export const DEFAULT_CLEAN_AGE_HOURS = 24
