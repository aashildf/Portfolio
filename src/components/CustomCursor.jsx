import { useEffect, useRef } from 'react'
import { BASE } from '../utils/assetUrl'

const hasReactOnClick = (el) => {
  const key = Object.keys(el).find(k => k.startsWith('__reactProps'))
  return !!(key && el[key]?.onClick)
}

const isInteractive = (el) => {
  while (el && el !== document.body) {
    const tag = el.tagName?.toLowerCase()
    if (['a', 'button', 'input', 'select', 'textarea'].includes(tag)) return true
    const role = el.getAttribute?.('role')
    if (role === 'button' || role === 'link') return true
    if (hasReactOnClick(el)) return true
    el = el.parentElement
  }
  return false
}

const isNativeCursorZone = (el) => {
  while (el && el !== document.body) {
    if (el.classList?.contains('native-cursor')) return true
    el = el.parentElement
  }
  return false
}

export default function CustomCursor() {
  const ref    = useRef(null)
  const imgRef = useRef(null)

  useEffect(() => {
    const move = (e) => {
      if (!ref.current) return
      ref.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
      const native = isNativeCursorZone(e.target)
      const interactive = isInteractive(e.target)
      // I native-cursor-sone: skjul sky helt, bruk native CSS-peker
      if (native) {
        ref.current.style.opacity = '0'
      } else {
        ref.current.style.opacity = '1'
        if (imgRef.current) {
          imgRef.current.src = interactive ? `${BASE}cloud_pointer2.png` : `${BASE}cloud_pointer.png`
        }
      }
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 42,
        height: 26,
        pointerEvents: 'none',
        zIndex: 999999,
        transform: 'translate(-999px, -999px)',
        marginLeft: -6,
        marginTop: -3,
      }}
    >
      <img
        ref={imgRef}
        src={`${BASE}cloud_pointer.png`}
        alt=""
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  )
}
