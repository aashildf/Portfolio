import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import prosjekter from '../data/prosjekter'
import PortfolioEasterEgg from '../components/PortfolioEasterEgg'

const HAUG_ROT = [-4, 6, -3, 8, -2, 5]

const kortVariants = {
  haug:   ({ x, y, rotate }) => ({ x, y, rotate }),
  spredt: {
    x: 0, y: 0, rotate: 0,
    transition: { duration: 1.3, ease: [0.22, 0.61, 0.36, 1] },
  },
}

const containerVariants = {
  haug:   {},
  spredt: { transition: { staggerChildren: 0.14 } },
}

const FOTO_BOX_SHADOW_DEFAULT = "1px 1px 0 0 rgba(0,0,0,0.12), 2px 2px 0 0 rgba(0,0,0,0.09), 3px 3px 0 0 rgba(0,0,0,0.07), 4px 4px 0 0 rgba(0,0,0,0.05), 6px 12px 24px 0 rgba(0,0,0,0.22), 0px 1px 5px 0px rgba(0,0,0,0.10)"
const FOTO_BOX_SHADOW_HOVER   = "1px 1px 0 0 rgba(0,0,0,0.12), 2px 2px 0 0 rgba(0,0,0,0.09), 3px 3px 0 0 rgba(0,0,0,0.07), 4px 4px 0 0 rgba(0,0,0,0.05), 10px 18px 36px 0 rgba(0,0,0,0.30), 0px 2px 8px 0px rgba(0,0,0,0.14)"

const kortStyle = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  background: "var(--color-white)",
  padding: "18px 16px 36px",
  textDecoration: "none",
  boxShadow: FOTO_BOX_SHADOW_DEFAULT,
}

const kortHover = {
  scale: 1.03,
  boxShadow: FOTO_BOX_SHADOW_HOVER,
  transition: { duration: 0.2 },
}

const bildeBoks = {
  aspectRatio: "5 / 4",
  overflow: "hidden",
  background: "var(--color-beige)",
  position: "relative",
}

const bildeStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
  filter: "contrast(0.95) saturate(0.9)",
}

const tekstStyle = {
  textAlign: "center",
  paddingTop: "10px",
  fontFamily: "var(--font-hand)",
  fontSize: "clamp(14px, 1.2vw, 19px)",
  fontWeight: 400,
  color: "var(--color-text)",
  lineHeight: 1.2,
}

const linkStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  fontFamily: "var(--font-ui)",
  fontSize: "clamp(10px, 0.78vw, 12px)",
  fontWeight: 500,
  letterSpacing: "0.05em",
  color: "var(--color-text)",
  textDecoration: "none",
  padding: "5px 10px",
  border: "1px solid rgba(0,0,0,0.18)",
  background: "rgba(255,255,255,0.7)",
  transition: "background 0.15s ease, border-color 0.15s ease",
}

export default function ProsjekterGrid({ prosjGap, prosjActive, prosjSpredt, vw, frameInset }) {
  const [sceneOpen, setSceneOpen] = useState(false)
  const [flipped, setFlipped] = useState(prosjekter.map(() => false))

  useEffect(() => {
    if (!prosjSpredt) setFlipped(prosjekter.map(() => false))
  }, [prosjSpredt])

  const toggleFlip = (i) => {
    if (!prosjSpredt) return
    setFlipped(f => f.map((v, j) => j === i ? !v : v))
  }

  const gap       = prosjGap
  const cols      = vw < 1050 ? 2 : 3
  const MAX_CARD  = cols === 3 ? 262 : 220
  const gridMaxW  = cols * MAX_CARD + (cols - 1) * gap
  const contW     = Math.min(vw - 2 * (frameInset + 1) - gap * 2, gridMaxW)
  const cardW     = (contW - (cols - 1) * gap) / cols
  const cardH     = cardW * (4 / 5)

  const numCards  = 1 + prosjekter.length
  const totalRows = Math.ceil(numCards / cols)
  const cx        = (cols - 1) / 2
  const cy        = (totalRows - 1) / 2

  const pileOffset = (i) => ({
    x:      -(i % cols             - cx) * (cardW + gap),
    y:      -(Math.floor(i / cols) - cy) * (cardH + gap),
    rotate: HAUG_ROT[i % HAUG_ROT.length],
  })

  return (
    <motion.div
      variants={containerVariants}
      initial="haug"
      animate={prosjSpredt ? "spredt" : "haug"}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap,
        width: `calc(100% - ${gap * 2}px)`,
        maxWidth: gridMaxW,
        boxSizing: "border-box",
        alignItems: "start",
      }}
    >
      <PortfolioEasterEgg
        kortVariants={kortVariants}
        pileOffset={pileOffset(0)}
        kortStyle={kortStyle}
        kortHover={kortHover}
        bildeBoks={bildeBoks}
        bildeStyle={bildeStyle}
        tekstStyle={tekstStyle}
        prosjSpredt={prosjSpredt}
        onOpenChange={setSceneOpen}
      />

      {prosjekter.map((p, i) => (
        <motion.div
          key={p.id}
          custom={pileOffset(i + 1)}
          variants={kortVariants}
          className="pcrd pcrd-foto"
          style={{
            ...kortStyle,
            padding: 0,
            display: 'block',
            pointerEvents: prosjSpredt ? 'auto' : 'none',
            opacity: sceneOpen ? 0.12 : 1,
            filter: sceneOpen ? 'blur(2px)' : 'none',
            transition: 'opacity 0.4s ease, filter 0.4s ease',
            cursor: prosjSpredt ? 'pointer' : 'default',
            perspective: '900px',
          }}
          onClick={() => toggleFlip(i)}
          whileHover={prosjSpredt && !flipped[i] ? kortHover : undefined}
        >
          {/* Flip-container */}
          <div style={{
            position: 'relative',
            width: '100%',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.55s cubic-bezier(0.45,0,0.55,1)',
            transform: flipped[i] ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}>

            {/* Forside */}
            <div style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              padding: '18px 16px 36px',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <div className="foto-bilde-boks" style={bildeBoks}>
                {p.bilde && <img src={p.bilde} alt={p.tittel} style={bildeStyle} />}
              </div>
              <div style={tekstStyle}>{p.tittel}</div>
            </div>

            {/* Bakside */}
            <div style={{
              position: 'absolute',
              inset: 0,
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              background: 'var(--color-bg)',
              padding: '12px',
              display: 'flex',
              pointerEvents: flipped[i] ? 'auto' : 'none',
            }}>
              <div style={{
                flex: 1,
                border: '1px solid rgba(0,0,0,0.13)',
                display: 'flex',
                flexDirection: 'column',
                padding: 'clamp(10px, 1.1vw, 16px)',
                gap: 'clamp(5px, 0.5vw, 8px)',
                overflow: 'hidden',
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-hand)',
                  fontWeight: 400,
                  fontSize: 'clamp(16px, 1.2vw, 20px)',
                  color: 'var(--color-text)',
                  margin: 0,
                  lineHeight: 1.15,
                  flexShrink: 0,
                }}>
                  {p.tittel}
                </h3>

                <p style={{
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 300,
                  fontSize: 'clamp(10px, 0.78vw, 12px)',
                  color: 'var(--color-text-mid)',
                  margin: 0,
                  lineHeight: 1.5,
                  flex: 1,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  fontStyle: 'italic',
                  whiteSpace: 'pre-line',
                }}>
                  {p.beskrivelse}
                </p>

                <div style={{
                  display: 'flex',
                  gap: 6,
                  flexShrink: 0,
                  flexWrap: 'wrap',
                }}>
                  <a
                    href={p.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={linkStyle}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,1)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.32)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.18)' }}
                  >
                    ↗ Live demo
                  </a>
                  <a
                    href={p.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={linkStyle}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,1)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.32)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.18)' }}
                  >
                    {'</>'}  Kode
                  </a>
                </div>

                <motion.span
                  initial="rest"
                  whileHover="hover"
                  onClick={e => { e.stopPropagation(); toggleFlip(i) }}
                  style={{
                    alignSelf: 'flex-start',
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontFamily: 'var(--font-ui)',
                    fontSize: 'clamp(9px, 0.7vw, 11px)',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                  }}
                  variants={{
                    rest:  { color: 'var(--color-text-muted)' },
                    hover: { color: 'var(--color-text)' },
                  }}
                >
                  <motion.span
                    variants={{ rest: { x: 0 }, hover: { x: -4 } }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >←</motion.span>
                  <span>tilbake</span>
                </motion.span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
