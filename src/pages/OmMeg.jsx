import { useState, useEffect } from 'react'
import { BASE } from '../utils/assetUrl'
import { motion, useMotionValueEvent } from 'framer-motion'
import drawingBlue from '../../assets/bilder/om_meg_bilder/blue_me_cutout.jpg'
import aashildTak from '../../assets/video/ashild_tak_capcut2.mp4'
import ScratchReveal from '../components/ScratchReveal'

const HINT_TEXT = "skrap her"

// Korte "oppmerksomhets-streker" fordelt symmetrisk rundt hjørnet over
// teksten, Symmetrisk om 270° (rett opp), 200° totalt.
const RAY_ANGLES = [170, 210, 250, 290, 330, 10]
const RAY_STAGGER_S = 0.45
const RAY_DURATION_S = 0.3
const RAYS_TOTAL_MS = ((RAY_ANGLES.length - 1) * RAY_STAGGER_S + RAY_DURATION_S) * 1000

export default function OmMegSeksjon({ isMobile, isTablet, newOmOp, frameInset, cardRef, vw, vh }) {
  const [drawn, setDrawn] = useState(false)
  const [scratchHintVisible, setScratchHintVisible] = useState(true)
  const [hasScratched, setHasScratched] = useState(false)
  const [arrowDrawn, setArrowDrawn] = useState(false)
  const [raysDrawn, setRaysDrawn] = useState(false)
  const [showScratchDemo, setShowScratchDemo] = useState(false)
  useMotionValueEvent(newOmOp, "change", (v) => {
    if (v > 0.5) setDrawn(true)
    else setDrawn(false)
  })

  // Hintet skal ikke dukke opp før seksjonen faktisk er skrolt inn —
  // scroll-animasjonen inn hit tar litt tid, og hvis vi starter ved mount
  // (uavhengig av om noen har sett siden ennå) er hintet nesten ferdig
  // avspilt før brukeren rekker å se det. "Skrap her" står ferdig skrevet
  // med en gang (skriveeffekt virket distraherende) — bare pilen og
  // strålene animeres inn, rett etter at hint-boksen er faded inn.
  useEffect(() => {
    if (!drawn) return
    const timeout = setTimeout(() => setArrowDrawn(true), 500)
    return () => clearTimeout(timeout)
  }, [drawn])

  // Oppmerksomhets-strekene venter en liten stund etter pilen før de
  // begynner å tegnes, så de ikke dukker opp for tett på resten av hintet.
  useEffect(() => {
    if (!arrowDrawn) return
    const timeout = setTimeout(() => setRaysDrawn(true), 3600)
    return () => clearTimeout(timeout)
  }, [arrowDrawn])

  // Skrape-demoen på selve bildet spilles bare av — og først godt etter at
  // ALLE strålene er helt ferdig tegnet — hvis brukeren ikke har begynt å
  // skrape selv innen rimelig tid.
  useEffect(() => {
    if (!raysDrawn || hasScratched) return
    const timeout = setTimeout(() => setShowScratchDemo(true), RAYS_TOTAL_MS + 1800)
    return () => clearTimeout(timeout)
  }, [raysDrawn, hasScratched])

  // Desktop/nettbrett: bildet ligger i venstre HALVDEL av kortet, med
  // høyde = (kortbredde/2) * bilde-aspektforhold (1380/1258). På brede MEN
  // KORTE skjermer (typisk bærbar med skjermskalering) kan dette bli høyere
  // enn selve rammen har plass til. Regn ut bredden i JS (ikke bare CSS
  // clamp) slik at vi kan begrense den av tilgjengelig høyde også.
  const availCardH  = vh - 2 * (frameInset + 1) - 24 // liten margin
  const imgAspect    = 1380 / 1258
  const maxWByHeight = Math.floor((availCardH / imgAspect) * 2)
  const desktopCardW = Math.round(Math.min(860, Math.max(500, vw * 0.72), maxWByHeight))
  // Nettbrett: kortet er smalere enn desktop, så bildets aspekt-styrte høyde
  // (bredde/2 * aspekt) blir for lav til at all teksten får plass — den ble
  // avkuttet/usynlig. Sett en minstehøyde for kortet på nettbrett-bredder,
  // og la bildet beskjæres (object-fit: cover) for å fylle den i stedet for
  // at teksten må presses inn i bildets naturlige høyde. 560 var opprinnelig
  // satt for å bli kvitt scroll ved 768px bredde, men var langt over det
  // teksten faktisk trenger (målt ~360-390px innhold gjennom hele
  // nettbrett-spennet 600-1050px) — det ga et unødig høyt/smalt kort på
  // bredere nettbrett. 440 gir god margin uten overdrevet tomrom.
  const tabletMinCardH = 440
  const desktopImgH    = Math.round((desktopCardW / 2) * imgAspect)
  const desktopCardH   = isTablet ? Math.max(desktopImgH, tabletMinCardH) : desktopImgH

  // Mobil: bildet stables OVER teksten (hele kortbredden, ikke halvparten),
  // så det spiser mye mer av tilgjengelig høyde enn på desktop, og teksten
  // under fikk ikke plass. Å smalne bildets BREDDE for å begrense høyden
  // (slik desktop gjør) virker mot sin hensikt her — det gjør tekstkolonnen
  // smalere også, som bryter teksten over enda flere linjer og gjør den enda
  // høyere. Behold derfor full bredde, men beskjær bildet til en fast,
  // begrenset høyde (~36% av tilgjengelig korthøyde) med object-fit: cover.
  const mobileImgW   = Math.min(Math.round(vw * 0.85), 380)
  const mobileImgCapH = Math.round(availCardH * 0.36)

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
      <div style={{ position: "relative" }}>
        {/* Skrap-hint. Desktop/nettbrett har rom over kortet, som originalt —
            der er bakgrunnen lys, så mørk tekst. Mobil har ikke den plassen
            (bildet fyller nesten hele rammen), så hintet ligger OPPÅ bildets
            hjørne i stedet — der er bakgrunnen blå, så lys tekst i stedet,
            med en svak skygge for lesbarhet mot det travle illustrasjons-
            motivet under. */}
        {scratchHintVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: drawn ? 1 : 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              position: "absolute",
              // Nok innrykk til å ikke havne bak den faste ramme-linja
              // (tegnes i Layout.jsx ved x = frameInset, med høyere
              // z-index enn innholdet her) på smale skjermer.
              top: isMobile ? 10 : -58,
              left: 26,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              pointerEvents: "none",
              zIndex: 4,
            }}
          >
            <div style={{ position: "relative", display: "inline-block" }}>
              <span
                style={{
                  position: "relative",
                  display: "inline-block",
                  fontFamily: "var(--font-hand)",
                  fontSize: "clamp(13px, 1.2vw, 18px)",
                  color: isMobile ? "#fff" : "#274B66",
                  letterSpacing: "0.08em",
                  whiteSpace: "nowrap",
                  // Lys tekst på "drop-shadow" alene var ikke pålitelig nok
                  // lesbar mot det travle bilde-motivet på ekte enheter — en
                  // faktisk bakgrunnsflate garanterer kontrast uavhengig av
                  // hva som ligger bak, i stedet for å stole på filter-
                  // rendring som kan variere mellom nettlesere.
                  ...(isMobile && {
                    background: "rgba(23,45,74,0.68)",
                    borderRadius: 5,
                    padding: "2px 7px",
                  }),
                }}
              >
                {HINT_TEXT}
              </span>
              {raysDrawn && (
                <svg
                  viewBox="0 0 130 130"
                  width="130"
                  height="130"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    overflow: "visible",
                    pointerEvents: "none",
                  }}
                >
                  {RAY_ANGLES.map((deg, i) => {
                    const rad = (deg * Math.PI) / 180
                    const cx = 65, cy = 65
                    const r1 = 46, r2 = 64
                    const x1 = cx + r1 * Math.cos(rad)
                    const y1 = cy + r1 * Math.sin(rad)
                    const x2 = cx + r2 * Math.cos(rad)
                    const y2 = cy + r2 * Math.sin(rad)
                    return (
                      <motion.line
                        key={deg}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={isMobile ? "rgba(255,255,255,0.8)" : "rgba(55,90,160,0.55)"}
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: RAY_DURATION_S, delay: i * RAY_STAGGER_S, ease: "easeOut" }}
                      />
                    )
                  })}
                </svg>
              )}
            </div>
            <motion.svg
              viewBox="0 0 16 22"
              width="14"
              height="20"
              style={{ display: "block", overflow: "visible" }}
              animate={arrowDrawn ? { y: [0, 4, 0] } : { y: 0 }}
              transition={{
                duration: 1.4,
                repeat: arrowDrawn ? Infinity : 0,
                ease: "easeInOut",
              }}
            >
              <path
                d="M 8,1 L 8,15 M 3,10 L 8,16 L 13,10"
                fill="none"
                stroke={isMobile ? "rgba(255,255,255,0.9)" : "rgba(55,90,160,0.7)"}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </motion.div>
        )}

        <div
          ref={cardRef}
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            position: "relative",
            // Mobil: kortet stables i én kolonne, så bildet får HELE denne
            // bredden (ikke halvparten som på desktop) — begrenset av
            // mobileImgW (bredde OG høyde) slik at teksten under fortsatt
            // får plass i rammen.
            width: isMobile ? mobileImgW : desktopCardW,
            height: isMobile ? undefined : desktopCardH,
            borderRadius: 0,
            overflow: "hidden",
            boxShadow: "var(--shadow-card)",
            marginLeft: isMobile ? 16 : isTablet ? 24 : 0,
            marginRight: isMobile ? 16 : isTablet ? 24 : 0,
          }}
        >
          {/* Bilde-halvdel — skrapelodd-effekt avslører ashild_tak_capcut.mp4 under */}
          <div style={{ flex: "0 0 50%", position: "relative", pointerEvents: "auto" }}>
            <ScratchReveal
              topSrc={drawingBlue}
              bottomSrc={aashildTak}
              alt="Åshild Færøy"
              onScratchStart={() => { setScratchHintVisible(false); setHasScratched(true) }}
              triggerHint={showScratchDemo}
              style={{ height: isMobile ? mobileImgCapH : desktopCardH }}
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
            overflowX: "hidden",
            // Sikkerhetsnett: hvis teksten likevel blir høyere enn plassen
            // bildet levner (uansett skjermstørrelse), skal den kunne
            // scrolles i stedet for å bli usynlig avkuttet.
            overflowY: isMobile ? "visible" : "auto",
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
            {/* Bouncing arrow — dukker først opp når brukeren har skrapt */}
            <motion.svg
              viewBox="0 0 16 22"
              width="14"
              height="20"
              style={{ display: "block", overflow: "visible" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: hasScratched ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <motion.g
                animate={hasScratched ? { y: [0, 5, 0] } : { y: 0 }}
                transition={{
                  duration: 1.4,
                  repeat: hasScratched ? Infinity : 0,
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
                animate={{ r: hasScratched ? 1.4 : 0, opacity: hasScratched ? 1 : 0 }}
                transition={{ duration: 0.1, delay: 0.35 }}
              />
              <motion.circle
                cx={14}
                cy={5.8}
                fill="rgba(55, 90, 160, 0.6)"
                initial={{ r: 0, opacity: 0 }}
                animate={{ r: hasScratched ? 1.2 : 0, opacity: hasScratched ? 1 : 0 }}
                transition={{ duration: 0.1, delay: 0.4 }}
              />
              <motion.path
                d="M 5,11 C 6,16 15,15.5 16,11"
                fill="none"
                stroke="rgba(55, 90, 160, 0.6)"
                strokeWidth="1.1"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: hasScratched ? 1 : 0 }}
                transition={{ duration: 0.65, ease: "easeInOut", delay: 0.5 }}
              />
            </svg>
          </div>
        </div>
      </div>
      </div>
    </motion.div>
  );
}
