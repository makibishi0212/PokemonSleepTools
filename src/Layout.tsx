import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { SHOW_HEADER } from './config.ts'
import { routes, toolList } from './routes.ts'

/**
 * Tool page layout: a top bar with a menu button, plus a drawer sidebar.
 * Desktop: the drawer slides in over a dimmed content area.
 * Mobile: the drawer covers the whole screen.
 * The bar and drawer are omitted when SHOW_HEADER is off, or with a single tool
 * (nothing to switch between).
 */
function Layout() {
  const [isOpen, setIsOpen] = useState(false)
  const close = () => setIsOpen(false)
  const hasMenu = SHOW_HEADER && toolList.length > 1

  // Close the drawer with the Escape key.
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  return (
    <>
      <main className="content-area">
        {hasMenu && (
          <div className="top-bar">
            <button
              type="button"
              className="button menu-button"
              aria-label="メニューを開く"
              aria-expanded={isOpen}
              aria-controls="sidebar"
              onClick={() => setIsOpen(true)}
            >
              <span className="icon" aria-hidden="true">
                ☰
              </span>
            </button>
            <NavLink to={routes.home} className="top-bar-title has-text-weight-bold">
              Pokemon-Sleep Tools
            </NavLink>
          </div>
        )}
        <section className="section">
          <Outlet />
        </section>
      </main>

      {hasMenu && isOpen && (
        <div className="drawer-backdrop" onClick={close} aria-hidden="true" />
      )}

      {hasMenu && (
        <aside
          id="sidebar"
          className={`sidebar menu ${isOpen ? 'is-open' : ''}`}
          aria-label="ツール一覧"
          aria-hidden={!isOpen}
        >
          <div className="top-bar">
            <button
              type="button"
              className="button menu-button"
              aria-label="メニューを閉じる"
              onClick={close}
            >
              <span className="icon" aria-hidden="true">
                ✕
              </span>
            </button>
            <NavLink
              to={routes.home}
              className="top-bar-title has-text-weight-bold"
              onClick={close}
            >
              Pokemon-Sleep Tools
            </NavLink>
          </div>
          <div className="p-4">
            <p className="menu-label">ツール</p>
            <ul className="menu-list">
              {toolList.map((tool) => (
                <li key={tool.path}>
                  <NavLink
                    to={tool.path}
                    className={({ isActive }) => (isActive ? 'is-active' : '')}
                    onClick={close}
                  >
                    {tool.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}
    </>
  )
}

export default Layout
