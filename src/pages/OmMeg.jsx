import { useState } from 'react'
import { BASE } from '../utils/assetUrl'
import { motion, useMotionValueEvent } from 'framer-motion'
import drawingBlue from '../../assets/bilder/om_meg_bilder/blue_me_cutout.jpg'

export default function OmMegSeksjon({ isMobile, isTablet, newOmOp, frameInset, cardRef }) {
  const [drawn, setDrawn] = useState(false)
  useMotionValueEvent(newOmOp, "change", (v) => {
    if (v > 0.5) setDrawn(true)
    else setDrawn(false)
  })

  return (
    <motion.div
      style={{
        position: "absolute",
        top: frameInset + 1,
        bottom: frameInset + 1,
        left: frameInset + 1,
        right: frameInset + 1,
        opacity: newOmOp,
        zIndex: 3,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div
        ref={cardRef}
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          position: "relative",
          maxWidth: "clamp(500px, 72vw, 860px)",
          borderRadius: 0,
          overflow: "hidden",
          boxShadow: "var(--shadow-card)",
          marginLeft: isMobile ? 16 : isTablet ? 24 : 0,
          marginRight: isMobile ? 16 : isTablet ? 24 : 0,
        }}
      >
        {/* Bilde-halvdel */}
        <div style={{ flex: "0 0 50%" }}>
          <img
            src={drawingBlue}
            alt="Åshild Færøy"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </div>

        {/* Tekst-halvdel — absolutt posisjonert så bildets høyde bestemmer kortets høyde */}
        <div
          style={{
            ...(isMobile
              ? { flex: "0 0 auto" }
              : {
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "50%",
                  height: "100%",
                }),
            display: "flex",
            flexDirection: "column",
            padding: "clamp(32px, 4vw, 48px)",
            justifyContent: "flex-start",
            paddingTop: "clamp(10px, 2vw, 30px)",
            paddingBottom: "clamp(10px, 2vw, 30px)",
            gap: "clamp(10px, 1vw, 18px)",
            overflow: "hidden",
            backgroundImage: `url(${BASE}watercolor-paper-texture.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-hand)",
              fontWeight: 200,
              fontSize: "clamp(22px, 2.4vw, 30px)",
              color: "var(--color-text)",
              margin: 0,
              lineHeight: 1.05,
              letterSpacing: "0.01em",
            }}
          >
            Åshild Færøy
          </h2>

          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "clamp(12.5px, 0.85vw, 14px)",
              lineHeight: 1.4,
              color: "var(--color-text)",
              margin: 0,
              letterSpacing: "0.01em",
            }}
          >
            Jeg er en frontend-student fra Bergen med flere idéer enn timer i
            døgnet. Det beste jeg vet er når en løs tanke endelig våkner til liv
            og begynner å leve på skjermen.
          </p>

          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "clamp(12.5px, 0.85vw, 14px)",
              lineHeight: 1.4,
              color: "var(--color-text)",
              margin: 0,
            }}
          >
            Jeg elsker å skape ting som ikke bare fungerer, men som også gir deg
            en liten opplevelse, noe du kan smile av eller bare nyte. 
          </p>

          <p
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "clamp(12.5px, 0.85vw, 14px)",
              lineHeight: 1.4,
              color: "var(--color-text)",
              margin: 0,
            }}
          >
            Jeg jakter
            på den følelsen der alt bare 'klikker' på plass:
          </p>

          <div
            style={{
              position: "relative",
              marginTop: "clamp(12px, 1.5vw, 24px)",
              width: "fit-content",
            }}
          >
            <svg
              viewBox="0 0 400 60"
              preserveAspectRatio="none"
              style={{
                position: "absolute",
                top: "5%",
                left: "-3%",
                width: "106%",
                height: "90%",
                display: "block",
                overflow: "visible",
                pointerEvents: "none",
                zIndex: 0,
                transform: "skewX(-20deg) rotate(-0.5deg)",
              }}
            >
              <motion.path
                d="M 0,45 C 20,38 55,8 80,5 C 75,5 45,60 38,65 C 55,65 155,-6 205,-4 C 198,-4 165,64 155,68 C 168,68 315,14 400,10"
                fill="none"
                stroke="rgba(160, 215, 240, 0.45)"
                strokeWidth="34"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: drawn ? 1 : 0, opacity: drawn ? 1 : 0 }}
                transition={{ duration: 4.5, ease: "easeInOut", delay: 0.6 }}
                style={{ mixBlendMode: "multiply", filter: "blur(0.5px)" }}
              />
            </svg>
            <motion.p
              initial={{ opacity: 0.55 }}
              animate={{ opacity: drawn ? 1 : 0.55 }}
              transition={{ duration: 1.4, ease: "easeInOut", delay: 0.5 }}
              style={{
                fontFamily: "var(--font-hand)",
                fontSize: "clamp(20px, 2vw, 24px)",
                fontWeight: 200,
                color: "var(--color-text)",
                margin: 0,
                position: "relative",
                zIndex: 1,
              }}
            >
              "Det øyeblikket der noe er så rett og så smooth at
              det gir deg et lite grøss."
            </motion.p>
          </div>

          {/* Pil ned + smilefjes — blå kulepenn */}
          <div
            style={{
              position: "absolute",
              bottom: 10,
              right: 14,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {/* Bouncing arrow */}
            <motion.svg
              viewBox="0 0 16 22"
              width="14"
              height="20"
              style={{ display: "block", overflow: "visible" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: drawn ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 5.2 }}
            >
              <motion.g
                animate={drawn ? { y: [0, 5, 0] } : { y: 0 }}
                transition={{
                  duration: 1.4,
                  repeat: drawn ? Infinity : 0,
                  ease: "easeInOut",
                }}
              >
                <path
                  d="M 8,1 L 8,15 M 3,10 L 8,16 L 13,10"
                  fill="none"
                  stroke="rgba(55,90,160,0.7)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.g>
            </motion.svg>

            {/* Smilefjes */}
            <svg
              viewBox="0 0 20 17"
              width="22"
              height="19"
              style={{ display: "block" }}
            >
              <motion.circle
                cx={6}
                cy={5.5}
                fill="rgba(55, 90, 160, 0.6)"
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: drawn ? 1.4 : 0, opacity: drawn ? 1 : 0 }}
                transition={{ duration: 0.1, delay: 5.6 }}
              />
              <motion.circle
                cx={14}
                cy={5.8}
                fill="rgba(55, 90, 160, 0.6)"
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: drawn ? 1.2 : 0, opacity: drawn ? 1 : 0 }}
                transition={{ duration: 0.1, delay: 5.75 }}
              />
              <motion.path
                d="M 5,11 C 6,16 15,15.5 16,11"
                fill="none"
                stroke="rgba(55, 90, 160, 0.6)"
                strokeWidth="1.1"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: drawn ? 1 : 0 }}
                transition={{ duration: 0.65, ease: "easeInOut", delay: 5.9 }}
              />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
