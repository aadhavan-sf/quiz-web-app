/** Reset scroll position — works on desktop and mobile Safari. */
export function scrollToTop(): void {
  if (typeof window === 'undefined') return

  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
}
