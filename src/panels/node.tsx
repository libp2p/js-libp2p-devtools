import React from 'react'
import { Panel } from './panel'
import { MultiaddrList } from './multiaddr-list'

export interface NodePanelProps {
  peerId: string
  multiaddrs: string[]
  protocols: string[]
}

export function Node ({ peerId, multiaddrs, protocols }: NodePanelProps) {
  return (
    <Panel>
      <h2>PeerId</h2>
      <p>{peerId}</p>
      <small>A PeerId is derived from a node's cryptographic key and uniquely identifies it on the network</small>
      <MultiaddrList addresses={multiaddrs.map(multiaddr => ({ multiaddr }))} />
      <small>Multiaddrs are addresses that other nodes can use to contact this node</small>
      <h2>Supported protocols</h2>
      <Protocols protocols={protocols} />
      <small>This node will respond to these protocols</small>
    </Panel>
  )
}

export interface ProtocolsPanelProps {
  protocols: string[]
}

function Protocols ({ protocols }: ProtocolsPanelProps) {
  if (protocols.length === 0) {
    return (
      <p>This node has does not support any protocols.</p>
    )
  }

  return (
    <ul>
    {protocols.map((protocol, index) => <li key={`protocol-${index}`}>{protocol}</li>)}
    </ul>
  )
}
