import React, { useState } from 'react'
import { Panel } from './panel.js'
import { Button } from './button.js'
import { TextInput } from './text-input.js'
import { getBrowserInstance } from '../utils/get-browser.js'
import { evalOnPage } from '../utils/eval-on-page.js'
import { LIBP2P_DEVTOOLS_METRICS_INSTANCE } from '@libp2p/devtools-metrics'

const browser = getBrowserInstance()

function sendDebug (evt: Event, namespace: string): boolean {
  evt.preventDefault()

  evalOnPage(`${LIBP2P_DEVTOOLS_METRICS_INSTANCE}.setDebug(${JSON.stringify(namespace)})`)

  if (namespace.length > 0) {
    localStorage.setItem('debug', namespace)
  } else {
    localStorage.removeItem('debug')
  }

  return false
}

export function Debug () {
  const [namespace, setNamespace] = useState(localStorage.getItem('debug') ?? '')

  return (
    <Panel>
      <h2>Debug</h2>
      <p>Enter the name of one or more libp2p components to enable logging in the console tab or disable it completely</p>
      <form onSubmit={(evt) => sendDebug(evt, namespace)}>
        <TextInput type="text" value={namespace} placeholder="libp2p:*" onChange={(e) => setNamespace(e.target.value)} />
        <Button onClick={(evt) => sendDebug(evt, namespace)} primary={true}>Go</Button>
        <Button onClick={(evt) => sendDebug(evt, '')} danger={true}>Disable</Button>
      </form>
      <small>E.g. `libp2p:*`, `libp2p:kad-dht*,*:trace`, etc</small>
    </Panel>
  )
}
