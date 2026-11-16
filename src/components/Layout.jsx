import { useState, useEffect, useRef } from 'react'
import { useScroll, useMotionValueEvent, useTransform, AnimatePresence, motion } from 'framer-motion'
import {
  W, H, BUNN, BUNN_W,
  GAP,
  TEXT_PAD, WORD_GAP, CORNER_LEAD, FONT_SIZE,
} from '../constants'
import IntroAnimasjon from './IntroAnimasjon'
import RainGull from './RainGull'
import ConstructionSite from './ConstructionSite'
import { BASE } from '../utils/assetUrl'
import hjemIkon from '../../assets/bilder/prosjektbilder/bergenshus_hjemikon.png'


export default function Layout() {
  const [vp, setVp]         = useState({ w: window.innerWidth, h: window.innerHeight })
  const [tw, setTw]         = useState(null)
  const [active, setActive] = useState('hjem')
  const [menuOpen, setMenuOpen]           = useState(false)
  const [menuByClick, setMenuByClick]     = useState(false)
  const closeTimer                         = useRef(null)
  const [hoveredNav, setHoveredNav]       = useState(null)

  const openHover  = () => { clearTimeout(closeTimer.current); setMenuOpen(true) }
  const leaveHover = () => {
    if (menuByClick) return
    closeTimer.current = setTimeout(() => setMenuOpen(false), 120)
  }
  const enterMenu  = () => { clearTimeout(closeTimer.current) }
  const leaveMenu  = () => { if (!menuByClick) setMenuOpen(false) }
  const clickBurger = () => {
    clearTimeout(closeTimer.current)
    if (menuByClick) { setMenuOpen(false); setMenuByClick(false) }
    else             { setMenuOpen(true);  setMenuByClick(true)  }
  }
  const closeClick = () => { setMenuOpen(false); setMenuByClick(false) }

  // Refs for nav-tekst (breddemåling i SVG)
  const nameRef       = useRef(null)
  const kontaktRef    = useRef(null)
  const ferdigRef     = useRef(null)
  const prosjRef      = useRef(null)
  const sectionLblRef = useRef(null)
  const [sectionLblW, setSectionLblW] = useState(90)

  // Refs for seksjoner (scroll + IntersectionObserver)
  const hjemSec    = useRef(null)
  const omMegSec   = useRef(null)
  const ferdigSec  = useRef(null)
  const prosjSec   = useRef(null)
  const kontaktSec = useRef(null)
  const jumpHomeRef = useRef(null)

  const { scrollY } = useScroll()

  const [showGap, setShowGap] = useState(true)
  useMotionValueEvent(scrollY, 'change', v =>
    setShowGap(prev => { const s = v < 5; return s !== prev ? s : prev })
  )

  const measure = () => {
    if (!nameRef.current) return
    setTw({
      name:       nameRef.current.getBBox().width,
      kontakt:    kontaktRef.current.getBBox().width,
      ferdig:     ferdigRef.current.getBBox().width,
      prosjekter: prosjRef.current.getBBox().width,
    })
  }

  useEffect(() => {
    document.fonts.ready.then(measure)
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Mål seksjonnavn-bredde etter hver seksjonendring (fonten er da lastet)
  useEffect(() => {
    if (sectionLblRef.current) {
      setSectionLblW(sectionLblRef.current.getBBox().width)
    }
  }, [active, tw])

  // Scroll-basert active-tracking (IntersectionObserver er upålitelig for sticky-elementer)
  useMotionValueEvent(scrollY, 'change', v => {
    const vh = window.innerHeight
    if      (v >= vh * 4.0) setActive('kontakt')
    else if (v >= vh * 3.0) setActive('prosjekter')
    else if (v >= vh * 2.5) setActive('ferdigheter')
    else if (v >= vh * 0.5) setActive('omMeg')
    else                    setActive('hjem')
  })

  // ── Easter egg: måka river hull i bunnlinja og faller ned til byggeplassen ──
  const [egg, setEgg] = useState(false)
  const [gullKey, setGullKey] = useState(0)
  const eggArmed = useRef(false)
  const scrollAnim = useRef(null)

  // Egen, rolig scroll (ikke nettleserens smooth) så vi styrer tempoet
  const glideTo = (target, duration) => {
    cancelAnimationFrame(scrollAnim.current)
    const start = window.scrollY, dist = target - start, t0 = performance.now()
    const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
    const step = now => {
      const t = Math.min(1, (now - t0) / duration)
      window.scrollTo({ top: start + dist * ease(t), behavior: 'instant' })
      if (t < 1) scrollAnim.current = requestAnimationFrame(step)
    }
    scrollAnim.current = requestAnimationFrame(step)
  }

  const onGullFall = () => {
    // Snap-logikken (IntroAnimasjon) får et ekstra stoppunkt nederst
    document.documentElement.dataset.sneak = '1'
    setEgg(true)
    setTimeout(() => glideTo(6 * window.innerHeight, 1500), 380)
  }
  const climbBack = () => glideTo(4.85 * window.innerHeight, 1100)

  // Tilbake på Kontakt → lukk byggeplassen og la en ny, våt måke tegne seg
  useMotionValueEvent(scrollY, 'change', v => {
    if (!egg) return
    const vh = window.innerHeight
    if (v > 5.5 * vh) eggArmed.current = true
    if (eggArmed.current && v < 4.95 * vh) {
      eggArmed.current = false
      delete document.documentElement.dataset.sneak
      setEgg(false)
      setGullKey(k => k + 1)
    }
  })
  useEffect(() => () => { delete document.documentElement.dataset.sneak }, [])

  // Rammen henger fast i vinduet — men når vi «faller» forbi bunnen av
  // scenen, skal den bli med opp, som om kameraet følger etter ned
  const frameShift = useTransform(scrollY, v => -Math.max(0, v - 5 * window.innerHeight))

  const scrollToRef = ref => {
    ref.current?.scrollIntoView({ behavior: 'instant' })
    jumpHomeRef.current?.()
  }

  const svgW    = Math.min(vp.h * W / H, vp.w)
  const svgLeft = (vp.w - svgW) / 2
  const scale   = svgW / W
  const bunnL   = svgLeft + BUNN.x * scale - GAP
  const bunnR   = svgLeft + (BUNN.x + BUNN_W) * scale + GAP

  const isMobile   = vp.w < 600
  const isTablet   = !isMobile && vp.w < 1050
  // Continuous frameInset: 18px at 375vw → 100px at 1440vw (samme
  // sluttpunkt som før — kun mobil-enden er senket, ned fra opprinnelig
  // 36px). Ga mer plass å jobbe med i alle seksjoner på smale skjermer —
  // bekreftet at hus-ikon/hamburger-meny fortsatt har komfortabel avstand
  // til kanten ved 18px. På svært lave skjermer (bred-men-kort bærbar) tar
  // rammemarginen for mye av den knappe høyden — trekk den sammen der (se
  // samme resonnement i IntroAnimasjon.jsx).
  const fiByWidth = Math.max(18, Math.min(100, 18 + (vp.w - 375) * 82 / 1065))
  const fi = Math.round(Math.max(18, Math.min(fiByWidth, vp.h * 0.1)))
  const fr = vp.w - fi
  const fb = vp.h - fi
  const fontSize   = isMobile ? 15 : FONT_SIZE
  const cornerLead = isMobile ? 14 : CORNER_LEAD

  const HOUSE_W   = isMobile ? 66 : isTablet ? 96 : 108  // bredde på bergenshus-ikon
  const SEPT_LINE = 26   // bredde til strek + margins i seksjonnavn-overlayeren
  const nameW    = tw ? tw.name       : 105
  const kontaktW = tw ? tw.kontakt    :  62
  const ferdigW  = tw ? tw.ferdig     :  88
  const prosjW   = tw ? tw.prosjekter :  82

  const hjemX    = fi + cornerLead
  const hjemW    = HOUSE_W
  const kontaktX = fr - kontaktW - cornerLead
  const prosjX   = kontaktX - WORD_GAP - prosjW
  const ferdigX  = prosjX   - WORD_GAP - ferdigW
  const nameDisplayW = nameW
  const nameX        = ferdigX  - WORD_GAP - nameDisplayW

  const bunnLc = Math.max(fi, bunnL)
  const bunnRc = Math.min(fr, bunnR)
  // Regnvåt måke på bunnlinja i Kontakt — den eier biten gullX0…fr av linja
  const gullSize = isMobile ? 46 : 70
  const gullCx = Math.round(fr - 37 * gullSize / 70 - (isMobile ? 12 : 44))
  const gullX0 = Math.round(Math.max(fi + 20, gullCx - 2.4 * (fr - gullCx)))
  const showGull = active === 'kontakt'
  const bottomLine = !isMobile && active === 'hjem' && showGap && bunnLc < bunnRc
    ? `M ${fr} ${fb} H ${bunnRc} M ${bunnLc} ${fb} H ${fi}`
    : showGull
      ? `M ${gullX0} ${fb} H ${fi}`
      : `M ${fr} ${fb} H ${fi}`

  // Mobil: dynamisk gap basert på målt seksjonnavn-bredde
  const mobileGapEnd = hjemX + HOUSE_W + TEXT_PAD + SEPT_LINE + sectionLblW + TEXT_PAD

  const mobileTopLineGap = (isMobile || isTablet) && active !== 'hjem'
    ? `M ${fi} ${fi} H ${hjemX - TEXT_PAD} M ${mobileGapEnd} ${fi} H ${fr - 52}`
    : `M ${fi} ${fi} H ${hjemX - TEXT_PAD} M ${hjemX + HOUSE_W + TEXT_PAD} ${fi} H ${fr - 52}`

  const mainFrameLines = (isMobile || isTablet ? [
    `M ${fi} ${fi} V ${fb}`,
    `M ${fr} ${fi} V ${fb}`,
    bottomLine,
    mobileTopLineGap,
  ] : [
    `M ${fi} ${fi} V ${fb}`,
    `M ${fr} ${fi} V ${fb}`,
    bottomLine,
    `M ${fi} ${fi} H ${hjemX - TEXT_PAD}`,
    `M ${hjemX + hjemW + TEXT_PAD} ${fi} H ${nameX - TEXT_PAD}`,
    `M ${nameX + nameDisplayW + TEXT_PAD} ${fi} H ${ferdigX - TEXT_PAD}`,
    `M ${ferdigX + ferdigW + TEXT_PAD} ${fi} H ${prosjX - TEXT_PAD}`,
    `M ${prosjX + prosjW + TEXT_PAD} ${fi} H ${kontaktX - TEXT_PAD}`,
    `M ${kontaktX + kontaktW + TEXT_PAD} ${fi} H ${fr}`,
  ]).join(' ')

  const textProps = {
    dominantBaseline: 'middle',
    fontFamily: "'Caveat', cursive",
    fontSize,
    fill: 'black',
  }
  const navStyle = id => ({
    fontWeight: active === id || hoveredNav === id ? 600 : 400,
    letterSpacing: '1px',
    cursor: 'pointer',
  })
  const navHover = id => ({
    onMouseEnter: () => setHoveredNav(id),
    onMouseLeave: () => setHoveredNav(null),
  })

  return (
    <>
      {/* Intro + Om Meg + Ferdigheter + Prosjekter */}
      <IntroAnimasjon
        sectionRef={hjemSec}
        omMegRef={omMegSec}
        ferdigRef={ferdigSec}
        prosjRef={prosjSec}
        kontaktRef={kontaktSec}
        jumpHomeRef={jumpHomeRef}
      />

      {egg && (
        <ConstructionSite
          vw={vp.w}
          vh={vp.h}
          fi={fi}
          holeL={gullCx - 9 * gullSize / 70}
          holeR={gullCx + 10 * gullSize / 70}
          gullCx={gullCx}
          gullSize={gullSize}
          onBack={climbBack}
        />
      )}

      {/* Seksjonnavn på linjen — mobil/nettbrett, i linje med rammen (skjult på hjem) */}
      <motion.div style={{ position: 'fixed', inset: 0, y: frameShift, zIndex: 10000, pointerEvents: 'none' }}>
      {(isMobile || isTablet) && active !== 'hjem' && (
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: fi,
              left: hjemX + HOUSE_W + 11,
              transform: 'translateY(-50%)',
              zIndex: 10000,
              fontFamily: "'Caveat', cursive",
              fontSize: fontSize,
              color: 'black',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              lineHeight: 1,
            }}
          >
            <svg width="14" height="1" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 8, marginLeft: 2, overflow: 'visible' }}>
              <line x1="0" y1="0.5" x2="14" y2="0.5" stroke="black" strokeWidth="1" strokeLinecap="round" />
            </svg>
            {{ hjem: 'Hjem', omMeg: 'Om meg', ferdigheter: 'Ferdigheter', prosjekter: 'Prosjekter', kontakt: 'Kontakt' }[active]}
          </motion.div>
        </AnimatePresence>
      )}
      </motion.div>

      {/* Fast ramme + nav */}
      <style>{`
        .nav-link { text-decoration: none; }
        .nav-link:hover { text-decoration: underline; text-underline-offset: 4px; text-decoration-color: rgba(0,0,0,0.28); text-decoration-thickness: 1px; }
        .menu-item { cursor: pointer; text-decoration: none; display: block; letter-spacing: 1.5px; }
        .menu-item:hover { font-weight: 600; }
        .menu-item--active { font-weight: 600; text-decoration: underline; text-underline-offset: 4px; text-decoration-color: rgba(0,0,0,0.4); text-decoration-thickness: 1px; }
      `}</style>
      <motion.svg
        style={{
          y: frameShift,
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 9999,
          pointerEvents: "none",
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={mainFrameLines} fill="none" stroke="black" strokeWidth="1" />

        {/* Regnvåt måke som prøver å fly av gårde med bunnlinja (Kontakt) */}
        {showGull && (
          <RainGull key={gullKey} cx={gullCx} lineY={fb} x0={gullX0} x1={fr} size={gullSize} onFall={onGullFall} />
        )}

        {/* Usynlig tekst for å måle seksjonnavn-bredde */}
        <text ref={sectionLblRef} x={-9999} y={-9999} {...{ dominantBaseline:'middle', fontFamily:"'Caveat', cursive", fontSize }} style={{ visibility:'hidden', pointerEvents:'none' }}>
          {{ hjem:'Hjem', omMeg:'Om meg', ferdigheter:'Ferdigheter', prosjekter:'Prosjekter', kontakt:'Kontakt' }[active]}
        </text>

        {/* Hjem-ikon */}
        <g
          data-nav=""
          onClick={() => { window.scrollTo({ top: 0, behavior: "instant" }); jumpHomeRef.current?.() }}
          {...navHover("hjem")}
          style={{ pointerEvents: "auto", cursor: "pointer", opacity: hoveredNav === "hjem" || active === "hjem" ? 1 : 0.72 }}
        >
          <image
            href={hjemIkon}
            x={hjemX - 1}
            y={fi - HOUSE_W / 2}
            width={HOUSE_W}
            height={HOUSE_W}
            style={{ pointerEvents: "none" }}
          />
          {/* Usynlig klikkflate */}
          <rect x={hjemX - 2} y={fi - HOUSE_W / 2 - 1} width={HOUSE_W + 4} height={HOUSE_W + 2} fill="transparent" />
        </g>

        <text ref={nameRef} x={nameX} y={fi} {...textProps}
          style={{ ...navStyle("omMeg"), pointerEvents: isMobile || isTablet ? "none" : "auto", opacity: isMobile || isTablet ? 0 : 1 }}
          onClick={() => scrollToRef(omMegSec)}
          {...navHover("omMeg")}>
          Åshild Færøy
        </text>

        <text ref={ferdigRef} x={ferdigX} y={fi} {...textProps}
          style={{ ...navStyle("ferdigheter"), pointerEvents: isMobile || isTablet ? "none" : "auto", opacity: isMobile || isTablet ? 0 : 1 }}
          onClick={() => scrollToRef(ferdigSec)}
          {...navHover("ferdigheter")}>
          Ferdigheter
        </text>

        <text ref={prosjRef} x={prosjX} y={fi} {...textProps}
          style={{ ...navStyle("prosjekter"), pointerEvents: isMobile || isTablet ? "none" : "auto", opacity: isMobile || isTablet ? 0 : 1 }}
          onClick={() => scrollToRef(prosjSec)}
          {...navHover("prosjekter")}>
          Prosjekter
        </text>

        <text ref={kontaktRef} x={kontaktX} y={fi} {...textProps}
          style={{ ...navStyle("kontakt"), pointerEvents: isMobile || isTablet ? "none" : "auto", opacity: isMobile || isTablet ? 0 : 1 }}
          onClick={() => scrollToRef(kontaktSec)}
          {...navHover("kontakt")}>
          Kontakt
        </text>

        {/* SVG-underline ved hover (0.5px — ikke mulig med CSS på SVG-tekst) */}
        {[
          { id: 'hjem',        x: hjemX,    w: hjemW,    show: false },
          { id: 'omMeg',       x: nameX,    w: nameW,    show: !(isMobile || isTablet) },
          { id: 'ferdigheter', x: ferdigX,  w: ferdigW,  show: !(isMobile || isTablet) },
          { id: 'prosjekter',  x: prosjX,   w: prosjW,   show: !(isMobile || isTablet) },
          { id: 'kontakt',     x: kontaktX, w: kontaktW, show: !(isMobile || isTablet) },
        ].map(({ id, x, w, show }) =>
          show && active === id ? (
            <line key={id} x1={x} x2={x + w} y1={fi + 7} y2={fi + 7}
              stroke="rgba(0,0,0,0.55)" strokeWidth="0.8" strokeLinecap="round" />
          ) : null
        )}

        {(isMobile || isTablet) && (
          <g
            data-nav=""
            onClick={clickBurger}
            onMouseEnter={openHover}
            onMouseLeave={leaveHover}
            style={{ cursor: "pointer", pointerEvents: "auto" }}
          >
            <rect
              x={fr - 48}
              y={fi - 14}
              width={42}
              height={28}
              fill="transparent"
            />
            {menuOpen ? (
              <>
                <line
                  x1={fr - 34} y1={fi - 4}
                  x2={fr - 20} y2={fi + 4}
                  stroke="black" strokeWidth="1.5" strokeLinecap="round"
                />
                <line
                  x1={fr - 20} y1={fi - 4}
                  x2={fr - 34} y2={fi + 4}
                  stroke="black" strokeWidth="1.5" strokeLinecap="round"
                />
              </>
            ) : (
              <>
                <line
                  x1={fr - 34} y1={fi - 5}
                  x2={fr - 20} y2={fi - 5}
                  stroke="black" strokeWidth="1.5" strokeLinecap="round"
                />
                <line
                  x1={fr - 34} y1={fi}
                  x2={fr - 20} y2={fi}
                  stroke="black" strokeWidth="1.5" strokeLinecap="round"
                />
                <line
                  x1={fr - 34} y1={fi + 5}
                  x2={fr - 20} y2={fi + 5}
                  stroke="black" strokeWidth="1.5" strokeLinecap="round"
                />
              </>
            )}
          </g>
        )}
      </motion.svg>

      {(isMobile || isTablet) && menuOpen && (
        <>
          <div
            data-nav=""
            onClick={closeClick}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9998,
            }}
          />
          <div
            data-nav=""
            onMouseEnter={enterMenu}
            onMouseLeave={leaveMenu}
            style={{
              position: "fixed",
              top: fi + 14,
              right: fi,
              background: "#faf8f5",
              border: "1px solid rgba(0,0,0,0.09)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.06), 0 8px 20px rgba(0,0,0,0.10), 0 20px 40px rgba(0,0,0,0.08)",
              padding: "20px 32px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              zIndex: 100001,
              fontFamily: "'Caveat', cursive",
              fontSize: 20,
              minWidth: 160,
            }}
          >
            {[
              { label: "Hjem",        ref: null,       id: "hjem"        },
              { label: "Om meg",      ref: omMegSec,   id: "omMeg"       },
              { label: "Ferdigheter", ref: ferdigSec,  id: "ferdigheter" },
              { label: "Prosjekter",  ref: prosjSec,   id: "prosjekter"  },
              { label: "Kontakt",     ref: kontaktSec, id: "kontakt"     },
            ].map(({ label, ref, id }) => (
              <span
                key={label}
                className={`menu-item${active === id ? " menu-item--active" : ""}`}
                onClick={() => {
                  if (id === "hjem") { window.scrollTo({ top: 0, behavior: "instant" }); jumpHomeRef.current?.() }
                  else scrollToRef(ref)
                  closeClick()
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </>
      )}
    </>
  );
}
