import './app.css'
import 'react'
import { LIBP2P_DEVTOOLS_METRICS_KEY } from '@libp2p/devtools-metrics'
import { valueCodecs } from '@libp2p/devtools-metrics/rpc'
import { TypedEventEmitter } from '@libp2p/interface'
import { pipe } from 'it-pipe'
import { pushable } from 'it-pushable'
import { rpc } from 'it-rpc'
import { base64 } from 'multiformats/bases/base64'
import { Component, type ReactElement } from 'react'
import { createRoot } from 'react-dom/client'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { dark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { DetectingPanel } from './panels/detecting.js'
import { FloatingPanel } from './panels/floating-panel.js'
import { GrantPermissions } from './panels/grant-permissions.js'
import { Inspector } from './panels/inspector.js'
import { defer } from './utils/defer.js'
import { evalOnPage } from './utils/eval-on-page.js'
import { getPlatform } from './utils/get-platform.js'
import { getBrowserTheme } from './utils/get-theme.js'
import { sendMessage, events } from './utils/send-message.js'
import type { DeferredPromise } from './utils/defer.js'
import type { DevToolsEvents, MetricsRPC, Peer, RPCMessage } from '@libp2p/devtools-metrics'
import type { TypedEventTarget, Message } from '@libp2p/interface'
import type { Pushable } from 'it-pushable'
import type { RPC } from 'it-rpc'

const theme = getBrowserTheme()
const platform = getPlatform()

interface OfflineAppState {
  status: 'init' | 'missing' | 'permissions'
}

interface ErrorAppState {
  status: 'error'
  error: Error
}

interface OnlineAppState {
  status: 'online'
  self: Peer
  peers: Peer[]
  debug: string
  capabilities: Record<string, string[]>
  pubsub: Record<string, Message[]>
}

type AppState = OfflineAppState | ErrorAppState | OnlineAppState

const ErrorPanel = ({ error }: { error: Error }): ReactElement => {
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

const MissingPanel = (): ReactElement => {
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

const GrantPermissionsPanel = (): ReactElement => {
  return (
    <>
      <FloatingPanel>
        <h2>Permissions</h2>
        <p>No data has been received from the libp2p node running on the page.</p>
        <p>You may need to grant this extension access to the current page.</p>
        {
          platform === 'unknown'
            ? (
              <p>Please see your browser documentation for how to do this.</p>
              )
            : <GrantPermissions />
        }
      </FloatingPanel>
    </>
  )
}

class App extends Component {
  state: AppState
  nodeConnected: DeferredPromise<boolean>
  private readonly rpcQueue: Pushable<Uint8Array>
  private readonly rpc: RPC
  private readonly metrics: MetricsRPC
  private readonly events: TypedEventTarget<DevToolsEvents>

  constructor (props: any) {
    super(props)

    this.state = {
      status: 'init'
    }

    this.rpcQueue = pushable()
    this.rpc = rpc({
      valueCodecs
    })

    // remote metrics instance
    this.metrics = this.rpc.createClient<MetricsRPC>('metrics')

    // create event emitter to receive events from devtools-metrics
    this.events = new TypedEventEmitter<DevToolsEvents>()
    this.events.addEventListener('metrics', (evt) => {
      // handle incoming metrics

    })
    this.events.addEventListener('self', (evt) => {
      this.setState(s => ({
        ...s,
        self: evt.detail
      }))
    })
    this.events.addEventListener('peers', (evt) => {
      this.setState(s => ({
        ...s,
        peers: evt.detail
      }))
    })

    this.events.addEventListener('pubsub:message', (evt) => {
      this.setState(s => ({
        ...s,
        pubsub: {
          ...(s.pubsub ?? {}),
          [evt.detail.topic ?? '']: [
            ...(s.pubsub[evt.detail.topic] ?? []),
            evt.detail
          ]
        }
      }))
    })

    this.rpc.createTarget('devTools', this.events)

    // send RPC messages
    Promise.resolve()
      .then(async () => {
        await pipe(
          this.rpcQueue,
          this.rpc,
          async source => {
            for await (const buf of source) {
              sendMessage<RPCMessage>({
                type: 'libp2p-rpc',
                message: base64.encode(buf)
              })
            }
          }
        )
      })
      .catch(err => {
        console.error('error while reading RPC messages', err)
      })

    // receive RPC messages
    events.addEventListener('libp2p-rpc', (event) => {
      this.rpcQueue.push(base64.decode(event.detail.message))
    })

    this.nodeConnected = defer<boolean>()

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

  init (): void {
    Promise.resolve().then(async () => {
      const metricsPresent = await evalOnPage<boolean>(`${LIBP2P_DEVTOOLS_METRICS_KEY} === true`)

      if (!metricsPresent) {
        this.setState({
          status: 'missing'
        })
        return
      }

      const signal = AbortSignal.timeout(2000)

      try {
        const { self, peers, debug, capabilities } = await this.metrics.init({
          signal
        })

        this.setState({
          status: 'online',
          self,
          peers,
          debug,
          capabilities,
          pubsub: {}
        })
      } catch (err: any) {
        if (signal.aborted) {
          this.setState({
            status: 'permissions'
          })
          return
        }

        this.setState({
          status: 'error',
          error: err
        })
      }
    })
      .catch(err => {
        console.error('error communicating with page', err)

        this.setState({
          status: 'error',
          error: err
        })
      })
  }

  render (): ReactElement {
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

    if (this.state.status === 'online') {
      return (
        <Inspector {...this.state} metrics={this.metrics} />
      )
    }

    return (
      <p>{this.state.status}</p>
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
