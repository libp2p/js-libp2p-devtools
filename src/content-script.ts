/**
 * This script is injected into the webpage being monitored.
 *
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Background_scripts
 */

import { getBrowserInstance } from './utils/get-browser.js'
import type { DevToolsMessage } from '@libp2p/devtools-metrics'

const browser = getBrowserInstance()

/**
 * Receive events broadcast by `@libp2p/devtools-metrics` and forward them on to
 * the background script, which forwards them on to dev tools.
 *
 * web page -> **content-script.js** -> background.js -> dev tools
 */
window.addEventListener('message', async (event) => {
  // Only accept messages from same frame
  if (event.source !== window) {
    return
  }

  const message = event.data

  if (message?.source !== '@libp2p/devtools-metrics:node') {
    // ignore messages from other sources
    return
  }

  try {
    await browser.runtime.sendMessage(message)
  } catch (err) {
    console.error('error sending message to dev tools', err)
  }
})

/**
 * Receive events broadcast by the dev tools and forward them on to
 * `@libp2p/devtools-metrics`.
 *
 * dev tools -> background.js -> **content-script.js** -> web page
 */
browser.runtime.onMessage.addListener((request: DevToolsMessage) => {
  if (request.source !== '@libp2p/devtools-metrics:devtools') {
    // ignore messages from other sources
    return
  }

  console.info('content-script.js incoming message from dev tools', request)

  window.postMessage(request, '*')
})
