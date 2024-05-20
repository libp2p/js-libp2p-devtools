import './app.css'
import React, { Component } from 'react'
import { createRoot } from 'react-dom/client'
import { getBrowserTheme } from './utils/get-theme.js'
import { Inspector } from './panels/inspector.js'
import { FloatingPanel } from './panels/floating-panel.js'
import { LIBP2P_DEVTOOLS_METRICS_KEY } from '@libp2p/devtools-metrics'
import type { Peer } from '@libp2p/devtools-metrics'
import { evalOnPage } from './utils/eval-on-page.js'
// import { delay } from './utils/delay.js'
import { getBrowserInstance } from './utils/get-browser.js'
import SyntaxHighlighter from 'react-syntax-highlighter'

const browser = getBrowserInstance()

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

const ErrorPanel = () => {
  return (
    <>
      <FloatingPanel>
        <p>An error occurred while tring to detect a libp2p node on the current page</p>
      </FloatingPanel>
    </>
  )
}

const DetectingPanel = () => {
  return (
    <>
      <FloatingPanel>
        <p>Connecting to libp2p...</p>
      </FloatingPanel>
    </>
  )
}

const MissingPanel = () => {
  return (
    <>
      <FloatingPanel>
        <p>@libp2p/devtool-metrics was not found on the on the current page</p>
        <p>Please ensure you have configured your libp2p node correctly:</p>
        <SyntaxHighlighter language="javascript">
      {`
import { devToolMetrics } from '@libp2p/devtool-metrics'
import { createLibp2p } from 'libp2p'

const node = await createLibp2p({
  metrics: devToolMetrics({
    //... options here
  }),
  // ...other config here
})
      `}
    </SyntaxHighlighter>
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

    browser.runtime.sendMessage({
      tabId: browser.devtools.inspectedWindow.tabId,
      script: '/dist/content-script.js'
    });

    // let the user know if we can't find libp2p after 5s
    const timeout = setTimeout(() => {
      this.setState({
        status: 'missing'
      })
    }, 5000)

    Promise.resolve().then(async () => {
      const metricsPresent = await evalOnPage<boolean>(`${LIBP2P_DEVTOOLS_METRICS_KEY}`)

      if (!metricsPresent) {
        this.setState({
          status: 'missing'
        })
        return
      }


      // we found it, no need to let the user know
      clearTimeout(timeout)
/*
      while (true) {
        try {
          const status = await evalOnPage<boolean>(`${LIBP2P_DEVTOOLS_METRICS_KEY}`)

          this.setState({
            status: 'online',
            peerId: status.peerId,
            multiaddrs: status.multiaddrs,
            protocols: status.protocols,
            peers: status.peers
          })
        } catch (err: any) {
          console.error('error getting status', err)
        } finally {
          await delay(1000)
        }
      }

      */
    })
    .catch(err => {
      console.error('error communicating with page', err)

      this.setState({
        status: 'error'
      })
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
        <DetectingPanel />
      )
    }

    if (this.state.status === 'missing') {
      return (
        <MissingPanel />
      )
    }

    if (this.state.status === 'error') {
      return (
        <ErrorPanel />
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
