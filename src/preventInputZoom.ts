/**
 * iOS Safari zooms the page when an input with a font size below 16px is focused.
 * Adding `maximum-scale=1` to the viewport meta disables that auto-zoom.
 * Applied on iOS only: on Android Chrome the same setting would also disable pinch zoom.
 */
export function preventInputZoomOnIos(): void {
  const ua = navigator.userAgent
  const isIos =
    /iPhone|iPad|iPod/.test(ua) ||
    // iPadOS reports itself as a Mac; a Mac with touch points is an iPad.
    (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
  if (!isIos) return

  const meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]')
  if (!meta) return
  if (!/maximum-scale/.test(meta.content)) {
    meta.content = `${meta.content}, maximum-scale=1`
  }
}
