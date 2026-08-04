// Orca Note plugin API types（对照安装版 v1.88.0 渲染包与已发布插件源码整理，2026-08）
declare global {
  declare const orca: OrcaAPI
  interface Window {
    orca: OrcaAPI
    React: any
    Valtio: any
    createRoot: Function
  }
}

export interface OrcaAPI {
  invokeBackend(type: APIMsg, ...args: any[]): Promise<any>
  state: {
    activePanel: string
    blockConverters: Record<
      string,
      Record<
        string,
        (block: BlockForConversion, repr: Repr) => string | Promise<string>
      >
    >
    blockRenderers: Record<string, any>
    blocks: Record<string | DbId, Block>
    commands: Record<string, CommandWithPinyin>
    dataDir: string
    inlineConverters: Record<
      string,
      Record<string, (content: ContentFragment) => string | Promise<string>>
    >
    inlineRenderers: Record<string, any>
    locale: string
    notifications: Notification[]
    panelBackHistory: PanelHistory[]
    panelForwardHistory: PanelHistory[]
    panels: RowPanel
    plugins: Record<string, Plugin>
    repo: string
    settings: Record<number, any>
    settingsOpened: boolean
    commandPaletteOpened: boolean
    globalSearchOpened: boolean
    shortcuts: Record<string, string>
    themeMode: "light" | "dark"
    themes: Record<string, string>
    toolbarButtons: Record<string, ToolbarButton | ToolbarButton[]>
    headbarButtons: Record<string, () => React.ReactElement | null>
    slashCommands: Record<string, SlashCommandWithPinyin>
    blockMenuCommands: Record<string, BlockMenuCommand>
    tagMenuCommands: Record<string, TagMenuCommand>
    editorSidetools: Record<string, EditorSidetool>
    sidebarTab: string
    filterInTags?: string
  }
  commands: {
    registerCommand(id: string, fn: CommandFn, label?: string): void
    unregisterCommand(id: string): void
    registerEditorCommand(
      id: string,
      doFn: EditorCommandFn,
      undoFn: CommandFn,
      opts?: { label?: string; hasArgs?: boolean; noFocusNeeded?: boolean },
    ): void
    unregisterEditorCommand(id: string): void
    invokeCommand(id: string, ...args: any[]): Promise<any>
    invokeEditorCommand(
      id: string,
      cursor: CursorData | null,
      ...args: any[]
    ): Promise<any>
    invokeTopEditorCommand(
      id: string,
      cursor: CursorData | null,
      ...args: any[]
    ): Promise<any>
    invokeGroup(callback: () => Promise<void>): Promise<void>
    registerBeforeCommand(id: string, pred: BeforeHookPred): void
    unregisterBeforeCommand(id: string, pred: BeforeHookPred): void
    registerAfterCommand(id: string, fn: AfterHook): void
    unregisterAfterCommand(id: string, fn: AfterHook): void
  }
  shortcuts: {
    reload(): Promise<void>
    assign(shortcut: string, command: string): Promise<void>
    reset(command: string): Promise<void>
  }
  nav: {
    addTo(
      id: string,
      dir: "top" | "bottom" | "left" | "right",
      src?: Pick<ViewPanel, "view" | "viewArgs" | "viewState">,
    ): string | null
    move(
      from: string,
      to: string,
      dir: "top" | "bottom" | "left" | "right",
    ): void
    close(id: string): void
    closeAllBut(id: string): void
    changeSizes(startPanelId: string, values: number[])
    switchFocusTo(id: string): void
    goBack(withRedo?: boolean): void
    goForward(): void
    goTo(
      view: PanelView,
      viewArgs?: Record<string, any>,
      panelId?: string,
    ): void
    openInLastPanel(view: PanelView, viewArgs?: Record<string, any>): void
    findViewPanel(id: string, panels: RowPanel): ViewPanel | null
    isThereMoreThanOneViewPanel(): boolean
    focusNext(): void
    focusPrev(): void
  }
  plugins: {
    register(name: string): Promise<void>
    unregister(name: string): Promise<void>
    enable(name: string): Promise<void>
    disable(name: string): Promise<void>
    setSettingsSchema(name: string, schema: PluginSettingsSchema): Promise<void>
    setSettings(
      to: "app" | "repo",
      name: string,
      settings: Record<string, any>,
    ): Promise<void>
    load(
      name: string,
      schema: PluginSettingsSchema,
      settings: Record<string, any>,
    ): Promise<void>
    unload(name: string): Promise<void>
    getDataKeys(name: string): Promise<string[]>
    getData(name: string, key: string): Promise<any>
    setData(
      name: string,
      key: string,
      value: string | number | ArrayBuffer | null,
    ): Promise<void>
    removeData(name: string, key: string): Promise<void>
    clearData(name: string): Promise<void>
    readFile(name: string, path: string, encoding?: string, ...args: any[]): Promise<any>
    writeFile(name: string, path: string, data: any, ...args: any[]): Promise<void>
    removeFile(name: string, path: string): Promise<void>
    removeFolder(name: string, path: string): Promise<void>
    listFiles(name: string, path: string): Promise<string[]>
    existsFile(name: string, path: string): Promise<boolean>
  }
  themes: {
    register(pluginName: string, themeName: string, themeFileName: string): void
    unregister(themeName: string): void
    injectCSSResource(url: string, role: string): void
    removeCSSResources(role: string): void
  }
  renderers: {
    registerInline(type: string, isEditable: boolean, renderer: any): void
    unregisterInline(type: string): void
    registerBlock(
      type: string,
      isEditable: boolean,
      renderer: any,
      options?: BlockRendererOptions,
      useChildrenDefault?: boolean,
    ): void
    unregisterBlock(type: string): void
  }
  converters: {
    registerBlock(
      format: string,
      type: string,
      fn: (
        block: BlockForConversion,
        repr: Repr,
        originalBlock?: Block,
        forExport?: boolean,
        ctx?: any,
      ) => string | Promise<string>,
    ): void
    registerInline(
      format: string,
      type: string,
      fn: (content: ContentFragment) => string | Promise<string>,
    ): void
    unregisterBlock(format: string, type: string): void
    unregisterInline(format: string, type: string): void
    blockConvert(
      format: string,
      block: BlockForConversion,
      repr: Repr,
      forExport?: boolean,
      ...args: any[]
    ): Promise<string>
    inlineConvert(
      format: string,
      type: string,
      content: ContentFragment,
    ): Promise<string>
  }
  broadcasts: {
    isHandlerRegistered(type: string): boolean
    registerHandler(type: string, handler: CommandFn): void
    unregisterHandler(type: string): void
    broadcast(type: string, ...args: any[]): void
  }
  components: {
    Block: any
    BlockBreadcrumb: any
    BlockChildren: any
    BlockSelect: any
    BlockShell: any
    Breadcrumb: any
    Button: any
    Checkbox: any
    CompositionInput: any
    CompositionTextArea: any
    ConfirmBox: any
    ContextMenu: any
    DatePicker: any
    HoverContextMenu: any
    Image: any
    Input: any
    InputBox: any
    LoadMore: any
    MemoizedViews: any
    Menu: any
    MenuItem: any
    MenuSeparator: any
    MenuText: any
    MenuTitle: any
    ModalOverlay: any
    Popup: any
    Segmented: any
    Select: any
    Skeleton: any
    Switch: any
    Table: any
    Tooltip: any
  }
  contexts: {
    BlockEditorContext: any
    ImageViewerContext: any
    ZContext: any
  }
  utils: {
    getCursorDataFromSelection(selection: Selection | null): CursorData | null
    getCursorDataFromRange(range: Range): CursorData | null
    setSelectionFromCursorData(cursor: CursorData): Promise<void>
    getAssetPath(path: string): string
    showBlockPreview(...args: any[]): void
    hashArray(...args: any[]): string
  }
  toolbar: {
    registerToolbarButton(id: string, button: any): void
    unregisterToolbarButton(id: string): void
  }
  headbar: {
    registerHeadbarButton(id: string, render: () => React.ReactElement | null): void
    unregisterHeadbarButton(id: string): void
  }
  slashCommands: {
    registerSlashCommand(id: string, command: SlashCommand): void
    unregisterSlashCommand(id: string): void
  }
  blockMenuCommands: {
    registerBlockMenuCommand(id: string, command: any): void
    unregisterBlockMenuCommand(id: string): void
  }
  tagMenuCommands: {
    registerTagMenuCommand(id: string, command: any): void
    unregisterTagMenuCommand(id: string): void
  }
  editorSidetools: {
    registerEditorSidetool(id: string, tool: EditorSidetool): void
    unregisterEditorSidetool(id: string): void
  }
  ai: {
    sendMessage(
      messages: ChatMessage[],
      controller?: AbortController,
      opts?: { extraTools?: any[] },
    ): Promise<any>
    sendStreamMessage(
      messages: ChatMessage[],
      controller: AbortController,
      opts?: { extraTools?: any[] },
    ): AsyncGenerator<StreamDelta>
  }
  notify: (
    type: "info" | "success" | "warn" | "error",
    message: string,
    options?: { title?: string; action?: () => void | Promise<void> },
  ) => void
}

export type APIMsg = string
export type CommandFn = (...args: any[]) => void | Promise<void>
export type BeforeHookPred = (id: string, ...args: any[]) => boolean
export type AfterHook = (id: string, ...args: any[]) => void

export type PanelView = "journal" | "block"

export interface RowPanel {
  id: string
  direction: "row" | "column"
  children: Array<ViewPanel | RowPanel>
  [key: string]: any
}

export interface ViewPanel {
  id: string
  view: PanelView
  viewArgs: Record<string, any>
  viewState: Record<string, any>
  locked?: boolean
  [key: string]: any
}

export interface PanelHistory {
  activePanel: string
  view: PanelView
  viewArgs: Record<string, any>
}

export interface EditorSidetool {
  render: (rootBlockId: DbId, panelId: string) => React.ReactElement | null
}

export interface BlockRendererOptions {
  assetFields?: string[]
  useChildren?: boolean
  foldInQuery?: boolean
}

export interface Plugin {
  enabled: boolean
  icon: string
  schema?: PluginSettingsSchema
  settings?: Record<string, any>
  module?: any
}

export interface PluginSettingsSchema {
  [key: string]: {
    label: string
    description?: string
    type:
      | "string"
      | "number"
      | "boolean"
      | "date"
      | "time"
      | "datetime"
      | "dateRange"
      | "datetimeRange"
      | "color"
      | "singleChoice"
      | "multiChoices"
      | "array"
    defaultValue?: any
    choices?: { label: string; value: string }[]
    arrayItemSchema?: PluginSettingsSchema
  }
}

export interface SlashCommand {
  icon: string
  group: string
  title: string
  command: string
}

export interface SlashCommandWithPinyin extends SlashCommand {
  pinyin: string
}

export type DbId = number

export interface Block {
  id: DbId
  content?: ContentFragment[]
  text?: string
  created: Date
  modified: Date
  parent?: DbId
  left?: DbId
  children: DbId[]
  aliases: string[]
  properties: BlockProperty[]
  refs: BlockRef[]
  backRefs: BlockRef[]
}

export interface ContentFragment {
  t: string
  v: any
  f?: string
  fa?: Record<string, any>
  [key: string]: any
}

export interface Repr {
  type: string
  [key: string]: any
}

export interface AIChatRepr extends Repr {
  type: "aichat"
  ctx?: DbId[]
  msgs?: ChatMessage[]
  cap?: string
}

export interface BlockProperty {
  name: string
  type: number
  typeArgs?: any
  value?: any
  pos?: number
}

export interface BlockRef {
  id: DbId
  from: DbId
  to: DbId
  type: number
  alias?: string
  data?: BlockProperty[]
}

export type BlockForConversion = {
  content?: ContentFragment[]
  children?: DbId[]
  id?: DbId
  [key: string]: any
}

export type EditorCommandFn = (
  editor: EditorArg,
  ...args: any[]
) =>
  | { ret?: any; undoArgs: any }
  | Promise<{ ret?: any; undoArgs?: any }>
  | null
  | Promise<null>

export interface CommandWithPinyin {
  label?: string
  fn: any
  hasArgs?: boolean
  noFocusNeeded?: boolean
  pinyin: string
}

export type EditorArg = [
  panelId: string,
  rootBlockId: DbId,
  cursor: CursorData | null,
  isRedo: boolean,
]

export interface CursorData {
  anchor: CursorNodeData
  focus: CursorNodeData
  isForward: boolean
  panelId?: string
  rootBlockId?: DbId
}

export interface CursorNodeData {
  blockId: DbId
  isInline: boolean
  index: number
  offset: number
}

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool"
  content: string
  images?: any[]
  tool_calls?: any[]
  [key: string]: any
}

export interface StreamDelta {
  content?: string | null
  reasoning_content?: string | null
  [key: string]: any
}

export interface Notification {
  id: number
  type: "info" | "success" | "warn" | "error"
  message: string
  title?: string
}

export interface ToolbarButton {
  icon?: string
  [key: string]: any
}

export interface BlockMenuCommand {
  render: (blockId: DbId, rootBlockId: DbId, close: () => void) => React.ReactElement
}

export interface TagMenuCommand {
  render: (tagBlock: Block, close: () => void) => React.ReactElement
}
