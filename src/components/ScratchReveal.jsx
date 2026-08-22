import { useRef, useEffect, useCallback } from 'react'

// Skrapelodd-effekt: toppbildet males på et "erase"-canvas oppå bunnbildet,
// og et gjennomsiktig "drops"-canvas oppå alt sammen tegner de synlige,
// falgende vanndråpene (samme visuelle stil som paraply-dryppene på
// Kontakt-siden). To måter å avsløre bunnbildet på:
//  1. Manuelt: musepeker/finger "visker" bort (destination-out) langs sporet.
//  2. Automatisk: synlige dråper drypper ned fra toppen med jevne mellomrom,
//     glir nedover med litt tyngdekraft og en vaklende bane, etterlater et
//     tynt, jevnt bredt vått spor bak seg, og renner rett ut av synsfeltet
//     ved nedre kant (canvaset klipper dem naturlig der) — bare mens
//     `active` er true, så tiden ikke brukes opp mens kortet ikke er synlig.
export default function ScratchReveal({
  topSrc, bottomSrc, alt,
  brushFraction = 0.09,
  active = true,
  style,
}) {
  const containerRef   = useRef(null)
  const canvasRef      = useRef(null)   // "erase"-lag: toppbilde minus hull
  const dropsCanvasRef = useRef(null)   // synlige dråper, tegnes på nytt hver frame
  const topImgRef      = useRef(null)
  const lastPointRef   = useRef(null)
  const brushRadiusRef = useRef(30)
  const cssSizeRef     = useRef({ width: 0, height: 0 })
  const dropsRef       = useRef([])

  const drawTopLayer = useCallback(() => {
    const canvas = canvasRef.current
    const dropsCanvas = dropsCanvasRef.current
    const img = topImgRef.current
    if (!canvas || !dropsCanvas || !img) return
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    const dpr = window.devicePixelRatio || 1

    canvas.width  = Math.round(rect.width * dpr)
    canvas.height = Math.round(rect.height * dpr)
    dropsCanvas.width  = canvas.width
    dropsCanvas.height = canvas.height

    brushRadiusRef.current = rect.width * brushFraction
    cssSizeRef.current = { width: rect.width, height: rect.height }

    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
    ctx.drawImage(img, 0, 0, rect.width, rect.height)

    dropsCanvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0)

    // Skrape-/dryppefremdrift nullstilles uansett ved resize siden
    // toppbildet males på nytt (nye pikseldimensjoner).
    dropsRef.current = []
  }, [brushFraction])

  useEffect(() => {
    const img = new Image()
    img.src = topSrc
    img.onload = () => { topImgRef.current = img; drawTopLayer() }
    return () => { img.onload = null }
  }, [topSrc, drawTopLayer])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => drawTopLayer())
    ro.observe(el)
    return () => ro.disconnect()
  }, [drawTopLayer])

  const wetCircle = (ctx, x, y, r, alpha = 1) => {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r)
    gradient.addColorStop(0,   `rgba(0,0,0,${alpha})`)
    gradient.addColorStop(0.7, `rgba(0,0,0,${alpha * 0.9})`)
    gradient.addColorStop(1,   'rgba(0,0,0,0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // Fast radius brukt BÅDE for det viskede sporet og for selve dråpen —
  // begge skal holde seg like store/tynne hele veien nedover.
  const DROP_RADIUS = 5.5

  // Tegner en synlig vanndråpe — spiss øverst, rund/bred nederst (ordentlig
  // dråpeform), i "tegnet med penn, malt inni"-stil: tydelig konturstrek og
  // en flat fargeflate inni (ikke blank/glossy). Samme fargepalett som
  // paraply-/musepeker-dråpene ellers på siden (Regn.jsx / CustomCursor).
  const drawDroplet = (ctx, x, y, r, opacity) => {
    const height = r * 3 // avstand fra sentrum av "buken" til spissen
    const apexY = y - height
    ctx.save()
    ctx.globalAlpha = opacity
    ctx.beginPath()
    ctx.moveTo(x, apexY)
    ctx.bezierCurveTo(x + r * 1.1, apexY + height * 0.6, x + r, y - r * 0.4, x + r, y)
    ctx.arc(x, y, r, 0, Math.PI, false)
    ctx.bezierCurveTo(x - r, y - r * 0.4, x - r * 1.1, apexY + height * 0.6, x, apexY)
    ctx.closePath()
    ctx.fillStyle = 'rgba(59, 74, 97, 0.85)'   // samme "malt" fylling som paraply-dryppene
    ctx.fill()
    ctx.lineWidth = 1.1
    ctx.strokeStyle = 'rgba(142, 162, 197, 0.9)'  // mørk penn-kontur
    ctx.stroke()

    // liten pennstrek-glans i stedet for blank høylys
    ctx.strokeStyle = 'rgba(241, 233, 233, 0.7)'
    ctx.lineWidth = Math.max(0.6, r * 0.14)
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x - r * 0.28, apexY + height * 0.4)
    ctx.quadraticCurveTo(x - r * 0.42, y - r * 0.55, x - r * 0.3, y - r * 0.15)
    ctx.stroke()
    ctx.restore()
  }

  // Automatisk drypping — kun mens `active` er true.
  useEffect(() => {
    if (!active) return
    let rafId = null
    let lastTime = null
    let nextSpawnAt = null
    let elapsed = 0

    const spawnDrop = (width) => {
      const baseX = 14 + Math.random() * (width - 28)
      dropsRef.current.push({
        baseX,
        x: baseX,
        y: -8,
        speed: 20 + Math.random() * 16,
        wobbleFreq: 0.4 + Math.random() * 0.9,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleAmp: 2 + Math.random() * 4,
      })
    }

    const step = (now) => {
      if (lastTime == null) {
        lastTime = now
        nextSpawnAt = now + 300
      }
      const dt = Math.min(0.05, (now - lastTime) / 1000) // demp store hopp (f.eks. faneskifte)
      lastTime = now
      elapsed += dt

      const { width, height } = cssSizeRef.current
      if (width && height) {
        if (now >= nextSpawnAt) {
          spawnDrop(width)
          nextSpawnAt = now + 1500 + Math.random() * 2000 // sjeldne drypp
        }

        const eraseCtx = canvasRef.current.getContext('2d')
        eraseCtx.globalCompositeOperation = 'destination-out'
        const dropsCtx = dropsCanvasRef.current.getContext('2d')
        dropsCtx.clearRect(0, 0, width, height)

        dropsRef.current.forEach((d) => {
          const prevY = d.y
          d.speed = Math.min(65, d.speed + 12 * dt) // svak tyngdekraft, aldri veldig fort
          d.y += d.speed * dt
          d.x = d.baseX + Math.sin(elapsed * d.wobbleFreq + d.wobblePhase) * d.wobbleAmp

          const steps = Math.max(1, Math.ceil((d.y - prevY) / (DROP_RADIUS * 0.6)))
          for (let i = 0; i <= steps; i++) {
            const t = i / steps
            wetCircle(eraseCtx, d.x, prevY + (d.y - prevY) * t, DROP_RADIUS)
          }
          // Dråpen tegnes helt til den renner ut av synsfeltet — canvaset
          // klipper den naturlig ved nedre kant, ingen egen sluttanimasjon.
          drawDroplet(dropsCtx, d.x, d.y, DROP_RADIUS, 1)
        })

        // Fjern først når dråpen er godt forbi kanten (usynlig uansett)
        dropsRef.current = dropsRef.current.filter((d) => d.y < height + DROP_RADIUS * 4)
      }
      rafId = requestAnimationFrame(step)
    }

    rafId = requestAnimationFrame(step)
    return () => { if (rafId) cancelAnimationFrame(rafId) }
  }, [active])

  const scratchAt = (x, y) => {
    const ctx = canvasRef.current.getContext('2d')
    ctx.globalCompositeOperation = 'destination-out'
    wetCircle(ctx, x, y, brushRadiusRef.current)
  }

  const scratchLine = (from, to) => {
    const dx = to.x - from.x, dy = to.y - from.y
    const dist = Math.hypot(dx, dy)
    const steps = Math.max(1, Math.ceil(dist / (brushRadiusRef.current * 0.5)))
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      scratchAt(from.x + dx * t, from.y + dy * t)
    }
  }

  const getPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const touch = e.touches && e.touches[0]
    const clientX = touch ? touch.clientX : e.clientX
    const clientY = touch ? touch.clientY : e.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const handleMove = (e) => {
    const point = getPoint(e)
    if (lastPointRef.current) scratchLine(lastPointRef.current, point)
    else scratchAt(point.x, point.y)
    lastPointRef.current = point
  }

  const handleEnd = () => { lastPointRef.current = null }

  return (
    <div ref={containerRef} style={{ position: 'relative', ...style }}>
      <img src={bottomSrc} alt={alt} style={{ width: '100%', height: 'auto', display: 'block' }} />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          touchAction: 'none',
        }}
        onMouseMove={handleMove}
        onMouseLeave={handleEnd}
        onMouseUp={handleEnd}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />
      <canvas
        ref={dropsCanvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
