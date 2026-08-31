import { useRef, useEffect, useCallback } from 'react'

// Skrapelodd-effekt: toppbildet males på et canvas oppå bunnbildet, og
// "viskes" bort (destination-out) langs musepekeren/fingeren for å
// avsløre bildet under.
export default function ScratchReveal({ topSrc, bottomSrc, alt, brushFraction = 0.14, style, onScratchStart, triggerHint }) {
  const containerRef   = useRef(null)
  const canvasRef      = useRef(null)
  const topImgRef      = useRef(null)
  const lastPointRef   = useRef(null)
  const brushRadiusRef = useRef(30)
  const hasStartedRef  = useRef(false)
  const hintAnimRef    = useRef(null)
  const prevTriggerRef = useRef(false)

  const scratchAt = (x, y, radius = brushRadiusRef.current) => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = 'rgba(0,0,0,1)'
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  const scratchLine = (from, to, radius = brushRadiusRef.current) => {
    const dx = to.x - from.x, dy = to.y - from.y
    const dist = Math.hypot(dx, dy)
    const steps = Math.max(1, Math.ceil(dist / (radius * 0.5)))
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      scratchAt(from.x + dx * t, from.y + dy * t, radius)
    }
  }

  // Lite drag helt oppe i venstre hjørnet — spilles av som en animasjon (ikke
  // et ferdig skrapt strøk) så brukeren faktisk SER bevegelsen, som om noen
  // skraper akkurat der, uten å måtte gjøre det selv. Tegnes som en
  // sammenhengende linje (scratchLine) mellom hvert animasjonssteg, ikke
  // enkeltprikker, slik at det ser ut som ett skrap og ikke en prikkerekke.
  const animateHintScratch = (rectWidth, rectHeight) => {
    if (hintAnimRef.current) cancelAnimationFrame(hintAnimRef.current)
    const r = rectWidth * 0.035
    const from = { x: 0, y: rectHeight * 0.04 }
    const to   = { x: rectWidth * 0.04, y: 0 }
    const duration = 900
    const startTime = performance.now()
    let prevPoint = from

    const step = (now) => {
      if (hasStartedRef.current) { hintAnimRef.current = null; return }
      const t = Math.min(1, (now - startTime) / duration)
      const eased = 1 - Math.pow(1 - t, 2)
      const point = { x: from.x + (to.x - from.x) * eased, y: from.y + (to.y - from.y) * eased }
      scratchLine(prevPoint, point, r)
      prevPoint = point
      hintAnimRef.current = t < 1 ? requestAnimationFrame(step) : null
    }
    hintAnimRef.current = requestAnimationFrame(step)
  }

  const drawTopLayer = useCallback(() => {
    const canvas = canvasRef.current
    const img = topImgRef.current
    if (!canvas || !img) return
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    const dpr = window.devicePixelRatio || 1
    canvas.width  = Math.round(rect.width * dpr)
    canvas.height = Math.round(rect.height * dpr)
    brushRadiusRef.current = rect.width * brushFraction
    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
    // "object-fit: cover" for canvas — når containeren får en påtvunget
    // høyde (se style.height under, brukt på mobil/nettbrett for å gi
    // teksten nok plass) matcher ikke lenger rect sitt sideforhold bildets
    // naturlige sideforhold. Å tegne rett til rect.width×rect.height ville
    // da strukket/flatklemt strektegningen — beskjær kildebildet i stedet,
    // akkurat som object-fit: cover gjør på <img> under.
    const imgAspect  = img.naturalWidth / img.naturalHeight
    const rectAspect = rect.width / rect.height
    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight
    if (imgAspect > rectAspect) {
      sw = img.naturalHeight * rectAspect
      sx = (img.naturalWidth - sw) / 2
    } else {
      sh = img.naturalWidth / rectAspect
      sy = (img.naturalHeight - sh) / 2
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, rect.width, rect.height)
  }, [brushFraction])

  useEffect(() => {
    const img = new Image()
    img.src = topSrc
    img.onload = () => { topImgRef.current = img; drawTopLayer() }
    return () => {
      img.onload = null
      if (hintAnimRef.current) cancelAnimationFrame(hintAnimRef.current)
    }
  }, [topSrc, drawTopLayer])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => drawTopLayer())
    ro.observe(el)
    return () => ro.disconnect()
  }, [drawTopLayer])

  // Spill av skrape-hintet når brukeren faktisk ruller til seksjonen (ikke
  // ved mount) — ellers er animasjonen ferdig lenge før noen ser den.
  useEffect(() => {
    if (triggerHint && !prevTriggerRef.current && !hasStartedRef.current) {
      const canvas = canvasRef.current
      if (canvas) {
        const rect = canvas.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) animateHintScratch(rect.width, rect.height)
      }
    }
    prevTriggerRef.current = triggerHint
  }, [triggerHint])

  const getPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const touch = e.touches && e.touches[0]
    const clientX = touch ? touch.clientX : e.clientX
    const clientY = touch ? touch.clientY : e.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  // Skraping krever et bevisst trykk-og-dra (som et ekte skrapelodd), ikke
  // bare at musepekeren henger over bildet. Uten dette skraper siden seg selv
  // når JS-drevet scroll flytter kortet under en stillestående mus — da
  // sender nettleseren mousemove-hendelser for hit-testing selv om brukeren
  // ikke har rørt musen.
  const isDrawingRef = useRef(false)

  const beginScratch = (e) => {
    isDrawingRef.current = true
    if (!hasStartedRef.current) {
      hasStartedRef.current = true
      if (hintAnimRef.current) cancelAnimationFrame(hintAnimRef.current)
      onScratchStart?.()
    }
    const point = getPoint(e)
    scratchAt(point.x, point.y)
    lastPointRef.current = point
  }

  const handleMove = (e) => {
    if (!isDrawingRef.current) return
    const point = getPoint(e)
    if (lastPointRef.current) scratchLine(lastPointRef.current, point)
    else scratchAt(point.x, point.y)
    lastPointRef.current = point
  }

  const handleEnd = () => {
    isDrawingRef.current = false
    lastPointRef.current = null
  }

  // Museknappen holdes ofte utenfor selve canvaset mens man drar (kortet er
  // lite) — da slutter et rent onMouseLeave/onMouseUp på canvaset å funke,
  // og brukeren må klikke på nytt for hvert lite sveip utenfor kanten. Følg
  // derfor musa på window mens den er nede, så draget fortsetter selv om
  // pekeren et øyeblikk er utenfor bildet.
  const handleMouseDown = (e) => {
    beginScratch(e)
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleWindowMouseUp)
  }

  const handleWindowMouseUp = () => {
    handleEnd()
    window.removeEventListener('mousemove', handleMove)
    window.removeEventListener('mouseup', handleWindowMouseUp)
  }

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleWindowMouseUp)
    }
  }, [])

  // Som standard får bunn-innholdet sin egen naturlige høyde (aspect-ratio-
  // styrt). Hvis den som bruker komponenten eksplisitt gir en høyde via
  // `style` (f.eks. for å begrense hvor mye plass det spiser på mobil),
  // fyller det i stedet den høyden og beskjæres med object-fit: cover — å
  // bare krympe bredden ville også gjort tekstkolonnen ved siden av smalere
  // og dermed fått den til å bryte over flere linjer (motsatt effekt av
  // det vi vil).
  const hasExplicitHeight = style?.height != null
  const isVideo = /\.(mp4|webm|mov)$/i.test(bottomSrc || '')
  const bottomStyle = {
    width: '100%',
    height: hasExplicitHeight ? '100%' : 'auto',
    objectFit: hasExplicitHeight ? 'cover' : undefined,
    display: 'block',
  }
  return (
    <div ref={containerRef} style={{ position: 'relative', ...style }}>
      {isVideo ? (
        <video src={bottomSrc} autoPlay loop muted playsInline style={bottomStyle} />
      ) : (
        <img src={bottomSrc} alt={alt} style={bottomStyle} />
      )}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          touchAction: 'none',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={beginScratch}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />
    </div>
  )
}
