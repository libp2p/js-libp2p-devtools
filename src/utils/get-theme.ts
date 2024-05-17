/* global chrome */

export type BrowserTheme = 'light' | 'dark'

export function getBrowserTheme(): BrowserTheme {
  console.info('theme is', chrome.devtools.panels.themeName)
  return chrome.devtools.panels.themeName === 'dark' ? 'dark' : 'light';
}
