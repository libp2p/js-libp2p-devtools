import './peers.css'
import React from 'react'
import { Panel } from './panel.js'
import { Peer } from '@libp2p/devtools-metrics'
import { base64 } from 'multiformats/bases/base64'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

interface PeersProps {
  peers: Peer[]
}

export function Peers ({ peers }: PeersProps) {
  if (peers.length === 0) {
    return (
      <Panel>
        <p>This node is not connected to any peers.</p>
      </Panel>
    )
  }

  return (
    <Panel>
      {
        peers.map(peer => <Peer key={peer.peerId} peer={peer} />)
      }
    </Panel>
  )
}

interface PeerProps {
  peer: Peer
  key?: string
}

function Peer ({ peer }: PeerProps) {
  return (
    <Panel>
      <h2><PeerAgent peer={peer} /> <span className="PeerId">{peer.peerId}</span></h2>
      <p>
        <PeerTags peer={peer} />
      </p>
      <ConnectedMultiaddrs peer={peer} />
      <PeerMultiaddrs peer={peer} />
      <PeerProtocols peer={peer} />
    </Panel>
  )
}

function PeerAgent ({ peer }: PeerProps) {
  if (peer.metadata.AgentVersion == null) {
    return undefined
  }

  return (
    <span className="PeerAgent">{uint8ArrayToString(base64.decode(peer.metadata.AgentVersion))}</span>
  )
}

function PeerTags ({ peer }: PeerProps) {
  const entries = Object.entries(peer.tags)

  if (entries.length === 0) {
    return undefined
  }

  return (
    <>
      {entries.map(([key, value], index) => <span key={index} className="PeerTag">{key}</span>)}
    </>
  )
}

function ConnectedMultiaddrs ({ peer }: PeerProps) {
  if (peer.addresses.length === 0) {
    return undefined
  }

  return (
    <>
      {peer.addresses.map((ma, index) => <Multiaddr key={`ma-${index}`} multiaddr={ma} />)}
    </>
  )
}

interface MultiaddrProps {
  multiaddr: string
  isCertified?: boolean
  key?: string
}

function Multiaddr ({ multiaddr, isCertified }: MultiaddrProps) {
  return (
    <div className={'Multiaddr'}>
      <pre><code>{isCertified === true ? '🔒 ' : ''}{multiaddr}</code></pre>
    </div>
  )
}

function PeerMultiaddrs ({ peer }: PeerProps) {
  if (peer.multiaddrs.length === 0) {
    return undefined
  }

  return (
    <>
      <h3>Multiaddrs</h3>
      <ul>
        {peer.multiaddrs.map(({ multiaddr, isCertified }, index) => <Multiaddr key={`ma-${index}`} multiaddr={multiaddr} isCertified={isCertified} />)}
      </ul>
    </>
  )
}

function PeerProtocols ({ peer }: PeerProps) {
  if (peer.protocols.length === 0) {
    return undefined
  }

  return (
    <>
      <h3>Protocols</h3>
      <ul>
        {peer.protocols.map((proto, index) => <li key={`proto-${index}`}>{proto}</li>)}
      </ul>
    </>
  )
}