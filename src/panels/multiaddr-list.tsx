import './multiaddr-list.css'
import React from 'react'
import { multiaddr, type Multiaddr } from '@multiformats/multiaddr'
import { WebRTC, WebSockets, WebSocketsSecure, WebTransport, Circuit, QUIC, QUICV1, TCP } from '@multiformats/multiaddr-matcher'
import webrtcTransport from '../../public/img/transport-webrtc.svg'
import websocketTransport from '../../public/img/transport-websocket.svg'
import webtransportTransport from '../../public/img/transport-webtransport.svg'
import circuitRelayTransport from '../../public/img/transport-circuit-relay.svg'
import quicTransport from '../../public/img/transport-quic.svg'
import tcpTransport from '../../public/img/transport-tcp.svg'
import unknownTransport from '../../public/img/transport-unknown.svg'
import certifiedMultiaddr from '../../public/img/multiaddr-certified.svg'
import uncertifiedMultiaddr from '../../public/img/multiaddr-uncertified.svg'
import copyIcon from '../../public/img/icon-copy.svg'
import type { CopyToClipboardMessage, Peer } from '@libp2p/devtools-metrics'
import { sendMessage } from '../utils/send-message'
import { evalOnPage } from '../utils/eval-on-page'

export interface TransportIconProps {
  multiaddr: Multiaddr
}

function TransportIcon ({ multiaddr }: TransportIconProps) {
  let src: string = unknownTransport

  if (WebRTC.matches(multiaddr)) {
    src = webrtcTransport
  } else if (Circuit.matches(multiaddr)) {
    src = circuitRelayTransport
  } else if (WebSockets.matches(multiaddr) || WebSocketsSecure.matches(multiaddr)) {
    src = websocketTransport
  } else if (WebTransport.matches(multiaddr)) {
    src = webtransportTransport
  } else if (QUIC.matches(multiaddr) || QUICV1.matches(multiaddr)) {
    src = quicTransport
  } else if (TCP.matches(multiaddr)) {
    src = tcpTransport
  }

  return (
    <>
    <img src={src} height={16} width={16} className={'Icon'} />
    </>
  )
}

export interface CertifiedIconProps {
  isCertified?: boolean
}

function CertifiedIcon ({ isCertified }: CertifiedIconProps) {
  return (
    <>
      <img src={isCertified === true ? certifiedMultiaddr : uncertifiedMultiaddr} height={16} width={16} className={'Icon'} />
    </>
  )
}


export interface TransportIconProps {
  multiaddr: Multiaddr
}

function CopyIcon ({ multiaddr }: TransportIconProps) {
  function copyToClipboard (evt: any) {
    evt.preventDefault()
/*
    navigator.clipboard.writeText(multiaddr.toString())
      .catch(err => {
        console.error('could not write to clipboard', err)
      })
*/
    sendMessage<CopyToClipboardMessage>({
      type: 'copy-to-clipboard',
      value: multiaddr.toString()
    })

    /*
    evalOnPage(`document.getElementsByTagName('body')[0].focus(); navigator.clipboard.writeText(${JSON.stringify(multiaddr.toString())})`)
      .catch(err => {
        console.error('could not write to clipboard', err)
      })
*/

    }

  return (
    <>
      <img src={copyIcon} height={16} width={16} className={'Icon'} onClick={evt => copyToClipboard(evt)} />
    </>
  )
}

interface MultiaddrProps {
  multiaddr: string
  isCertified?: boolean
  key?: string,
  includeCertification?: boolean
}

function MultiaddrPanel ({ multiaddr: m, isCertified, includeCertification }: MultiaddrProps) {
  const ma = multiaddr(m)

  return (
    <div className={'Multiaddr'}>
      <TransportIcon multiaddr={ma} />
      {
        includeCertification === true ? <CertifiedIcon isCertified={isCertified} /> : undefined
      }
      <CopyIcon multiaddr={ma} />
      <code>{m}</code>
    </div>
  )
}

export interface MulitaddrListProps {
  addresses: Array<{ multiaddr: string, isCertified?: boolean }>
  includeCertification?: boolean
}

export function MultiaddrList ({ addresses, includeCertification }: MulitaddrListProps) {
  if (addresses.length === 0) {
    return undefined
  }

  return (
    <>
      <div className="MultiaddrList">
        <h3>Multiaddrs</h3>
        <ul>
          {addresses.map(({ multiaddr: m, isCertified }, index) => <MultiaddrPanel key={`ma-${index}`} multiaddr={m} includeCertification={includeCertification} isCertified={isCertified} />)}
        </ul>
      </div>
    </>
  )
}
