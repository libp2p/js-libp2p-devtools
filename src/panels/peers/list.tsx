import './peer-list.css'
import 'react'
import { useState } from 'react'
import { Panel } from '../panel.js'
import disclosureTriangleClosed from '../../../public/img/icon-disclosure-triangle-closed.svg'
import disclosureTriangleOpen from '../../../public/img/icon-disclosure-triangle-open.svg'
import type { MetricsRPC, Peer } from '@libp2p/devtools-metrics'
import { MultiaddrList } from '../multiaddr-list.js'
import { getAgent } from '../../utils/get-agent.js'
import { DeleteIcon } from '../icons/icon-delete.js'
import { SpinnerIcon } from '../icons/icon-spinner.js'

export interface PeersProps {
  peers: Peer[]
  metrics: MetricsRPC
}

export function PeerList ({ peers, metrics }: PeersProps) {
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
        peers.map(peer => <Peer key={peer.id.toString()} peer={peer} metrics={metrics} />)
      }
    </>
  )
}

interface PeerProps {
  peer: Peer
  metrics: MetricsRPC
  key?: string
}

function Peer ({ peer, metrics }: PeerProps) {
  const [expanded, setExpanded] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  async function closeConnection (evt: any) {
    evt.preventDefault()

    setDisconnecting(true)
    await metrics.closeConnection(peer.id)
  }

  let disconnectIcon = <DeleteIcon onClick={closeConnection} />

  if (disconnecting) {
    disconnectIcon = <SpinnerIcon />
  }

  if (expanded) {
    return (
      <Panel>
        <h2><img src={disclosureTriangleOpen} height={12} width={12} className={'DisclosureTriangle'} onClick={() => setExpanded(false)} /> {disconnectIcon} <PeerAgent peer={peer} /> <span className="PeerId">{peer.id.toString()}</span></h2>
        <p>
          <PeerTags peer={peer} />
        </p>
        <h3>Multiaddrs</h3>
        <MultiaddrList addresses={peer.addresses} includeCertification={true} />
        <PeerProtocols peer={peer} />
      </Panel>
    )
  }

  return (
    <Panel>
      <h2><img src={disclosureTriangleClosed} height={12} width={12} className={'DisclosureTriangle'} onClick={() => setExpanded(true)} /> {disconnectIcon} <PeerAgent peer={peer} /> <span className="PeerId">{peer.id.toString()}</span></h2>
      <p>
        <PeerTags peer={peer} />
      </p>
    </Panel>
  )
}

function PeerAgent ({ peer }: Pick<PeerProps, 'peer'>) {
  if (peer.metadata.AgentVersion == null) {
    return undefined
  }

  return (
    <span className="PeerAgent">{getAgent(peer.metadata)}</span>
  )
}

function PeerTags ({ peer }: Pick<PeerProps, 'peer'>) {
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

function PeerProtocols ({ peer }: Pick<PeerProps, 'peer'>) {
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