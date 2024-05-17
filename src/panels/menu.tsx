import React from 'react'
import './menu.css'

export function Menu ({ onClick, panel }) {
  return (
    <div className='Menu'>
      <button onClick={() => onClick('node')} className={panel === 'node' ? 'selected' : ''}>Node</button>
      <button onClick={() => onClick('peers')} className={panel === 'peers' ? 'selected' : ''}>Peers</button>
      <button onClick={() => onClick('debug')} className={panel === 'debug' ? 'selected' : ''}>Debug</button>
      <button onClick={() => onClick('dht')} className={panel === 'dht' ? 'selected' : ''}>DHT</button>
    </div>
  )
}
