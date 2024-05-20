import './peers.css'
import React, { useState } from 'react'
import { Panel } from './panel.js'
import { Peer } from '@libp2p/devtools-metrics'
import { base64 } from 'multiformats/bases/base64'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { multiaddr } from '@multiformats/multiaddr'
import { WebRTC, WebSockets, WebSocketsSecure, WebTransport, Circuit } from '@multiformats/multiaddr-matcher'
import webrtcLogo from '../../public/img/webrtc.svg'
import websocketLogo from '../../public/img/websocket.svg'
import webtransportLogo from '../../public/img/webtransport.svg'
import circuitRelay from '../../public/img/circuit-relay.svg'
import disclosureTriangleClosed from '../../public/img/disclosure-triangle-closed.svg'
import disclosureTriangleOpen from '../../public/img/disclosure-triangle-open.svg'

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
    <>
      {
        peers.map(peer => <Peer key={peer.peerId} peer={peer} />)
      }
    </>
  )
}

interface PeerProps {
  peer: Peer
  key?: string
}

function Peer ({ peer }: PeerProps) {
  const [expanded, setExpanded] = useState(false)

  if (expanded) {
    return (
      <Panel>
        <h2><img src={disclosureTriangleOpen} height={12} width={12} className={'DisclosureTriangle'} onClick={() => setExpanded(false)} /> <PeerIcon peer={peer} /> <PeerAgent peer={peer} /> <span className="PeerId">{peer.peerId}</span></h2>
        <p>
          <PeerTags peer={peer} />
        </p>
        <ConnectedMultiaddrs peer={peer} />
        <PeerMultiaddrs peer={peer} />
        <PeerProtocols peer={peer} />
      </Panel>
    )
  }

  return (
    <Panel>
      <h2><img src={disclosureTriangleClosed} height={12} width={12} className={'DisclosureTriangle'} onClick={() => setExpanded(true)} /> <PeerIcon peer={peer} /> <PeerAgent peer={peer} /> <span className="PeerId">{peer.peerId}</span></h2>
      <p>
        <PeerTags peer={peer} />
      </p>
    </Panel>
  )
}

function TransportIcon ({ src, key }) {
  return <img src={src} height={16} width={16} className={'Icon'} key={key} />
}

function PeerIcon ({ peer }: PeerProps) {
  return (
    <>
      {
        peer.addresses.map((address, index) => {
         const ma = multiaddr(address)

         if (WebRTC.matches(ma)) {
          return <TransportIcon src={webrtcLogo} key={`address-${index}`} />
         }

         if (WebSockets.matches(ma) || WebSocketsSecure.matches(ma)) {
          return <TransportIcon src={websocketLogo} key={`address-${index}`} />
         }

         if (WebTransport.matches(ma)) {
          return <TransportIcon src={webtransportLogo} key={`address-${index}`} />
         }

         if (Circuit.matches(ma)) {
          return <TransportIcon src={circuitRelay} key={`address-${index}`} />
         }
        })
      }
    </>
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