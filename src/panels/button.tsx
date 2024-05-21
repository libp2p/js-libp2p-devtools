import React, { type MouseEventHandler } from 'react'
import './button.css'

interface ButtonProps {
  children?: any[] | string
  onClick: MouseEventHandler
  primary?: boolean
  secondary?: boolean
  danger?: boolean
}

export function Button ({ children, onClick, primary, secondary, danger }: ButtonProps) {
  return (
    <button type="button" onClick={onClick} className={`Button ${primary ? 'primary' : ''} ${secondary ? 'secondary' : ''} ${danger ? 'danger' : ''}`}>
      {children}
    </button>
  )
}
