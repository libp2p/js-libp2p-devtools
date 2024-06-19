import 'react'
import { Button } from '../button.js'
import { TextInput } from '../text-input.js'
import { Panel } from '../panel.js'
import { Component, type FormEvent } from 'react'
import { peerIdFromString } from '@libp2p/peer-id'
import { multiaddr } from '@multiformats/multiaddr'
import type { MetricsRPC } from '@libp2p/devtools-metrics'
import { SmallError, SmallSuccess } from '../status'

export interface DialPeerProps {
  metrics: MetricsRPC
}

export interface DialPeerState {
  target: string
  error: string
  details: JSX.Element[]
}

export class DialPeer extends Component<DialPeerProps, DialPeerState> {
  constructor (props: DialPeerProps) {
    super(props)

    this.state = {
      target: '',
      error: '',
      details: []
    }
  }

  componentDidMount(): void {
    this.setState({
      target: '',
      error: '',
      details: []
    })
  }

  private dial (evt: FormEvent | Event, target: string): boolean {
    evt.preventDefault()

    this.setState({
      error: '',
      details: []
    })

    target = target?.trim()

    if (target == null || target === '') {
      this.setState({
        error: 'Please enter a PeerId or Multiaddr'
      })

      return false
    }

    try {
      peerIdFromString(target)
    } catch {
      try {
        multiaddr(target)
      } catch {
        this.setState({
          error: 'PeerId/Multiaddr invalid'
        })

        return false
      }
    }

    this.props.metrics.openConnection(target, {
      onProgress: (event) => {
        let message: string = event.type

        if (event.type === 'dial:already-connected') {
          message = 'Already connected to this peer'
        } else if (event.type === 'dial:add-to-dial-queue') {
          message = 'Adding dial to queue'
        } else if (event.type === 'dial:already-in-dial-queue') {
          message = 'Dial to this peer already in queue'
        } else if (event.type === 'dial:calculate-addresses') {
          message = 'Calculating addresses'
        } else if (event.type === 'dial:selected-transport') {
          message = `Selected transport ${event.detail}`
        }

        this.setState(s => {
          return {
            details: [
              ...s.details,
              <p key={`event-${s.details.length}`}>{message}</p>
            ]
          }
        })
      }
    })
      .then(() => {
        this.setState(s => {
          return {
            error: '',
            details: [
              ...s.details,
              <SmallSuccess key={`event-${s.details.length}`} message={"Dial successful"} />
            ]
          }
        })
      })
      .catch(err => {
        this.setState(s => {
          return {
            details: [
              ...s.details,
              <SmallError key={`event-${s.details.length}`} error={err} />
            ]
          }
        })
      })

    return false
  }

  render () {
    return (
      <Panel>
        <p>Enter a Peer ID or multiaddr to dial:</p>
        <form onSubmit={(evt) => this.dial(evt, this.state.target)}>
          <TextInput type="text" value={this.state.target} placeholder="123Foo..." onChange={(e) => this.setState({
            target: e.target.value
          })} />
          <Button onClick={(evt) => this.dial(evt, this.state.target)} primary={true}>Dial</Button>
        </form>
        {this.state.error ? <SmallError error={this.state.error} /> : undefined}
        {this.state.details}
      </Panel>
    )
  }
}
