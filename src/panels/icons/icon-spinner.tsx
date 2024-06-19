import 'react'
import './icon.css'
import src from '../../../public/img/icon-spinner.svg'

export function SpinnerIcon () {
  return (
    <>
      <img src={src} height={16} width={16} className={`Icon SpinnerIcon`} />
    </>
  )
}
