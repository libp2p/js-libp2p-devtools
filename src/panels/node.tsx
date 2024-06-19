import 'react'
import { Panel } from './panel'
import { MultiaddrList } from './multiaddr-list'
import { Heading } from './heading.js'
import type { Peer } from '@libp2p/devtools-metrics'
import { getAgent } from '../utils/get-agent'

export interface NodeProps {
  self: Peer
}

export function Node ({ self }: NodeProps) {
  const agent = getAgent(self.metadata)
  let agentVersion

  if (agent != null) {
    agentVersion = (
      <>
        <Heading subtitle="The agent is sent to peers during Identify">
          <h2>Agent</h2>
        </Heading>
        <p>{agent}</p>
      </>
    )
  }

  return (
    <Panel>
      <Heading subtitle="A PeerId is derived from a node's cryptographic key and uniquely identifies it on the network">
        <h2>PeerId</h2>
      </Heading>
      <p>{self.id.toString()}</p>
      {agentVersion}
      <Heading subtitle="Multiaddrs are addresses that other nodes can use to contact this node">
        <h2>Multiaddrs</h2>
      </Heading>
      <MultiaddrList addresses={self.addresses.map(address => ({ multiaddr: address.multiaddr }))} />
      <Heading subtitle="This node will respond to these protocols">
        <h2>Supported protocols</h2>
      </Heading>
      <Protocols protocols={self.protocols} />
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
