import { useState } from 'react'
import { motion } from 'framer-motion'
import prosjekter from '../data/prosjekter'
import PortfolioEasterEgg from '../components/PortfolioEasterEgg'

const HAUG_ROT = [-4, 6, -3, 8, -2, 5]

// custom = { x, y, rotate } — each card's pile offset from its natural grid position
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

export default function ProsjekterGrid({ prosjGap, prosjActive, prosjSpredt, vw, frameInset }) {
  const [sceneOpen, setSceneOpen] = useState(false)
  const gap       = prosjGap
  const cols      = vw < 1050 ? 2 : 3
  const MAX_CARD  = cols === 3 ? 262 : 220
  const gridMaxW  = cols * MAX_CARD + (cols - 1) * gap
  const contW     = Math.min(vw - 2 * (frameInset + 1) - gap * 2, gridMaxW)
  const cardW     = (contW - (cols - 1) * gap) / cols
  const cardH     = cardW * (4 / 5)                        // matches bildeBoks 5:4 ratio

  const numCards  = 1 + prosjekter.length
  const totalRows = Math.ceil(numCards / cols)
  const cx        = (cols - 1) / 2
  const cy        = (totalRows - 1) / 2

  // Offset from each card's grid cell to the visual pile center
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
        <motion.a
          key={p.id}
          custom={pileOffset(i + 1)}
          variants={kortVariants}
          href={p.github}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => { if (!prosjSpredt) e.preventDefault() }}
          className="pcrd pcrd-foto"
          style={{
            ...kortStyle,
            pointerEvents: prosjSpredt ? 'auto' : 'none',
            opacity: sceneOpen ? 0.12 : 1,
            filter: sceneOpen ? 'blur(2px)' : 'none',
            transition: 'opacity 0.4s ease, filter 0.4s ease',
          }}
          whileHover={kortHover}
        >
          <div className="foto-bilde-boks" style={bildeBoks}>
            {p.bilde && <img src={p.bilde} alt={p.tittel} style={bildeStyle} />}
          </div>
          <div style={tekstStyle}>{p.tittel}</div>
        </motion.a>
      ))}
    </motion.div>
  )
}
