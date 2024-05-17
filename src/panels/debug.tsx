import React, { useState } from 'react'
import { Panel } from './panel.js'
import { EnableDebugMessage } from '@libp2p/devtools-metrics'
import { sendMessage } from '../utils/send-message.js'
import { Button } from './button.js'
import { TextInput } from './text-input.js'

function sendDebug (evt: Event, namespace: string): boolean {
  evt.preventDefault()

  const message: EnableDebugMessage = {
    source: '@libp2p/devtools-metrics:devtools',
    type: 'debug',
    namespace: namespace.trim()
  }

  sendMessage(message)

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
