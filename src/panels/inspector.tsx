import React, { useState } from 'react'
import { Menu } from './menu.js'
import { Peers } from './peers.js'
import { Routing } from './routing.js'
import { Node } from './node.js'
import { Debug } from './debug.js'
import type { Peer } from '@libp2p/devtools-metrics'

export interface InspectorProps {
  peerId: string
  protocols: string[]
  multiaddrs: string[]
  peers?: Peer[]
}

export function Inspector ({ peerId, protocols, multiaddrs, peers }: InspectorProps) {
  const [panel, setPanel] = useState('node')

  return (
    <>
      <Menu onClick={(panel) => setPanel(panel)} panel={panel} peers={peers ?? []} />
      { panel === 'node' ? <Node peerId={peerId} protocols={protocols} multiaddrs={multiaddrs} /> : undefined }
      { panel === 'peers' ? <Peers peers={peers ?? []} /> : undefined }
      { panel === 'debug' ? <Debug /> : undefined }
      { panel === 'routing' ? <Routing /> : undefined }
    </>
  )
}
