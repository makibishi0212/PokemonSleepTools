/**
 * Emulate the AdSense anchor ad (dev only).
 *
 * In production, adsbygoogle.js inserts a fixed `<ins>` bar at the top of
 * the viewport (outside the React root) and adds padding-top to `<body>`.
 * To make sure the layout tolerates that, reproduce the same DOM changes
 * while running `pnpm dev`. This does nothing in production builds.
 */
const BANNER_HEIGHT = 30

export function emulateAdBanner(): void {
  if (!import.meta.env.DEV) {
    return
  }

  document.body.style.paddingTop = `${BANNER_HEIGHT}px`

  const ins = document.createElement('ins')
  ins.textContent = 'AdSense anchor ad (dev only)'
  Object.assign(ins.style, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    width: '100%',
    height: `${BANNER_HEIGHT}px`,
    margin: '0',
    padding: '0',
    zIndex: '2147483647',
    background: '#cccccc',
    color: '#333333',
    fontSize: '12px',
    textDecoration: 'none',
  } satisfies Partial<CSSStyleDeclaration>)
  document.body.appendChild(ins)
}
