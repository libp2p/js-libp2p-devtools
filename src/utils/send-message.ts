import { SOURCE_DEVTOOLS } from '@libp2p/devtools-metrics'
import { TypedEventEmitter } from '@libp2p/interface'
import { getBrowserInstance } from './get-browser.js'
import type { TypedEventTarget } from '@libp2p/interface'
import type { DevToolsMessage, SelfMessage, PeersMessage, MetricsMessage, ApplicationMessage, WorkerMessage } from '@libp2p/devtools-metrics'

const browser = getBrowserInstance()
let port: chrome.runtime.Port | undefined

// listen for incoming connections from the service worker script

export interface DevToolEvents {
  'self': CustomEvent<SelfMessage>
  'peers': CustomEvent<PeersMessage>
  'metrics': CustomEvent<MetricsMessage>
  'page-loaded': CustomEvent
}

export const events: TypedEventTarget<DevToolEvents> = new TypedEventEmitter()

export function sendMessage <Message extends DevToolsMessage> (message: Omit<Message, 'source' | 'tabId'>): void {
  if (port == null) {
    port = browser.runtime.connect({
      name: SOURCE_DEVTOOLS
    })

    port.onMessage.addListener((message: ApplicationMessage | WorkerMessage) => {
      console.info('devtools port message', message)

      if (message.type === 'self') {
        events.safeDispatchEvent<SelfMessage>('self', {
          detail: message
        })
      }

      if (message.type === 'peers') {
        events.safeDispatchEvent<PeersMessage>('peers', {
          detail: message
        })
      }

      if (message.type === 'metrics') {
        events.safeDispatchEvent<MetricsMessage>('metrics', {
          detail: message
        })
      }

      if (message.type === 'page-loaded') {
        events.safeDispatchEvent('page-loaded', {})
      }
    })

    port.onDisconnect.addListener(() => {
      console.info('devtools service-worker port disconnected')
      port = undefined
    })
  }

  port.postMessage({
    ...message,
    source: SOURCE_DEVTOOLS,
    tabId: browser.devtools.inspectedWindow.tabId,
  })
}
