import './multiaddr-list.css'
import 'react'
import { multiaddr, type Multiaddr } from '@multiformats/multiaddr'
import { WebRTC, WebSockets, WebSocketsSecure, WebTransport, Circuit, QUIC, QUICV1, TCP } from '@multiformats/multiaddr-matcher'
import certifiedMultiaddr from '../../public/img/multiaddr-certified.svg'
import uncertifiedMultiaddr from '../../public/img/multiaddr-uncertified.svg'
import circuitRelayTransport from '../../public/img/transport-circuit-relay.svg'
import quicTransport from '../../public/img/transport-quic.svg'
import tcpTransport from '../../public/img/transport-tcp.svg'
import unknownTransport from '../../public/img/transport-unknown.svg'
import webrtcTransport from '../../public/img/transport-webrtc.svg'
import websocketTransport from '../../public/img/transport-websocket.svg'
import webtransportTransport from '../../public/img/transport-webtransport.svg'
import { sendMessage } from '../utils/send-message.js'
import { CopyIcon } from './icons/icon-copy.js'
import type { CopyToClipboardMessage } from '@libp2p/devtools-metrics'
import type { ReactElement } from 'react'

export interface TransportIconProps {
  multiaddr: Multiaddr
}

function TransportIcon ({ multiaddr }: TransportIconProps): ReactElement {
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

function CertifiedIcon ({ isCertified }: CertifiedIconProps): ReactElement {
  return (
    <>
      <img src={isCertified === true ? certifiedMultiaddr : uncertifiedMultiaddr} height={16} width={16} className={'Icon'} />
    </>
  )
}

interface MultiaddrProps {
  multiaddr: Multiaddr
  isCertified?: boolean
  key?: string
  includeCertification?: boolean
}

function MultiaddrPanel ({ multiaddr: m, isCertified, includeCertification }: MultiaddrProps): ReactElement {
  const ma = multiaddr(m)

  function copyToClipboard (evt: any): void {
    evt.preventDefault()

    sendMessage<CopyToClipboardMessage>({
      type: 'copy-to-clipboard',
      value: ma.toString()
    })
  }

  return (
    <div className={'Multiaddr'}>
      <TransportIcon multiaddr={ma} />
      {
        includeCertification === true ? <CertifiedIcon isCertified={isCertified} /> : undefined
      }
      <CopyIcon onClick={copyToClipboard} />
      <code>{m.toString()}</code>
    </div>
  )
}

export interface MulitaddrListProps {
  addresses: Array<{ multiaddr: Multiaddr, isCertified?: boolean }>
  includeCertification?: boolean
}

export function MultiaddrList ({ addresses, includeCertification }: MulitaddrListProps): ReactElement {
  if (addresses.length === 0) {
    return (
      <>
        <p>There are no multiaddrs to display</p>
      </>
    )
  }

  return (
    <>
      <div className="MultiaddrList">
        <ul>
          {addresses.map(({ multiaddr: m, isCertified }, index) => <MultiaddrPanel key={`ma-${index}`} multiaddr={m} includeCertification={includeCertification} isCertified={isCertified} />)}
        </ul>
      </div>
    </>
  )
}
