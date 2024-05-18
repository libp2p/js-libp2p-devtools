import React from 'react'
import './menu.css'
import libp2pLogo from '../../public/img/libp2p.svg'

export function Menu ({ onClick, panel, peers }) {
  return (
    <div className='Menu'>
      <img src={libp2pLogo} height={24} width={24} className={'Icon'} />
      <button onClick={() => onClick('node')} className={panel === 'node' ? 'selected' : ''}>Node</button>
      <button onClick={() => onClick('peers')} className={panel === 'peers' ? 'selected' : ''}>Peers ({peers.length})</button>
      <button onClick={() => onClick('debug')} className={panel === 'debug' ? 'selected' : ''}>Debug</button>
      <button onClick={() => onClick('dht')} className={panel === 'dht' ? 'selected' : ''}>DHT</button>
    </div>
  )
}
