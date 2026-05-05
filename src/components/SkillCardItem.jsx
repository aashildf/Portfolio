import { motion } from 'framer-motion'
import bgImage from '/paper-texture2.jpg'

export default function SkillCardItem({ data, AnimComp, opacity, y }) {
  return (
    <motion.div style={{
      display: 'flex',
      flexDirection: 'row',
      height: '100%',
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      boxShadow: '0 4px 16px rgba(0,0,0,0.18), 0 12px 36px rgba(0,0,0,0.12)',
      borderRadius: '3px',
      overflow: 'hidden',
      opacity,
      y,
      pointerEvents: 'auto',
    }}>
      {/* Animasjon til venstre */}
      <div style={{
        flex: '0 0 42%',
        position: 'relative',
        overflow: 'hidden',
        borderRight: '1px solid rgba(125,168,178,0.20)',
      }}>
        <AnimComp active={true} />
      </div>

      {/* Tekst til høyre */}
      <div style={{
        flex: 1,
        padding: 'clamp(10px, 1.2vh, 18px) clamp(12px, 1.4vw, 22px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 6,
        overflow: 'hidden',
      }}>
        <h3 style={{
          fontFamily: "'Caveat', cursive",
          fontWeight: 700,
          fontSize: 'clamp(18px, 1.6vw, 26px)',
          color: '#162E42',
          margin: '0 0 4px',
          lineHeight: 1.1,
        }}>
          {data.tittel}
        </h3>
        <p style={{
          fontFamily: "'Caveat', cursive",
          fontSize: 'clamp(14px, 1.1vw, 18px)',
          color: '#4a4a4a',
          margin: 0,
          lineHeight: 1.35,
        }}>
          {data.innhold}
        </p>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 300,
          fontSize: 'clamp(11px, 0.75vw, 13px)',
          color: '#888',
          margin: 0,
          lineHeight: 1.5,
          fontStyle: 'italic',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
        }}>
          {data.forklaring}
        </p>
      </div>
    </motion.div>
  )
}
