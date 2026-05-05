import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { BASE } from '../utils/assetUrl'
import { useMotionValue, useMotionValueEvent, motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { W, H } from '../constants'
import Home              from '../pages/Home'
import OmMegSeksjon      from '../pages/OmMeg'
import { KOLONNER } from '../pages/Ferdigheter'
import { FrontendImprint, ApiImprint, DesignImprint, CoinImprint } from './CardImprints'
import ProsjekterGrid    from '../pages/Prosjekter'
import { KontaktInnhold } from '../pages/Kontakt'
import umbrellaImg  from '../../assets/svg/blue_umbrella.svg'
import { RainBackdrop, RimDrips } from './Regn'
import drawingBlue  from '../../assets/bilder/om_meg_bilder/blue_me_cutout.jpg'

export default function IntroAnimasjon({ sectionRef, omMegRef, ferdigRef, prosjRef, kontaktRef }) {
  const { scrollY } = useScroll()
  const [win, setWin] = useState({ w: window.innerWidth, h: window.innerHeight })
  useEffect(() => {
    const onResize = () => setWin({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // JS scroll snap: snapper til nærmeste seksjon i scroll-retningen
  useEffect(() => {
    const vh = window.innerHeight
    const points = [0, 1.00 * vh, 2.58 * vh, 3.35 * vh, 4.85 * vh]
    let lastY = window.scrollY
    let timer = null
    let isSnapping = false

    const onScroll = () => {
      if (isSnapping) return
      const currentY = window.scrollY
      const direction = currentY > lastY ? 1 : -1
      lastY = currentY

      clearTimeout(timer)
      timer = setTimeout(() => {
        const y = window.scrollY
        // Finn segmentet [before, after] brukeren befinner seg i
        const before   = [...points].reverse().find(p => p <= y) ?? points[0]
        const after    = points.find(p => p > y) ?? points[points.length - 1]
        const gap      = after - before
        const progress = gap > 0 ? (y - before) / gap : 0
        // Snap fremover hvis > 25 % inn i segmentet, bakover hvis < 25 %
        const target = direction > 0
          ? (progress > 0.25 ? after  : before)
          : (progress < 0.75 ? before : after)

        if (Math.abs(target - y) > 5) {
          isSnapping = true
          window.scrollTo({ top: target, behavior: 'smooth' })
          setTimeout(() => { isSnapping = false }, 800)
        }
      }, 100)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); clearTimeout(timer) }
  }, [])
  const vw = win.w
  const vh = win.h
  const isMobile   = vw < 600
  const isTablet   = !isMobile && vw < 1050
  // Continuous frameInset: 36px at 375vw → 100px at 1440vw
  const frameInset = Math.round(Math.max(36, Math.min(100, 36 + (vw - 375) * 64 / 1065)))

  // ─── Scroll-indikator ────────────────────────────────────────────────────────
  const scrollHintOp = useTransform(scrollY, [0, 0.12 * vh], [1, 0])

  // ─── P-animasjon (hjem-logo) ─────────────────────────────────────────────────
  const pWidth      = Math.min(vh * W / H, vw)
  const scaleToFill = vw / pWidth
  const pScale      = useTransform(scrollY, [0, 0.30 * vh], [1, scaleToFill])
  const pOpacityRaw = useTransform(scrollY, [0.12 * vh, 0.38 * vh], [1, 0])
  const pOpacity    = useSpring(pOpacityRaw, { stiffness: 55, damping: 18 })
  // bergen.jpg: litt lysnet — fader inn med P-en, forsvinner ved slutten
  const bergenOp = useTransform(scrollY,
    [0.12*vh, 0.35*vh, 5.60*vh, 5.85*vh],
    [0,       0.82,    0.82,    0])

  // ───  Om Meg-seksjon (fader ut akkurat når bitene dukker opp) ────────────
  const newOmOp = useTransform(scrollY,
    [0.45*vh, 0.62*vh, 1.38*vh, 1.44*vh], [0, 1, 1, 0])

  const CARD_GAP  = 16
  // cardW = halvparten av Om Meg-kortets bredde → 4 biter tiler perfekt uten gap
  const omCardW   = Math.round(Math.min(860, Math.max(500, vw * 0.72)))
  const frameInsetLocal = Math.round(Math.max(36, Math.min(100, 36 + (vw - 375) * 64 / 1065)))
  const maxCardW  = Math.floor((vw - 2 * frameInsetLocal - 1 - CARD_GAP) / 2)
  const cardW     = (isMobile || isTablet) ? Math.min(Math.round(omCardW / 2), maxCardW) : Math.round(omCardW / 2)
  // Image natural size: 1258×1380. Image renders at cardW wide, so card height = cardW*(1380/1258).
  // Each quadrant = half the card height → cardH = cardW * 1380 / (2 * 1258)
  const cardH     = Math.round(cardW * 1380 / (2 * 1258))

  // ─── Om Meg → Ferdigheter quadrant-split ─────────────────────────────────────
  // Raskere spring på mobil: snap-animasjon hopper fra Om Meg direkte til ferdigheter,
  // og spring på 55/20 tar ~1.5s å slå seg til ro. 220/26 tar ~0.5s.
  const splitSpring = useSpring(
    useTransform(scrollY, [1.44*vh, 2.02*vh], [1, 0]),
    isMobile ? { stiffness: 220, damping: 26 } : { stiffness: 55, damping: 20 }
  )

  // Mål Om Meg-kortet for å beregne kvadrant-startposisjoner
  const omMegCardRef = useRef(null)
  const omRectRef    = useRef({ left: 0, top: 0, width: 600, height: 400 })
  useLayoutEffect(() => {
    if (!omMegCardRef.current) return
    const r = omMegCardRef.current.getBoundingClientRect()
    omRectRef.current = { left: r.left, top: r.top, width: r.width, height: r.height }
  }, [vw, vh])

  // Grid-posisjoner
  const gridW    = 2 * cardW + CARD_GAP
  const gridH    = 2 * cardH + CARD_GAP
  const gridLeft = Math.round(frameInset + 1 + (vw - 2*(frameInset+1) - gridW) / 2)
  const gridTop  = Math.round(frameInset + 1 + (vh - 2*(frameInset+1) - gridH) / 2)

  // Pile-konvergens: alle kort samles til samme punkt (gridLeft+hx, gridTop+hy)
  const hx = cardW / 2 + CARD_GAP / 2
  const hy = cardH / 2 + CARD_GAP / 2

  const prosjGap = Math.round(Math.max(12, Math.min(20, vw * 0.015)))

  // Mobile: 1-kolonne, samme bredde og sidemarger som prosjekter-kortene
  const prosjContW_mobile = Math.min(vw - 2 * (frameInset + 1) - prosjGap * 2, 2 * 220 + prosjGap)
  const mobileCardW = isMobile ? prosjContW_mobile : cardW
  const mobileCardH = isMobile ? Math.round((prosjContW_mobile - prosjGap) / 2 * 4 / 5) : cardH
  const mobileGridH = isMobile ? 4 * mobileCardH + 3 * CARD_GAP : gridH
  const mobileGridL = isMobile ? frameInset + 1 + prosjGap : gridLeft
  const mobileGridT = isMobile ? Math.round(frameInset + 1 + (vh - 2 * (frameInset + 1) - mobileGridH) / 2) : gridTop
  // Aliaser: GL/GT/CW/CH/Hx/Hy — riktige verdier for både mobil og desktop
  const GL = isMobile ? mobileGridL : gridLeft
  const GT = isMobile ? mobileGridT : gridTop
  const CW = isMobile ? mobileCardW : cardW
  const CH = isMobile ? mobileCardH : cardH
  const Hx = hx
  const Hy = hy

  // ─── Prosjekter-fase ──────────────────────────────────────────────────────────
  const [prosjActive,      setProsjActive]      = useState(false)
  const [prosjSpredt,      setProsjSpredt]      = useState(false)
  const [kontaktActive,    setKontaktActive]    = useState(false)
  const [ferdigHoverActive,setFerdigHoverActive]= useState(false)
  const [flipped,          setFlipped]          = useState([false, false, false, false])
  const [hoveredCard,      setHoveredCard]      = useState(null)
  useMotionValueEvent(scrollY, 'change', v => {
    setProsjActive(v > vh * 3.0)
    setProsjSpredt(v > vh * 3.15)
    setKontaktActive(v > vh * 4.5)
    setFerdigHoverActive(v > vh * 2.1 && v < vh * 2.78)
    if (v < vh * 1.44 || v > vh * 3.08) {
      setFlipped([false, false, false, false])
    }
  })

  // Prosjekter: fade inn, hold, fade ut bak regnet (INGEN push-up)
  const prosjOp    = useTransform(scrollY, [3.05*vh, 3.28*vh], [0, 1])
  const prosjPushY = useMotionValue(0)

  // Ferdigheter-kort samler seg til haug rett før prosjekter-fasen
  const ferdigPile = useSpring(
    useTransform(scrollY, [2.70*vh, 2.88*vh], [0, 1]),
    { stiffness: 55, damping: 20 }
  )

  // ─── Unified kort-posisjoner (ett sett absolutt-posisjonerte kort, ingen handoff) ─
  // Formel: lerp(gridPos + pileOffset*fp, omMegQuadrant, splitSpring)
  // → split=1: Om Meg-kvadrant, split=0 pile=0: grid, split=0 pile=1: sentrum-haug
  const lerp = (a, b, t) => a + (b - a) * t

  // s=1: Om Meg-opprinnelse, s=0: grid-posisjon, fp=1: haug-sentrum
  // Mobil: 1-kolonne nedover, Om Meg deles i 4 horisontale strimler
  // Desktop: 2×2 grid, Om Meg deles i 4 kvadranter
  const p0L = useTransform([splitSpring, ferdigPile], ([s, fp]) =>
    isMobile
      ? lerp(GL, omRectRef.current.left, s)
      : lerp(GL + Hx * fp, omRectRef.current.left, s))
  const p0T = useTransform([splitSpring, ferdigPile], ([s, fp]) =>
    isMobile
      ? lerp(GT + 1.5 * (CH + CARD_GAP) * fp, omRectRef.current.top, s)
      : lerp(GT + Hy * fp, omRectRef.current.top, s))
  const p1L = useTransform([splitSpring, ferdigPile], ([s, fp]) =>
    isMobile
      ? lerp(GL, omRectRef.current.left, s)
      : lerp(GL + CW + CARD_GAP - Hx * fp, omRectRef.current.left + omRectRef.current.width * 0.5, s))
  const p1T = useTransform([splitSpring, ferdigPile], ([s, fp]) =>
    isMobile
      ? lerp(GT + (1 + 0.5 * fp) * (CH + CARD_GAP), omRectRef.current.top + omRectRef.current.height * 0.25, s)
      : lerp(GT + Hy * fp, omRectRef.current.top, s))
  const p2L = useTransform([splitSpring, ferdigPile], ([s, fp]) =>
    isMobile
      ? lerp(GL, omRectRef.current.left, s)
      : lerp(GL + Hx * fp, omRectRef.current.left, s))
  const p2T = useTransform([splitSpring, ferdigPile], ([s, fp]) =>
    isMobile
      ? lerp(GT + (2 - 0.5 * fp) * (CH + CARD_GAP), omRectRef.current.top + omRectRef.current.height * 0.5, s)
      : lerp(GT + CH + CARD_GAP - Hy * fp, omRectRef.current.top + omRectRef.current.height * 0.5, s))
  const p3L = useTransform([splitSpring, ferdigPile], ([s, fp]) =>
    isMobile
      ? lerp(GL, omRectRef.current.left, s)
      : lerp(GL + CW + CARD_GAP - Hx * fp, omRectRef.current.left + omRectRef.current.width * 0.5, s))
  const p3T = useTransform([splitSpring, ferdigPile], ([s, fp]) =>
    isMobile
      ? lerp(GT + (3 - 1.5 * fp) * (CH + CARD_GAP), omRectRef.current.top + omRectRef.current.height * 0.75, s)
      : lerp(GT + CH + CARD_GAP - Hy * fp, omRectRef.current.top + omRectRef.current.height * 0.5, s))

  // Størrelse: mobil → full bredde × 25 % høyde (strimel), desktop → halvpart × halvpart
  const cardWMV = useTransform(splitSpring, v => lerp(CW, omRectRef.current.width  * (isMobile ? 1   : 0.5), v))
  const cardHMV = useTransform(splitSpring, v => lerp(CH, omRectRef.current.height * (isMobile ? 0.25 : 0.5), v))

  // Crossfade: splitSpring=1 → Om Meg-lag synlig, =0 → kortinnhold synlig
  const invertedSplit = useTransform(splitSpring, v => 1 - v)

  const rot0 = useTransform(ferdigPile, [0, 1], [0, -7])
  const rot1 = useTransform(ferdigPile, [0, 1], [0,  5])
  const rot2 = useTransform(ferdigPile, [0, 1], [0, -3])
  const rot3 = useTransform(ferdigPile, [0, 1], [0,  8])

  // Fader inn med Om Meg-overgangen, holder seg til pile-fasen er ferdig
  const cardOp = useTransform(scrollY,
    [1.38*vh, 1.44*vh, 2.88*vh, 3.08*vh], [0, 1, 1, 0])

  // ─── Paraply-overgang (prosjekter → kontakt) ─────────────────────────────────
  // SVG viewBox: 18196 × 14829 (aspect ≈ 1.227)
  // Canopy spike at y = 1851 (12.48 % from top)
  // Handle start at y = 7787 (52.52 % from top)


  // ─── Paraply: toppen lander akkurat innenfor rammen, hele paraplyen synlig ─────
  //   umbrellaScale : bredde som andel av vw
  const HANDLE_FRAC    = 7787 / 14829
  const CANOPY_FRAC    = 1851 / 14829

  const ASPECT_H = (14829 / 18196) * 0.48  // paraplyhøyde som andel av bredde

  // Kontinuerlig skala: tar alltid den største av vw-basert og vh-basert formel
  // → skalerer sømløst uten hopp ved breakpoints
  const umbrellaScale = Math.min(2.20, Math.max(0.80,
    Math.max(
      0.80 + (vw - 375) * 0.20 / 675,          // vw-drevet (desktop)
      (vh * 0.70) / (vw * ASPECT_H)             // vh-drevet (høye/smale skjermer)
    )
  ))
  const umbrellaW = Math.round(vw * umbrellaScale)
  const umbrellaH = Math.round(umbrellaW * ASPECT_H)

  const showUmbrella     = !isMobile && (vw - 2 * frameInset) > 380
  // FinalY: pinner kontaktinnhold på ~44 % av vh når paraply vises.
  // Når paraply ikke vises, settes Y til -vh så prosjektmasken skjuler alt.
  const umbrellaFinalY = showUmbrella
    ? Math.round(vh * 0.44 - umbrellaH * HANDLE_FRAC - 24)
    : -vh
  const umbrellaLeft     = Math.round(vw / 2 - umbrellaW / 2)
  const kontaktPadTop    = showUmbrella
    ? Math.round(umbrellaFinalY + umbrellaH * HANDLE_FRAC) + 24
    : 0

  // Horisontale prosent-grenser for regn-filtrering (d.x er 0–100 %)
// Paraplyen stiger OPP etter at regnet har dekket prosjektene
  const umbrellaYRaw     = useTransform(scrollY, [3.90*vh, 4.45*vh], [vh * 1.05, umbrellaFinalY])
  const umbrellaY        = useSpring(umbrellaYRaw, { stiffness: 40, damping: 22 })
  const prosjMask = useTransform(umbrellaY, y => {
    const canopyY = y + CANOPY_FRAC * umbrellaH   // faktisk spissposisjon
    const clipPx  = Math.max(0, vh - frameInset - 1 - canopyY)
    const fade    = 50
    return `linear-gradient(to bottom, black calc(100% - ${clipPx + fade}px), transparent calc(100% - ${clipPx}px))`
  })
  const umbrellaEntryScaleRaw = useTransform(scrollY, [3.90*vh, 4.45*vh], [0.86, 1])
  const umbrellaEntryScale    = useSpring(umbrellaEntryScaleRaw, { stiffness: 40, damping: 22 })
  const umbrellaImgOp    = useTransform(scrollY, [3.88*vh, 3.94*vh], [0, 1])
  const kontaktInnholdOp = useTransform(scrollY, [4.50*vh, 4.70*vh], [0, 1])
  
 
  

 
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ height: "600vh", position: "relative" }}>
      {/* Scroll-ankere for nav + snap-punkter */}
      <div style={{ position: "absolute", top: 0, scrollSnapAlign: "start" }} />
      <div
        ref={omMegRef}
        data-id="om-meg"
        style={{ position: "absolute", top: "100vh", scrollSnapAlign: "start" }}
      />
      <div
        ref={ferdigRef}
        data-id="ferdigheter"
        style={{ position: "absolute", top: "258vh", scrollSnapAlign: "start" }}
      />
      <div
        ref={prosjRef}
        data-id="prosjekter"
        style={{ position: "absolute", top: "335vh", scrollSnapAlign: "start" }}
      />
      <div
        ref={kontaktRef}
        data-id="kontakt"
        style={{ position: "absolute", top: "460vh", scrollSnapAlign: "start" }}
      />
      <div
        ref={sectionRef}
        data-id="hjem"
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        {/* bergen.jpg – lysnet, fader inn og holder seg */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${BASE}bergen.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: bergenOp,
            filter: "brightness(1.1) saturate(0.75) contrast(0.9)",
            zIndex: 1,
          }}
        />

        {/* Overlay */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(rgba(255,255,255,0.3), rgba(255,255,255,0.2))", // 🔥 juster denne
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        {/* P-animasjon */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            scale: pScale,
            opacity: pOpacity,
            zIndex: 2,
          }}
        >
          <Home />
        </motion.div>

        {/* ─── Ny Om Meg-seksjon ───────────────────────────────────────────────── */}
        <OmMegSeksjon
          isMobile={isMobile}
          isTablet={isTablet}
          newOmOp={newOmOp}
          frameInset={frameInset}
          cardRef={omMegCardRef}
        />

        {/* ─── Unified kort: Om Meg-lag + flip-animasjon foran/bak ───────────────── */}
        {(() => {
          const KORT_FRONT = [
            {
              tittel: "Frontend",
              innhold: "HTML, CSS, JavaScript, React",
              forklaring: "Fokus på løsninger som fungerer godt og ser bra ut.",
            },
            {
              tittel: "API & data",
              innhold: "Fetch, async/await",
              forklaring:
                "Henter, viser og visualiserer data på en enkel måte.",
            },
            {
              tittel: "Design",
              innhold: "Figma, UI/UX",
              forklaring: "Skisser og prototyper i Figma før implementering.",
            },
            {
              tittel: "Interaktivitet",
              innhold: "Event handling, dynamisk UI",
              forklaring: "Liker å skape små ting som får siden til å leve.",
            },
          ];
          const cards = [
            {
              L: p0L, T: p0T, rot: rot0, kol: KOLONNER[0],
              backBg: `url(${BASE}bg_topleft.jpg)`,
              husBg: false,
              omBg: `url(${drawingBlue})`, omPos: "left top",
              overlay: "#ffffff", overlayOpacity: 0.20, lightText: false,
            },
            {
              L: p1L, T: p1T, rot: rot1, kol: KOLONNER[2],
              backBg: `url(${BASE}bg_topright.jpg)`,
              husBg: false,
              omBg: `url(${BASE}watercolor-paper-texture.jpg)`, omPos: "right top",
              overlay: "#D0D8E3", overlayOpacity: 0.20, lightText: false,
            },
            {
              L: p2L, T: p2T, rot: rot2, kol: KOLONNER[3],
              backBg: `url(${BASE}bg_bottom_left.jpg)`,
              husBg: false,
              omBg: `url(${drawingBlue})`, omPos: "left bottom",
              overlay: "#D2E2E1", overlayOpacity: 0.20, lightText: false,
            },
            {
              L: p3L, T: p3T, rot: rot3, kol: KOLONNER[1],
              backBg: `url(${BASE}bg_bottom_right.jpg)`,
              husBg: false,
              omBg: `url(${BASE}watercolor-paper-texture.jpg)`, omPos: "right bottom",
              overlay: "#162E42", overlayOpacity: 0.30, lightText: true,
            },
          ];
          const pad = "clamp(18px,2.4vw,30px)";
          return cards.map(
            ({ L, T, rot, kol, backBg, omBg, omPos, overlay, overlayOpacity, lightText }, i) => (
              <motion.div
                key={i}
                onClick={() =>
                  ferdigHoverActive &&
                  setFlipped((f) => f.map((v, j) => (j === i ? !v : v)))
                }
                onMouseEnter={() => ferdigHoverActive && setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  position: "absolute",
                  left: L,
                  top: T,
                  width: cardWMV,
                  height: cardHMV,
                  zIndex: 4,
                  opacity: cardOp,
                  rotate: rot,
                  perspective: "900px",
                  boxShadow: "var(--shadow-card)",
                  cursor: ferdigHoverActive ? "pointer" : "default",
                  pointerEvents: ferdigHoverActive ? "auto" : "none",
                }}
              >
                {/* Om Meg-lag */}
                <motion.div
                  style={{
                    position: "absolute",
                    inset: 0,
                    overflow: "hidden",
                    backgroundImage: isMobile ? `url(${drawingBlue})` : omBg,
                    backgroundSize: isMobile ? "100% 400%" : "cover",
                    backgroundPosition: isMobile ? `center ${(i / 3) * 100}%` : omPos,
                    opacity: splitSpring,
                  }}
                />

                {/* Flip-container */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    transformStyle: "preserve-3d",
                    transition: "transform 0.55s cubic-bezier(0.45,0,0.55,1)",
                    transform: flipped[i] ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Forside */}
                  <motion.div
                    style={{
                      position: "absolute",
                      inset: 0,
                      overflow: "hidden",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      backgroundColor: overlay,
                      opacity: invertedSplit,
                    }}
                  >
                    {/* Bilde-overlay med lav opacity */}
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage: `url(${BASE}skillsoverlay.jpg)`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      opacity: overlayOpacity,
                      pointerEvents: "none",
                    }} />

                    {/* Ytre marg + indre ramme */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        padding: "var(--space-4)",
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          border: `1px solid ${lightText ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.22)"}`,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          padding: pad,
                          minHeight: 0,
                          overflow: "hidden",
                          position: "relative",
                          color: lightText ? "rgba(255,255,255,0.85)" : "var(--color-text)",
                        }}
                      >
                        {/* Imprint — unikt symbol per kort */}
                        {i === 0 && <FrontendImprint hovered={hoveredCard === 0} />}
                        {i === 1 && <ApiImprint      hovered={hoveredCard === 1} />}
                        {i === 2 && <DesignImprint   hovered={hoveredCard === 2} />}
                        {i === 3 && <CoinImprint     hovered={hoveredCard === 3} />}

                        {/* Øvre gruppe: tittel + underoverskrift + forklaring */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(6px,0.7vw,10px)", overflow: "hidden", minHeight: 0 }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(4px,0.4vw,6px)" }}>
                            <h3
                              style={{
                                fontFamily: "var(--font-hand)",
                                fontWeight: 400,
                                fontSize: "clamp(20px,1.8vw,26px)",
                                color: lightText ? "#ffffff" : "var(--color-text)",
                                margin: 0,
                                lineHeight: 1.2,
                              }}
                            >
                              {KORT_FRONT[i].tittel}
                            </h3>
                            <p
                              style={{
                                fontFamily: "var(--font-ui)",
                                fontSize: "clamp(11px,0.85vw,13px)",
                                fontWeight: 400,
                                color: lightText ? "rgba(255,255,255,0.72)" : "var(--color-text-mid)",
                                letterSpacing: "0.04em",
                                lineHeight: 1.35,
                                margin: 0,
                              }}
                            >
                              {kol.innhold.split(", ").join(" · ")}
                            </p>
                          </div>
                          <p
                            style={{
                              fontFamily: "var(--font-ui)",
                              fontWeight: 300,
                              fontSize: "clamp(13px,0.95vw,15px)",
                              margin: 0,
                              color: lightText ? "rgba(255,255,255,0.65)" : "var(--color-text-mid)",
                              lineHeight: 1.55,
                              fontStyle: "italic",
                            }}
                          >
                            {KORT_FRONT[i].forklaring}
                          </p>
                        </div>

                        {/* "les mer →" — alltid forankret i bunnen */}
                        <motion.span
                          initial="rest"
                          whileHover="hover"
                          onClick={e => {
                            e.stopPropagation()
                            if (ferdigHoverActive)
                              setFlipped(f => f.map((v, j) => j === i ? !v : v))
                          }}
                          style={{
                            alignSelf: "flex-start",
                            flexShrink: 0,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontFamily: "var(--font-ui)",
                            fontSize: "clamp(11px,0.8vw,13px)",
                            letterSpacing: "0.04em",
                            cursor: "pointer",
                            transition: "color 0.2s ease",
                          }}
                          variants={{
                            rest:  { color: lightText ? "rgba(255,255,255,0.6)"  : "var(--color-text-mid)" },
                            hover: { color: lightText ? "rgba(255,255,255,1)"    : "var(--color-text)" },
                          }}
                        >
                          <span>les mer</span>
                          <motion.span
                            variants={{
                              rest: { x: 0 },
                              hover: { x: 5 },
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          >
                            →
                          </motion.span>
                        </motion.span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Bakside */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      overflow: "hidden",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      pointerEvents: flipped[i] ? "auto" : "none",
                      backgroundImage: backBg,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      display: "flex",
                      padding: "var(--space-4)",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        border: "1px solid rgba(0,0,0,0.22)",
                        display: "flex",
                        flexDirection: "column",
                        padding: "clamp(8px,1.2vw,20px)",
                        minHeight: 0,
                        overflow: "hidden",
                        gap: "clamp(3px,0.4vw,7px)",
                      }}
                    >
                      <h3
                        style={{
                          fontFamily: "var(--font-hand)",
                          fontWeight: 400,
                          fontSize: "clamp(19px, 1.15vw, 19px)",
                          color: "var(--color-text)",
                          margin: 0,
                          lineHeight: 1.2,
                          flexShrink: 0,
                        }}
                      >
                        {kol.tittel}
                      </h3>
                      <p
                        style={{
                          fontFamily: "var(--font-ui)",
                          fontWeight: 400,
                          fontSize: "clamp(13px, 0.82vw, 14px)",
                          color: "var(--color-text-mid)",
                          lineHeight: 1.4,
                          margin: 0,
                          flex: 1,
                          overflow: "hidden",
                          minHeight: 0,
                        }}
                      >
                        {kol.forklaring}
                      </p>

                      {/* "← tilbake" — alltid forankret i bunnen */}
                      <motion.span
                        initial="rest"
                        whileHover="hover"
                        onClick={e => {
                          e.stopPropagation()
                          if (ferdigHoverActive)
                            setFlipped(f => f.map((v, j) => j === i ? !v : v))
                        }}
                        style={{
                          alignSelf: "flex-start",
                          flexShrink: 0,
                          marginTop: "clamp(6px,0.6vw,10px)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontFamily: "var(--font-ui)",
                          fontSize: "clamp(10px,0.75vw,12px)",
                          letterSpacing: "0.06em",
                          cursor: "pointer",
                        }}
                        variants={{
                          rest: { color: "var(--color-text-mid)" },
                          hover: { color: "var(--color-text)" },
                        }}
                      >
                        <motion.span
                          variants={{
                            rest: { x: 0 },
                            hover: { x: -5 },
                          }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          ←
                        </motion.span>
                        <span>tilbake</span>
                      </motion.span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ),
          );
        })()}

        {/* Prosjekter-fase: polaroid-grid */}
        <motion.div
          style={{
            position: "absolute",
            top: frameInset + 1,
            bottom: frameInset + 1,
            left: frameInset + 1,
            right: frameInset + 1,
            opacity: prosjOp,
            WebkitMaskImage: prosjMask,
            maskImage: prosjMask,
            y: prosjPushY,
            zIndex: 5,
            pointerEvents: prosjSpredt && !kontaktActive ? "auto" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <ProsjekterGrid
            prosjGap={prosjGap}
            prosjActive={prosjActive}
            prosjSpredt={prosjSpredt}
            vw={vw}
            frameInset={frameInset}
          />
        </motion.div>

        {/* Scroll-indikator */}
        <motion.div
          style={{
            position: "absolute",
            bottom: frameInset + 60,
            right: frameInset + 250,
            zIndex: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            pointerEvents: "none",
            opacity: scrollHintOp,
          }}
        >
          <span
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: "clamp(13px, 1.2vw, 18px)",
              color: "#274B66",
              letterSpacing: "0.08em",
            }}
          >
            skroll
          </span>
          <motion.svg
            viewBox="0 0 16 20"
            width={16}
            height={20}
            fill="none"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <path
              d="M8 2 L8 14 M3 10 L8 15 L13 10"
              stroke="#274B66"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </motion.div>
      </div>{" "}
      {/* /sticky */}
      {/* Regn-bakgrunn — fast, beveger seg ikke med paraplyen */}
      {showUmbrella && <RainBackdrop opacity={umbrellaImgOp} />}

      {/* Paraply — beveger seg med umbrellaY */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: umbrellaH + 100,
          y: umbrellaY,
          scale: umbrellaEntryScale,
          transformOrigin: "center bottom",
          zIndex: 10000,
          pointerEvents: "none",
        }}
      >
        {showUmbrella && (
          <>
            <motion.img
              src={umbrellaImg}
              alt=""
              style={{
                position: "absolute",
                top: 0,
                left: umbrellaLeft,
                width: umbrellaW,
                height: umbrellaH,
                objectFit: "fill",
                display: "block",
                zIndex: 1,
                opacity: umbrellaImgOp,
              }}
            />
            <RimDrips
              umbrellaLeft={umbrellaLeft}
              umbrellaW={umbrellaW}
              umbrellaH={umbrellaH}
              opacity={umbrellaImgOp}
            />
          </>
        )}
      </motion.div>
      {/* Kontaktinnhold — fast posisjon, fader inn separat */}
      <motion.div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          opacity: kontaktInnholdOp,
          pointerEvents: kontaktActive ? "auto" : "none",
          display: "flex",
          alignItems: showUmbrella ? "flex-start" : "center",
          justifyContent: "center",
          paddingTop: showUmbrella ? kontaktPadTop : 0,
        }}
      >
        <KontaktInnhold
          isMobile={isMobile || !showUmbrella}
          frameInset={frameInset}
          vw={vw}
          visible={kontaktActive}
        />
      </motion.div>
    </div>
  );
}
