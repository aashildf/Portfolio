import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { BASE } from '../utils/assetUrl'
import { createPortal } from 'react-dom'
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

export default function IntroAnimasjon({ sectionRef, omMegRef, ferdigRef, prosjRef, kontaktRef, jumpHomeRef }) {
  const { scrollY } = useScroll()
  const [win, setWin] = useState({ w: window.innerWidth, h: window.innerHeight })
  useEffect(() => {
    const onResize = () => setWin({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // JS scroll snap: én tydelig scroll-bevegelse = ett steg til neste/forrige
  // seksjon (samme "decisive" oppførsel som å klikke i navigasjonen) —
  // ikke avhengig av hvor langt inn i segmentet man har scrollet.
  useEffect(() => {
    // Regnes ut på nytt hver gang (ikke bufret), slik at snap-punktene alltid
    // matcher GJELDENDE vindushøyde — ellers blir de stående feil etter en
    // vindus-/DevTools-endring av størrelse (siden dette kun kjørte én gang
    // ved mount), og scroll-snap treffer feil sted.
    const getPoints = () => {
      const vh = window.innerHeight
      const pts = [0, 1.00 * vh, 2.58 * vh, 3.35 * vh, 4.85 * vh]
      // Easter egg (måka i Kontakt): byggeplassen under er åpnet
      if (document.documentElement.dataset.sneak) pts.push(6 * vh)
      return pts
    }
    const nearestIndex = (y, points) => {
      let best = 0
      for (let i = 1; i < points.length; i++) {
        if (Math.abs(points[i] - y) < Math.abs(points[best] - y)) best = i
      }
      return best
    }

    // restY: posisjonen vi sist var i ro på — grunnlinjen den neste
    // scroll-bevegelsen måles fra. Fanges friskt fra faktisk DOM-tilstand,
    // så den også synkroniseres riktig etter eksterne hopp (f.eks. nav-klikk).
    let restY = window.scrollY
    let debounceTimer = null
    let rafId = null
    let animating = false

    const easeInOutCubic = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

    const cancelAnim = () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      rafId = null
      animating = false
    }

    // Egen rAF-drevet scroll: vi styrer varighet og easing selv, så vi
    // vet nøyaktig når overgangen er ferdig — i stedet for å gjette et
    // fast antall ms på nettleserens innebygde "smooth" scroll (som varierer
    // med avstand/nettleser og kan avbrytes for tidlig).
    const animateTo = (target) => {
      cancelAnim()
      const start = window.scrollY
      const distance = target - start
      if (Math.abs(distance) < 1) { restY = target; return }
      animating = true
      // Telefon: korte skjermer gir korte avstander og dermed svært raske
      // overganger — zoomen inn i P-en (første 30 % av steget) rakk knapt
      // å synes. Gi berøringsskjermer en litt lengre minstetid.
      const minDur = isTouch ? 650 : 300
      const duration = Math.min(Math.max(700, minDur), Math.max(minDur, Math.abs(distance) * 0.4))
      const startTime = performance.now()

      const step = (now) => {
        const t = Math.min(1, (now - startTime) / duration)
        window.scrollTo({ top: start + distance * easeInOutCubic(t), behavior: 'auto' })
        if (t < 1) {
          rafId = requestAnimationFrame(step)
        } else {
          animating = false
          rafId = null
          restY = target
        }
      }
      rafId = requestAnimationFrame(step)
    }

    // Skiller ekte musehjul/touch/tastatur-scrolling (skal være "decisive":
    // ett steg per bevegelse) fra programmatiske hopp som nav-klikk sin
    // scrollIntoView (skal få lov å lande akkurat der de sikter, selv om
    // det er flere seksjoner unna — ellers "korrigerer" vi et Hjem→Kontakt-
    // klikk tilbake til bare ett steg).
    let userScrolling = false
    const isTouch = window.matchMedia('(pointer: coarse)').matches

    const onUserInput = (e) => {
      // Et TRYKK på hus-ikonet/menyen sender også touchstart — uten dette
      // ble nav-hoppet tolket som en fingerscroll, og "ett steg om gangen"-
      // regelen stoppet hoppet én seksjon unna i stedet for der man trykket.
      if (e?.type === 'touchstart' && e.target?.closest?.('[data-nav]')) return
      userScrolling = true
      // Avbryter en pågående overgang UTEN å røre restY. restY skal bare
      // oppdateres når en bevegelse faktisk fullføres (se animateTo/step) —
      // holdes den urørt her, måles hele den (kanskje humpete, flerdelte)
      // fysiske bevegelsen alltid fra samme, opprinnelige utgangspunkt når
      // den til slutt roer seg, så den alltid lander nøyaktig ett steg unna.
      // (Å sette restY til enten det avbrutte stedet ELLER målet var begge
      // feil: det avbrutte stedet kan ligge nærmere neste seksjon enn start,
      // og målet kan ligge FORAN der brukeren faktisk har rukket å scrolle,
      // som begge ga en falsk retning/dobbel-steg ved gjenopptatt scrolling.)
      if (animating) cancelAnim()
    }

    // px — filtrerer bort støy OG svak treghets-etterslep (som typisk er
    // noen få px per rest-tick), men fanger fortsatt en bevisst, liten scroll
    const MIN_INTENT = 16

    const onScroll = () => {
      if (animating) return // ignorer scroll-events generert av vår egen animasjon

      clearTimeout(debounceTimer)
      // Ekte maskinvare (styreflate/mus) leverer ofte et "etterslep" av
      // svake scroll-events lenge etter at brukeren fysisk sluttet å bevege
      // seg (treghet/momentum) — med pauser som lett overstiger en kort
      // debounce. Er ventetiden for kort, blir dette etterslepet feiltolket
      // som en helt NY, separat scrollbevegelse rett etter at den første er
      // korrekt fullført, og gir et ekstra, uønsket steg videre. Vent derfor
      // en god stund med ro før vi bestemmer oss.
      const delay = userScrolling ? 260 : 220
      debounceTimer = setTimeout(() => {
        const y = window.scrollY
        const points = getPoints()

        if (userScrolling) {
          // Ekte scroll-input: flytt nøyaktig ett steg i scroll-retningen
          userScrolling = false
          const delta = y - restY
          const baseIdx = nearestIndex(restY, points)
          let targetIdx = baseIdx
          if      (delta >  MIN_INTENT) targetIdx = Math.min(points.length - 1, baseIdx + 1)
          else if (delta < -MIN_INTENT) targetIdx = Math.max(0, baseIdx - 1)
          const target = points[targetIdx]
          if (Math.abs(target - y) > 2) animateTo(target)
          else restY = target
        } else {
          // Programmatisk hopp (nav-klikk, Hjem-ikon): stol på posisjonen,
          // bare synk til nærmeste gyldige punkt uten ett-steg-begrensningen
          const target = points[nearestIndex(y, points)]
          if (Math.abs(target - y) > 2) animateTo(target)
          else restY = target
        }
      }, delay)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('wheel', onUserInput, { passive: true })
    window.addEventListener('touchstart', onUserInput, { passive: true })
    window.addEventListener('keydown', onUserInput)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', onUserInput)
      window.removeEventListener('touchstart', onUserInput)
      window.removeEventListener('keydown', onUserInput)
      clearTimeout(debounceTimer)
      cancelAnim()
    }
  }, [])
  const vw = win.w
  const vh = win.h
  const isMobile   = vw < 600
  const isTablet   = !isMobile && vw < 1050
  // Continuous frameInset: 18px at 375vw → 100px at 1440vw (samme
  // sluttpunkt som før — kun mobil-enden er senket, ned fra opprinnelig
  // 36px, se Layout.jsx). På svært lave skjermer (bred-men-kort bærbar)
  // tar rammemarginen for mye av den knappe høyden — trekk den sammen
  // der, ellers blir det for lite plass igjen til innholdet.
  const frameInsetByWidth = Math.max(18, Math.min(100, 18 + (vw - 375) * 82 / 1065))
  const frameInset = Math.round(Math.max(18, Math.min(frameInsetByWidth, vh * 0.1)))

  // ─── Scroll-indikator ────────────────────────────────────────────────────────
  const scrollHintOp = useTransform(scrollY, [0, 0.12 * vh], [1, 0])

  // ─── P-animasjon (hjem-logo) ─────────────────────────────────────────────────
  const pWidth      = Math.min(vh * W / H, vw)
  // Desktop: P-en er høyde-begrenset, så "fyll bredden" gir en tydelig zoom
  // (~2,5×). Mobil: P-en er allerede bredde-begrenset → vw/pWidth = 1, og
  // det ble ingen zoom i det hele tatt. Zoom like mye inn der også.
  const scaleToFill = isMobile ? Math.max(2.6, vw / pWidth) : vw / pWidth
  const pScale      = useTransform(scrollY, [0, 0.30 * vh], [1, scaleToFill])
  const pOpacityRaw = useTransform(scrollY, [0.12 * vh, 0.38 * vh], [1, 0])
  const pOpacity    = useSpring(pOpacityRaw, { stiffness: 55, damping: 18 })
  // Ved instant nav-hopp (klikk i menyen) rekker ikke fjæra å tone P-en ut/inn
  // i tide, så den blir liggende og "spøke" synlig et halvt sekund etterpå.
  // Layout kaller denne rett etter et instant scroll-hopp for å hoppe rett
  // til riktig opacity uten fjær-animasjon.
  useEffect(() => {
    if (jumpHomeRef) jumpHomeRef.current = () => pOpacity.jump(window.scrollY < 0.5 * vh ? 1 : 0)
  })
  // bergen.jpg: litt lysnet — fader inn med P-en, forsvinner ved slutten
  const bergenOp = useTransform(scrollY,
    [0.12*vh, 0.35*vh, 5.60*vh, 5.85*vh],
    [0,       0.82,    0.82,    0])

  // ───  Om Meg-seksjon (fader ut akkurat når bitene dukker opp) ────────────
  const newOmOp = useTransform(scrollY,
    [0.45*vh, 0.62*vh, 1.38*vh, 1.44*vh], [0, 1, 1, 0])

  const CARD_GAP  = 16
  // cardW = halvparten av Om Meg-kortets bredde → 4 biter tiler perfekt uten gap.
  // Samme resonnement som i OmMeg.jsx: på brede MEN korte skjermer (bærbar
  // med skjermskalering) må bredden også begrenses av tilgjengelig høyde,
  // ellers blir kvadrant-rutenettet høyere enn rammen har plass til.
  const omImgAspect       = 1380 / 1258
  const availGridH        = vh - 2 * (frameInset + 1) - CARD_GAP - 24
  // Minstemål ~780px (kvadrant-bredde ~390px): under det får ikke kortenes
  // faste tekstinnhold (tittel/undertekst/beskrivelse/"les mer", og
  // baksidens forklaringstekst) plass — teksten overlapper seg selv eller
  // blir avkuttet.
  const maxOmCardWByHeight = Math.max(760, Math.floor((availGridH / omImgAspect) * 2))
  const omCardW   = Math.round(Math.min(860, Math.max(500, vw * 0.72), maxOmCardWByHeight))
  const maxCardW  = Math.floor((vw - 2 * frameInset - 1 - CARD_GAP) / 2)
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

  // Mobile: 1-kolonne, samme bredde og sidemarger som prosjekter-kortene.
  // Trekker fra litt ekstra (ikke bare prosjGap) — kortstabelen fylte hele
  // rammebredden/-høyden kant-til-kant med null pusterom.
  const prosjContW_mobile = Math.min(vw - 2 * (frameInset + 1) - prosjGap * 2, 2 * 220 + prosjGap)
  const mobileCardW = isMobile ? prosjContW_mobile - 14 : cardW
  // Korthøyden ble tidligere regnet ut fra BREDDEN (en vilkårlig 4/5-faktor),
  // uavhengig av hvor mye plass det faktiske tekstinnholdet (tittel/
  // undertekst/beskrivelse/"les mer") trenger — på smale mobilskjermer ga
  // det kort som knapt viste mer enn tittelen. Bruk i stedet all høyden
  // rammen faktisk har å avse til 4 stablede kort, med en mindre gap enn
  // 2×2-rutenettet på desktop (CARD_GAP) bruker. -36 gir litt luft over
  // første og under siste kort, i stedet for å fylle rammen helt ut.
  const MOBILE_FERDIG_GAP  = 10
  const maxFerdigHByHeight = Math.floor((vh - 2 * (frameInset + 1) - 3 * MOBILE_FERDIG_GAP - 36) / 4)
  const mobileCardH = isMobile ? Math.max(50, maxFerdigHByHeight) : cardH
  const mobileGridH = isMobile ? 4 * mobileCardH + 3 * MOBILE_FERDIG_GAP : gridH
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
  // Mobil/nettbrett: et trykk på et ferdighetskort løfter det frem i stort
  // format (i stedet for å snu det — baksideteksten fikk aldri plass i de
  // små kortene). focus = { i, rect } holdes til lukke-animasjonen er ferdig;
  // focusOpen styrer selve åpen/lukket-tilstanden.
  const [focus,     setFocus]     = useState(null)
  const [focusOpen, setFocusOpen] = useState(false)
  const focusOpenRef = useRef(false)
  const pendingFocusRef = useRef(null)
  const focusSeqRef = useRef(0)
  focusOpenRef.current = focusOpen
  const closeFocus = () => setFocusOpen(false)
  // Om brukeren har skrapt Om meg-bildet: da skal ikke tegningen dukke opp
  // igjen i kortene når de deler seg (det så rart ut etter at man hadde
  // avslørt videoen under).
  const [omScratched, setOmScratched] = useState(false)
  // P-en (med sine <a>-lenker) ligger under alle seksjonene og er bare
  // usynlig (opacity 0) etter forsiden — uten dette fanget den trykk som
  // traff "ved siden av" innholdet (f.eks. rundt Om meg-kortet) og navigerte
  // til /prosjekt1 osv.
  const [pClickable, setPClickable] = useState(() => window.scrollY < window.innerHeight * 0.1)
  useMotionValueEvent(scrollY, 'change', v => {
    setPClickable(v < vh * 0.1)
    setProsjActive(v > vh * 3.0)
    setProsjSpredt(v > vh * 3.15)
    setKontaktActive(v > vh * 4.5)
    setFerdigHoverActive(v > vh * 2.1 && v < vh * 2.78)
    if (v < vh * 1.44 || v > vh * 3.08) {
      setFlipped([false, false, false, false])
    }
  })

  // Lukk det fremhevede kortet så snart brukeren scroller videre
  useEffect(() => {
    if (!focusOpen) return
    const y0 = window.scrollY
    const onScroll = () => { if (Math.abs(window.scrollY - y0) > 8) closeFocus() }
    const onKey = e => { if (e.key === 'Escape') closeFocus() }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('keydown', onKey)
    }
  }, [focusOpen])

  // Prosjekter: fade inn, hold, fade ut bak regnet (INGEN push-up).
  // Regn-skjulingen (prosjMask) følger paraplyens fjær-posisjon, som bruker
  // reell tid (~1,5-2s) på å rekke opp — ved et raskt/instant hopp til
  // Kontakt (f.eks. nav-klikk) rekker ikke fjæra å dekke prosjektene i tide,
  // og de blir stående synlige oppå paraplyen. Legg til en direkte
  // opacity-fade rett før Kontakt som sikkerhetsnett, uavhengig av fjæra.
  const prosjOp    = useTransform(scrollY, [3.05*vh, 3.28*vh, 4.60*vh, 4.80*vh], [0, 1, 1, 0])
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
  // Mobil: Om meg-kortet viser videoen (ikke tegningen), så å dele opp
  // tegningen i strimler ga ingen mening — kortene står i sin egen kolonne
  // hele tiden og toner bare inn (se cardOp), med en liten forskjøvet
  // oppglidning (mobileRise) så de ikke bare "popper" inn.
  const p0L = useTransform([splitSpring, ferdigPile], ([s, fp]) =>
    isMobile
      ? GL
      : lerp(GL + Hx * fp, omRectRef.current.left, s))
  const mobileRise = useTransform(scrollY, [1.40 * vh, 2.10 * vh], [1, 0])
  const riseOff = (r, i) => (isMobile ? r * (28 + i * 16) : 0)
  const p0T = useTransform([splitSpring, ferdigPile, mobileRise], ([s, fp, r]) =>
    isMobile
      ? GT + 1.5 * (CH + MOBILE_FERDIG_GAP) * fp + riseOff(r, 0)
      : lerp(GT + Hy * fp, omRectRef.current.top, s))
  const p1T = useTransform([splitSpring, ferdigPile, mobileRise], ([s, fp, r]) =>
    isMobile
      ? GT + (1 + 0.5 * fp) * (CH + MOBILE_FERDIG_GAP) + riseOff(r, 1)
      : lerp(GT + Hy * fp, omRectRef.current.top, s))
  const p2T = useTransform([splitSpring, ferdigPile, mobileRise], ([s, fp, r]) =>
    isMobile
      ? GT + (2 - 0.5 * fp) * (CH + MOBILE_FERDIG_GAP) + riseOff(r, 2)
      : lerp(GT + CH + CARD_GAP - Hy * fp, omRectRef.current.top + omRectRef.current.height * 0.5, s))
  const p3T = useTransform([splitSpring, ferdigPile, mobileRise], ([s, fp, r]) =>
    isMobile
      ? GT + (3 - 1.5 * fp) * (CH + MOBILE_FERDIG_GAP) + riseOff(r, 3)
      : lerp(GT + CH + CARD_GAP - Hy * fp, omRectRef.current.top + omRectRef.current.height * 0.5, s))
  const p1L = useTransform([splitSpring, ferdigPile], ([s, fp]) =>
    isMobile
      ? GL
      : lerp(GL + CW + CARD_GAP - Hx * fp, omRectRef.current.left + omRectRef.current.width * 0.5, s))
  const p2L = useTransform([splitSpring, ferdigPile], ([s, fp]) =>
    isMobile
      ? GL
      : lerp(GL + Hx * fp, omRectRef.current.left, s))
  const p3L = useTransform([splitSpring, ferdigPile], ([s, fp]) =>
    isMobile
      ? GL
      : lerp(GL + CW + CARD_GAP - Hx * fp, omRectRef.current.left + omRectRef.current.width * 0.5, s))

  // Størrelse: mobil → fast kortstørrelse, desktop → halvpart × halvpart av Om meg-kortet
  const cardWMV = useTransform(splitSpring, v => isMobile ? CW : lerp(CW, omRectRef.current.width  * 0.5, v))
  const cardHMV = useTransform(splitSpring, v => isMobile ? CH : lerp(CH, omRectRef.current.height * 0.5, v))

  // Crossfade: splitSpring=1 → Om Meg-lag synlig, =0 → kortinnhold synlig.
  // Mobil har ikke Om meg-laget, så der er forsiden alltid fullt synlig.
  const invertedSplit = useTransform(splitSpring, v => isMobile ? 1 : 1 - v)

  const rot0 = useTransform(ferdigPile, [0, 1], [0, -7])
  const rot1 = useTransform(ferdigPile, [0, 1], [0,  5])
  const rot2 = useTransform(ferdigPile, [0, 1], [0, -3])
  const rot3 = useTransform(ferdigPile, [0, 1], [0,  8])

  // Fader inn med Om Meg-overgangen, holder seg til pile-fasen er ferdig
  // Mobil: ingen Om meg-bit å "bli" kortene, så tonen inn må være mykere.
  const cardOp = useTransform(scrollY,
    isMobile
      ? [1.40*vh, 1.95*vh, 2.88*vh, 3.08*vh]
      : [1.38*vh, 1.44*vh, 2.88*vh, 3.08*vh],
    [0, 1, 1, 0])

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
  // → skalerer sømløst uten hopp ved breakpoints. Øvre grense: paraplyen
  // skal aldri bli høyere enn ~65 % av skjermhøyden — ellers stikker
  // toppen opp over rammen/navigasjonen OG spiser for mye av høyden som
  // kontaktkortene under trenger, på brede-men-korte skjermer (typisk
  // bærbar med skjermskalering).
  const umbrellaScale = Math.min(2.20, (vh * 0.65) / (vw * ASPECT_H), Math.max(0.80,
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
  const kontaktPadTopIdeal = showUmbrella
    ? Math.round(umbrellaFinalY + umbrellaH * HANDLE_FRAC) + 24
    : 0
  // Kontaktkortene har en minstestørrelse (se Kontakt.jsx) under hvilken
  // innholdet deres ikke får plass. Hvis den "ideelle" paraply-posisjonen
  // (~44 % av vh) ikke etterlater nok plass til DEN minstestørrelsen på
  // lave skjermer, må paraplyen (og dermed kortene) flyttes høyere opp —
  // ellers stikker kortenes nedre kant under rammen.
  const MIN_KONTAKT_CARD_H = 301
  const trueAvailHIdeal = (vh - frameInset - 1) - (kontaktPadTopIdeal + 30)
  const kontaktPadTop = showUmbrella
    ? Math.max(20, trueAvailHIdeal < MIN_KONTAKT_CARD_H
        ? kontaktPadTopIdeal - (MIN_KONTAKT_CARD_H - trueAvailHIdeal)
        : kontaktPadTopIdeal)
    : 0
  // Reell plass igjen til kontaktkortene UNDER paraplyens håndtak — brukes
  // til å størrelsestilpasse kortene i stedet for å gjette ut fra rå vh,
  // som ikke tar høyde for at paraplyen selv spiser av høyden ovenfra.
  const kontaktAvailH = Math.max(160, (vh - frameInset - 1) - (kontaktPadTop + 30) - 20)

  // Horisontale prosent-grenser for regn-filtrering (d.x er 0–100 %)
// Paraplyen stiger OPP etter at regnet har dekket prosjektene
  const umbrellaYRaw     = useTransform(scrollY, [3.90*vh, 4.45*vh], [vh * 1.05, umbrellaFinalY])
  const umbrellaY        = useSpring(umbrellaYRaw, { stiffness: 40, damping: 22 })
  // Easter egg (måka): når siden glir forbi bunnen av scenen ned til
  // byggeplassen, må de faste lagene i Kontakt bli med opp — ellers blir de
  // hengende igjen oppå. 0 ellers (siden kan normalt ikke scrolles forbi 5·vh).
  const fallShift        = useTransform(scrollY, v => -Math.max(0, v - 5 * window.innerHeight))
  const umbrellaYShifted = useTransform([umbrellaY, fallShift], ([a, b]) => a + b)
  // Masken (umbrellaY) er fjær-basert og kan henge etter i opptil ~1,5-2s
  // etter et besøk på Kontakt (fjæra bruker reell tid på å falle tilbake
  // til hvileposisjon, uavhengig av hvor fort man scroller/klikker seg
  // tilbake til Prosjekter). Uten en vakt her kan prosjektrutenettet vises
  // delvis "gjennomsiktig"/fadet lenge etter at man faktisk har forlatt
  // paraply-sonen. Koble derfor på/av med rå scrollY (oppdateres momentant,
  // ingen etterslep) — masken skal uansett bare være aktiv mens paraplyen
  // faktisk stiger (3.90-4.45vh) eller står ferdig hevet (Kontakt).
  const prosjMask = useTransform([scrollY, umbrellaY], ([sy, y]) => {
    if (sy < 3.85 * vh) return 'none'
    const canopyY = y + CANOPY_FRAC * umbrellaH   // faktisk spissposisjon
    const clipPx  = Math.max(0, vh - frameInset - 1 - canopyY)
    const fade    = 50
    return `linear-gradient(to bottom, black calc(100% - ${clipPx + fade}px), transparent calc(100% - ${clipPx}px))`
  })
  const umbrellaEntryScaleRaw = useTransform(scrollY, [3.90*vh, 4.45*vh], [0.86, 1])
  const umbrellaEntryScale    = useSpring(umbrellaEntryScaleRaw, { stiffness: 40, damping: 22 })
  const umbrellaImgOp    = useTransform(scrollY, [3.88*vh, 3.94*vh], [0, 1])
  // Kontaktinnholdet skal vente på at paraplyen faktisk har landet (fjæra
  // henger etter rå scroll og bruker ca. 1,5s på å sette seg uansett
  // scrollhastighet) — ellers dukker innholdet opp før paraplyen er på plass.
  const kontaktInnholdOpUmbrella = useTransform(umbrellaY, [umbrellaFinalY + 60, umbrellaFinalY], [0, 1])
  const kontaktInnholdOpScroll   = useTransform(scrollY, [4.50*vh, 4.70*vh], [0, 1])
  const kontaktInnholdOp = showUmbrella ? kontaktInnholdOpUmbrella : kontaktInnholdOpScroll
  
 
  

 
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    // Alle høyder i px fra window.innerHeight, ikke CSS "vh": på mobil er
    // 100vh høyden UTEN adressefelt, mens rammen (Layout.jsx) og alle
    // posisjoner her regnes ut fra innerHeight (synlig høyde). Forskjellen
    // (60-110px) dyttet alt som er plassert fra bunnen (f.eks. "skroll")
    // ut under rammen.
    <div style={{ height: 6 * vh, position: "relative" }}>
      {/* Scroll-ankere for nav + snap-punkter */}
      <div style={{ position: "absolute", top: 0, scrollSnapAlign: "start" }} />
      <div
        ref={omMegRef}
        data-id="om-meg"
        style={{ position: "absolute", top: 1.00 * vh, scrollSnapAlign: "start" }}
      />
      <div
        ref={ferdigRef}
        data-id="ferdigheter"
        style={{ position: "absolute", top: 2.58 * vh, scrollSnapAlign: "start" }}
      />
      <div
        ref={prosjRef}
        data-id="prosjekter"
        style={{ position: "absolute", top: 3.35 * vh, scrollSnapAlign: "start" }}
      />
      <div
        ref={kontaktRef}
        data-id="kontakt"
        style={{ position: "absolute", top: 4.85 * vh, scrollSnapAlign: "start" }}
      />
      <div
        ref={sectionRef}
        data-id="hjem"
        style={{
          position: "sticky",
          top: 0,
          height: vh,
          // P-zoomen på mobil (2,6×) går langt utenfor skjermen — uten
          // klipping ga det vannrett scroll på hele siden. "clip" (ikke
          // "hidden") så det ikke lages en egen scroll-container.
          overflow: "clip",
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
            pointerEvents: pClickable ? "auto" : "none",
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
          vw={vw}
          vh={vh}
          onScratched={() => setOmScratched(true)}
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
              forklaring: "Henter og visualiserer data på en tydelig måte.",
            },
            {
              tittel: "Design",
              innhold: "Figma, UI/UX",
              forklaring: "Jeg utforsker design og former idéer visuelt før de blir til kode.",
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
          // Mobil/nettbrett: kortene er mye kortere enn på desktop (mobil
          // stables 4-i-én-kolonne, nettbrett har smalere omCardW), så den
          // vanlige paddingen (16px ytre + clamp(18-30px) indre = ~68px
          // totalt) spiste det meste av kortet og lot knapt plass til
          // teksten. Strammere padding på begge.
          const compact = isMobile || isTablet
          const outerPad = compact ? 8 : "var(--space-4)";
          const pad = isMobile ? "10px 14px" : compact ? "clamp(8px,2vw,14px)" : "clamp(18px,2.4vw,30px)";
          // Mobil: på lave telefoner er hvert kort bare ~130px høyt — da får
          // ikke den kursive linja plass sammen med tittel og undertekst i
          // lesbar størrelse. Den står uansett i det fremhevede kortet.
          const showLead = !isMobile || CH >= 165
          const openFocus = (i, el) => {
            if (!ferdigHoverActive || !el) return
            const r = el.getBoundingClientRect()
            const next = { i, seq: ++focusSeqRef.current, rect: { left: r.left, top: r.top, width: r.width, height: r.height } }
            // Forrige kort holder fortsatt på å lukke seg → vent til det er
            // ferdig (onExitComplete), ellers kolliderer de to animasjonene.
            if (focus) { pendingFocusRef.current = next; return }
            setFocus(next)
            setFocusOpen(true)
          }
          const cardEls = cards.map(
            ({ L, T, rot, kol, backBg, omBg, omPos, overlay, overlayOpacity, lightText }, i) => (
              <motion.div
                key={i}
                onClick={(e) => {
                  if (!ferdigHoverActive) return
                  if (compact) openFocus(i, e.currentTarget)
                  else setFlipped((f) => f.map((v, j) => (j === i ? !v : v)))
                }}
                onMouseEnter={() => ferdigHoverActive && !compact && setHoveredCard(i)}
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
                  // Kortet "løftes ut" i det fremhevede formatet — skjul
                  // originalen så det ikke ser ut som det finnes to.
                  visibility: focus?.i === i ? "hidden" : "visible",
                }}
              >
                {/* Om Meg-lag (tegningen deles i fire) — ikke på mobil, og
                    ikke hvis brukeren allerede har skrapt den bort */}
                {!isMobile && !omScratched && (
                  <motion.div
                    style={{
                      position: "absolute",
                      inset: 0,
                      overflow: "hidden",
                      backgroundImage: omBg,
                      backgroundSize: "cover",
                      backgroundPosition: omPos,
                      opacity: splitSpring,
                    }}
                  />
                )}

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
                        padding: outerPad,
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

                        {/* Øvre gruppe: tittel + underoverskrift + forklaring.
                            overflowY: auto er et sikkerhetsnett — hvis teksten
                            likevel ikke får plass (svært lave kort), kan den
                            scrolles i stedet for å bli usynlig avkuttet. */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "clamp(6px,0.7vw,10px)", overflowX: "hidden", overflowY: compact ? "hidden" : "auto", minHeight: 0 }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(4px,0.4vw,6px)" }}>
                            <h3
                              style={{
                                fontFamily: "var(--font-hand)",
                                fontWeight: 400,
                                fontSize: isMobile ? 26 : "clamp(20px,1.8vw,26px)",
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
                                fontSize: isMobile ? 14 : "clamp(11px,0.85vw,13px)",
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
                          {showLead && (
                            <p
                              style={{
                                fontFamily: "var(--font-ui)",
                                fontWeight: 300,
                                fontSize: isMobile ? 15 : "clamp(13px,0.95vw,15px)",
                                margin: 0,
                                color: lightText ? "rgba(255,255,255,0.75)" : "var(--color-text-mid)",
                                lineHeight: isMobile ? 1.4 : 1.55,
                                fontStyle: "italic",
                              }}
                            >
                              {KORT_FRONT[i].forklaring}
                            </p>
                          )}
                        </div>

                        {/* "les mer →" — alltid forankret i bunnen */}
                        <motion.span
                          initial="rest"
                          whileHover="hover"
                          onClick={e => {
                            // Mobil/nettbrett: la klikket gå videre til kortet
                            // (som åpner det fremhevede formatet)
                            if (compact) return
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
                            fontSize: isMobile ? 13 : "clamp(11px,0.8vw,13px)",
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
                      padding: outerPad,
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
                          overflowX: "hidden",
                          overflowY: "auto",
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

          // ── Fremhevet kort (mobil/nettbrett) ──────────────────────────────
          // Vokser ut fra kortets egen plass til midten av skjermen, viser
          // hele teksten og spiller animasjonen (som ellers bare startet ved
          // hover — og det finnes ikke på berøringsskjerm). Trykk hvor som
          // helst for å legge det tilbake.
          const fc = focus ? cards[focus.i] : null
          const fW = Math.min(vw - 2 * frameInset - 16, 460)
          const fH = Math.min(vh - 2 * frameInset - 48, 500)
          const fLeft = Math.round((vw - fW) / 2)
          const fTop  = Math.round((vh - fH) / 2)
          // Lukke-animasjonen er ferdig: rydd opp — eller åpne kortet brukeren
          // trykket på MENS det forrige lukket seg (se pendingFocusRef).
          const finishClose = () => {
            setHoveredCard(null)
            const next = pendingFocusRef.current
            pendingFocusRef.current = null
            if (next) { setFocus(next); setFocusOpen(true) }
            else setFocus(null)
          }
          const rectPos = focus && { left: focus.rect.left, top: focus.rect.top, width: focus.rect.width, height: focus.rect.height }
          // Ingen AnimatePresence/exit her med vilje: med den kolliderte
          // utgangen av ett kort med inngangen av det neste (det nye ble
          // stående uanimert). Kortet holdes montert og animeres mellom
          // åpen/lukket; nytt kort = ny key (seq) → monteres friskt.
          const focusEl = fc && createPortal(
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: focusOpen ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                onClick={closeFocus}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 100002,
                  background: "rgba(245,242,236,0.55)",
                  backdropFilter: "blur(3px)",
                  WebkitBackdropFilter: "blur(3px)",
                  // Under lukkingen: slipp trykk gjennom til neste kort
                  pointerEvents: focusOpen ? "auto" : "none",
                }}
              />
              <motion.div
                key={`focus-card-${focus.seq}`}
                initial={rectPos}
                animate={focusOpen ? { left: fLeft, top: fTop, width: fW, height: fH } : rectPos}
                transition={{ type: "spring", stiffness: 300, damping: 32, restDelta: 0.5 }}
                // Åpnet: start animasjonen først når kortet har landet.
                // Lukket: rydd opp. Ref, ikke state — closuren kan være utdatert.
                onAnimationComplete={() => {
                  if (focusOpenRef.current) setHoveredCard(focus.i)
                  else finishClose()
                }}
                onClick={() => { setHoveredCard(null); closeFocus() }}
                style={{
                  pointerEvents: focusOpen ? "auto" : "none",
                    position: "fixed",
                    zIndex: 100003,
                    overflow: "hidden",
                    backgroundColor: fc.overlay,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.18), 0 30px 60px rgba(0,0,0,0.14)",
                    color: fc.lightText ? "rgba(255,255,255,0.88)" : "var(--color-text)",
                  }}
                >
                  <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: `url(${BASE}skillsoverlay.jpg)`,
                    backgroundSize: "cover", backgroundPosition: "center",
                    opacity: fc.overlayOpacity, pointerEvents: "none",
                  }} />
                  <div style={{ position: "absolute", inset: 0, padding: 10, display: "flex" }}>
                    <div style={{
                      flex: 1,
                      position: "relative",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      border: `1px solid ${fc.lightText ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.22)"}`,
                    }}>
                      {/* Reven: over hele kortet, dempet litt (den ligger
                          allerede nederst og fungerte fint slik). */}
                      {focus.i === 2 && (
                        <div style={{ position: "absolute", inset: 0, opacity: 0.7, pointerEvents: "none" }}>
                          <DesignImprint hovered={hoveredCard === 2} />
                        </div>
                      )}
                      {/* Fisken: IKKE inni en beholder med opacity < 1 — det
                          isolerer mix-blend-mode: multiply, så GIF-ens hvite
                          bakgrunn ble stående som en hvit firkant i stedet
                          for å blandes inn i kortfargen. */}
                      {focus.i === 3 && <CoinImprint hovered={hoveredCard === 3} />}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: focusOpen ? 1 : 0 }}
                        transition={{ duration: 0.25, delay: focusOpen ? 0.15 : 0 }}
                        style={{
                          position: "relative",
                          flex: "0 1 auto",
                          minHeight: 0,
                          overflowY: "auto",
                          padding: "22px 22px 16px",
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                        }}
                      >
                        <span style={{
                          position: "absolute", top: 10, right: 14,
                          fontFamily: "var(--font-ui)", fontSize: 22, lineHeight: 1,
                          opacity: 0.6,
                        }} aria-hidden>×</span>
                        <h3 style={{
                          fontFamily: "var(--font-hand)", fontWeight: 400,
                          fontSize: 32, lineHeight: 1.1, margin: 0,
                          color: fc.lightText ? "#fff" : "var(--color-text)",
                          paddingRight: 24,
                        }}>
                          {fc.kol.tittel}
                        </h3>
                        <p style={{
                          fontFamily: "var(--font-ui)", fontSize: 14, margin: 0,
                          letterSpacing: "0.04em", lineHeight: 1.4,
                          color: fc.lightText ? "rgba(255,255,255,0.75)" : "var(--color-text-mid)",
                        }}>
                          {fc.kol.innhold.split(/,\s*|\s·\s/).join(" · ")}
                        </p>
                        <p style={{
                          fontFamily: "var(--font-ui)", fontWeight: 300, fontStyle: "italic",
                          fontSize: 16, lineHeight: 1.45, margin: "4px 0 0",
                          color: fc.lightText ? "rgba(255,255,255,0.8)" : "var(--color-text-mid)",
                        }}>
                          {KORT_FRONT[focus.i].forklaring}
                        </p>
                        <p style={{
                          fontFamily: "var(--font-ui)", fontSize: 15.5, lineHeight: 1.55, margin: 0,
                          color: fc.lightText ? "rgba(255,255,255,0.9)" : "var(--color-text)",
                        }}>
                          {fc.kol.forklaring}
                        </p>
                      </motion.div>
                      {/* Scene UNDER teksten for ranken og skyen — over hele
                          kortet la de seg oppå teksten / skyen havnet i
                          kanten. Tar resten av høyden (minst 110px). */}
                      {(focus.i === 0 || focus.i === 1) && (
                        <div style={{ position: "relative", flex: "1 0 110px", pointerEvents: "none" }}>
                          {focus.i === 0 && (
                            <FrontendImprint
                              hovered={hoveredCard === 0}
                              style={{ width: "100%", height: "100%", opacity: 0.8 }}
                            />
                          )}
                          {focus.i === 1 && (
                            <ApiImprint
                              hovered={hoveredCard === 1}
                              style={{
                                top: "4%", right: "auto", left: "50%",
                                width: "auto", height: "88%",
                                transform: "translateX(-50%)",
                              }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
            </>,
            document.body
          )

          return <>{cardEls}{focusEl}</>;
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
            vh={vh}
            frameInset={frameInset}
          />
        </motion.div>

        {/* Scroll-indikator */}
        <motion.div
          style={{
            position: "absolute",
            bottom: frameInset + 60,
            // Fast 250px-forskyvning presser hintet forbi venstre rammelinje
            // på smale mobilskjermer — bruk en mindre, trygg avstand der.
            right: isMobile ? frameInset + 40 : frameInset + 250,
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
      {showUmbrella && <RainBackdrop opacity={umbrellaImgOp} y={fallShift} />}

      {/* Paraply — beveger seg med umbrellaY */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: umbrellaH + 100,
          y: umbrellaYShifted,
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
          y: fallShift,
          zIndex: 9999,
          opacity: kontaktInnholdOp,
          pointerEvents: kontaktActive ? "auto" : "none",
          display: "flex",
          // Uten paraply (mobil/nettbrett) sentrerte innholdet seg i HELE
          // viewporten, som kunne dytte toppen av kortet opp under/bak den
          // faste seksjonnavn-lappen ("Kontakt") i navigasjonen. Forankre
          // til toppen med nok padding til å klare den i stedet.
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: showUmbrella ? kontaktPadTop : frameInset + 56,
        }}
      >
        <KontaktInnhold
          isMobile={isMobile || !showUmbrella}
          frameInset={frameInset}
          vw={vw}
          // Uten paraply (mobil): plassen fra under seksjonnavnet ned til
          // rammens bunnkant — kortbunken sentreres i den.
          availH={showUmbrella ? kontaktAvailH : vh - (frameInset + 56) - frameInset - 16}
          visible={kontaktActive}
        />
      </motion.div>
    </div>
  );
}
