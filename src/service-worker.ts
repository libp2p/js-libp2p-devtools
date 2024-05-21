import { SOURCE_DEVTOOLS, SOURCE_SERVICE_WORKER } from '@libp2p/devtools-metrics'
import { getBrowserInstance } from './utils/get-browser.js'
import type { DevToolsMessage, MetricsMessage, PageLoadedMessage } from '@libp2p/devtools-metrics'

console.info('background.js script loaded')

const browser = getBrowserInstance()

/**
 * Holds connections between tab id -> devTools
 */
const toDevTools: Record<number, chrome.runtime.Port> = {}

/**
 * Holds connections between tab id -> browser
 */
const toContentScript: Record<number, chrome.runtime.Port> = {}

/**
 * Listen for incoming connections from the dev tools panel, when a message is
 * received, open a port to the content script and forward the message.
 *
 * Listen for incoming messages on the forwarding port and relay them back to
 * the dev tools panel.
 */
browser.runtime.onConnect.addListener(port => {
  // only accept incoming connections from the dev tools panel
  if (port.name !== SOURCE_DEVTOOLS) {
    return
  }

  console.info('background.js dev tools connected')
  let tabId: number | undefined

  const onContentScriptMessage = (message: MetricsMessage) => {
    port.postMessage(message)
  }

  const onDevToolsPanelMessage = (message: DevToolsMessage) => {
    console.info('background.js dev tools port message', message)

    if (tabId == null) {
      tabId = message.tabId
    }

    if (toDevTools[tabId] !== port) {
      toDevTools[tabId]?.onMessage.removeListener(onDevToolsPanelMessage)
      toDevTools[tabId] = port
    }

    if (toContentScript[tabId] == null) {
      console.info('background.js creating connection to content-script.js in tab', message.tabId)

      toContentScript[tabId] = browser.tabs.connect(message.tabId, {
        name: SOURCE_SERVICE_WORKER
      })

      toContentScript[tabId].onMessage.addListener(onContentScriptMessage)

      toContentScript[tabId].onDisconnect.addListener((port) => {
        port.onMessage.removeListener(onContentScriptMessage)
        delete toContentScript[message.tabId]
      })
    }

    // forward message to content script
    toContentScript[tabId].postMessage(message)
  }

  // Listen to messages sent from the DevTools page
  port.onMessage.addListener(onDevToolsPanelMessage)

  // if the dev tools panel disconnects, clean up references - we will reconnect
  // if the dev tools panel is reloaded
  port.onDisconnect.addListener(() => {
    console.info('background.js dev tools disconnected')

    // do not process messages on a closed port
    port.onMessage.removeListener(onDevToolsPanelMessage)

    // clean up ports
    if (tabId != null) {
      // stop processing content script messages
      toContentScript[tabId]?.onMessage.removeListener(onContentScriptMessage)

      delete toContentScript[tabId]
      delete toDevTools[tabId]
    }
  })
})

browser.tabs?.onUpdated.addListener((tabId, changeInfo) => {
  console.info('tab', tabId, changeInfo.status, 'have port', Boolean(toDevTools[tabId]))

  if (changeInfo.status !== 'complete') {
    return
  }

  let port = toDevTools[tabId]

  if (port != null) {
    console.info('background.js sending "page-loaded" message to devtools', tabId, changeInfo.status)
    const message: PageLoadedMessage = {
      source: SOURCE_DEVTOOLS,
      type: 'page-loaded',
      tabId
    }

    port.postMessage(message)
  }
})
