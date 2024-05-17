
export function getBrowserInstance(): typeof chrome {
  // Get extension api Chrome or Firefox
  return window.chrome ?? (window as any)['browser']
}
