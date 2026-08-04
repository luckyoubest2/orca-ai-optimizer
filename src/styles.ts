// 插件全部样式（侧边栏对话管理 + 历史浮层 + 隐藏内置 AI 按钮）

let styleEl: HTMLStyleElement | null = null

const STYLES = `
  /* 侧边栏标签项（原生 Segmented 样式） */
  .orca-aio-tab-item {
    cursor: pointer;
  }

  /* 激活「AI 对话」标签时隐藏官方标签内容区 */
  nav#sidebar.orca-aio-active .orca-sidebar-tabs {
    display: none !important;
  }

  /* 侧边栏内容容器 */
  .orca-aio-sidebar-content {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: var(--orca-spacing-sm);
    margin: 0;
    padding: 0 var(--orca-spacing-md);
    box-sizing: border-box;
    overflow-y: auto;
    font-family: var(--orca-fontfamily-ui);
    font-size: var(--orca-fontsize-sm);
    color: var(--orca-color-text-1);
    user-select: none;
  }

  .orca-aio-toolbar {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 4px 0 0;
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
`

export function injectStyles(): void {
  if (styleEl != null) return
  styleEl = document.createElement("style")
  styleEl.id = "orca-ai-optimizer-styles"
  styleEl.textContent = STYLES
  document.head.appendChild(styleEl)
}

export function removeStyles(): void {
  styleEl?.remove()
  styleEl = null
}
