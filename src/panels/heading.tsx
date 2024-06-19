import './heading.css'

export interface HeadingProps {
  children: any
  subtitle?: string
}

export function Heading ({ children, subtitle }: HeadingProps) {
  const sub = subtitle == null ? undefined : <small>{subtitle}</small>

  return (
    <div className="Heading">
      {children}
      {sub}
    </div>
  )
}
