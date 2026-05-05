import { useState, useEffect, useRef } from 'react'
import { BASE } from '../utils/assetUrl'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import portfolioImg from '../../assets/bilder/prosjektbilder/portfolio_screens.jpg'

const SCALE = 2.1

// appendToPrev: true → teksten skrives på slutten av forrige linje (samme visuell rad)
const TERMINAL_LINES = [
  { text: '> npm run build',              preDelay: 80,  charMs: 55, color: '#cccccc' },
  { text: '  ▶ compiling portfolio...',   preDelay: 300, charMs: 48, color: '#9cdcfe' },
  { text: '  ! ups... ikke helt ferdig',  preDelay: 400, charMs: 60, color: '#daa520' },
  { text: '  → good enough. deploying.',  preDelay: 450, charMs: 38, color: '#569cd6' },
  { text: ' < ENJOY!',                    preDelay: 150, charMs: 50, color: '#c586c0', appendToPrev: true },
]

const CONFETTI = [
  { emoji: '🎉', dx: -38, dy: -95,  delay: 0.00 },
  { emoji: '✨', dx:  28, dy: -110, delay: 0.07 },
  { emoji: '🎊', dx: -60, dy: -75,  delay: 0.13 },
  { emoji: '⭐', dx:  55, dy: -90,  delay: 0.05 },
  { emoji: '✨', dx: -20, dy: -120, delay: 0.18 },
  { emoji: '🌟', dx:  42, dy: -70,  delay: 0.10 },
  { emoji: '🎈', dx: -50, dy: -60,  delay: 0.22 },
  { emoji: '🎉', dx:  15, dy: -130, delay: 0.03 },
]

const FONT_PX       = 8
const LINE_H_PX     = FONT_PX * 1.5
const MAX_LINES     = 3
const TERM_H        = MAX_LINES * LINE_H_PX + 14
const EXTRA_H       = TERM_H - 4
const CURSOR_PRE_MS = 1300

const CARD_DELAY = 0.55
const CARD_DUR   = 2.20
const ZOOM_DELAY = 1.00
const X_DELAY    = 2.10

// ── VS Code-terminal typewriter ───────────────────────────
function TerminalTyper({ onNewLine, onDone }) {
  const [lines,       setLines]       = useState(TERMINAL_LINES.map(() => ''))
  const [activeLine,  setActiveLine]  = useState(-1)
  const [scrollOffset,setScrollOffset]= useState(0)
  // Post-fase: markør blinker mellom "enough" og " deploying.", så skrives tekst inn
  const [postPhase,   setPostPhase]   = useState(false)
  const [postBefore,  setPostBefore]  = useState('')   // tekst før innsetting
  const [postAfter,   setPostAfter]   = useState('')   // tekst etter innsetting
  const [postTyped,   setPostTyped]   = useState('')   // det som skrives inn
  const [postCursor,  setPostCursor]  = useState(false)

  useEffect(() => {
    const timeouts = []
    timeouts.push(setTimeout(() => setActiveLine(0), 0))

    let t = CURSOR_PRE_MS
    let visualIdx = 0

    TERMINAL_LINES.forEach((line, li) => {
      t += line.preDelay
      const vIdx      = line.appendToPrev ? visualIdx - 1 : visualIdx
      const newOffset = Math.max(0, vIdx - (MAX_LINES - 1)) * LINE_H_PX

      timeouts.push(setTimeout(() => {
        setActiveLine(li)
        setScrollOffset(newOffset)
        if (!line.appendToPrev) onNewLine?.()
      }, t))

      for (let ci = 0; ci < line.text.length; ci++) {
        const at   = t + ci * line.charMs + Math.random() * 20
        const snap = line.text.slice(0, ci + 1)
        timeouts.push(setTimeout(() => {
          setLines(prev => prev.map((s, i) => i === li ? snap : s))
        }, at))
      }
      t += line.text.length * line.charMs
      if (!line.appendToPrev) visualIdx++
    })

    // Hoved-sekvens ferdig
    timeouts.push(setTimeout(() => { setActiveLine(-1); onDone?.() }, t + 400))

    // ── Post-fase ────────────────────────────────────────────
    // "  → good enough. deploying."
    //  →  before = "  → good enough.", after = " deploying."
    const BEFORE_DOT = '  → good enough.'   // 16 chars (inkl. punktum)
    const AFTER_DOT  = ' deploying.'
    const INSERT     = ' for now....'

    const ps = t + 400 + 700  // 700 ms etter konfetti

    // 1. Kursor dukker opp mellom "enough." og " deploying." og blinker
    timeouts.push(setTimeout(() => {
      setPostBefore(BEFORE_DOT)
      setPostAfter(AFTER_DOT)
      setPostCursor(true)
      setPostPhase(true)
    }, ps))

    // 2. Etter ~1.5s blinking: erstatt "." med ","
    timeouts.push(setTimeout(() => {
      setPostBefore('  → good enough,')
    }, ps + 1500))

    // 3. Skriv " for now...." tegn for tegn (100ms etter komma)
    INSERT.split('').forEach((ch, ci) => {
      timeouts.push(setTimeout(() => {
        setPostTyped(prev => prev + ch)
      }, ps + 1600 + ci * 65))
    })

    // 4. Kursor forsvinner
    timeouts.push(setTimeout(() => {
      setPostCursor(false)
    }, ps + 1600 + INSERT.length * 65 + 400))

    return () => timeouts.forEach(clearTimeout)
  }, [])

  const blinkStyle = { animation: 'terminalBlink 0.75s step-end infinite', color: '#aeafad', marginLeft: 1 }

  return (
    <div style={{
      margin: '6px -16px -36px',
      background: '#1e1e1e',
      borderTop: '1px solid #3c3c3c',
      height: TERM_H,
      overflow: 'hidden',
      fontFamily: "Consolas, 'Courier New', monospace",
      fontSize: FONT_PX,
      lineHeight: LINE_H_PX / FONT_PX,
      padding: '5px 10px',
      boxSizing: 'border-box',
    }}>
      <div style={{ transform: `translateY(-${scrollOffset}px)`, transition: 'transform 0.22s ease' }}>
        {TERMINAL_LINES.map((line, i) => {
          if (line.appendToPrev) return null

          const nextLine  = TERMINAL_LINES[i + 1]
          const hasAppend = nextLine?.appendToPrev
          const isActive  = i === activeLine || (hasAppend && (i + 1) === activeLine)

          return lines[i] || i === activeLine ? (
            <div key={i} style={{ whiteSpace: 'nowrap', height: LINE_H_PX }}>
              {(i === 3 && postPhase) ? (
                // Post-fase: split linje 3 rundt innsettingspunktet
                <>
                  <span style={{ color: line.color }}>{postBefore}</span>
                  {postCursor && <span style={blinkStyle}>▍</span>}
                  <span style={{ color: line.color }}>{postTyped}</span>
                  <span style={{ color: line.color }}>{postAfter}</span>
                  {lines[4] && (
                    <span style={{ color: TERMINAL_LINES[4].color }}>{lines[4]}</span>
                  )}
                </>
              ) : (
                // Normal rendering
                <>
                  <span style={{ color: line.color }}>{lines[i] || ''}</span>
                  {hasAppend && lines[i + 1] && (
                    <span style={{ color: nextLine.color }}>{lines[i + 1]}</span>
                  )}
                  {isActive && <span style={blinkStyle}>▍</span>}
                </>
              )}
            </div>
          ) : null
        })}
      </div>
    </div>
  )
}
// ─────────────────────────────────────────────────────────

export default function PortfolioEasterEgg({
  kortVariants, pileOffset, kortStyle, kortHover,
  bildeBoks, bildeStyle, tekstStyle, prosjSpredt, onOpenChange
}) {
  const [open, setOpen]             = useState(false)
  const [cardRect, setCardRect]     = useState(null)
  const [flashes, setFlashes]       = useState([])
  const [showConfetti, setConfetti] = useState(false)
  const cardRef = useRef(null)

  const handleNewLine = () => {
    const id = Date.now() + Math.random()
    setFlashes(prev => [...prev, id])
    setTimeout(() => setFlashes(prev => prev.filter(f => f !== id)), 500)
  }

  useEffect(() => {
    if (!open) return
    const onKey    = (e) => { if (e.key === 'Escape') handleClose() }
    const onScroll = () => handleClose()
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll',  onScroll, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll',  onScroll)
    }
  }, [open])

  const handleOpen = (e) => {
    e.preventDefault()
    if (!prosjSpredt || open) return
    const r = cardRef.current.getBoundingClientRect()
    setCardRect({ left: r.left, top: r.top, width: r.width, height: r.height })
    setOpen(true)
    setConfetti(false)
    onOpenChange?.(true)
  }

  const handleClose = () => {
    setOpen(false)
    setConfetti(false)
    onOpenChange?.(false)
  }

  const vw = window.innerWidth
  const vh = window.innerHeight

  return (
    <>
      {/* Placeholder-kort i grid */}
      <motion.div
        ref={cardRef}
        custom={pileOffset}
        variants={kortVariants}
        animate={prosjSpredt ? 'spredt' : 'haug'}
        className="pcrd pcrd-foto"
        style={{ ...kortStyle, pointerEvents: prosjSpredt ? 'auto' : 'none', opacity: open ? 0 : 1 }}
        whileHover={prosjSpredt && !open ? kortHover : undefined}
        onClick={handleOpen}
      >
        <div style={bildeBoks}>
          <img src={portfolioImg} alt="Portfolio" style={bildeStyle} />
        </div>
        <div style={tekstStyle}>Portfolio 2026</div>
      </motion.div>

      {/* Klikk-blokkerer */}
      {open && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000 }} onClick={handleClose} />,
        document.body
      )}

      {/* Kortet */}
      {open && cardRect && createPortal(
        <motion.div
          initial={{ x: cardRect.left, y: cardRect.top, scale: 1 }}
          animate={{
            x: vw / 2 - (cardRect.width * SCALE) / 2,
            y: vh / 2 - ((cardRect.height + EXTRA_H) * SCALE) / 2,
            scale: SCALE,
          }}
          transition={{ duration: CARD_DUR, delay: CARD_DELAY, ease: [0, 0, 0.2, 1] }}
          style={{
            ...kortStyle,
            position: 'fixed', left: 0, top: 0,
            width: cardRect.width,
            zIndex: 10001,
            transformOrigin: 'top left',
            overflow: 'visible',
          }}
          onClick={handleClose}
        >
          {/* Bildeboks */}
          <div style={{ ...bildeBoks, position: 'relative', overflow: 'hidden' }}>
            <motion.img
              src={portfolioImg} alt="Portfolio"
              initial={{ filter: 'blur(0px)', scale: 1, opacity: 1 }}
              animate={{ filter: 'blur(14px)', scale: 1.09, opacity: 0 }}
              transition={{ duration: 0.55, ease: 'easeIn' }}
              style={{ ...bildeStyle, position: 'absolute', inset: 0, zIndex: 0 }}
            />

            <motion.img
              src={`${BASE}portfolio_prosjekt_ups.png`} alt="Rom"
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: 2.0 }}
              transition={{
                opacity: { delay: 0.28, duration: 0.55, ease: 'easeOut' },
                scale:   { delay: ZOOM_DELAY, duration: 4.5, ease: 'easeOut' },
              }}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%', objectFit: 'cover',
                zIndex: 1, transformOrigin: '72% 18%',
              }}
            />

            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse 80% 70% at 50% 55%, transparent 0%, rgba(0,0,0,0.55) 100%)',
              zIndex: 1, pointerEvents: 'none',
            }} />

            {flashes.map(id => (
              <motion.div key={id}
                initial={{ opacity: 0.13 }} animate={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                style={{ position: 'absolute', inset: 0, background: '#fff', zIndex: 3, pointerEvents: 'none' }}
              />
            ))}
          </div>

          {/* Terminal */}
          <TerminalTyper onNewLine={handleNewLine} onDone={() => setConfetti(true)} />

          {/* Konfetti */}
          {showConfetti && CONFETTI.map((c, i) => (
            <motion.div key={i}
              initial={{ x: cardRect.width / 2, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: cardRect.width / 2 + c.dx, y: c.dy, opacity: 0, scale: 0.6 }}
              transition={{ duration: 1.4, delay: c.delay, ease: 'easeOut' }}
              style={{
                position: 'absolute', bottom: 0,
                fontSize: 11, pointerEvents: 'none', zIndex: 20,
              }}
            >
              {c.emoji}
            </motion.div>
          ))}

          {/* Lukke-kryss */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: X_DELAY }}
            style={{
              position: 'absolute', top: 1, right: 3, zIndex: 5,
              width: 18, height: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <line x1="1.5" y1="1.5" x2="12.5" y2="12.5" stroke="#2a2118" strokeWidth="2" strokeLinecap="round"/>
              <line x1="12.5" y1="1.5" x2="1.5" y2="12.5" stroke="#2a2118" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.div>
        </motion.div>,
        document.body
      )}
    </>
  )
}
