import './peers.css'
import React, { useState } from 'react'
import { Panel } from './panel.js'
import { base64 } from 'multiformats/bases/base64'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import { multiaddr, type Multiaddr } from '@multiformats/multiaddr'
import { WebRTC, WebSockets, WebSocketsSecure, WebTransport, Circuit, QUIC, QUICV1, TCP } from '@multiformats/multiaddr-matcher'
import webrtcTransport from '../../public/img/transport-webrtc.svg'
import websocketTransport from '../../public/img/transport-websocket.svg'
import webtransportTransport from '../../public/img/transport-webtransport.svg'
import circuitRelayTransport from '../../public/img/transport-circuit-relay.svg'
import quicTransport from '../../public/img/transport-quic.svg'
import tcpTransport from '../../public/img/transport-tcp.svg'
import unknownTransport from '../../public/img/transport-unknown.svg'
import certifiedMultiaddr from '../../public/img/multiaddr-certified.svg'
import uncertifiedMultiaddr from '../../public/img/multiaddr-uncertified.svg'
import disclosureTriangleClosed from '../../public/img/icon-disclosure-triangle-closed.svg'
import disclosureTriangleOpen from '../../public/img/icon-disclosure-triangle-open.svg'
import copyIcon from '../../public/img/icon-copy.svg'
import type { Peer } from '@libp2p/devtools-metrics'

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
        peers.map(peer => <Peer key={peer.id} peer={peer} />)
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
        <h2><img src={disclosureTriangleOpen} height={12} width={12} className={'DisclosureTriangle'} onClick={() => setExpanded(false)} /> <PeerAgent peer={peer} /> <span className="PeerId">{peer.id}</span></h2>
        <p>
          <PeerTags peer={peer} />
        </p>
        <PeerMultiaddrs peer={peer} />
        <PeerProtocols peer={peer} />
      </Panel>
    )
  }

  return (
    <Panel>
      <h2><img src={disclosureTriangleClosed} height={12} width={12} className={'DisclosureTriangle'} onClick={() => setExpanded(true)} /> <PeerAgent peer={peer} /> <span className="PeerId">{peer.id}</span></h2>
      <p>
        <PeerTags peer={peer} />
      </p>
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

export interface TransportIconProps {
  multiaddr: Multiaddr
}

function TransportIcon ({ multiaddr }: TransportIconProps) {
  let src: string = unknownTransport

  if (WebRTC.matches(multiaddr)) {
    src = webrtcTransport
  } else if (Circuit.matches(multiaddr)) {
    src = circuitRelayTransport
  } else if (WebSockets.matches(multiaddr) || WebSocketsSecure.matches(multiaddr)) {
    src = websocketTransport
  } else if (WebTransport.matches(multiaddr)) {
    src = webtransportTransport
  } else if (QUIC.matches(multiaddr) || QUICV1.matches(multiaddr)) {
    src = quicTransport
  } else if (TCP.matches(multiaddr)) {
    src = tcpTransport
  }

  return (
    <>
    <img src={src} height={16} width={16} className={'Icon'} />
    </>
  )
}

export interface CertifiedIconProps {
  isCertified?: boolean
}

function CertifiedIcon ({ isCertified }: CertifiedIconProps) {
  return (
    <>
      <img src={isCertified === true ? certifiedMultiaddr : uncertifiedMultiaddr} height={16} width={16} className={'Icon'} />
    </>
  )
}


export interface TransportIconProps {
  multiaddr: Multiaddr
}

function CopyIcon ({ multiaddr }: TransportIconProps) {
  function copyToClipboard (evt: any) {
    evt.preventDefault()
    navigator.clipboard.writeText(multiaddr.toString())
  }

  return (
    <>
      <img src={copyIcon} height={16} width={16} className={'Icon'} onClick={evt => copyToClipboard(evt)} />
    </>
  )
}

interface MultiaddrProps {
  multiaddr: string
  isCertified?: boolean
  key?: string
}

function MultiaddrPanel ({ multiaddr: m, isCertified }: MultiaddrProps) {
  const ma = multiaddr(m)

  return (
    <div className={'Multiaddr'}>
      <TransportIcon multiaddr={ma} />
      <CertifiedIcon isCertified={isCertified} />
      <CopyIcon multiaddr={ma} />
      <code>{m}</code>
    </div>
  )
}

function PeerMultiaddrs ({ peer }: PeerProps) {
  if (peer.addresses.length === 0) {
    return undefined
  }

  return (
    <>
      <div className="PeerMultiaddrs">
        <h3>Multiaddrs</h3>
        <ul>
          {peer.addresses.map(({ multiaddr: m, isCertified }, index) => <MultiaddrPanel key={`ma-${index}`} multiaddr={m} isCertified={isCertified} />)}
        </ul>
      </div>
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