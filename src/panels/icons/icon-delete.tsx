import 'react'
import './icon.css'
import src from '../../../public/img/icon-delete.svg'
import type { IconProps } from './index.js'

export function DeleteIcon ({ onClick }: IconProps) {
  return (
    <>
      <img src={src} height={16} width={16} className={`Icon${onClick != null ? ' ClickableIcon' : ''} DeleteIcon`} onClick={onClick} />
    </>
  )
}
