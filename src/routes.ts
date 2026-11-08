/** A tool: its URL path and the name shown as the page title and in the menus. */
export type Tool = {
  readonly path: string
  readonly name: string
}

export const routes = {
  home: '/',
} as const

/**
 * Tool definitions. This is the single source of truth for each tool's path
 * and name: the router, the top page, the sidebar and the tool page title all read from here.
 */
export const tools = {
  levelUpShards: { path: '/level-up-shards', name: 'レベル上げゆめのかけら計算' },
  dishIngredients: { path: '/dish-ingredients', name: '料理食材数計算' },
} as const satisfies Record<string, Tool>

/** Tools in display order. */
export const toolList: readonly Tool[] = Object.values(tools)
