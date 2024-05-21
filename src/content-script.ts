/**
 * This script is injected into the webpage being monitored
 *
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Background_scripts
 */

import { getBrowserInstance } from './utils/get-browser.js'
import { SOURCE_METRICS, SOURCE_DEVTOOLS, type DevToolsMessage, SOURCE_SERVICE_WORKER } from '@libp2p/devtools-metrics'

const browser = getBrowserInstance()

let port: chrome.runtime.Port | undefined

/**
 * Receive events broadcast by `@libp2p/devtools-metrics` and forward them on to
 * the service worker, which forwards them on to the dev tools panel
 */
window.addEventListener('message', async (event) => {
  // Only accept messages from same frame
  if (event.source !== window) {
    return
  }

  const message = event.data

  if (message?.source !== SOURCE_METRICS) {
    // ignore messages from other sources
    return
  }

  try {
    // send message to worker
    port?.postMessage(message)
  } catch {

  }
})

/**
 * Receive events broadcast by the services worker and forward them on to
 * `@libp2p/devtools-metrics`.
 */
browser.runtime.onConnect.addListener((p) => {
  // only accept incoming connections from the service worker
  if (p.name !== SOURCE_SERVICE_WORKER) {
    return
  }

  port = p
  port.onMessage.addListener((message: DevToolsMessage) => {
    if (message.source === SOURCE_DEVTOOLS) {
      window.postMessage(message, '*')
    }
  })

  port.onDisconnect.addListener(() => {
    port = undefined
  })
})
