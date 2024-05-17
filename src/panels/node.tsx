import React from 'react'
import { Panel } from './panel'

export function Node ({ peerId, multiaddrs, protocols }) {
  return (
    <Panel>
      <h2>PeerId</h2>
      <p>{peerId}</p>
      <small>A PeerId is derived from a node's cryptographic key and uniquely identifies it on the network</small>
      <h2>Multiaddrs</h2>
      <Multiaddrs multiaddrs={multiaddrs} />
      <small>Multiaddrs are addresses that other nodes can use to contact this node</small>
      <h2>Supported protocols</h2>
      <Protocols protocols={protocols} />
      <small>This node will respond to these protocols</small>
    </Panel>
  )
}

function Multiaddrs ({ multiaddrs }) {
  if (multiaddrs.length === 0) {
    return (
      <p>This node has no multiaddrs so is not dialable.</p>
    )
  }

  return (
    <ul>
      {multiaddrs.map((multiaddr, index) => <li key={`protocol-${index}`}>{multiaddr}</li>)}
    </ul>
  )
}

function Protocols ({ protocols }) {
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
