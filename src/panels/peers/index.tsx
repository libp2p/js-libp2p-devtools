import 'react'
import { useState } from 'react'
import type { MetricsRPC, Peer } from '@libp2p/devtools-metrics'
import { Menu } from '../menu.js'
import { DialPeer } from './dial.js'
import { PeerList } from './list.js'

export interface PeersProps {
  peers: Peer[]
  metrics: MetricsRPC
}

export function Peers ({ peers, metrics }: PeersProps) {
  const [panel, setPanel] = useState('Connected')

  return (
    <>
      <Menu onClick={(panel) => setPanel(panel)} panel={panel} options={['Connected', 'Dial']} />
      { panel === 'Connected' ? <PeerList peers={peers} metrics={metrics} /> : undefined }
      { panel === 'Dial' ? <DialPeer metrics={metrics} /> : undefined }
    </>
  )
}
