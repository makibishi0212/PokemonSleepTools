import type { ReactNode } from 'react'
import type { Tool } from '../routes.ts'

type Props = {
  /** Tool definition; its name is shown as the page heading */
  tool: Tool
  /** Tool content */
  children?: ReactNode
}

/** Common frame for every tool page: title, then content. */
function ToolPage({ tool, children }: Props) {
  return (
    <article className="tool-page">
      <h1 className="title tool-page-title">{tool.name}</h1>
      <div className="tool-page-content">{children}</div>
    </article>
  )
}

export default ToolPage
