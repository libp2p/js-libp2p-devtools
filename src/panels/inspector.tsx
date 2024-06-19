import 'react'
import { useState } from 'react'
import { Menu } from './menu.js'
import { Peers } from './peers/index.js'
import { Routing } from './routing/index.js'
import { Node } from './node.js'
import { Debug } from './debug.js'
import type { MetricsRPC, Peer } from '@libp2p/devtools-metrics'
import libp2pLogo from '../../public/img/libp2p.svg'

export interface InspectorProps {
  self: Peer
  peers: Peer[]
  debug: string
  metrics: MetricsRPC
}

export function Inspector ({ self, peers, debug, metrics }: InspectorProps) {
  const [panel, setPanel] = useState('Node')

  const logo = (
    <img src={libp2pLogo} height={24} width={24} className={'Icon'} />
  )

  return (
    <>
      <Menu logo={logo} onClick={(panel) => setPanel(panel)} panel={panel} options={['Node', 'Peers', 'Debug', 'Routing']} />
      { panel === 'Node' ? <Node self={self} /> : undefined }
      { panel === 'Peers' ? <Peers peers={peers} metrics={metrics} /> : undefined }
      { panel === 'Debug' ? <Debug metrics={metrics} debug={debug} /> : undefined }
      { panel === 'Routing' ? <Routing metrics={metrics} /> : undefined }
    </>
  )
}
