import './app.css'
import React, { Component } from 'react'
import { createRoot } from 'react-dom/client'
import { getBrowserTheme } from './utils/get-theme.js'
import { Inspector } from './panels/inspector.js'
import { FloatingPanel } from './panels/floating-panel.js'
import { LIBP2P_DEVTOOLS_METRICS_KEY } from '@libp2p/devtools-metrics'
import type { Peer } from '@libp2p/devtools-metrics'
import { evalOnPage } from './utils/eval-on-page.js'
import { delay } from './utils/delay.js'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { sendMessage, events } from './utils/send-message.js'
import { defer, type DeferredPromise } from './utils/defer.js'
import { getPlatform } from './utils/get-platform.js'
import { GrantPermissions } from './panels/grant-permissions.js'

const theme = getBrowserTheme()
const platform = getPlatform()

console.info('theme is', theme, 'browser is', platform)


interface OfflineAppState {
  status: 'init' | 'missing' | 'permissions'
}

interface ErrorAppState {
  status: 'error'
  error: Error
}

interface OnlineAppState {
  status: 'online'
  peerId: string
  multiaddrs: string[]
  protocols: string[]
  peers: Peer[]
}

type AppState = OfflineAppState | ErrorAppState | OnlineAppState

const ErrorPanel = ({ error }) => {
  return (
    <>
      <FloatingPanel>
        <h2>Error</h2>
        <p>An error occurred while tring to detect a libp2p node on the current page</p>
        <pre>
          <code>{error.stack ?? error.message}</code>
        </pre>
      </FloatingPanel>
    </>
  )
}

const DetectingPanel = () => {
  return (
    <>
      <FloatingPanel>
        <h2>Please wait</h2>
        <p>Connecting to libp2p...</p>
      </FloatingPanel>
    </>
  )
}

const MissingPanel = () => {
  return (
    <>
      <FloatingPanel>
        <h2>Missing</h2>
        <p>@libp2p/devtool-metrics was not found on the on the current page</p>
        <p>Please ensure you have configured your libp2p node correctly:</p>
        <SyntaxHighlighter language="javascript" style={dark}>
      {`import { devToolsMetrics } from '@libp2p/devtools-metrics'
import { createLibp2p } from 'libp2p'

const node = await createLibp2p({
  metrics: devToolsMetrics({ /* ... */ })
  // ...other config here
})`}
        </SyntaxHighlighter>
      </FloatingPanel>
    </>
  )
}

const GrantPermissionsPanel = () => {
  return (
    <>
      <FloatingPanel>
        <h2>Permissions</h2>
        <p>No data has been received from the libp2p node running on the page.</p>
        <p>You may need to grant this inspector access to the current page.</p>
        {
          platform === 'unknown' ? (
            <p>Please see your browser documentation for how to do this.</p>
          ) : <GrantPermissions />
        }
      </FloatingPanel>
    </>
  )
}

class App extends Component {
  state: AppState
  nodeConnected: DeferredPromise<boolean>

  constructor (props: any) {
    super(props)

    this.state = {
      status: 'init'
    }

    window.addEventListener('message', async (event) => {
      console.info('devtools incoming message', event)
    })

    this.nodeConnected = defer<boolean>()

    // the node sent us a self update
    events.addEventListener('self', (event) => {
      this.nodeConnected.resolve(true)

      this.setState({
        status: 'online',
        peerId: event.detail.peer.id,
        multiaddrs: event.detail.peer.multiaddrs,
        protocols: event.detail.peer.protocols
      })
    })

    // the node's peers changed
    events.addEventListener('peers', (event) => {
      this.nodeConnected.resolve(true)

      this.setState({
        status: 'online',
        peers: event.detail.peers
      })
    })

    // the inspected page was reloaded while the dev tools panel is open
    events.addEventListener('page-loaded', () => {
      this.nodeConnected.reject(new Error('Page reloaded'))
      this.nodeConnected = defer<boolean>()
      this.setState({
        status: 'init'
      })
      this.init()
    })

    this.init()
  }

  init () {
    const showPermissions = setTimeout(() => {
      this.setState({
        status: 'permissions'
      })
    }, 5000)

    Promise.resolve().then(async () => {
      const metricsPresent = await evalOnPage<boolean>(`${LIBP2P_DEVTOOLS_METRICS_KEY} === true`)

      if (!metricsPresent) {
        this.setState({
          status: 'missing'
        })
        return
      }

      while (true) {
        // ask the node to identify itself
        sendMessage({
          type: 'identify'
        })

        const result = await Promise.any([
          delay(1000),
          this.nodeConnected.promise
        ])

        if (result === true) {
          console.info('connected!')
          clearTimeout(showPermissions)

          break
        }
      }
    })
    .catch(err => {
      console.error('error communicating with page', err)
      clearTimeout(showPermissions)

      this.setState({
        status: 'error',
        error: err
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
        <ErrorPanel error={this.state.error} />
      )
    }

    if (this.state.status === 'permissions') {
      return (
        <GrantPermissionsPanel />
      )
    }

    return (
      <>
        <p>...</p>
      </>
    )
  }
}

const body = document.getElementsByTagName('body')[0]

if (body != null) {
  body.className = `${body.className} ${platform} ${theme}`
}

const app = document.getElementById('app')

if (app != null) {
  const root = createRoot(app)
  root.render(<App />)
}
