import React from 'react'
import './button.css'

interface ButtonProps {
  children?: any[]
  onClick: (evt: Event) => void
  primary?: boolean
  secondary?: boolean
  danger?: boolean
}

export function Button (props: ButtonProps) {
  return (
    <button type="button" {...props} className={`Button ${props.primary ? 'primary' : ''} ${props.secondary ? 'secondary' : ''} ${props.danger ? 'danger' : ''}`}>
      {props.children}
    </button>
  )
}
