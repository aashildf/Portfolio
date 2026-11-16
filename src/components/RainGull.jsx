import { useEffect, useRef, useState } from 'react'
import { motion, animate, useMotionValue, useReducedMotion } from 'framer-motion'

// En gjennomvåt, litt sur måke som sitter på rammens bunnlinje (Kontakt).
// Med jevne mellomrom prøver den å fly sin vei — men den holder fast i linja,
// så linja blir med opp og strekkes som en strikk. Den gir opp, linja
// spretter tilbake, og den sukker «pff».
//
// EASTER EGG: trykker man på måka, klorer den løs en bit av linja, river den
// av, slår en ufrivillig salto og faller ned gjennom hullet (onFall) — og
// siden følger etter ned til byggeplassen (ConstructionSite).
//
// Biten av bunnlinja mellom x0 og x1 tegnes HER (som en kurve) i stedet for i
// Layout sin rammesti, så den kan bøyes og rives i stykker.
//
// Lokale koordinater for måka: føttene i (0,0), y negativ oppover, måka ser
// mot venstre. Ca. 74 enheter bred, s = size / 70.

export const BODY = [
  'M -15 -27',
  'C -17 -17, -8 -11, 3 -11',           // bryst ned til buken
  'C 13 -11, 21 -15, 27 -19',           // buk bak til halen
  'L 37 -21 L 31 -22.5 L 36 -25 L 27 -25', // våte, klissete halefjær
  'C 18 -29, 6 -31, -5 -33',            // ryggen
  'C -5 -42, -12 -47, -19 -44',         // bakhodet opp til issen
  'C -22 -43, -23 -41, -23 -39',        // panna
  'L -35 -37.5',                        // overnebb ut
  'Q -37.5 -36.5 -35 -34.5',            // krok på nebbet
  'L -23 -34.5',                        // undernebb tilbake
  'C -20 -32, -16 -30, -15 -27',        // haka ned til strupen
].join(' ')

export const BEAK = 'M -23 -39 L -35 -37.5 Q -37.5 -36.5 -35 -34.5 L -23 -34.5 Z'

// Klissete hårtjafser som henger ned i panna
export const HAIR = ['M -16 -45.5 Q -19.5 -42 -18 -38.5', 'M -12 -46.3 Q -13.5 -43 -11.5 -40.5', 'M -8.5 -45 Q -8 -42.5 -6.5 -41']

// Sammenfoldet vinge — roteres rundt skulderen når den flakser
export const WING = 'M -3 -29 C 6 -31, 17 -28, 28 -22.5 L 22 -22.5 L 25 -19.5 L 17 -20 C 9 -20, 1 -23, -3 -29'
const SHOULDER = [-3, -29]

export const LEGS = ['M -1.5 0 L -1 -11', 'M 4 0 L 4.5 -11.5']
export const TOES = ['M -5 0 Q -2 -1.6 1 0', 'M 1.5 0 Q 4.5 -1.6 7.5 0']

// Biten av linja måka river løs (lokalt, under føttene)
export const PIECE_L = -9
export const PIECE_R = 10

// Dråper som drypper av halen, nebbet og buken
const DRIPS = [
  { x: 37, y: -21, fall: 21, delay: 0.3, every: 2.6 },
  { x: -35.5, y: -34, fall: 33, delay: 1.4, every: 3.4 },
  { x: 6, y: -11, fall: 11, delay: 2.1, every: 2.9 },
  { x: -18, y: -38, fall: 12, delay: 0.9, every: 4.1 },
]
export const DROP = 'M 0 -1.8 Q 1.3 0.2 0 1.1 Q -1.3 0.2 0 -1.8 Z'

// Den private regnskyen
const CLOUD = 'M -16 0 C -22.5 0, -22.5 -8, -15 -8 C -14 -15.5, -3 -16.5, -1 -10 C 2 -15.5, 12.5 -14.5, 11 -7 C 17.5 -7, 17.5 0, 11 0 Z'
const RAIN_X = [-13, -6, 1, 8]

export const PAPER = '#faf8f5'

const sleep = (ms, timers) => new Promise(r => timers.push(setTimeout(r, ms)))

export default function RainGull({ cx, lineY, x0, x1, size = 70, onFall }) {
  const reduce = useReducedMotion()
  const s = size / 70
  const sw = 1 / s // samme strektykkelse som rammen

  const lift = useMotionValue(0)      // hvor høyt føttene (og linja) er dratt opp, px
  const cloudLift = useMotionValue(0) // skyen henger litt etter
  const tilt = useMotionValue(0)
  const wobble = useMotionValue(0)
  const wing = useMotionValue(0)
  const spin = useMotionValue(0)      // saltoen
  const twang = useMotionValue(0)     // de avrevne linjeendene som dirrer

  const lineRef = useRef(null)
  const lineRRef = useRef(null)
  const gullRef = useRef(null)
  const cloudRef = useRef(null)
  const wingRef = useRef(null)
  const pokeRef = useRef(null)
  const busyRef = useRef(false)
  const modeRef = useRef('loop') // 'loop' | 'break'
  const brokenRef = useRef(false)
  const ctlsRef = useRef([])
  const timersRef = useRef([])

  const [shown, setShown] = useState(!!reduce)
  const [spray, setSpray] = useState(0)
  const [pff, setPff] = useState(0)
  const [cracks, setCracks] = useState(false)
  const [broken, setBroken] = useState(false)
  const [shock, setShock] = useState(false)

  // Tegn linje/måke/sky direkte i DOM-en når verdiene endrer seg (60 fps uten re-render)
  useEffect(() => {
    const draw = () => {
      const L = lift.get()
      const y = lineY
      if (!brokenRef.current) {
        const a = cx - x0, b = x1 - cx
        lineRef.current?.setAttribute('d',
          `M ${x0} ${y} C ${x0 + a * 0.55} ${y}, ${cx - a * 0.16} ${y - L * 0.85}, ${cx} ${y - L} ` +
          `C ${cx + b * 0.16} ${y - L * 0.85}, ${x1 - b * 0.55} ${y}, ${x1} ${y}`)
        lineRRef.current?.setAttribute('d', '')
      } else {
        // Revet: to løse ender som dirrer tilbake på plass, med et hull imellom
        const T = twang.get()
        const cl = cx + PIECE_L * s, cr = cx + PIECE_R * s
        const a = cl - x0, b = x1 - cr
        lineRef.current?.setAttribute('d',
          `M ${x0} ${y} C ${x0 + a * 0.6} ${y}, ${cl - a * 0.15} ${y - T * 0.8}, ${cl} ${y - T}`)
        lineRRef.current?.setAttribute('d',
          `M ${cr} ${y - T} C ${cr + b * 0.15} ${y - T * 0.8}, ${x1 - b * 0.6} ${y}, ${x1} ${y}`)
      }
      gullRef.current?.setAttribute('transform',
        `translate(${cx} ${y - L}) scale(${s}) rotate(${tilt.get() + wobble.get()}) rotate(${spin.get()} 2 -25)`)
      cloudRef.current?.setAttribute('transform',
        `translate(${cx} ${y - cloudLift.get()}) scale(${s}) translate(-4 -76)`)
      wingRef.current?.setAttribute('transform', `rotate(${wing.get()} ${SHOULDER[0]} ${SHOULDER[1]})`)
    }
    draw()
    const unsubs = [lift, cloudLift, tilt, wobble, wing, spin, twang].map(v => v.on('change', draw))
    return () => unsubs.forEach(u => u())
  }, [cx, lineY, x0, x1, s, broken, lift, cloudLift, tilt, wobble, wing, spin, twang])

  // Skyen følger etter med en treg fjær (men blir igjen når måka faller)
  useEffect(() => lift.on('change', v => {
    if (modeRef.current === 'break' && v < 0) return
    animate(cloudLift, v, { type: 'spring', stiffness: 60, damping: 12 })
  }), [lift, cloudLift])

  const run = (...args) => { const c = animate(...args); ctlsRef.current.push(c); return c }

  // Hovedløkka: dukk opp → (vent) → prøv å fly → rist av vannet → …
  useEffect(() => {
    if (reduce) return
    modeRef.current = 'loop' // (StrictMode kjører effekten to ganger i dev)
    const timers = timersRef.current
    const live = () => modeRef.current === 'loop'

    const waitOrPoke = ms => new Promise(r => {
      const t = setTimeout(r, ms); timers.push(t)
    })

    const attempt = async () => {
      busyRef.current = true
      await run(lift, -0.05 * size, { duration: 0.25, ease: 'easeOut' })
      if (!live()) return
      const flap = run(wing, [0, -88], { duration: 0.13, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' })
      run(tilt, -12, { duration: 0.4 })
      await run(lift, [-0.05, 0.22, 0.13, 0.36, 0.25, 0.5, 0.4, 0.56, 0.5].map(v => v * size),
        { duration: 2.6, ease: 'easeInOut' })
      if (!live()) return
      await sleep(220, timers)
      if (!live()) return
      flap.stop()
      run(wing, 0, { duration: 0.18 })
      run(tilt, 0, { type: 'spring', stiffness: 200, damping: 10 })
      await run(lift, 0, { type: 'spring', stiffness: 420, damping: 6 })
      if (!live()) return
      setSpray(k => k + 1)
      await sleep(500, timers)
      if (!live()) return
      setPff(k => k + 1)
      busyRef.current = false
    }

    const shake = async () => {
      busyRef.current = true
      setSpray(k => k + 1)
      await run(wobble, [0, -9, 9, -8, 8, -5, 5, 0], { duration: 0.65 })
      busyRef.current = false
    }

    ;(async () => {
      await sleep(700, timers)
      if (!live()) return
      setShown(true)
      await sleep(2600, timers)
      let i = 0
      while (live()) {
        await (i % 2 === 0 ? attempt() : shake())
        if (!live()) return
        await waitOrPoke(i % 2 === 0 ? 4500 : 6500)
        i++
      }
    })()

    return () => {
      modeRef.current = 'dead'
      timers.forEach(clearTimeout)
      ctlsRef.current.forEach(c => c.stop())
      ;[lift, cloudLift, tilt, wobble, wing, spin, twang].forEach(v => v.set(0))
    }
  }, [reduce, size, lift, cloudLift, tilt, wobble, wing, spin, twang])

  // Easter egg: klor løs en bit av linja → riv → salto → fall gjennom hullet
  const breakFree = async () => {
    if (modeRef.current !== 'loop') return
    modeRef.current = 'break'
    busyRef.current = true
    if (reduce) { onFall?.(); return }
    const timers = timersRef.current
    ctlsRef.current.forEach(c => c.stop())
    ctlsRef.current = []
    setPff(0)

    // Rett deg opp
    run(wing, 0, { duration: 0.15 })
    run(wobble, 0, { duration: 0.15 })
    await run(lift, 0, { duration: 0.2 })

    // 1. Ser ned og klorer i linja
    await run(tilt, 14, { duration: 0.25, ease: 'easeOut' })
    setCracks(true)
    await run(wobble, [0, 4, -4, 4, -4, 4, -4, 0], { duration: 0.75 })
    run(tilt, -8, { duration: 0.3 })

    // 2. Røsker til med full flaksing — linja strekkes, strekkes …
    const flap = run(wing, [0, -88], { duration: 0.11, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' })
    await run(lift, [0, 0.18, 0.04, 0.32, 0.08, 0.5].map(v => v * size), { duration: 1.5, ease: 'easeInOut' })

    // 3. … og ryker!
    brokenRef.current = true
    setBroken(true)
    setCracks(false)
    twang.set(lift.get())
    run(twang, 0, { type: 'spring', stiffness: 380, damping: 5 })
    flap.stop()
    setShock(true)
    run(wing, -70, { duration: 0.12 })
    await run(lift, lift.get() + 0.3 * size, { duration: 0.28, ease: 'easeOut' })

    // 4. Salto bakover og rett ned gjennom hullet
    onFall?.()
    run(spin, -400, { duration: 1.0, ease: 'easeIn' })
    run(wing, [-70, -20, -80, -10], { duration: 1.0 })
    await run(lift, -(window.innerHeight + 200), { duration: 1.1, ease: [0.55, 0, 1, 0.6] })
    await sleep(0, timers)
  }

  const onPoke = () => { if (shown) breakFree() }

  const drawIn = (delay = 0) => ({
    initial: { pathLength: reduce ? 1 : 0 },
    animate: { pathLength: shown ? 1 : 0 },
    transition: { duration: 1.4, delay, ease: 'easeInOut' },
  })
  const fadeIn = delay => ({
    initial: { opacity: reduce ? 1 : 0 },
    animate: { opacity: shown ? 1 : 0 },
    transition: { duration: 0.4, delay },
  })
  const stroke = { fill: 'none', stroke: 'black', strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' }

  return (
    <g aria-hidden>
      {/* Bunnlinja under måka — strekkes når den prøver å lette, rives når den faller */}
      <path ref={lineRef} fill="none" stroke="black" strokeWidth="1" />
      <path ref={lineRRef} fill="none" stroke="black" strokeWidth="1" />

      {/* Personlig regnsky */}
      <g ref={cloudRef}>
        <motion.g {...fadeIn(1.2)}>
          <path d={CLOUD} {...stroke} fill={PAPER} />
          {!reduce && RAIN_X.map((x, i) => (
            <motion.path
              key={i}
              d={`M ${x} 3 l -1 4`}
              {...stroke}
              strokeWidth={0.8 / s}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: [0, 15], opacity: [0, 0.8, 0] }}
              transition={{ duration: 0.7, delay: i * 0.23, repeat: Infinity, ease: 'easeIn' }}
            />
          ))}
        </motion.g>
      </g>

      {/* Måka */}
      <g
        ref={gullRef}
        data-nav=""
        onClick={onPoke}
        style={{ pointerEvents: shown && !broken ? 'auto' : 'none', cursor: 'pointer' }}
      >
        <rect x={-38} y={-50} width={78} height={52} fill="transparent" />

        {/* Den løsrevne linjebiten i klørne */}
        {broken && <path d={`M ${PIECE_L} 0 H ${PIECE_R}`} {...stroke} />}

        {/* Sprekker der den klorer */}
        {cracks && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <path d={`M ${PIECE_L} -3 L ${PIECE_L + 1.2} -1 L ${PIECE_L - 0.8} 1 L ${PIECE_L + 0.5} 3`} {...stroke} strokeWidth={0.8 / s} />
            <path d={`M ${PIECE_R} -3 L ${PIECE_R - 1.2} -1 L ${PIECE_R + 0.8} 1 L ${PIECE_R - 0.5} 3`} {...stroke} strokeWidth={0.8 / s} />
          </motion.g>
        )}

        {LEGS.map((d, i) => <motion.path key={i} d={d} {...stroke} {...drawIn(0)} />)}
        {TOES.map((d, i) => <motion.path key={i} d={d} {...stroke} {...drawIn(0)} />)}
        <motion.path d={BODY} {...stroke} {...drawIn(0.2)} />
        <motion.path d={BEAK} fill="#f2c14e" fillOpacity={0.55} stroke="none" {...fadeIn(1.4)} />
        <motion.circle cx={-31} cy={-35.4} r={0.9} fill="#d9534f" {...fadeIn(1.5)} />
        {HAIR.map((d, i) => <motion.path key={i} d={d} {...stroke} {...drawIn(1.2 + i * 0.1)} />)}

        {shock ? (
          // Store, sjokkerte øyne + «!»
          <g>
            <circle cx={-16} cy={-39} r={2.6} fill={PAPER} {...stroke} />
            <circle cx={-16.6} cy={-39} r={0.9} fill="black" />
            <text x={-14} y={-52} fontFamily="'Caveat', cursive" fontSize={14} fontWeight={700} fill="black">!</text>
          </g>
        ) : (
          // Surt, halvlukket øye med pose under
          <motion.g {...fadeIn(1.5)}>
            <circle cx={-16.5} cy={-38.6} r={1.25} fill="black" />
            <path d="M -19.2 -40.1 L -14 -39.7" {...stroke} />
            <path d="M -18.6 -36.6 Q -16.5 -35.6 -14.4 -36.8" {...stroke} strokeWidth={0.7 / s} />
          </motion.g>
        )}

        <g ref={wingRef}>
          <motion.path d={WING} {...stroke} fill={PAPER} fillOpacity={0.85} {...drawIn(0.7)} />
        </g>

        {/* Drypp */}
        {!reduce && shown && !broken && DRIPS.map((d, i) => (
          <g key={i} transform={`translate(${d.x} ${d.y})`}>
            <motion.path
              d={DROP}
              fill="black"
              initial={{ y: 0, opacity: 0, scale: 0.4 }}
              animate={{ y: [0, 0, d.fall], opacity: [0, 0.75, 0], scale: [0.4, 1, 1] }}
              transition={{ duration: 1.3, times: [0, 0.45, 1], delay: 2 + d.delay, repeat: Infinity, repeatDelay: d.every, ease: 'easeIn' }}
            />
          </g>
        ))}

        {/* Vannsprut når den rister seg / lander */}
        {spray > 0 && (
          <g key={`spray-${spray}`}>
            {[[-26, -46], [-8, -52], [12, -40], [32, -34], [40, -18], [-30, -22]].map(([dx, dy], i) => (
              <motion.path
                key={i}
                d={DROP}
                fill="black"
                initial={{ x: 4, y: -26, opacity: 0.8, scale: 0.6 }}
                animate={{ x: 4 + dx, y: -26 + dy * 0.6 + 14, opacity: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            ))}
          </g>
        )}

        {/* Oppgitt sukk */}
        {pff > 0 && (
          <motion.text
            key={`pff-${pff}`}
            x={-30}
            y={-50}
            fontFamily="'Caveat', cursive"
            fontSize={12}
            fill="black"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 1, 0], y: [0, -3, -5, -8] }}
            transition={{ duration: 1.8, times: [0, 0.15, 0.7, 1] }}
          >
            pff …
          </motion.text>
        )}
      </g>
    </g>
  )
}
