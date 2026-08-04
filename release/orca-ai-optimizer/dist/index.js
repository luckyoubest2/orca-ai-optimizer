const zhCN = {
  "New conversation": "新对话",
  "Conversation history": "对话历史",
  "Search conversations": "搜索对话",
  "No conversations yet": "还没有对话记录",
  "AI conversations": "AI 对话",
  "Open": "打开",
  "Rename": "重命名",
  "Delete": "删除",
  "Export markdown": "导出 Markdown",
  "Empty conversations": "空对话",
  "All conversations": "全部对话",
  "Last active": "最后活跃",
  "Messages": "消息",
  "Untitled": "未命名",
  "Clean empty chats": "清理空对话",
  "Clean now": "立即清理",
  "No empty conversations": "没有可清理的空对话",
  "Cleanup report": "清理报告",
  "Confirm cleanup": "确认清理",
  "Cancel": "取消",
  "Confirm": "确认",
  "Delete conversation?": "确定删除这段对话吗？",
  "Rename conversation": "重命名对话",
  "New title": "新标题",
  "Conversation opened": "已打开对话",
  "Failed to open conversation": "打开对话失败",
  "Refresh": "刷新",
  "AI chat manager": "AI 对话管理",
  "AI chats": "AI 对话",
  "Loading…": "加载中…",
  "No conversations match": "没有匹配的对话",
  "Deleted": "已删除",
  "Export": "导出",
  "Open in current panel": "在当前面板打开",
  "Open on the side": "在侧边打开",
  "Open last": "打开上次对话",
  "Open last conversation": "打开上次对话",
  "New": "新建",
  "Delete this empty chat?": "删除这个空对话？",
  "This conversation is empty": "这段对话还是空的",
  "Replace current": "替换当前",
  "Failed to create conversation": "创建对话失败",
  "New conversation opened": "已打开新的对话",
  "Failed to export conversation": "导出对话失败",
  "Shift": "Shift",
  "Chevron": "▾",
  "History and new chat": "历史与新建",
  "Close": "关闭",
  "Empty": "空",
  "Copy markdown": "复制 Markdown",
  "Copy": "复制",
  "Copied to clipboard": "已复制到剪贴板",
  "Right click": "右键",
  "AI chat panel only": "仅 AI 对话面板",
  "Filter conversations of this panel": "查看本面板来源的对话",
  "All sources": "全部来源",
  "Source": "来源",
  "Sort": "排序",
  "Created": "创建时间",
  "Message count": "消息数",
  "New AI conversation (replace current)": "新建 AI 对话（替换当前）",
  "Over": "超过",
  "days": "天",
  "Batch operations": "批量操作",
  "Batch": "批量",
  "Select all": "全选",
  "Selected": "已选",
  "Conversations": "条对话",
  "Copy block IDs": "复制块 ID",
  "Favorite": "收藏",
  "Unfavorite": "取消收藏",
  "Favorited": "已收藏",
  "Not favorited": "未收藏",
  "All": "全部",
  "Favorited conversations cannot be deleted": "收藏的对话不能删除",
  "Open last conversation on the side by default": "打开上次对话默认在侧边栏打开"
};
const enUS = {
  "New conversation": "New conversation",
  "Conversation history": "Conversation history",
  "Search conversations": "Search conversations",
  "No conversations yet": "No conversations yet",
  "AI conversations": "AI conversations",
  "Open": "Open",
  "Rename": "Rename",
  "Delete": "Delete",
  "Export markdown": "Export Markdown",
  "Empty conversations": "Empty conversations",
  "All conversations": "All conversations",
  "Last active": "Last active",
  "Messages": "Messages",
  "Untitled": "Untitled",
  "Clean empty chats": "Clean empty chats",
  "Clean now": "Clean now",
  "No empty conversations": "No empty conversations",
  "Cleanup report": "Cleanup report",
  "Confirm cleanup": "Confirm cleanup",
  "Cancel": "Cancel",
  "Confirm": "Confirm",
  "Delete conversation?": "Delete this conversation?",
  "Rename conversation": "Rename conversation",
  "New title": "New title",
  "Conversation opened": "Conversation opened",
  "Failed to open conversation": "Failed to open conversation",
  "Refresh": "Refresh",
  "AI chat manager": "AI chat manager",
  "AI chats": "AI chats",
  "Loading…": "Loading…",
  "No conversations match": "No conversations match",
  "Deleted": "Deleted",
  "Export": "Export",
  "Open in current panel": "Open in current panel",
  "Open on the side": "Open on the side",
  "Open last": "Open last conversation",
  "Open last conversation": "Open last conversation",
  "New": "New",
  "Delete this empty chat?": "Delete this empty chat?",
  "This conversation is empty": "This conversation is empty",
  "Replace current": "replace current",
  "Failed to create conversation": "Failed to create conversation",
  "New conversation opened": "New conversation opened",
  "Failed to export conversation": "Failed to export conversation",
  "Shift": "Shift",
  "Chevron": "▾",
  "History and new chat": "history & new chat",
  "Close": "Close",
  "Empty": "Empty",
  "Copy markdown": "Copy Markdown",
  "Copy": "Copy",
  "Copied to clipboard": "Copied to clipboard",
  "Right click": "Right-click",
  "AI chat panel only": "AI chat panels only",
  "Filter conversations of this panel": "Filter conversations from this panel",
  "All sources": "All sources",
  "Source": "Source",
  "Sort": "Sort",
  "Created": "Created",
  "Message count": "Message count",
  "New AI conversation (replace current)": "New AI conversation (replace current)",
  "Over": "over",
  "days": "days",
  "Batch operations": "Batch operations",
  "Batch": "Batch",
  "Select all": "Select all",
  "Selected": "selected",
  "Conversations": "conversations",
  "Copy block IDs": "Copy block IDs",
  "Favorite": "Favorite",
  "Unfavorite": "Unfavorite",
  "Favorited": "Favorited",
  "Not favorited": "Not favorited",
  "All": "All",
  "Favorited conversations cannot be deleted": "Favorited conversations cannot be deleted",
  "Open last conversation on the side by default": "Open last conversation on the side by default"
};
let table = enUS;
function setupL10N(locale) {
  table = locale.toLowerCase().startsWith("zh") ? zhCN : enUS;
}
function t(key) {
  return table[key] ?? enUS[key] ?? key;
}
const PLUGIN_NAME = "orca-ai-optimizer";
const PLUGIN_VERSION = "1.1.0";
const KEY_AI_BASE_URL = 19;
const KEY_AI_API_KEY = 20;
const KEY_AI_TAG = 21;
const KEY_AI_MODEL = 22;
const SETTING_CONFIRM = "confirmBeforeReplace";
const SETTING_SHOW_HEADBAR_BUTTON = "showHeadbarButton";
const SETTING_OPEN_LAST_ON_SIDE = "openLastOnSide";
const SETTING_AUTO_CLEAN = "autoCleanEmptyChats";
const SETTING_CLEAN_AGE_HOURS = "autoCleanEmptyChatsAfterHours";
const SETTING_CLEAN_CONFIRM = "confirmBeforeClean";
const DATA_KEY_HISTORY = "panelChatHistory";
const DATA_KEY_FAVORITES = "favorites";
const SIDETOOL_ID = "orcaAiOptimizer.newChat";
const DEFAULT_CLEAN_AGE_HOURS = 24;
let pluginName = "orca-ai-optimizer";
function setPluginName(name) {
  pluginName = name;
}
function getPluginName() {
  return pluginName;
}
function pluginSetting(key) {
  return orca.state.plugins[pluginName]?.settings?.[key];
}
function getRepr(block) {
  return block?.properties?.find((p) => p.name === "_repr")?.value;
}
function getAIChatBlock(blockId) {
  if (blockId == null) return void 0;
  const raw = orca.state.blocks[blockId];
  const repr = getRepr(raw);
  if (repr == null) return void 0;
  if (repr.type === "aichat") return raw;
  if (repr.type === "mirror") {
    const mirroredId = repr.mirroredId;
    const mirrored = mirroredId != null ? orca.state.blocks[mirroredId] : void 0;
    return getRepr(mirrored)?.type === "aichat" ? mirrored : void 0;
  }
  return void 0;
}
function chatHasUserMessages(chat) {
  const repr = getRepr(chat);
  if (repr?.type !== "aichat" || !Array.isArray(repr.msgs)) return false;
  return repr.msgs.some((m) => m?.role === "user");
}
function chatTitle(chat) {
  const repr = getRepr(chat);
  if (repr?.type === "aichat" && repr.cap) return repr.cap;
  return "";
}
function chatCtx(chat) {
  const repr = getRepr(chat);
  if (repr?.type === "aichat" && Array.isArray(repr.ctx)) return repr.ctx;
  return [];
}
function resolvePanel(panelId) {
  const id = panelId ?? orca.state.activePanel;
  return orca.nav.findViewPanel(id, orca.state.panels);
}
function shallowEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const k of keysA) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}
function openBlockInPanel(blockId, panelId, openOnSide) {
  if (openOnSide) {
    orca.nav.openInLastPanel("block", { blockId });
    return;
  }
  const panel = resolvePanel(panelId);
  if (panel?.locked) {
    orca.nav.openInLastPanel("block", { blockId });
    return;
  }
  const target = resolvePanel(panelId);
  if (target == null) {
    orca.nav.goTo("block", { blockId }, panelId);
    return;
  }
  const nextArgs = { blockId };
  if (target.view !== "block" || !shallowEqual(target.viewArgs, nextArgs)) {
    orca.state.panelBackHistory.push({
      activePanel: target.id,
      view: target.view,
      viewArgs: target.viewArgs ?? {}
    });
    target.view = "block";
    target.viewArgs = nextArgs;
    target.viewState?.editor && (target.viewState.editor.showMindMap = false);
    if (orca.state.panelForwardHistory.length > 0) {
      orca.state.panelForwardHistory.length = 0;
    }
  }
}
function openChat(blockId, panelId, openOnSide = false) {
  if (panelId != null) {
    openBlockInPanel(blockId, panelId, openOnSide);
  } else if (openOnSide) {
    orca.nav.openInLastPanel("block", { blockId });
  } else {
    orca.nav.goTo("block", { blockId });
  }
  scrollChatToBottom();
}
function scrollChatToBottom() {
  const findContainer = () => document.querySelector(".orca-aichat-messages");
  let tries = 0;
  const tick = () => {
    const el = findContainer();
    if (el != null) {
      el.scrollTop = el.scrollHeight;
      return;
    }
    if (++tries < 40) {
      setTimeout(tick, 100);
    }
  };
  setTimeout(tick, 150);
}
async function createNewChatBlock(ctx) {
  const aiTag = orca.state.settings[KEY_AI_TAG] || "AI Result";
  let newBlockId = null;
  try {
    await orca.commands.invokeGroup(async () => {
      newBlockId = await orca.commands.invokeEditorCommand(
        "core.editor.insertBlock",
        null,
        null,
        null,
        null,
        { type: "aichat", ctx, msgs: [] }
      );
      if (newBlockId != null) {
        await orca.commands.invokeEditorCommand(
          "core.editor.insertTag",
          null,
          newBlockId,
          aiTag
        );
      }
    });
  } catch (err) {
    console.error("[orca-ai-optimizer] 创建新对话失败", err);
    return null;
  }
  return newBlockId;
}
function aiConfigured() {
  return !!orca.state.settings[KEY_AI_BASE_URL] && !!orca.state.settings[KEY_AI_API_KEY] && !!orca.state.settings[KEY_AI_MODEL];
}
function notifyAIUnconfigured() {
  orca.notify("error", "请先在设置中配置 AI 的 Base URL、API Key 与模型！", {
    title: "AI 对话",
    action: () => {
      orca.commands.invokeCommand("core.openSettings");
    }
  });
}
async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn("[orca-ai-optimizer] Clipboard API 失败，改用兜底", err);
    }
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.left = "0";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch (err) {
    console.error("[orca-ai-optimizer] 复制失败", err);
    return false;
  }
}
let registry$1 = {};
let loaded$1 = false;
let saveTimer$1 = null;
function repoKey$1() {
  return String(orca.state.repo ?? "");
}
function rootKey(rootBlockId) {
  return String(rootBlockId);
}
function parseData$1(raw) {
  if (raw == null) return {};
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
  return raw && typeof raw === "object" ? raw : {};
}
async function loadHistory() {
  if (loaded$1) return;
  loaded$1 = true;
  try {
    const raw = await orca.plugins.getData(getPluginName(), DATA_KEY_HISTORY);
    registry$1 = parseData$1(raw);
  } catch (err) {
    console.error("[orca-ai-optimizer] 读取对话历史失败", err);
    registry$1 = {};
  }
}
function saveHistory() {
  if (saveTimer$1 != null) clearTimeout(saveTimer$1);
  saveTimer$1 = setTimeout(() => {
    saveTimer$1 = null;
    orca.plugins.setData(getPluginName(), DATA_KEY_HISTORY, JSON.stringify(registry$1)).catch((err) => {
      console.error("[orca-ai-optimizer] 保存对话历史失败", err);
    });
  }, 150);
}
function getHistory(rootBlockId) {
  return registry$1[repoKey$1()]?.[rootKey(rootBlockId)] ?? [];
}
function registerOpenedChat(rootBlockId, blockId, title) {
  const rk = repoKey$1();
  if (registry$1[rk] == null) registry$1[rk] = {};
  const key = rootKey(rootBlockId);
  const list = registry$1[rk][key] ?? [];
  const existing = list.find((e) => e.blockId === blockId);
  if (existing != null) {
    existing.openedAt = Date.now();
    if (title != null && title.length > 0) existing.title = title;
  } else {
    list.unshift({ blockId, openedAt: Date.now(), title });
  }
  registry$1[rk][key] = list.slice(0, 50);
  saveHistory();
}
function removeFromHistory(blockId) {
  const rk = repoKey$1();
  const roots = registry$1[rk];
  if (roots == null) return;
  let changed = false;
  for (const key of Object.keys(roots)) {
    const before = roots[key].length;
    roots[key] = roots[key].filter((e) => e.blockId !== blockId);
    if (roots[key].length !== before) changed = true;
    if (roots[key].length === 0) delete roots[key];
  }
  if (changed) saveHistory();
}
function removeManyFromHistory(blockIds) {
  for (const id of blockIds) removeFromHistory(id);
}
let registry = {};
let loaded = false;
let saveTimer = null;
function repoKey() {
  return String(orca.state.repo ?? "");
}
function parseData(raw) {
  if (raw == null) return {};
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
  return raw && typeof raw === "object" ? raw : {};
}
async function loadFavorites() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = await orca.plugins.getData(getPluginName(), DATA_KEY_FAVORITES);
    registry = parseData(raw);
  } catch (err) {
    console.error("[orca-ai-optimizer] 读取收藏失败", err);
    registry = {};
  }
}
function persist() {
  if (saveTimer != null) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    orca.plugins.setData(getPluginName(), DATA_KEY_FAVORITES, JSON.stringify(registry)).catch((err) => {
      console.error("[orca-ai-optimizer] 保存收藏失败", err);
    });
  }, 150);
}
function isFavorite(blockId) {
  return (registry[repoKey()] ?? []).includes(Number(blockId));
}
function getFavorites() {
  return new Set(registry[repoKey()] ?? []);
}
function toggleFavorite(blockId) {
  const rk = repoKey();
  const list = registry[rk] ?? [];
  const id = Number(blockId);
  const idx = list.indexOf(id);
  if (idx >= 0) {
    list.splice(idx, 1);
    registry[rk] = list;
    persist();
    return false;
  }
  list.push(id);
  registry[rk] = list;
  persist();
  return true;
}
function setFavorites(blockIds, value) {
  const rk = repoKey();
  const list = registry[rk] ?? [];
  const set = new Set(list);
  for (const id of blockIds) {
    if (value) set.add(Number(id));
    else set.delete(Number(id));
  }
  registry[rk] = Array.from(set);
  persist();
}
function removeManyFromFavorites(blockIds) {
  setFavorites(blockIds, false);
}
function chatInfoFromBlock(block) {
  if (block == null) return null;
  const repr = getRepr(block);
  if (repr?.type !== "aichat") return null;
  const msgs = Array.isArray(repr.msgs) ? repr.msgs : [];
  const userCount = msgs.filter((m) => m?.role === "user").length;
  return {
    block,
    blockId: block.id,
    title: chatTitle(block),
    userMsgCount: userCount,
    totalMsgCount: msgs.length,
    isEmpty: userCount === 0,
    ctx: chatCtx(block),
    modified: new Date(block.modified).getTime(),
    created: new Date(block.created).getTime()
  };
}
function isChatVisibleInAnyPanel(blockId) {
  const stack = [orca.state.panels];
  while (stack.length > 0) {
    const node = stack.pop();
    if (node == null) continue;
    if (node.children != null) {
      stack.push(...node.children);
      continue;
    }
    if (node.view === "block" && Number(node.viewArgs?.blockId) === Number(blockId)) {
      return true;
    }
  }
  return false;
}
function isChatInNavigationHistory(blockId) {
  const histories = [
    orca.state.panelBackHistory,
    orca.state.panelForwardHistory
  ];
  return histories.some(
    (h) => h.some(
      (e) => e?.view === "block" && Number(e?.viewArgs?.blockId) === Number(blockId)
    )
  );
}
function currentAITag() {
  return orca.state.settings[KEY_AI_TAG] || "AI Result";
}
async function listChats() {
  let blocks = [];
  try {
    const tagged = await orca.invokeBackend(
      "get-blocks-with-tags",
      [currentAITag()]
    );
    blocks = (tagged ?? []).filter((b) => {
      const repr = getRepr(b);
      return repr?.type === "aichat" || repr?.type === "mirror";
    });
  } catch (err) {
    console.error("[orca-ai-optimizer] 按标签查询对话失败", err);
    blocks = [];
  }
  if (blocks.length === 0) {
    try {
      const all = await orca.invokeBackend("get-all-blocks");
      blocks = (all ?? []).filter((b) => {
        const repr = getRepr(b);
        return repr?.type === "aichat";
      });
    } catch (err) {
      console.error("[orca-ai-optimizer] 全量扫描对话失败", err);
    }
  }
  const list = [];
  for (const b of blocks) {
    const info = chatInfoFromBlock(b);
    if (info != null) list.push(info);
  }
  list.sort((a, b) => b.modified - a.modified);
  return list;
}
async function preloadRootBlocks(chats) {
  const ids = Array.from(
    new Set(
      chats.map((c) => c.ctx?.[0]).filter((id) => id != null && Number.isFinite(Number(id)))
    )
  );
  const missing = ids.filter((id) => orca.state.blocks[id] == null);
  if (missing.length === 0) return;
  try {
    const blocks = await orca.invokeBackend("get-blocks", missing);
    for (const b of blocks ?? []) {
      if (b?.id != null) orca.state.blocks[b.id] = b;
    }
  } catch (err) {
    console.error("[orca-ai-optimizer] 预取文档块失败", err);
  }
}
function rootBlockTitle(rootBlockId) {
  if (rootBlockId == null) return "";
  const block = orca.state.blocks[rootBlockId];
  if (block == null) return "";
  if (block.aliases?.length > 0) return block.aliases[0];
  const text = Array.isArray(block.content) ? block.content.map((f) => typeof f?.v === "string" ? f.v : "").join("") : "";
  return text.trim().slice(0, 40);
}
async function deleteChat(blockId) {
  if (isFavorite(blockId)) {
    console.warn(`[orca-ai-optimizer] 对话 ${blockId} 已收藏，拒绝删除`);
    return false;
  }
  try {
    await orca.commands.invokeEditorCommand(
      "core.editor.deleteBlocks",
      null,
      [blockId]
    );
    removeManyFromHistory([blockId]);
    removeManyFromFavorites([blockId]);
    return true;
  } catch (err) {
    console.error("[orca-ai-optimizer] 编辑器删除失败，改用后端删除", err);
  }
  try {
    await orca.invokeBackend("delete-blocks", [blockId]);
    orca.state.blocks[blockId] = void 0;
    orca.broadcasts.broadcast("orca.delete-blocks", [blockId]);
    removeManyFromHistory([blockId]);
    removeManyFromFavorites([blockId]);
    return true;
  } catch (err2) {
    console.error("[orca-ai-optimizer] 删除对话失败", err2);
    return false;
  }
}
async function renameChat(blockId, newTitle) {
  const block = orca.state.blocks[blockId];
  if (block == null) return false;
  const repr = getRepr(block);
  if (repr?.type !== "aichat") return false;
  const next = { ...repr };
  if (newTitle.trim().length > 0) {
    next.cap = newTitle.trim();
  } else {
    delete next.cap;
  }
  try {
    await orca.commands.invokeTopEditorCommand(
      "core.editor.setProperties",
      null,
      [blockId],
      [{ name: "_repr", type: 0, value: next }]
    );
    return true;
  } catch (err) {
    console.error("[orca-ai-optimizer] 重命名对话失败", err);
    return false;
  }
}
async function exportChatMarkdown(blockId) {
  try {
    let block = orca.state.blocks[blockId];
    if (block == null) {
      const fetched = await orca.invokeBackend("get-block", blockId);
      if (fetched != null) {
        orca.state.blocks[fetched.id] = fetched;
        block = fetched;
      }
    }
    const repr = getRepr(block);
    if (block == null || repr?.type !== "aichat") return null;
    const msgs = Array.isArray(repr.msgs) ? repr.msgs : [];
    const parts = [];
    for (const m of msgs) {
      if (m == null) continue;
      if (m.role === "system" || m.role === "tool") continue;
      if (m.role === "user") {
        const body = `${m.content ?? ""}`.trim();
        const segs = [];
        if (body) segs.push(body);
        const imageCount = Array.isArray(m.images) ? m.images.length : 0;
        if (imageCount > 0) {
          segs.push(`${imageCount} attached image${imageCount > 1 ? "s" : ""}`);
        }
        const text = segs.join(" ").trim();
        if (text) parts.push(`**User**

${text}`);
      } else if (m.role === "assistant") {
        const content = `${m.content ?? ""}`.trim();
        if (content) parts.push(`**Assistant**

${content}`);
      }
    }
    if (parts.length === 0) return "";
    const title = repr.cap ? `# ${repr.cap}

` : "";
    return title + parts.join("\n\n");
  } catch (err) {
    console.error("[orca-ai-optimizer] 导出对话失败", err);
    return null;
  }
}
function isCleanupCandidate(info, opts = {}) {
  if (!info.isEmpty) return false;
  if (isChatVisibleInAnyPanel(info.blockId)) return false;
  if (isChatInNavigationHistory(info.blockId)) return false;
  if (info.block.backRefs?.length > 0) return false;
  if (info.block.children?.length > 0) return false;
  if (isFavorite(info.blockId)) return false;
  if (opts.minAgeMs != null && Date.now() - info.created < opts.minAgeMs) {
    return false;
  }
  return true;
}
async function cleanupEmptyChats(opts = {}) {
  const list = await listChats();
  const candidates = list.filter((info) => isCleanupCandidate(info, opts)).map((info) => info.blockId);
  if (opts.dryRun || candidates.length === 0) return candidates;
  const removed = [];
  for (const blockId of candidates) {
    const ok = await deleteChat(blockId);
    if (ok) removed.push(blockId);
  }
  return removed;
}
const React$2 = window.React;
const Valtio = window.Valtio;
const store = Valtio.proxy({ open: false, filterSource: null });
let root = null;
let holder = null;
function openManager() {
  store.filterSource = null;
  store.open = true;
}
function openManagerWithSource(sourceRootId) {
  store.filterSource = sourceRootId;
  store.open = true;
}
function closeManager() {
  store.open = false;
}
function toggleManager() {
  if (store.open) closeManager();
  else openManager();
}
function mountManager() {
  if (root != null) return;
  holder = document.createElement("div");
  holder.id = "orca-ai-optimizer-manager-root";
  document.body.appendChild(holder);
  const create = window.createRoot;
  if (typeof create === "function") {
    root = create(holder);
    root.render(React$2.createElement(ManagerDialog));
  } else {
    setTimeout(() => {
      holder?.remove();
      holder = null;
      mountManager();
    }, 1e3);
  }
}
function unmountManager() {
  root?.unmount();
  root = null;
  holder?.remove();
  holder = null;
  store.open = false;
}
function ManagerDialog() {
  const h = React$2.createElement;
  const snap = Valtio.useSnapshot(store);
  const visible = !!snap.open;
  const [chats, setChats] = React$2.useState([]);
  const [filter, setFilter] = React$2.useState("");
  const [sourceFilter, setSourceFilter] = React$2.useState(
    snap.filterSource ?? null
  );
  const [minUserMsgs, setMinUserMsgs] = React$2.useState(0);
  const [msgCompare, setMsgCompare] = React$2.useState("gte");
  const [favFilter, setFavFilter] = React$2.useState(
    "all"
  );
  const [inactiveDays, setInactiveDays] = React$2.useState(0);
  const [sortBy, setSortBy] = React$2.useState(
    "modified"
  );
  const [busy, setBusy] = React$2.useState(false);
  const [renamingId, setRenamingId] = React$2.useState(null);
  const [favorites, setFavoritesState] = React$2.useState(
    getFavorites()
  );
  const [batchMode, setBatchMode] = React$2.useState(false);
  const [selected, setSelected] = React$2.useState(/* @__PURE__ */ new Set());
  const busyRef = React$2.useRef(false);
  React$2.useEffect(() => {
    setSourceFilter(snap.filterSource ?? null);
  }, [snap.filterSource]);
  const reload = React$2.useCallback(async (force = false) => {
    if (busyRef.current && !force) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const list2 = await listChats();
      await preloadRootBlocks(list2);
      setChats(list2);
    } catch (err) {
      console.error("[orca-ai-optimizer] 加载对话列表失败", err);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, []);
  React$2.useEffect(() => {
    if (visible) void reload(true);
  }, [visible, reload]);
  const onClose = React$2.useCallback(() => {
    store.open = false;
    setBatchMode(false);
    setSelected(/* @__PURE__ */ new Set());
  }, []);
  const query = filter.trim().toLowerCase();
  const sources = Array.from(
    new Set(
      chats.map((c) => c.ctx?.[0]).filter((id) => id != null)
    )
  );
  let visibleChats = chats.filter((c) => {
    if (sourceFilter != null && Number(c.ctx?.[0]) !== Number(sourceFilter)) {
      return false;
    }
    if (msgCompare === "gte" && c.userMsgCount < minUserMsgs) return false;
    if (msgCompare === "lte" && c.userMsgCount > minUserMsgs) return false;
    const fav = favorites.has(c.blockId);
    if (favFilter === "fav" && !fav) return false;
    if (favFilter === "unfav" && fav) return false;
    if (inactiveDays > 0) {
      const cutoff = Date.now() - inactiveDays * 24 * 60 * 60 * 1e3;
      if (c.modified >= cutoff) return false;
    }
    if (!query) return true;
    const rootTitle = rootBlockTitle(c.ctx?.[0]).toLowerCase();
    return c.title.toLowerCase().includes(query) || rootTitle.includes(query) || String(c.blockId).includes(query);
  });
  visibleChats = [...visibleChats].sort((a, b) => {
    if (sortBy === "created") return b.created - a.created;
    if (sortBy === "user") return b.userMsgCount - a.userMsgCount;
    return b.modified - a.modified;
  });
  const visibleIds = visibleChats.map((c) => c.blockId);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        for (const id of visibleIds) next.delete(id);
      } else {
        for (const id of visibleIds) next.add(id);
      }
      return next;
    });
  };
  const doBatchFav = (value) => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setFavorites(ids, value);
    setFavoritesState(getFavorites());
    orca.notify(
      "success",
      `${value ? t("Favorite") : t("Unfavorite")} ${ids.length} ${t("Conversations")}`,
      { title: t("Batch operations") }
    );
  };
  const emptyCount = chats.filter((c) => c.isEmpty).length;
  const toolbar = h(
    "div",
    { className: "orca-aio-manager-toolbar" },
    h("input", {
      className: "orca-aio-search",
      placeholder: t("Search conversations"),
      value: filter,
      onChange: (e) => setFilter(e.target.value)
    }),
    h(
      "button",
      {
        type: "button",
        className: "orca-aio-btn",
        title: t("Refresh"),
        onClick: () => void reload(true)
      },
      h("i", { className: "ti ti-reload" })
    ),
    h(
      "button",
      {
        type: "button",
        className: batchMode ? "orca-aio-btn orca-aio-btn-primary" : "orca-aio-btn",
        title: t("Batch operations"),
        onClick: () => {
          setBatchMode((v) => !v);
          setSelected(/* @__PURE__ */ new Set());
        }
      },
      h("i", { className: "ti ti-list-check" }),
      t("Batch")
    ),
    h(
      "button",
      {
        type: "button",
        className: "orca-aio-btn orca-aio-btn-primary",
        disabled: busy,
        onClick: () => void doClean(reload)
      },
      h("i", { className: "ti ti-broom" }),
      t("Clean empty chats")
    )
  );
  const batchBar = batchMode ? h(
    "div",
    { className: "orca-aio-batch-bar" },
    h(
      "label",
      { className: "orca-aio-filter-label" },
      h("input", {
        type: "checkbox",
        checked: allSelected,
        onChange: toggleSelectAll
      }),
      t("Select all")
    ),
    h(
      "span",
      { className: "orca-aio-batch-count" },
      `${selected.size} ${t("Selected")}`
    ),
    h(
      "button",
      {
        type: "button",
        className: "orca-aio-btn orca-aio-btn-text orca-aio-btn-danger",
        disabled: selected.size === 0,
        onClick: () => void doBatchDelete(
          selected,
          reload,
          () => setFavoritesState(getFavorites())
        )
      },
      h("i", { className: "ti ti-trash" }),
      t("Delete")
    ),
    h(
      "button",
      {
        type: "button",
        className: "orca-aio-btn orca-aio-btn-text",
        disabled: selected.size === 0,
        onClick: () => void doBatchCopyIds(selected)
      },
      h("i", { className: "ti ti-copy" }),
      t("Copy block IDs")
    ),
    h(
      "button",
      {
        type: "button",
        className: "orca-aio-btn orca-aio-btn-text",
        disabled: selected.size === 0,
        onClick: () => doBatchFav(true)
      },
      h("i", { className: "ti ti-star" }),
      t("Favorite")
    ),
    h(
      "button",
      {
        type: "button",
        className: "orca-aio-btn orca-aio-btn-text",
        disabled: selected.size === 0,
        onClick: () => doBatchFav(false)
      },
      h("i", { className: "ti ti-star-off" }),
      t("Unfavorite")
    )
  ) : null;
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
          onChange: (e) => {
            const v = e.target.value;
            setSourceFilter(v ? Number(v) : null);
          }
        },
        h("option", { value: "" }, t("All sources")),
        sources.map(
          (id) => h(
            "option",
            { key: id, value: String(id) },
            rootBlockTitle(id) || `#${id}`
          )
        )
      )
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
          onChange: (e) => setMsgCompare(e.target.value)
        },
        h("option", { value: "lte" }, "≤"),
        h("option", { value: "gte" }, "≥")
      ),
      h("input", {
        type: "number",
        min: 0,
        className: "orca-aio-select orca-aio-number",
        value: minUserMsgs,
        onChange: (e) => setMinUserMsgs(Math.max(0, Number(e.target.value) || 0))
      })
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
          onChange: (e) => setFavFilter(e.target.value)
        },
        h("option", { value: "all" }, t("All")),
        h("option", { value: "fav" }, t("Favorited")),
        h("option", { value: "unfav" }, t("Not favorited"))
      )
    ),
    h(
      "label",
      { className: "orca-aio-filter-label" },
      `${t("Last active")} ${t("Over")}`,
      h(
        "input",
        {
          type: "number",
          min: 0,
          className: "orca-aio-select orca-aio-number",
          placeholder: "0",
          value: inactiveDays,
          onChange: (e) => setInactiveDays(Number(e.target.value) || 0)
        }
      ),
      t("days")
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
          onChange: (e) => setSortBy(e.target.value)
        },
        h("option", { value: "modified" }, t("Last active")),
        h("option", { value: "created" }, t("Created")),
        h("option", { value: "user" }, t("Message count"))
      )
    )
  );
  const summary = h(
    "div",
    { className: "orca-aio-summary" },
    busy ? t("Loading…") : `${t("All conversations")}: ${chats.length} · ${t("Empty conversations")}: ${emptyCount}`
  );
  const list = h(
    "div",
    { className: "orca-aio-list" },
    visibleChats.length === 0 ? h(
      "div",
      { className: "orca-aio-empty" },
      busy ? t("Loading…") : filter || favFilter !== "all" || sourceFilter != null || inactiveDays > 0 ? t("No conversations match") : t("No conversations yet")
    ) : visibleChats.map(
      (info) => buildRow({
        info,
        renamingId,
        setRenamingId,
        reload,
        favorites,
        onToggleFav: (id) => {
          const now = toggleFavorite(id);
          setFavoritesState(getFavorites());
          return now;
        },
        batchMode,
        selected: selected.has(info.blockId),
        onSelect: () => toggleSelect(info.blockId)
      })
    )
  );
  return h(
    orca.components.ModalOverlay,
    {
      visible,
      onClose,
      className: "orca-aio-manager-overlay"
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
            title: t("Close")
          },
          h("i", { className: "ti ti-x" })
        )
      ),
      toolbar,
      batchBar,
      filters,
      summary,
      list
    )
  );
}
function buildRow(args) {
  const h = React$2.createElement;
  const {
    info,
    renamingId,
    setRenamingId,
    reload,
    favorites,
    onToggleFav,
    batchMode,
    selected,
    onSelect
  } = args;
  const fav = favorites.has(info.blockId);
  const titleEl = renamingId === info.blockId ? h(RenameRow, {
    info,
    onDone: () => {
      setRenamingId(null);
      void reload(true);
    },
    onCancel: () => setRenamingId(null)
  }) : h(
    "div",
    {
      className: `orca-aio-row-title${info.title ? "" : " orca-aio-row-title-empty"}`
    },
    info.title || t("Untitled")
  );
  const meta = h(
    "div",
    { className: "orca-aio-row-meta" },
    h(
      "span",
      {},
      rootBlockTitle(info.ctx?.[0]) || `#${info.ctx?.[0] ?? "?"}`
    ),
    h("span", {}, `${info.userMsgCount} ${t("Messages")}`),
    h("span", {}, formatTime(info.modified))
  );
  const main = h(
    "div",
    {
      className: "orca-aio-row-main",
      title: t("Preview"),
      onClick: (e) => {
        if (renamingId === info.blockId) return;
        try {
          orca.utils.showBlockPreview(
            info.blockId,
            e.currentTarget,
            void 0,
            true
          );
        } catch (err) {
          console.error("[orca-ai-optimizer] 预览对话失败", err);
        }
      }
    },
    titleEl,
    meta
  );
  const actions = renamingId === info.blockId ? null : h(
    "div",
    { className: "orca-aio-row-actions" },
    h(
      "button",
      {
        type: "button",
        className: `orca-aio-btn${fav ? " orca-aio-btn-fav" : ""}`,
        title: fav ? t("Unfavorite") : t("Favorite"),
        onClick: (e) => {
          e?.stopPropagation?.();
          onToggleFav(info.blockId);
        }
      },
      h("i", { className: fav ? "ti ti-star-filled" : "ti ti-star" })
    ),
    h(
      "button",
      {
        type: "button",
        className: "orca-aio-btn",
        title: t("Open"),
        onClick: (e) => {
          e?.stopPropagation?.();
          try {
            openChat(info.blockId);
          } catch (err) {
            console.error("[orca-ai-optimizer] 打开对话失败", err);
          }
        }
      },
      h("i", { className: "ti ti-external-link" })
    ),
    h(
      "button",
      {
        type: "button",
        className: "orca-aio-btn",
        title: t("Rename"),
        onClick: (e) => {
          e?.stopPropagation?.();
          setRenamingId(info.blockId);
        }
      },
      h("i", { className: "ti ti-pencil" })
    ),
    h(
      "button",
      {
        type: "button",
        className: "orca-aio-btn",
        title: t("Copy markdown"),
        onClick: (e) => {
          e?.stopPropagation?.();
          void doCopy(info);
        }
      },
      h("i", { className: "ti ti-copy" })
    ),
    h(
      "button",
      {
        type: "button",
        className: "orca-aio-btn orca-aio-btn-danger",
        title: t("Delete"),
        onClick: (e) => {
          e?.stopPropagation?.();
          void doDelete(info.blockId, reload);
        }
      },
      h("i", { className: "ti ti-trash" })
    )
  );
  const badge = info.isEmpty ? h("span", { className: "orca-aio-badge-empty" }, t("Empty")) : null;
  const checkbox = batchMode ? h("input", {
    type: "checkbox",
    className: "orca-aio-checkbox",
    checked: selected,
    onChange: () => onSelect(),
    onClick: (e) => e?.stopPropagation?.()
  }) : null;
  return h(
    "div",
    { className: "orca-aio-row" },
    checkbox,
    badge,
    main,
    actions
  );
}
function RenameRow(props) {
  const h = React$2.createElement;
  const [value, setValue] = React$2.useState(props.info.title);
  const inputRef = React$2.useRef(null);
  React$2.useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);
  return h(
    "div",
    { className: "orca-aio-rename-row" },
    h("input", {
      ref: inputRef,
      className: "orca-aio-rename-input",
      value,
      placeholder: t("New title"),
      onChange: (e) => setValue(e.target.value),
      onKeyDown: (e) => {
        if (e.key === "Enter") {
          void (async () => {
            await renameChat(props.info.blockId, value);
            props.onDone();
          })();
        } else if (e.key === "Escape") {
          props.onCancel();
        }
      }
    }),
    h(
      "button",
      {
        type: "button",
        className: "orca-aio-btn",
        title: t("Confirm"),
        onClick: () => {
          void (async () => {
            await renameChat(props.info.blockId, value);
            props.onDone();
          })();
        }
      },
      h("i", { className: "ti ti-check" })
    ),
    h(
      "button",
      {
        type: "button",
        className: "orca-aio-btn",
        title: t("Cancel"),
        onClick: props.onCancel
      },
      h("i", { className: "ti ti-x" })
    )
  );
}
async function doDelete(blockId, reload) {
  if (!window.confirm(t("Delete conversation?"))) return;
  const done = await deleteChat(blockId);
  if (!done) {
    orca.notify("warn", t("Favorited conversations cannot be deleted"), {
      title: t("Delete")
    });
    return;
  }
  await reload(true);
}
async function doClean(reload) {
  const candidates = await cleanupEmptyChats({ dryRun: true, minAgeMs: 0 });
  if (candidates.length === 0) {
    orca.notify("info", t("No empty conversations"), {
      title: t("Clean empty chats")
    });
    return;
  }
  const confirmed = pluginSetting("confirmBeforeClean") !== false ? window.confirm(
    `${t("Confirm cleanup")}：${candidates.length} ${t("Empty conversations")}`
  ) : true;
  if (!confirmed) return;
  const removed = await cleanupEmptyChats({ minAgeMs: 0 });
  if (removed.length > 0) {
    orca.notify(
      "success",
      `${t("Cleanup report")}：${t("Deleted")} ${removed.length} ${t("Empty conversations")}`,
      { title: t("Clean empty chats") }
    );
    await reload(true);
  }
}
async function doCopy(info) {
  const text = await exportChatMarkdown(info.blockId);
  if (text == null) {
    orca.notify("error", t("Failed to export conversation"), {
      title: t("Copy")
    });
    return;
  }
  try {
    const ok = await copyTextToClipboard(text);
    if (!ok) throw new Error("copy failed");
    orca.notify("success", t("Copied to clipboard"), {
      title: t("Copy")
    });
  } catch (err) {
    console.error("[orca-ai-optimizer] 复制失败", err);
    orca.notify("error", t("Failed to export conversation"), {
      title: t("Copy")
    });
  }
}
async function doBatchDelete(selected, reload, refreshFavs) {
  const ids = Array.from(selected);
  if (ids.length === 0) return;
  if (!window.confirm(`${t("Delete")} ${ids.length} ${t("Conversations")}?`)) {
    return;
  }
  let ok = 0;
  let skipped = 0;
  for (const id of ids) {
    if (await deleteChat(id)) ok++;
    else skipped++;
  }
  orca.notify(
    "success",
    `${t("Deleted")} ${ok} / ${ids.length}`,
    { title: t("Batch operations") }
  );
  if (skipped > 0) {
    orca.notify("warn", `${t("Favorited conversations cannot be deleted")}：${skipped}`, {
      title: t("Batch operations")
    });
  }
  refreshFavs();
  await reload(true);
}
async function doBatchCopyIds(selected) {
  const ids = Array.from(selected);
  if (ids.length === 0) return;
  try {
    const ok = await copyTextToClipboard(ids.join(", "));
    if (!ok) throw new Error("copy failed");
    orca.notify("success", t("Copied to clipboard"), {
      title: t("Copy block IDs")
    });
  } catch (err) {
    console.error("[orca-ai-optimizer] 复制块ID失败", err);
    orca.notify("error", t("Failed to export conversation"), {
      title: t("Copy block IDs")
    });
  }
}
function formatTime(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
const React$1 = window.React;
let registered = false;
function registerSidetool() {
  if (registered) return;
  if (orca.state.editorSidetools?.[SIDETOOL_ID] == null) {
    orca.editorSidetools.registerEditorSidetool(SIDETOOL_ID, {
      render: renderSidetool
    });
  }
  registered = true;
}
function unregisterSidetool() {
  if (orca.state.editorSidetools?.[SIDETOOL_ID] != null) {
    orca.editorSidetools.unregisterEditorSidetool(SIDETOOL_ID);
  }
  registered = false;
}
function renderSidetool(rootBlockId, panelId) {
  return React$1.createElement(ChatSidetool, {
    rootBlockId,
    panelId
  });
}
function ChatSidetool(props) {
  const h = React$1.createElement;
  const { Button, Tooltip } = orca.components;
  const rootBlockId = props.rootBlockId;
  const panelId = props.panelId;
  const current = getAIChatBlock(rootBlockId);
  const ctx = current != null ? getRepr(current)?.ctx : void 0;
  const historyKey = current != null && Array.isArray(ctx) && ctx.length > 0 ? Number(ctx[0]) : rootBlockId;
  const mainButton = h(
    Button,
    {
      className: "orca-block-editor-sidetools-btn",
      variant: "plain",
      title: t("Open last conversation"),
      onClick: (e) => {
        void onMainClick(rootBlockId, panelId, !!e?.shiftKey);
      }
    },
    h("i", { className: "ti ti-message-chatbot" })
  );
  const managerButton = h(
    Tooltip,
    {
      text: t("Filter conversations of this panel"),
      placement: "horizontal"
    },
    h(
      Button,
      {
        className: "orca-block-editor-sidetools-btn orca-aio-history-btn",
        variant: "plain",
        onClick: (e) => {
          e?.stopPropagation?.();
          openManagerWithSource(Number.isFinite(historyKey) ? historyKey : null);
        }
      },
      h("i", { className: "ti ti-history" })
    )
  );
  const mainTooltip = h(
    Tooltip,
    {
      text: `${t("Open last conversation")}
Shift+${t("Open on the side")}`,
      placement: "horizontal"
    },
    mainButton
  );
  return h(
    "span",
    {
      style: {
        position: "relative",
        display: "inline-flex",
        flexDirection: "column"
      }
    },
    mainTooltip,
    managerButton
  );
}
async function onMainClick(rootBlockId, panelId, openOnSide) {
  const panel = resolvePanel(panelId);
  if (panel == null) return;
  const finalSide = openOnSide || pluginSetting(SETTING_OPEN_LAST_ON_SIDE) === true;
  const current = getAIChatBlock(rootBlockId);
  const ctx = current != null ? getRepr(current)?.ctx : void 0;
  const historyKey = current != null && Array.isArray(ctx) && ctx.length > 0 ? Number(ctx[0]) : rootBlockId;
  const history = getHistory(historyKey);
  const liveEntry = await findLiveHistoryEntry(history);
  if (liveEntry != null) {
    registerOpenedChat(historyKey, liveEntry.blockId, liveEntry.title);
    openChat(liveEntry.blockId, panel.id, finalSide);
    return;
  }
  await onNewChatClick(rootBlockId, panelId, finalSide);
}
async function openLastInCurrentPanel() {
  const panel = resolvePanel(void 0);
  if (panel == null) return;
  const rootBlockId = Number(panel.viewArgs?.blockId);
  if (!Number.isFinite(rootBlockId)) return;
  await onMainClick(
    rootBlockId,
    panel.id,
    pluginSetting(SETTING_OPEN_LAST_ON_SIDE) === true
  );
}
async function findLiveHistoryEntry(history) {
  for (const entry of history) {
    try {
      const block = await orca.invokeBackend("get-block", entry.blockId);
      if (block == null) continue;
      orca.state.blocks[block.id] = block;
      const info = chatInfoFromBlock(block);
      if (info != null && !info.isEmpty) {
        return { ...entry, title: info.title || entry.title };
      }
    } catch {
      continue;
    }
  }
  return null;
}
async function newChatInCurrentPanel(panelId, openOnSide = false) {
  const panel = resolvePanel(panelId);
  if (panel == null) return;
  const rootBlockId = Number(panel.viewArgs?.blockId);
  if (!Number.isFinite(rootBlockId)) return;
  const current = getAIChatBlock(rootBlockId);
  if (current == null) {
    orca.notify("info", t("AI chat panel only"), {
      title: t("New conversation")
    });
    return;
  }
  await onNewChatClick(rootBlockId, panel.id, openOnSide);
}
async function onNewChatClick(rootBlockId, panelId, openOnSide) {
  if (!aiConfigured()) {
    notifyAIUnconfigured();
    return;
  }
  const current = getAIChatBlock(rootBlockId);
  if (current != null && chatHasUserMessages(current) && pluginSetting("confirmBeforeReplace") !== false) {
    const confirmed = window.confirm(
      `${t("New conversation")}：${t("Replace current")}？`
    );
    if (!confirmed) return;
  }
  const panel = resolvePanel(panelId);
  const ctx = current != null && Array.isArray(getRepr(current)?.ctx) ? [...getRepr(current).ctx] : [rootBlockId];
  const newId = await createNewChatBlock(ctx);
  if (newId == null) {
    orca.notify("error", t("Failed to create conversation"), {
      title: t("New conversation")
    });
    return;
  }
  const historyKey = Array.isArray(ctx) && ctx.length > 0 ? Number(ctx[0]) : rootBlockId;
  registerOpenedChat(historyKey, newId);
  openChat(newId, panel?.id ?? panelId, openOnSide);
  orca.notify("success", t("New conversation opened"), {
    title: t("New conversation")
  });
}
const React = window.React;
const HEADBAR_MANAGER_ID = "orcaAiOptimizer.openChatManager";
const HEADBAR_NEW_CHAT_ID = "orcaAiOptimizer.newChat";
function registerNewChatButton() {
  if (orca.state.headbarButtons?.[HEADBAR_NEW_CHAT_ID] != null) return;
  orca.headbar.registerHeadbarButton(HEADBAR_NEW_CHAT_ID, () => {
    return React.createElement(
      orca.components.Tooltip,
      {
        text: t("New AI conversation (replace current)"),
        defaultPlacement: "bottom"
      },
      React.createElement(
        orca.components.Button,
        {
          variant: "plain",
          className: "orca-headbar-btn",
          onClick: () => {
            void newChatInCurrentPanel(void 0, false);
          }
        },
        React.createElement("i", {
          className: "ti ti-message-plus orca-headbar-icon"
        })
      )
    );
  });
}
function registerManagerButton() {
  if (orca.state.headbarButtons?.[HEADBAR_MANAGER_ID] != null) return;
  orca.headbar.registerHeadbarButton(HEADBAR_MANAGER_ID, () => {
    return React.createElement(
      orca.components.Tooltip,
      {
        text: t("AI chat manager"),
        defaultPlacement: "bottom"
      },
      React.createElement(
        orca.components.Button,
        {
          variant: "plain",
          className: "orca-headbar-btn",
          onClick: () => toggleManager()
        },
        React.createElement("i", {
          className: "ti ti-folders orca-headbar-icon"
        })
      )
    );
  });
}
function unregisterManagerButton() {
  if (orca.state.headbarButtons?.[HEADBAR_MANAGER_ID] != null) {
    orca.headbar.unregisterHeadbarButton(HEADBAR_MANAGER_ID);
  }
}
function applyHeadbarButton() {
  registerNewChatButton();
  if (pluginSetting("showHeadbarButton") === false) {
    unregisterManagerButton();
    return;
  }
  registerManagerButton();
}
function unregisterHeadbarButton() {
  unregisterManagerButton();
  if (orca.state.headbarButtons?.[HEADBAR_NEW_CHAT_ID] != null) {
    orca.headbar.unregisterHeadbarButton(HEADBAR_NEW_CHAT_ID);
  }
}
async function maybeAutoClean() {
  if (pluginSetting(SETTING_AUTO_CLEAN) === false) return;
  const ageHours = typeof pluginSetting(SETTING_CLEAN_AGE_HOURS) === "number" ? pluginSetting(SETTING_CLEAN_AGE_HOURS) : DEFAULT_CLEAN_AGE_HOURS;
  const minAgeMs = Math.max(0, Number(ageHours) || 0) * 60 * 60 * 1e3;
  const removed = await cleanupEmptyChats({ minAgeMs });
  if (removed.length > 0) {
    orca.notify(
      "success",
      `${t("Cleanup report")}：${t("Deleted")} ${removed.length} ${t("Empty conversations")}`,
      { title: t("Clean empty chats") }
    );
  }
}
let styleEl = null;
const STYLES = `
  /* 对话管理弹窗 */
  .orca-aio-manager-overlay {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .orca-aio-manager {
    width: min(680px, calc(100vw - 48px));
    max-height: min(560px, calc(100vh - 96px));
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px 16px 10px;
    box-sizing: border-box;
    background: var(--orca-color-bg-1, var(--orca-color-canvas, #fff));
    border: 1px solid var(--orca-color-border);
    border-radius: var(--orca-radius-lg, 12px);
    box-shadow: var(--orca-shadow-popup, 0 12px 32px rgba(0,0,0,0.25));
    font-family: var(--orca-fontfamily-ui);
    font-size: var(--orca-fontsize-sm);
    color: var(--orca-color-text-1);
    user-select: none;
  }
  .orca-aio-manager-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .orca-aio-manager-title {
    flex: 1;
    font-size: var(--orca-fontsize-md);
    font-weight: 600;
  }

  .orca-aio-manager-toolbar {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .orca-aio-manager-filters {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    padding: 2px 0;
  }
  .orca-aio-filter-label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--orca-color-text-2);
    font-size: var(--orca-fontsize-xs);
    white-space: nowrap;
  }
  .orca-aio-select {
    padding: 3px 6px;
    border-radius: var(--orca-radius-sm);
    border: 1px solid var(--orca-color-border);
    background: var(--orca-color-bg-2);
    color: var(--orca-color-text-1);
    font-size: var(--orca-fontsize-xs);
    font-family: var(--orca-fontfamily-ui);
    outline: none;
    max-width: 180px;
  }
  .orca-aio-number {
    width: 56px;
  }
  .orca-aio-batch-bar {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
    padding: 6px 8px;
    border-radius: var(--orca-radius-md);
    border: 1px solid var(--orca-color-border);
    background: var(--orca-color-bg-2);
    color: var(--orca-color-text-1);
    font-size: var(--orca-fontsize-sm);
  }
  .orca-aio-batch-count {
    color: var(--orca-color-text-2);
    font-size: var(--orca-fontsize-sm);
    margin-right: auto;
  }
  .orca-aio-checkbox {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    accent-color: var(--orca-color-primary-5);
  }
  .orca-aio-btn-fav {
    color: var(--orca-color-text-yellow, #eab308);
  }
  .orca-aio-search {
    flex: 1;
    min-width: 0;
    padding: 5px 8px;
    box-sizing: border-box;
    border-radius: var(--orca-radius-md);
    border: 1px solid var(--orca-color-border);
    background: var(--orca-color-bg-2);
    color: var(--orca-color-text-1);
    font-size: var(--orca-fontsize-sm);
    font-family: var(--orca-fontfamily-ui);
    outline: none;
    user-select: text;
  }
  .orca-aio-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 26px;
    padding: 0 8px;
    border: none;
    background: transparent;
    border-radius: var(--orca-radius-sm);
    color: var(--orca-color-text-2);
    cursor: pointer;
    font-size: var(--orca-fontsize-md);
    line-height: 1;
    white-space: nowrap;
  }
  .orca-aio-btn:hover {
    color: var(--orca-color-text-1);
    background-color: var(--orca-color-gray-5);
  }
  .orca-aio-btn-danger {
    color: var(--orca-color-dangerous-5);
  }
  .orca-aio-btn-primary {
    background: var(--orca-color-primary-5);
    color: var(--orca-color-white);
    font-size: var(--orca-fontsize-xs);
    gap: 4px;
  }
  .orca-aio-btn-primary:hover {
    background: var(--orca-color-primary-6);
    color: var(--orca-color-white);
  }
  .orca-aio-btn-text {
    font-size: var(--orca-fontsize-xs);
    gap: 4px;
    height: 24px;
    padding: 0 8px;
    border-radius: var(--orca-radius-sm);
  }
  .orca-aio-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .orca-aio-summary {
    color: var(--orca-color-text-2);
    font-size: var(--orca-fontsize-2xs);
    padding: 0 2px;
  }

  .orca-aio-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-bottom: 12px;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
  .orca-aio-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border-radius: var(--orca-radius-sm);
    cursor: default;
  }
  .orca-aio-row:hover {
    background: var(--orca-color-selection);
  }
  .orca-aio-row-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    cursor: pointer;
  }
  .orca-aio-row-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--orca-color-text-1);
    font-size: var(--orca-fontsize-sm);
  }
  .orca-aio-row-title-empty {
    color: var(--orca-color-text-3);
    font-style: italic;
  }
  .orca-aio-row-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--orca-color-text-3);
    font-size: var(--orca-fontsize-2xs);
    overflow: hidden;
    white-space: nowrap;
  }
  .orca-aio-row-meta span {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .orca-aio-row-actions {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
    opacity: 0.7;
  }
  .orca-aio-row:hover .orca-aio-row-actions {
    opacity: 1;
  }
  .orca-aio-empty {
    color: var(--orca-color-text-2);
    font-size: var(--orca-fontsize-sm);
    padding: 12px 2px;
  }

  /* 行内重命名 */
  .orca-aio-rename-row {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }
  .orca-aio-rename-input {
    flex: 1;
    min-width: 0;
    padding: 3px 6px;
    box-sizing: border-box;
    border-radius: var(--orca-radius-sm);
    border: 1px solid var(--orca-color-primary-5);
    background: var(--orca-color-bg-2);
    color: var(--orca-color-text-1);
    font-size: var(--orca-fontsize-sm);
    font-family: var(--orca-fontfamily-ui);
    outline: none;
    user-select: text;
  }

  /* 对话徽标：空对话显示「空」 */
  .orca-aio-badge-empty {
    flex-shrink: 0;
    padding: 1px 5px;
    border-radius: 999px;
    background: var(--orca-color-gray-5);
    color: var(--orca-color-text-2);
    font-size: var(--orca-fontsize-2xs);
  }
  .orca-aio-badge-user {
    flex-shrink: 0;
    padding: 1px 5px;
    border-radius: 999px;
    background: var(--orca-color-primary-5);
    color: var(--orca-color-white);
    font-size: var(--orca-fontsize-2xs);
  }

  /* 历史浮层容器 */
  .orca-aio-history-pop {
    min-width: 260px;
    max-width: 360px;
    max-height: 320px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: var(--orca-color-bg-1, var(--orca-color-canvas, #fff));
    border: 1px solid var(--orca-color-border);
    border-radius: var(--orca-radius-md);
    box-shadow: var(--orca-shadow-popup, 0 8px 24px rgba(0, 0, 0, 0.18));
    padding: 6px;
    font-family: var(--orca-fontfamily-ui);
    font-size: var(--orca-fontsize-sm);
    color: var(--orca-color-text-1);
  }
  .orca-aio-history-search {
    padding: 4px 6px;
    border-radius: var(--orca-radius-sm);
    border: 1px solid var(--orca-color-border);
    background: var(--orca-color-bg-2);
    color: var(--orca-color-text-1);
    font-size: var(--orca-fontsize-sm);
    font-family: var(--orca-fontfamily-ui);
    outline: none;
    user-select: text;
  }
  .orca-aio-history-list {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .orca-aio-history-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 6px;
    border-radius: var(--orca-radius-sm);
    cursor: pointer;
    min-width: 0;
  }
  .orca-aio-history-item:hover {
    background: var(--orca-color-selection);
  }
  .orca-aio-history-item-title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .orca-aio-history-item-time {
    flex-shrink: 0;
    color: var(--orca-color-text-3);
    font-size: var(--orca-fontsize-2xs);
  }
  .orca-aio-history-empty {
    color: var(--orca-color-text-2);
    font-size: var(--orca-fontsize-sm);
    padding: 10px 6px;
  }
`;
function injectStyles() {
  if (styleEl != null) return;
  styleEl = document.createElement("style");
  styleEl.id = "orca-ai-optimizer-styles";
  styleEl.textContent = STYLES;
  document.head.appendChild(styleEl);
}
function removeStyles() {
  styleEl?.remove();
  styleEl = null;
}
let unsubscribeNav = null;
let unsubscribeSettings = null;
const CMD_OPEN_MANAGER = "orca-ai-optimizer.openChatManager";
const CMD_NEW_CHAT = "orca-ai-optimizer.newChat";
const CMD_OPEN_LAST = "orca-ai-optimizer.openLastChat";
function watchPanelNavigation() {
  if (unsubscribeNav != null) return;
  const lastRegistered = /* @__PURE__ */ new Map();
  unsubscribeNav = window.Valtio.subscribe(orca.state, () => {
    const stack = [orca.state.panels];
    while (stack.length > 0) {
      const node = stack.pop();
      if (node == null) continue;
      if (node.children != null) {
        stack.push(...node.children);
        continue;
      }
      if (node.view !== "block") continue;
      const blockId = Number(node.viewArgs?.blockId);
      if (!Number.isFinite(blockId) || lastRegistered.get(node.id) === blockId) {
        continue;
      }
      const chat = getAIChatBlock(blockId);
      if (chat == null) continue;
      lastRegistered.set(node.id, blockId);
      const ctx = getRepr(chat)?.ctx;
      const rootKey2 = Array.isArray(ctx) && ctx.length > 0 ? Number(ctx[0]) : blockId;
      if (Number.isFinite(rootKey2)) {
        registerOpenedChat(rootKey2, chat.id, chatTitle(chat));
      }
    }
  });
}
async function load(name) {
  setPluginName(name || PLUGIN_NAME);
  setupL10N(orca.state.locale);
  await orca.plugins.setSettingsSchema(name || PLUGIN_NAME, {
    [SETTING_CONFIRM]: {
      label: "替换有内容的对话前先确认",
      description: "开启时，若当前面板正在显示已有提问的 AI 对话，点击「新对话」会先弹出确认框，避免误触丢失上下文。",
      type: "boolean",
      defaultValue: true
    },
    [SETTING_SHOW_HEADBAR_BUTTON]: {
      label: "在顶栏显示「AI 对话」按钮",
      description: "关闭后顶栏不显示快捷按钮，仍可通过命令面板执行「AI 对话管理」。",
      type: "boolean",
      defaultValue: true
    },
    [SETTING_OPEN_LAST_ON_SIDE]: {
      label: "打开上次对话默认在侧边栏打开",
      description: "开启后，侧工具条主按钮与「打开上个 AI 对话」命令默认在侧边新面板打开上次对话；关闭则替换当前面板。Shift 点击始终在侧边打开。",
      type: "boolean",
      defaultValue: true
    },
    [SETTING_AUTO_CLEAN]: {
      label: "自动清理空对话",
      description: "应用启动时扫描并清理从未产生用户消息的空 AI 对话（有引用、正在展示或最近打开过的不删）。",
      type: "boolean",
      defaultValue: false
    },
    [SETTING_CLEAN_AGE_HOURS]: {
      label: "空对话保留时长（小时）",
      description: "自动清理时，创建不足该时长的空对话会被跳过；0 表示不按时间过滤。",
      type: "number",
      defaultValue: 24
    },
    [SETTING_CLEAN_CONFIRM]: {
      label: "手动清理前先确认",
      description: "在对话管理窗口点击清理时先弹出确认框。",
      type: "boolean",
      defaultValue: true
    }
  });
  injectStyles();
  registerSidetool();
  mountManager();
  applyHeadbarButton();
  unsubscribeSettings = window.Valtio.subscribe(
    orca.state.plugins[name || PLUGIN_NAME],
    () => applyHeadbarButton()
  );
  if (orca.state.commands[CMD_OPEN_MANAGER] == null) {
    orca.commands.registerCommand(CMD_OPEN_MANAGER, () => {
      toggleManager();
    }, "AI 对话管理");
  }
  if (orca.state.commands[CMD_NEW_CHAT] == null) {
    orca.commands.registerCommand(CMD_NEW_CHAT, () => {
      void newChatInCurrentPanel(void 0, false);
    }, "新建 AI 对话（替换当前）");
  }
  if (orca.state.commands[CMD_OPEN_LAST] == null) {
    orca.commands.registerCommand(CMD_OPEN_LAST, () => {
      void openLastInCurrentPanel();
    }, "打开上个 AI 对话");
  }
  await loadHistory();
  await loadFavorites();
  watchPanelNavigation();
  setTimeout(() => {
    void maybeAutoClean();
  }, 3e3);
  console.log(
    `[orca-ai-optimizer] v${PLUGIN_VERSION} loaded (${name || PLUGIN_NAME}).`
  );
}
async function unload() {
  unsubscribeNav?.();
  unsubscribeNav = null;
  unsubscribeSettings?.();
  unsubscribeSettings = null;
  unregisterSidetool();
  unregisterHeadbarButton();
  unmountManager();
  if (orca.state.commands[CMD_OPEN_MANAGER] != null) {
    orca.commands.unregisterCommand(CMD_OPEN_MANAGER);
  }
  if (orca.state.commands[CMD_NEW_CHAT] != null) {
    orca.commands.unregisterCommand(CMD_NEW_CHAT);
  }
  if (orca.state.commands[CMD_OPEN_LAST] != null) {
    orca.commands.unregisterCommand(CMD_OPEN_LAST);
  }
  removeStyles();
  console.log(`[orca-ai-optimizer] v${PLUGIN_VERSION} unloaded.`);
}
export {
  load,
  unload
};
