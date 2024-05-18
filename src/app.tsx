import './app.css'
import React, { Component } from 'react'
import { createRoot } from 'react-dom/client'
import { getBrowserTheme } from './utils/get-theme.js'
import { Inspector } from './panels/inspector.js'
import { FloatingPanel } from './panels/floating-panel.js'
import { LIBP2P_DEVTOOLS_METRICS_INSTANCE, Status } from '@libp2p/devtools-metrics'
import type { Peer } from '@libp2p/devtools-metrics'
import { evalOnPage } from './utils/eval-on-page.js'
import { delay } from './utils/delay.js'

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

    // let the user know if we can't find libp2p after 5s
    const timeout = setTimeout(() => {
      this.setState({
        status: 'missing'
      })
    }, 5000)

    Promise.resolve().then(async () => {
      await findLibp2p(1000)

      // we found it, no need to let the user know
      clearTimeout(timeout)

      while (true) {
        try {
          const status = await evalOnPage<Status>(`${LIBP2P_DEVTOOLS_METRICS_INSTANCE}.getStatus()`)

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

async function findLibp2p (retryAfter: number): Promise<void> {
  while (true) {
    try {
      await evalOnPage<boolean, void>(`${LIBP2P_DEVTOOLS_METRICS_INSTANCE} != null`, (arg) => {
        if (!arg) {
          throw new Error('libp2p not found')
        }
      })

      return
    } catch (err) {
      if (err.message === 'libp2p not found') {
        await delay(retryAfter)
        continue
      }

      throw err
    }
  }
}
