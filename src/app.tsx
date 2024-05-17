import './app.css'
import React, { Component } from 'react'
import { createRoot } from 'react-dom/client'
import { getBrowserTheme } from './utils/get-theme.js'
import { Inspector } from './panels/inspector.js'
import { FloatingPanel } from './panels/floating-panel.js'
import type { BrowserMessage, IdentifyMessage, Peer } from '@libp2p/devtools-metrics'
import { sendMessage } from './utils/send-message.js'

interface OfflineAppState {
  status: 'init' | 'missing' | 'error'
}

interface OnlineAppState {
  status: 'online'
  peerId: string
  multiaddrs: string[]
  protocols: string[]
  peers: Peer[]
}

type AppState = OfflineAppState | OnlineAppState

const Error = () => {
  return (
    <>
      <FloatingPanel>
        <p>An error occurred while tring to detect a libp2p node on the current page</p>
      </FloatingPanel>
    </>
  )
}

const Detecting = () => {
  return (
    <>
      <FloatingPanel>
        <p>Connecting to libp2p...</p>
      </FloatingPanel>
    </>
  )
}

const Missing = () => {
  return (
    <>
      <FloatingPanel>
        <p>A libp2p node was not found on the on the current page</p>
        <p>Please ensure you have configured the Debug Tool Metrics module</p>
        <pre><code>{`
import { devToolMetrics } from '@libp2p/devtool-metrics'
import { createLibp2p } from 'libp2p'

const node = await createLibp2p({
  metrics: devToolMetrics({
    //... options here
  }),
  // ...other config here
})
`}
          </code></pre>
      </FloatingPanel>
    </>
  )
}

class App extends Component {
  state: AppState

  constructor () {
    super()

    this.state = {
      status: 'init'
    }

    const timeout = setTimeout(() => {
      this.setState({
        status: 'missing'
      })
    }, 5000)

    // not sure when libp2p will be ready so keep asking for identify message
    const interval = setInterval(() => {
      console.info('devtools sending identify message to page')
      // request a self update
      const message: IdentifyMessage = {
        source: '@libp2p/devtools-metrics:devtools',
        type: 'identify'
      }

      sendMessage(message)
    }, 500)

    chrome.runtime.onMessage.addListener((message: BrowserMessage) => {
      if (message.source !== '@libp2p/devtools-metrics:node') {
        // ignore messages from other sources
        return
      }

      clearTimeout(timeout)

      if (message.type === 'self') {
        clearInterval(interval)

        this.setState({
          status: 'online',
          peerId: message.peerId,
          multiaddrs: message.multiaddrs,
          protocols: message.protocols,
          peers: []
        })
      }

      if (message.type === 'peers') {
        console.info('devtools got peers', message)
        this.setState({
          peers: message.peers
        })
      }

      if (message.type !== 'metrics') {
        console.info('devtools incoming message from chrome runtime', message)
      }
    })
  }

  render() {
    if (this.state.status === 'online') {
      return (
        <Inspector {...this.state} />
      )
    }

    if (this.state.status === 'init') {
      return (
        <Detecting />
      )
    }

    if (this.state.status === 'missing') {
      return (
        <Missing />
      )
    }

    if (this.state.status === 'error') {
      return (
        <Error />
      )
    }

    return (
      <>
        <p>...</p>
      </>
    )
  }
}

const theme = getBrowserTheme()
const body = document.getElementsByTagName('body')[0]

if (body != null) {
  body.className = `${body.className} ${theme}`
}

const root = createRoot(document.getElementById('app'))
root.render(<App />)
