import React, { useState } from 'react'
import { Menu } from './menu.js'
import { Peers } from './peers.js'
import { DHT } from './dht.js'
import { Node } from './node.js'
import { Debug } from './debug.js'

export function Inspector ({ peerId, protocols, multiaddrs, peers }) {
  const [panel, setPanel] = useState('node')

  return (
    <>
      <Menu onClick={(panel) => setPanel(panel)} panel={panel} />
      { panel === 'node' ? <Node peerId={peerId} protocols={protocols} multiaddrs={multiaddrs} /> : undefined }
      { panel === 'peers' ? <Peers peers={peers} /> : undefined }
      { panel === 'debug' ? <Debug /> : undefined }
      { panel === 'dht' ? <DHT /> : undefined }
    </>
  )
}
