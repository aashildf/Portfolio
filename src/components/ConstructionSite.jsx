import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, animate, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion'
import { BODY, BEAK, HAIR, WING, LEGS, TOES, PAPER } from './RainGull'
import { BASE } from '../utils/assetUrl'

// Hemmelig «kjeller» under Kontakt: måka har revet hull i bunnlinja og falt
// ned hit. Det er bekmørkt — bare en lyskjegle slipper inn gjennom hullet i
// «taket» og følger musepekeren (eller fingeren). I lyset: en liten
// byggeplass malt i samme akvarellstil som Bergen-bildet, og en sniktitt på
// Rådbanken. Seksjonen finnes bare etter at easter egget er utløst.

const RADBANKEN_URL = 'https://raadbanken.vercel.app/'

const SIGN_FONT = "'Arial Black', 'Helvetica Neue', Arial, sans-serif"
const INK = 'rgba(18, 12, 4, 0.92)'

// Akvarellpalett hentet fra Bergen-maleriet
const WC = {
  ink: '#4a3f37',      // sepia-grå strek
  ochre: '#e6be6a',
  terracotta: '#d4704f',
  cream: '#f4ecdc',
  dust: '#9db5c6',     // støvblå
  slate: '#6c7884',
  sand: '#d8b886',
}

// Lyset
const DARK = '#0e1119'
const WARM = '255, 228, 168'

// ─── Akvarell-scenen ──────────────────────────────────────────────────────────
// Hvert element males i to lag, slik som i Bergen-bildet: en løs vaskeflate
// (ujevn kant, pigmentkorn, mørkere rand der vannet tørker) som ikke treffer
// streken helt, og en tynn, litt skjelven sepia-strek oppå.
function WatercolorScene({ width, lampRef }) {
  const h = width * (220 / 360)
  const wash = (color, op = 0.8) => ({
    fill: color, fillOpacity: op, filter: 'url(#wc-wash)', style: { mixBlendMode: 'multiply' },
  })
  const ink = { fill: 'none', stroke: WC.ink, strokeWidth: 1, strokeLinecap: 'round', strokeLinejoin: 'round', filter: 'url(#wc-ink)' }
  const signText = { fontFamily: SIGN_FONT, fontWeight: 900, fill: WC.ink, filter: 'url(#wc-ink)', textAnchor: 'middle' }

  return (
    <svg viewBox="0 0 360 220" width={width} height={h} style={{ display: 'block', overflow: 'visible' }} aria-hidden>
      <defs>
        {/* Vaskeflate: forskjøvet kant + korn + mørk tørkerand */}
        <filter id="wc-wash" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="7" xChannelSelector="R" yChannelSelector="G" result="wobble" />
          <feGaussianBlur in="wobble" stdDeviation="0.7" result="soft" />
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="9" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.8 1.15" result="grainA" />
          <feComposite in="soft" in2="grainA" operator="in" result="grainy" />
          <feMorphology in="soft" operator="erode" radius="1.4" result="inner" />
          <feComposite in="soft" in2="inner" operator="out" result="edge" />
          <feMerge><feMergeNode in="grainy" /><feMergeNode in="edge" /></feMerge>
        </filter>
        {/* Store, utflytende bakgrunnsvasker */}
        <filter id="wc-bloom" x="-20%" y="-30%" width="140%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="22" xChannelSelector="R" yChannelSelector="G" result="wobble" />
          <feGaussianBlur in="wobble" stdDeviation="3" />
        </filter>
        {/* Skjelven tusjstrek */}
        <filter id="wc-ink" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="2" seed="7" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <pattern id="wc-stripes" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="9" height="18" fill={WC.terracotta} />
        </pattern>
      </defs>

      {/* Bakgrunn: tåkete, støvblå vask og en varm flekk — som himmelen over Bergen */}
      <path d="M 18 150 C 10 100, 60 52, 130 58 C 170 30, 250 34, 300 70 C 350 88, 356 140, 330 168 L 30 172 Z"
        fill={WC.dust} fillOpacity={0.32} filter="url(#wc-bloom)" />
      <path d="M 210 120 C 230 90, 300 92, 320 130 C 326 150, 300 168, 250 166 C 214 162, 200 140, 210 120 Z"
        fill={WC.sand} fillOpacity={0.3} filter="url(#wc-bloom)" />

      {/* Bakke og grus */}
      <path d="M 8 183 C 70 176, 150 186, 230 180 C 290 176, 330 184, 354 181 L 352 194 C 260 197, 120 196, 10 194 Z" {...wash(WC.sand, 0.6)} />
      <path d="M 10 186 C 90 183, 200 189, 352 185" {...ink} strokeWidth={0.8} />

      {/* Vannpytt med speiling (som havna i Bergen-bildet) */}
      <ellipse cx="226" cy="203" rx="78" ry="7.5" {...wash(WC.dust, 0.65)} />
      <g opacity={0.35} filter="url(#wc-bloom)">
        <rect x="150" y="196" width="150" height="5" fill={WC.terracotta} />
        <rect x="160" y="200" width="20" height="3" fill={WC.ochre} />
      </g>
      <path d="M 170 204 h 22 M 236 207 h 34 M 205 200 h 12" {...ink} stroke={WC.dust} strokeWidth={0.9} />

      {/* Sandhaug med spade (bak den store kjeglen) */}
      <path d="M 282 186 C 292 160, 318 150, 336 160 C 348 168, 354 178, 356 186 Z" {...wash(WC.sand, 0.85)} />
      <path d="M 284 185 C 294 162, 318 152, 336 161 C 347 168, 353 177, 355 185" {...ink} />
      <path d="M 314 158 L 300 112" {...ink} strokeWidth={1.4} />
      <path d="M 296 104 h 8 M 300 104 v 8" {...ink} />
      <path d="M 309 154 C 304 166, 316 172, 322 162 L 318 150 Z" {...wash(WC.slate, 0.75)} />
      <path d="M 309 154 C 304 166, 316 172, 322 162 L 318 150 Z" {...ink} />

      {/* Rombeformet skilt: WORK IN PROGRESS */}
      <g transform="rotate(-4 70 186)">
        <path d="M 67 110 L 66 186 L 74 186 L 73 110 Z" {...wash(WC.slate, 0.55)} />
        <path d="M 68 112 L 67 186 M 72 112 L 73 186" {...ink} />
        <path d="M 70 20 L 120 70 L 70 120 L 20 70 Z" {...wash(WC.ochre, 0.9)} />
        <path d="M 70 22 L 118 70 L 70 118 L 22 70 Z" {...ink} strokeWidth={1.3} />
        <path d="M 70 30 L 110 70 L 70 110 L 30 70 Z" {...ink} strokeWidth={0.8} />
        <text x="70" y="66" {...signText} fontSize="10.5" textLength="52" lengthAdjust="spacingAndGlyphs">WORK IN</text>
        <text x="70" y="80" {...signText} fontSize="10.5" textLength="62" lengthAdjust="spacingAndGlyphs">PROGRESS</text>
      </g>

      {/* Liten kjegle */}
      <g transform="translate(128 0)">
        <path d="M -11 186 L -4 150 L 4 150 L 11 186 Z" {...wash(WC.terracotta, 0.85)} />
        <path d="M -7.5 172 L 7.5 172 L 6 163 L -6 163 Z" fill={WC.cream} fillOpacity={0.9} filter="url(#wc-wash)" />
        <path d="M -10 186 L -4 151 L 4 151 L 10 186" {...ink} />
        <path d="M -16 186 H 16 L 15 190 H -15 Z" {...wash(WC.slate, 0.7)} />
      </g>

      {/* Sperrebukk */}
      <path d="M 168 118 L 156 186 M 168 118 L 182 186 M 284 118 L 272 186 M 284 118 L 298 186" {...ink} strokeWidth={1.3} />
      <path d="M 168 118 L 156 186 L 160 186 L 170 122 Z M 284 118 L 298 186 L 294 186 L 282 122 Z" {...wash(WC.slate, 0.4)} />
      <rect x="146" y="112" width="160" height="22" {...wash(WC.cream, 0.95)} />
      <rect x="146" y="112" width="160" height="22" fill="url(#wc-stripes)" fillOpacity={0.85} filter="url(#wc-wash)" style={{ mixBlendMode: 'multiply' }} />
      <rect x="146" y="112" width="160" height="22" {...ink} />
      <rect x="152" y="150" width="148" height="13" {...wash(WC.cream, 0.95)} />
      <rect x="152" y="150" width="148" height="13" fill="url(#wc-stripes)" fillOpacity={0.85} filter="url(#wc-wash)" style={{ mixBlendMode: 'multiply' }} />
      <rect x="152" y="150" width="148" height="13" {...ink} />

      {/* CONSTRUCTION-skilt */}
      <path d="M 196 112 V 104 M 256 112 V 104" {...ink} />
      <rect x="158" y="72" width="136" height="33" rx="3" {...wash(WC.ochre, 0.92)} />
      <rect x="160" y="74" width="132" height="30" rx="3" {...ink} strokeWidth={1.3} />
      <text x="226" y="94.5" {...signText} fontSize="14" textLength="112" lengthAdjust="spacingAndGlyphs">CONSTRUCTION</text>

      {/* Varsellampe (gløden tegnes oppå mørket, se ConstructionSite) */}
      <circle ref={lampRef} cx="166" cy="68" r="5.5" {...wash(WC.terracotta, 0.9)} />
      <circle cx="166" cy="68" r="5" {...ink} />

      {/* Stor kjegle */}
      <g transform="translate(332 0)">
        <path d="M -14 186 L -5 140 L 5 140 L 14 186 Z" {...wash(WC.terracotta, 0.88)} />
        <path d="M -10 170 L 10 170 L 8.4 158 L -8.4 158 Z" fill={WC.cream} fillOpacity={0.9} filter="url(#wc-wash)" />
        <path d="M -13 186 L -5 141 L 5 141 L 13 186" {...ink} />
        <path d="M -20 186 H 20 L 19 191 H -19 Z" {...wash(WC.slate, 0.7)} />
      </g>

      {/* Fargesprut på papiret, som nederst i Bergen-bildet */}
      {[
        [24, 206, 2.2, WC.dust], [36, 212, 1.4, WC.dust], [52, 204, 1.1, WC.ochre],
        [300, 212, 2.4, WC.terracotta], [318, 207, 1.3, WC.ochre], [334, 214, 1.8, WC.terracotta],
        [346, 205, 1, WC.dust], [96, 214, 1.6, WC.sand], [140, 210, 1, WC.dust],
      ].map(([x, y, r, c], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={c} fillOpacity={0.55} filter="url(#wc-wash)" />
      ))}
    </svg>
  )
}

// ─── Den forslåtte måka som lander på bunnlinja her nede ─────────────────────
function DazedGull({ cx, groundY, s, dropFrom, delay, onLand }) {
  const sw = 1 / s
  const st = { fill: 'none', stroke: 'black', strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' }
  const [landed, setLanded] = useState(false)
  return (
    <g transform={`translate(${cx} ${groundY})`}>
      <motion.g
        initial={{ y: -dropFrom, rotate: -300, opacity: 0 }}
        animate={{ y: 0, rotate: 0, opacity: 1 }}
        transition={{ delay, duration: 0.85, ease: [0.5, 0, 1, 0.7], opacity: { delay, duration: 0.01 } }}
        onAnimationComplete={() => { setLanded(true); onLand?.() }}
        style={{ originX: 0.5, originY: 0.5 }}
      >
        <g transform={`scale(${s}) rotate(${landed ? 9 : 0} 2 0)`}>
          {LEGS.map((d, i) => <path key={i} d={d} {...st} />)}
          {TOES.map((d, i) => <path key={i} d={d} {...st} />)}
          <path d={BODY} {...st} fill={PAPER} />
          <path d={BEAK} fill="#f2c14e" fillOpacity={0.55} />
          <circle cx={-31} cy={-35.4} r={0.9} fill="#d9534f" />
          {HAIR.map((d, i) => <path key={i} d={d} {...st} />)}
          {/* Svimmelt kryss-øye */}
          <path d="M -18 -40.6 L -15 -37.6 M -15 -40.6 L -18 -37.6" {...st} />
          {/* Linjebiten den rev løs, dinglende fra nebbet som en mark */}
          <path d="M -34 -35.5 C -40 -30, -33 -24, -38 -17" {...st} />
          <path d={WING} {...st} fill={PAPER} transform="rotate(14 -3 -29)" />
        </g>
      </motion.g>

      {/* Stjerner som svirrer rundt hodet */}
      {landed && (
        <g transform={`translate(${-10 * s} ${-56 * s})`}>
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
            style={{ originX: 0.5, originY: 0.5 }}
          >
            {[0, 120, 240].map(a => {
              const r = 13 * s
              const x = Math.cos(a * Math.PI / 180) * r
              const y = Math.sin(a * Math.PI / 180) * r * 0.45
              return <text key={a} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={9 * s + 3} fill={WC.terracotta}>✦</text>
            })}
          </motion.g>
        </g>
      )}
    </g>
  )
}

// Svevende støv i lysstrålen
const MOTES = Array.from({ length: 14 }, (_, i) => ({
  t: (i * 0.37) % 1,           // hvor langt ned i kjeglen (0 = hullet, 1 = lysflekken)
  side: ((i * 0.61) % 1) - 0.5, // sideveis plassering
  r: 0.8 + ((i * 0.53) % 1) * 1.4,
  dur: 5 + ((i * 0.71) % 1) * 5,
  delay: (i * 0.43) % 3,
}))

export default function ConstructionSite({ vw, vh, fi, holeL, holeR, gullCx, gullSize, onBack }) {
  const reduce = useReducedMotion()
  const isMobile = vw < 600
  const innerW = vw - 2 * fi
  const innerH = vh - 2 * fi
  const sceneW = Math.round(Math.min(innerW - 24, 540, Math.max(220, (innerH - 300) * (360 / 220))))
  const fb = vh - fi
  const s = gullSize / 70

  const sectionRef = useRef(null)
  const ctaRef = useRef(null)
  const lampRef = useRef(null)
  const userMoved = useRef(false)
  const [lamp, setLamp] = useState(null)

  // ── Lyskjeglen ──
  // Lyset faller inn gjennom hullet (topp) og lander i en rund lysflekk der
  // pekeren er. Først peker det rett ned på måka som faller.
  const R = isMobile ? 135 : 200
  const holeC = (holeL + holeR) / 2
  const topY = -fi // oversiden av «gulvet» måka falt gjennom
  const spring = reduce ? { stiffness: 1000, damping: 100 } : { stiffness: 55, damping: 16, mass: 0.9 }
  const tx = useSpring(gullCx, spring)
  const ty = useSpring(fb - 40, spring)

  const conePts = (x, y, grow = 1) => {
    const dx = x - holeC, dy = y - topY
    const len = Math.hypot(dx, dy) || 1
    const nx = -dy / len, ny = dx / len
    const r = R * grow
    return { l: [x + nx * r, y + ny * r], r: [x - nx * r, y - ny * r] }
  }
  const coneD = useTransform([tx, ty], ([x, y]) => {
    const p = conePts(x, y)
    return `M ${holeL} ${topY} L ${holeR} ${topY} L ${p.r[0]} ${p.r[1]} L ${p.l[0]} ${p.l[1]} Z`
  })
  // Selve strålen (det synlige lyset i lufta) er smalere enn lysflekken
  const beamD = useTransform([tx, ty], ([x, y]) => {
    const p = conePts(x, y, 0.8)
    return `M ${holeL + 1} ${topY} L ${holeR - 1} ${topY} L ${p.r[0]} ${p.r[1]} L ${p.l[0]} ${p.l[1]} Z`
  })

  // Følg mus/finger (koordinater i forhold til seksjonen)
  useEffect(() => {
    const follow = e => {
      const el = sectionRef.current
      if (!el) return
      const b = el.getBoundingClientRect()
      const y = e.clientY - b.top
      if (y < 0) return // pekeren er over seksjonen (mens vi glir ned)
      userMoved.current = true
      tx.set(e.clientX - b.left)
      ty.set(y)
    }
    window.addEventListener('pointermove', follow, { passive: true })
    window.addEventListener('pointerdown', follow, { passive: true })
    return () => {
      window.removeEventListener('pointermove', follow)
      window.removeEventListener('pointerdown', follow)
    }
  }, [tx, ty])

  // Med mus: lyset står stille (på måka) til musa beveges.
  // Berøringsskjerm (ingen mus å bevege): la lyset lete seg fram til knappen.
  useEffect(() => {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const t = setTimeout(() => {
      if (!userMoved.current) aimAt(ctaRef.current)
    }, reduce ? 300 : 2600)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const aimAt = el => {
    const sec = sectionRef.current
    if (!el || !sec) return
    const a = el.getBoundingClientRect(), b = sec.getBoundingClientRect()
    tx.set(a.left + a.width / 2 - b.left)
    ty.set(a.top + a.height / 2 - b.top - 20)
  }

  // Posisjonen til varsellampa (gløden dens tegnes oppå mørket)
  useLayoutEffect(() => {
    const measure = () => {
      const l = lampRef.current?.getBoundingClientRect()
      const b = sectionRef.current?.getBoundingClientRect()
      if (l && b) setLamp({ x: l.left + l.width / 2 - b.left, y: l.top + l.height / 2 - b.top, r: l.width })
    }
    measure()
    const t = setTimeout(measure, 700) // etter inn-animasjonen
    return () => clearTimeout(t)
  }, [vw, vh, sceneW])

  // Bunnlinja gir etter når måka lander
  const dip = useMotionValue(0)
  const groundD = useTransform(dip, d => {
    const a = gullCx - fi, b = vw - fi - gullCx
    return `M ${fi} ${fb} C ${fi + a * 0.6} ${fb}, ${gullCx - a * 0.12} ${fb + d}, ${gullCx} ${fb + d} ` +
      `C ${gullCx + b * 0.12} ${fb + d}, ${vw - fi - b * 0.6} ${fb}, ${vw - fi} ${fb}`
  })
  const onLand = () => animate(dip, [0, 14, -5, 3, 0], { duration: 0.9, ease: 'easeOut' })

  const appear = (delay) => reduce
    ? {}
    : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.5, ease: 'easeOut' } }

  return (
    <section
      ref={sectionRef}
      aria-label="Byggeplass: sniktitt på Rådbanken"
      style={{
        position: 'relative',
        height: vh,
        overflowX: 'clip',
        backgroundColor: PAPER,
        backgroundImage: `url(${BASE}watercolor-paper-texture.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Ramme for «etasjen» under, med hullet måka falt gjennom */}
      <svg
        width={vw}
        height={vh}
        style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}
        aria-hidden
      >
        <path d={`M ${holeL} ${-fi} V ${fi} M ${holeR} ${-fi} V ${fi}`} stroke="black" strokeWidth="1" strokeDasharray="2 3" />
        <path d={`M ${fi} ${fi} H ${holeL} M ${holeR} ${fi} H ${vw - fi}`} stroke="black" strokeWidth="1" fill="none" />
        <path d={`M ${fi} ${fi} V ${fb} M ${vw - fi} ${fi} V ${fb}`} stroke="black" strokeWidth="1" fill="none" />
        <motion.path d={groundD} stroke="black" strokeWidth="1" fill="none" />
        <motion.g style={{ y: dip }}>
          <DazedGull cx={gullCx} groundY={fb} s={s} dropFrom={fb - fi + 40} delay={reduce ? 0 : 0.25} onLand={onLand} />
        </motion.g>
      </svg>

      <div
        style={{
          position: 'absolute',
          left: fi, right: fi, top: fi, bottom: fi,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isMobile ? 12 : 18,
          padding: '0 12px',
        }}
      >
        {/* Sperrebånd: SNEAK PEEK */}
        <motion.div
          {...(reduce ? {} : { initial: { scaleX: 0 }, animate: { scaleX: 1 }, transition: { delay: 0.1, duration: 0.6, ease: 'easeOut' } })}
          style={{
            width: `calc(100% + ${2 * fi + 24}px)`,
            transform: 'rotate(-2.5deg)',
            background: `repeating-linear-gradient(-45deg, ${WC.ochre} 0 12px, #2a2520 12px 24px)`,
            padding: '4px 0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
          }}
        >
          <div style={{
            background: WC.ochre,
            color: '#1d1915',
            fontFamily: SIGN_FONT,
            fontWeight: 900,
            fontSize: isMobile ? 13 : 16,
            letterSpacing: 3,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            padding: '5px 0',
            textAlign: 'center',
          }}>
            {Array(8).fill('SNEAK PEEK').join('  ✦  ')}
          </div>
        </motion.div>

        <motion.div {...appear(0.2)}>
          <WatercolorScene width={sceneW} lampRef={lampRef} />
        </motion.div>

        <div style={{ maxWidth: 460, textAlign: 'center', color: INK }}>
          <motion.h2
            {...appear(0.5)}
            style={{ fontFamily: "'Caveat', cursive", fontWeight: 700, fontSize: isMobile ? 28 : 34, margin: '0 0 6px', lineHeight: 1.1 }}
          >
            Oi! Du falt rett inn på byggeplassen.
          </motion.h2>
          <motion.p
            {...appear(0.65)}
            style={{ fontFamily: "'Caveat', cursive", fontSize: isMobile ? 19 : 22, lineHeight: 1.3, margin: '0 0 16px' }}
          >
            Her bygger jeg <strong>Rådbanken</strong>: et norsk oppslagsverk for kjerringråd og husråd.
            Det som funket for mormor, samlet på ett sted og stemt fram av brukerne selv.
          </motion.p>
          <motion.div {...appear(0.8)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <a
              ref={ctaRef}
              href={RADBANKEN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="native-cursor"
              onFocus={e => aimAt(e.currentTarget)}
              style={{
                display: 'inline-block',
                fontFamily: "'Caveat', cursive",
                fontWeight: 700,
                fontSize: isMobile ? 22 : 24,
                color: 'black',
                background: WC.ochre,
                border: '1.5px solid black',
                borderRadius: 4,
                padding: '6px 18px',
                textDecoration: 'none',
                boxShadow: '3px 3px 0 rgba(0,0,0,0.85)',
                transform: 'rotate(-1deg)',
              }}
            >
              Ta en sniktitt på Rådbanken →
            </a>
            <button
              type="button"
              onClick={onBack}
              onFocus={e => aimAt(e.currentTarget)}
              className="native-cursor"
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: isMobile ? 18 : 20,
                color: INK,
                background: 'none',
                border: 'none',
                padding: 4,
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: 4,
                textDecorationColor: 'rgba(0,0,0,0.3)',
              }}
            >
              ↑ klatre opp igjen
            </button>
          </motion.div>
        </div>
      </div>

      {/* ── Mørket + lyskjeglen ──
          Et mørkt lag over alt, med et mykt hull formet som strålen fra
          hullet i taket ned til lysflekken. Klikk går rett gjennom. */}
      <svg
        width={vw}
        height={vh + fi}
        viewBox={`0 ${-fi} ${vw} ${vh + fi}`}
        style={{ position: 'absolute', left: 0, top: -fi, pointerEvents: 'none', overflow: 'visible' }}
        aria-hidden
      >
        <defs>
          <filter id="cs-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={isMobile ? 12 : 18} />
          </filter>
          <filter id="cs-glow" x="-60%" y="-30%" width="220%" height="160%">
            <feGaussianBlur stdDeviation={isMobile ? 16 : 24} />
          </filter>
          <filter id="cs-lamp" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <radialGradient id="cs-pool">
            <stop offset="0%" stopColor="black" stopOpacity="1" />
            <stop offset="65%" stopColor="black" stopOpacity="0.9" />
            <stop offset="100%" stopColor="black" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="cs-beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`rgb(${WARM})`} stopOpacity="0.55" />
            <stop offset="100%" stopColor={`rgb(${WARM})`} stopOpacity="0.08" />
          </linearGradient>
          <mask id="cs-light" maskUnits="userSpaceOnUse" x={0} y={-fi} width={vw} height={vh + fi}>
            <rect x={0} y={-fi} width={vw} height={vh + fi} fill="white" />
            <g filter="url(#cs-soft)">
              <motion.path d={coneD} fill="black" fillOpacity={0.55} />
              <motion.circle cx={tx} cy={ty} r={R} fill="url(#cs-pool)" />
            </g>
          </mask>
          <clipPath id="cs-beam-clip">
            <motion.path d={beamD} />
          </clipPath>
        </defs>

        {/* Mørket (bare innenfor seksjonen) */}
        <rect x={0} y={0} width={vw} height={vh} fill={DARK} fillOpacity={0.93} mask="url(#cs-light)" />

        {/* Varmt lys i lufta: strålen + gløden i lysflekken */}
        <g style={{ mixBlendMode: 'screen' }}>
          <motion.path d={beamD} fill="url(#cs-beam)" filter="url(#cs-glow)" opacity={0.5} />
          <motion.circle cx={tx} cy={ty} r={R * 0.7} fill={`rgba(${WARM}, 0.10)`} filter="url(#cs-glow)" />
        </g>

        {/* Støv som svever i strålen */}
        {!reduce && (
          <g clipPath="url(#cs-beam-clip)" style={{ mixBlendMode: 'screen' }}>
            {MOTES.map((m, i) => (
              <Mote key={i} m={m} tx={tx} ty={ty} holeC={holeC} topY={topY} R={R} />
            ))}
          </g>
        )}

        {/* Varsellampa blinker gult gjennom mørket */}
        {lamp && (
          <motion.circle
            cx={lamp.x}
            cy={lamp.y}
            r={lamp.r * 1.6}
            fill={`rgb(255, 196, 92)`}
            filter="url(#cs-lamp)"
            style={{ mixBlendMode: 'screen' }}
            animate={reduce ? { opacity: 0.25 } : { opacity: [0.03, 0.4, 0.03] }}
            transition={reduce ? {} : { duration: 1.1, repeat: Infinity }}
          />
        )}
      </svg>
    </section>
  )
}

// Ett støvkorn: driver sakte opp og ned langs strålen, sideveis litt fram og tilbake
function Mote({ m, tx, ty, holeC, topY, R }) {
  const phase = useMotionValue(m.t)
  useEffect(() => {
    const c = animate(phase, [m.t, (m.t + 0.25) % 1, m.t], { duration: m.dur, delay: m.delay, repeat: Infinity, ease: 'easeInOut' })
    return () => c.stop()
  }, [phase, m])
  const cx = useTransform([tx, ty, phase], ([x, , p]) => holeC + (x - holeC) * p + m.side * R * 1.4 * p)
  const cy = useTransform([tx, ty, phase], ([, y, p]) => topY + (y - topY) * p)
  return <motion.circle cx={cx} cy={cy} r={m.r} fill={`rgba(${WARM}, 0.8)`} />
}
