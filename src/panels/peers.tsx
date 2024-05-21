import './peers.css'
import React, { useState } from 'react'
import { Panel } from './panel.js'
import { base64 } from 'multiformats/bases/base64'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import disclosureTriangleClosed from '../../public/img/icon-disclosure-triangle-closed.svg'
import disclosureTriangleOpen from '../../public/img/icon-disclosure-triangle-open.svg'
import type { Peer } from '@libp2p/devtools-metrics'
import { MultiaddrList } from './multiaddr-list.js'

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
        <MultiaddrList addresses={peer.addresses} includeCertification={true} />
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