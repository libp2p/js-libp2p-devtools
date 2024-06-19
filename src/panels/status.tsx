import './status.css'

export interface ErrorProps {
  error: Error | string
}

export function SmallError ({ error }: ErrorProps) {
  return (
    <small className="Error">{error instanceof Error ? error.message : error}</small>
  )
}

export interface SuccessProps {
  message: string
}

export function SmallSuccess ({ message }: SuccessProps) {
  return (
    <small className="Success">{message}</small>
  )
}
