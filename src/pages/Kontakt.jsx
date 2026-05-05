



// 1. IMPORTS
// 2. COMPONENTS (små ting)
// 3. DATA + STYLE
// 4. MAIN UI (KontaktInnhold)
//    ├── mobile
//    ├── desktop
//    ├── kort 1
//    ├── kort 2
//    ├── kort 3
//    └── modal


// IMPORTER:
import { useState, useRef, useEffect } from 'react'
import { BASE } from '../utils/assetUrl'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'



// KOMPONENTER/FUNKSJONER:
// 1.function SlowVideo()
// 2.function Steam()
// 3.function TinySmile()
// 4.function MailIcon()
// 5.function PhoneIcon()
// 6.function GithubIcon()
// 7.function LinkedInIcon()

// 1.function slowVideo
function SlowVideo({ style }) {
  const ref = useRef(null)
  useEffect(() => { if (ref.current) ref.current.playbackRate = 0.5 }, [])
  return <video ref={ref} src={`${BASE}drawing_video.mp4`} autoPlay loop muted playsInline style={style} />
}

// 2.function Steam
function Steam() {
  return (
    <motion.div
      whileHover={{
        scale: 1.12,
        opacity: 1,
        y: -2,
      }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{
        display: "block",
        pointerEvents: "none",
        opacity: 0.75,
        // transformOrigin: "center bottom",
      }}
    >
      <svg
        viewBox="0 0 60 50"
        width="60"
        height="50"
        style={{ display: "block", overflow: "visible" }}
      >
        <style>{`
          @keyframes steam1 {
            0%   { transform: translate(0,0) scaleX(1); opacity: 0; }
            10%  { opacity: 0.9; }
            50%  { transform: translate(-3px,-18px) scaleX(1.2); }
            100% { transform: translate(4px,-48px) scaleX(1.4); opacity: 0; }
          }

          @keyframes steam2 {
            0%   { transform: translate(0,0) scaleX(1); opacity: 0; }
            10%  { opacity: 0.9; }
            50%  { transform: translate(3px,-20px) scaleX(0.9); }
            100% { transform: translate(-3px,-42px) scaleX(1.25); opacity: 0; }
          }

          @keyframes steam3 {
            0%   { transform: translate(0,0) scaleX(1); opacity: 0; }
            10%  { opacity: 0.8; }
            50%  { transform: translate(-2px,-22px) scaleX(1.15); }
            100% { transform: translate(2px,-46px) scaleX(1.35); opacity: 0; }
          }

          .s1 {
            animation: steam1 2.8s ease-in-out infinite;
            transform-origin: center bottom;
          }

          .s2 {
            animation: steam2 2.4s ease-in-out infinite 0.6s;
            transform-origin: center bottom;
          }

          .s3 {
            animation: steam3 3.2s ease-in-out infinite 1.2s;
            transform-origin: center bottom;
          }
        `}</style>

        {/* STEAM 1 */}

        {/* outline */}
        <g className="s1">
          <path
            d="M 18,48 C 16,42 22,38 20,32 C 18,26 14,24 16,18"
            fill="none"
            stroke="black"
            strokeWidth="0.5"
            strokeLinecap="square"
          />

          {/* mainline */}
          <path
            d="M 18,48 C 16,42 22,38 20,32 C 18,26 14,24 16,18"
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="2.0"
            strokeLinecap="round"
          />
        </g>

        {/* STEAM 2 */}

        {/* outline */}
        <g className="s2">
          <path
            d="M 30,48 C 32,42 26,37 28,31 C 30,25 34,22 32,16"
            fill="none"
            stroke="black"
            strokeWidth="0.5"
            strokeLinecap="square"
          />

          {/* mainline */}
          <path
            d="M 30,48 C 32,42 26,37 28,31 C 30,25 34,22 32,16"
            fill="none"
            stroke="rgba(240,240,240,0.5)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </g>

        {/* STEAM 3 */}

        {/* outline */}
        <g className="s3">
          <path
            d="M 44,48 C 42,43 46,39 44,33 C 42,27 38,25 40,19"
            fill="none"
            stroke="black"
            strokeWidth="0.5"
            strokeLinecap="square"
          />

          {/* mainline */}
          <path
            d="M 44,48 C 42,43 46,39 44,33 C 42,27 38,25 40,19"
            fill="none"
            stroke="rgba(230,230,230,0.45)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </motion.div>
  );
}

// 3.function TinySmile
function TinySmile() {
  return (
    <svg viewBox="0 0 20 17" width="20" height="17" style={{ display: "block" }}>
      <circle cx={6} cy={5.5} r={1.4} fill="rgba(55, 90, 160, 0.6)" />
      <circle cx={14} cy={5.8} r={1.2} fill="rgba(55, 90, 160, 0.6)" />
      <path
        d="M 5,11 C 6,16 15,15.5 16,11"
        fill="none"
        stroke="rgba(55, 90, 160, 0.6)"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  )
}

// 4. function MailIcon
// 5. function PhoneIcon
// 6. function GithubIcon
// 7. function LinkedInIcon

function MailIcon({ size = 18, color = "var(--color-navy)" })     { return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5" style={{ flexShrink:0, pointerEvents:"none" }}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> }
function PhoneIcon({ size = 18, color = "var(--color-navy)" })    { return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5" style={{ flexShrink:0, pointerEvents:"none" }}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg> }
function GithubIcon({ size = 18, color = "var(--color-navy)" })   { return <svg viewBox="0 0 24 24" width={size} height={size} fill={color} style={{ flexShrink:0, pointerEvents:"none" }}><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg> }
function LinkedInIcon({ size = 18, color = "var(--color-navy)" }) { return <svg viewBox="0 0 24 24" width={size} height={size} fill={color} style={{ flexShrink:0, pointerEvents:"none" }}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> }

// ------------------------------------
// REGN — hover-animasjon på kontaktkortet
// ------------------------------------

// ── Justering regndråper kontaktkort ──────────────────────────────
const RAIN_COUNT  = 52   // antall dråper
const CLOUD_TOP   = 87   // % fra toppen — hvor regnet starter
const CLOUD_LEFT  = 35   // % venstre kant av regnområdet
const CLOUD_WIDTH = 35   // % bredde på regnområdet
const FALL_PX     = 50   // piksler dråpene faller ned
const DROP_LEN    = 6   // piksler lang dråpe
// ──────────────────────────────────────────────

const RAIN_DROPS = Array.from({ length: RAIN_COUNT }, (_, i) => ({
  id:    i,
  left:  `${CLOUD_LEFT + (i / RAIN_COUNT) * CLOUD_WIDTH}%`,
  top:   `${CLOUD_TOP}%`,
  delay: (i * 0.06) % 0.9,
  dur:   0.38 + (i % 4) * 0.07,
}))

function RainOverlay({ active }) {
  return (
    <AnimatePresence>
      {active && RAIN_DROPS.map(d => (
        <motion.div
          key={d.id}
          initial={{ y: 0, opacity: 0.85 }}
          animate={{ y: FALL_PX, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, repeatDelay: 0.05, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            left: d.left,
            top: d.top,
            width: 1.5,
            height: DROP_LEN,
            background: 'rgba(18, 12, 4, 0.70)',
            transform: 'rotate(18deg)',
            borderRadius: 1,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      ))}
    </AnimatePresence>
  )
}

function TapeStripe({ onClick }) {
  const [hovered, setHovered] = useState(false)
  const [nudge, setNudge]     = useState(false)

  useEffect(() => {
    let timeout
    const schedule = () => {
      const delay = 4000 + Math.random() * 6000
      timeout = setTimeout(() => {
        setNudge(true)
        setTimeout(() => setNudge(false), 600)
        schedule()
      }, delay)
    }
    schedule()
    return () => clearTimeout(timeout)
  }, [])

  const active = hovered || nudge
  return (
    <div
      onClick={onClick}
      role="button"
      className="native-cursor"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        top: "clamp(0px, 0.8vw, 10px)",
        left: "-70px",
        width: "clamp(160px, 19vw, 210px)",
        padding: "clamp(16px, 0.45vw, 20px) 0",
        background: active ? "rgba(210, 120, 100, 0.48)" : "rgba(210, 120, 100, 0.28)",
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
        transform: active ? "rotate(-45deg) scale(1.04)" : "rotate(-45deg) scale(1)",
        transformOrigin: "center center",
        textAlign: "center",
        zIndex: 5,
        cursor: "pointer",
        userSelect: "none",
        transition: "background 0.25s ease, transform 0.25s ease",
      }}
    >
      <span style={{
        fontFamily: "'Caveat', cursive",
        fontSize: "clamp(16px, 0.92vw, 18px)",
        color: "rgba(18, 12, 4, 0.85)",
        letterSpacing: "0.07em",
        fontWeight: 400,
        whiteSpace: "nowrap",
      }}>
        Save it for a rainy day
      </span>
    </div>
  )
}

// ------------------------------------
// MODAL - POPUP-LAG visittkort
// ------------------------------------

function VisittkortModal({ onClose }) {
  const INK = 'rgba(30, 30, 30, 0.8)'
  

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}
    >
      {/*  selve visittkortet */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(88vw, 500px)",
          aspectRatio: "1.75",
          borderRadius: 2,
          boxShadow: `
  10px 10px 30px rgba(0,0,0,0.5),
  
`,
          overflow: "hidden",
          backgroundImage: `url(${BASE}watercolor-paper-texture.jpg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "contrast(1.08) saturate(0.85) brightness(1.02)",
          flexShrink: 0,
        }}
      >
        {/* -------------------cutout-Å--------------------- */}

        {/* cutout-skyggen til -å-en */}
        <div
          style={{
            position: "absolute",
            top: "-6%",
            right: "8%",
            // top: "-6%",
            // left: "6%",
            fontFamily: "'Lemonada', cursive",
            fontWeight: 700,
            fontSize: "clamp(110px, 28vw, 195px)",
            lineHeight: 2,
            color: "transparent",
            WebkitTextStroke: "1px rgba(0,0,0,0.25)",
            textShadow: `
  0 1px 0 rgba(255,255,255,0.5),   
  0 -1.5px 1px rgba(0,0,0,0.22),   
  0 3px 4px rgba(0,0,0,0.12)       
`,
            opacity: 0.9,
            pointerEvents: "none",
          }}
        >
          Å
        </div>

        {/* Cutout Å — Bergen vises gjennom bokstaven */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "-6%",
            right: "8%",
            fontFamily: "'Lemonada', cursive",
            fontWeight: 700,
            fontSize: "clamp(110px, 28vw, 195px)",
            lineHeight: 2,
            backgroundImage: `url(${BASE}bergen.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "40% 30%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            userSelect: "none",
            pointerEvents: "none",
            opacity: 0.92,
          }}
        >
          Å
        </div>

        {/* tekstblokk - visittkort 
     -----------------------------------------  */}

        {/* Kontaktinfo — venstre side */}
        <div
          style={{
            position: "absolute",
            left: "clamp(40px, 15%, 45px)",
            top: "clamp(50px, 5%, 60px)",
            bottom: "clamp(50px, 5%, 60px)",

            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",

            maxWidth: "55%",
          }}
        >
          {/* Navn + tittel */}
          <div>
            <div
              style={{
                fontFamily: "'Courier Prime', monospace",
                fontSize: "clamp(18px, 3.2vw, 20px)",
                fontWeight: 400,
                letterSpacing: "0.02em",
                color: INK,
                lineHeight: 1.2,
              }}
            >
              Åshild Færøy
            </div>
            <div
              style={{
                fontFamily: "'Courier Prime', 'Courier New', monospace",
                fontSize: "clamp(8px, 1.6vw, 10px)",
                color: "rgba(30, 30, 30, 0.55)",

                letterSpacing: "0.12em",
                marginTop: 4,
              }}
            >
              junior frontend-utvikler
            </div>
          </div>

          {/* Skillelinje */}
          <div
            style={{
              height: 1,
              background: "rgba(30,30,30,0.18)",
              marginLeft: "auto",
              width: "50%",
              transform: "translateX(-4px)",
              marginLeft: 0,
            }}
          />

          {/* Kontaktlinjer */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {KONTAKT_INFO.filter(({ label }) => label !== 'LinkedIn').map(({ label }) => (
              <div
                key={label}
                style={{
                  fontFamily: "'Courier Prime', 'Courier New', monospace",
                  fontSize: "clamp(9px, 1.5vw, 11px)",
                  color: INK,
                  letterSpacing: "0.08em",
                  color: "rgba(30,30,30,0.75)",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Knapperad under kortet */}

      <div style={{ display: "flex", gap: 15, marginTop: 10 }}>
        {/* Lagre-knapp */}
        <button
          onClick={() => alert("Lagrer kontakt...")} // ...legge inn lagre-funksjon
          style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: 12, 
            background: "rgba(255,255,255,0.8)",
            color: "INK",
            border: "none",
            padding: "6px 18px",
            borderRadius: 1,
            cursor: "pointer",
            letterSpacing: "0.05em",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.opacity = 0.8)}
          onMouseLeave={(e) => (e.target.style.opacity = 1)}
        >
          Lagre kontakt
        </button>

        {/* Lukk-knapp */}
        <button
          onClick={onClose}
          style={{
            fontFamily: "'Courier Prime', monospace",
            fontSize: 12,
            background: INK,
            color: "white",
            border: "1px solid rgba(255,255,255,0.3)",
            padding: "6px 18px",
            borderRadius: 1,
            cursor: "pointer",
            letterSpacing: "0.05em",
          }}
        >
          Lukk
        </button>
      </div>
    </div>,
    document.body,
  );
}



// --------------------------------------------
//    DATA - const KONTAKT_INFO = [...]
// ---------------------------------------------

const KONTAKT_INFO = [
  { label: 'faaas0825@gmail.com',    href: 'mailto:faaas0825@gmail.com',              Icon: MailIcon,     icon: '/mail_icon.jpg' },
  { label: '41 52 49 84',            href: null,                                       Icon: PhoneIcon,    icon: '/phone_icon.jpg' },
  { label: 'github.com/aashildf',    href: 'https://github.com/aashildf',             Icon: GithubIcon,   icon: '/githuc_icon.jpg' },
  { label: 'LinkedIn',               href: 'https://www.linkedin.com/in/%C3%A5shild-f%C3%A6r%C3%B8y-855595108/', Icon: LinkedInIcon, icon: '/linkedin_icon.jpg' },
]

// --------------------------------------
// DESIGN CONSTANTS (styling system)
// -------------------------------------


const MAIL_HREF = 'mailto:faaas0825@gmail.com'

const kortBase = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  background: "#fff",
  textDecoration: "none",

};
// etikett= skriften nederst på polaroid-kortene
const etikett = {
  textAlign: "center",
  paddingTop: 14,
  fontFamily: "var(--font-hand)",
  fontWeight: 400,
  fontSize: "clamp(18px, 2.2vw, 22px)",
  whiteSpace: "nowrap",
  color: "var(--color-text)",
  lineHeight: 1.2,
};

const CARD_PAD = "clamp(28px, 2.4vw, 44px)";
const CARD_W = "clamp(260px, 32vw, 420px)";
const INNER_OUTLINE = "1px solid rgba(0,0,0,0.12)"

const MONO      = "'Courier Prime', 'Courier New', monospace"



// -----------------------------------
// HOVEDKOMPONENT:

// *State + logikk: 
// const [showVisittkort, setShowVisittkort] = useState(false)


// *Layout-beregninger: 
// const cardWpx = ...
// const safeRight = ...
// const cupRight = ...


// *Mobil versjon:
// if (isMobile) { return (...) }


// *Desctop layout:
// return <div> kort1, kort2, kort3


// *Kortene:
// 1. kontaktinfo
// 2.video
// 3.kaffekopp og damp

// -----------------------------------


// 1.kontaktinfo
export function KontaktInnhold({ isMobile }) {
  const [showVisittkort, setShowVisittkort] = useState(false)
  const [raining, setRaining] = useState(isMobile)

  //  høyre-offset for kopp-kort, slik at det ikke går utenfor rammen

  if (isMobile) {
    const INK = "rgba(18, 12, 4, 0.92)"
    const MOB_W = "min(260px, 82vw)"
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "0 16px", transform: "translateY(-16px)" }}>

        {/* Mobil kontaktkort */}
        <div className="pcrd pcrd-instax native-cursor"
          style={{ ...kortBase, padding: "20px 20px 46px", width: MOB_W }}
        >
          <div style={{ position: "relative", aspectRatio: "5/4" }}>
            <RainOverlay active={true} />
            <img src={`${BASE}kontakt_bg.png`} alt=""
              style={{
                position: "absolute",
                top: "-38px", left: "-38px", right: "-38px", bottom: "-28px",
                width: "calc(100% + 76px)", height: "calc(100% + 66px)",
                objectFit: "contain", display: "block",
                transform: "translateY(20px)",
              }} />
            <div style={{ position: "absolute", inset: 0, zIndex: 1, display: "flex", flexDirection: "column",
              justifyContent: "flex-start", padding: "16px 18px", gap: 6 }}>
              {KONTAKT_INFO.map(({ label, href, Icon }) => {
                const inner = (
                  <div className="kontakt-rad native-cursor" style={{ display: "flex", alignItems: "center", gap: 7, padding: "1px 4px" }}>
                    <Icon size={12} color={INK} />
                    <span style={{ fontFamily: "var(--font-hand)", fontSize: 13, color: INK,
                      fontWeight: 400, letterSpacing: "0.02em", lineHeight: 1.2 }}>{label}</span>
                  </div>
                )
                return href ? (
                  <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none", position: "relative", zIndex: 2 }}>
                    {inner}
                  </a>
                ) : <div key={label}>{inner}</div>
              })}
            </div>
          </div>
        </div>

        {/* Mobil videokort — samme bredde som kontaktkortet */}
        <div className="pcrd pcrd-instax" style={{ ...kortBase, padding: "20px", width: MOB_W }}>
          <div style={{ aspectRatio: "5/4", overflow: "hidden", position: "relative", outline: "1px solid #D9D8D3" }}>
            <SlowVideo style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", display: "block",
              transform: "scale(1.58) translateY(11%)", transformOrigin: "center center" }} />
          </div>
          <div style={{ ...etikett, paddingTop: 10 }}>Åshild Færøy</div>
        </div>

        {/* Mobil koppekort — liten, nederst */}
        <a
          href={MAIL_HREF}
          className="pcrd pcrd-instax"
          style={{ ...kortBase, padding: "14px 14px 14px", width: "min(148px, 40vw)", textDecoration: "none", transform: "rotate(2deg)" }}
        >
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", bottom: "100%", left: 0, right: 0, display: "flex",
              justifyContent: "center", transform: "translateY(66px)", opacity: 0.95, pointerEvents: "none" }}>
              <Steam />
            </div>
            <div style={{ overflow: "hidden" }}>
              <img src={`${BASE}kaffekopp.jpg`} alt="Kaffekopp"
                style={{ width: "100%", height: "auto", display: "block" }} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center",
            justifyContent: "center", paddingTop: 10, gap: 10 }}>
            <div style={{ fontFamily: "var(--font-hand)", fontWeight: 400, fontSize: 15,
              color: "var(--color-text)", textAlign: "left", lineHeight: 1.35 }}>
              Ta gjerne kontakt<br />for en prat!
            </div>
            <TinySmile />
          </div>
        </a>
      </div>
    )
  }


  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: "clamp(32px, 4.5vw, 60px)",
        paddingTop: 30,
        paddingBottom: "clamp(140px, 16vw, 220px)",
      }}
    >
      {showVisittkort && (
        <VisittkortModal onClose={() => setShowVisittkort(false)} />
      )}

      {/* Kort 1 — kontaktinfo/tekst  (venstre) */}
      <div
        className="pcrd pcrd-instax native-cursor"
        style={{
          ...kortBase,
          padding: CARD_PAD,
          paddingBottom: `calc(${CARD_PAD} + 38px)`,
          width: CARD_W,
          flexShrink: 0,
        }}
        onMouseEnter={() => setRaining(true)}
        onMouseLeave={() => setRaining(false)}
      >
        {/* Fotoflate — bildet blør ut over den indre rammen på alle kanter */}
        <div style={{ position: "relative", aspectRatio: "5 / 4" }}>
          <RainOverlay active={raining} />
          <img
            src={`${BASE}kontakt_bg.png`}
            alt=""
            style={{
              position: "absolute",
              top: "clamp(-48px, -3vw, -40px)",
              left: "clamp(-48px, -3vw, -40px)",
              right: "clamp(-48px, -3vw, -40px)",
              bottom: "clamp(-36px, -2.25vw, -30px)",
              width: "calc(100% + clamp(80px, 6vw, 96px))",
              height: "calc(100% + clamp(70px, 5.25vw, 84px))",
              objectFit: "contain",
              transform: "translateY(15px)",
            }}
          />

          {/* Kontaktinfo som svart penn */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            padding: "clamp(14px, 2vw, 26px)",
            paddingTop: "clamp(10px, 4vw, 2px)",
            gap: "clamp(5px, 0.65vw, 10px)",
          }}>
            {KONTAKT_INFO.map(({ label, href, Icon }) => {
              const INK = "rgba(18, 12, 4, 0.92)"
              const row = (
                <div className="kontakt-rad" style={{ display: "flex", alignItems: "center", gap: 7, padding: "1px 4px" }}>
                  <Icon size={15} color={INK} />
                  <span style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: "clamp(14px, 1.6vw, 19px)",
                    color: INK,
                    letterSpacing: "0.02em",
                    lineHeight: 1.25,
                    fontWeight: 400,
                  }}>
                    {label}
                  </span>
                </div>
              )
              return href ? (
                <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                  {row}
                </a>
              ) : <div key={label}>{row}</div>
            })}

          </div>
        </div>

        {/* Tape-stripe — øvre venstre hjørne */}
        <TapeStripe onClick={() => setShowVisittkort(true)} />
      </div>

      {/* Kort 2 — video */}
      <div
        className="pcrd pcrd-instax"
        style={{
          ...kortBase,
          padding: CARD_PAD,
          width: CARD_W,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            aspectRatio: "5/4",
            overflow: "hidden",
            position: "relative",
            outline: "1px solid #D9D8D3",
          }}
        >
          <SlowVideo
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transform: "scale(1.58) translateY(11%)",
              transformOrigin: "center center",
            }}
          />
        </div>
        <div style={{ ...etikett, width: "100%" }}>Åshild Færøy</div>
      </div>
    </div>
  );
}
