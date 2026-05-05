import { motion } from 'framer-motion'

// Umbrella spike position as fractions of SVG viewBox (18196×14829)
// spike ≈ (9348, 1851)
const SPIKE_XF = 9348  / 18196   // ≈ 0.514
const SPIKE_YF = 1851  / 14829   // ≈ 0.125

// Spike tips — where water collects most.
// Coordinates estimated from blue_umbrella.svg path data.
// spoke:true → larger & more frequent drips

// ➤ For å flytte dråpen inn mot midten
// → ØK xf

// ➤ For å flytte dråpen nedover
// → ØK yf

// ➤ For å flytte dråpen oppover
// → SENK yf
const RIM_DRIPS = [
  // Venstre spiss (spoke tip — to dråper fra samme punkt, forskjellig takt)
  { xf: 0.261, yf: 0.435, dur: 2.2, del: 0.00, spoke: true  },
  { xf: 0.261, yf: 0.435, dur: 3.4, del: 1.30, spoke: false },

  // Venstre kant
  { xf: 0.268, yf: 0.436, dur: 2.8, del: 2.60, spoke: false },
  { xf: 0.282, yf: 0.435, dur: 1.8, del: 0.80, spoke: true  },
  { xf: 0.287, yf: 0.436, dur: 3.0, del: 2.10, spoke: false },

  // Venstre 1. bue
  { xf: 0.294, yf: 0.434, dur: 2.4, del: 0.40, spoke: true  },
  { xf: 0.298, yf: 0.437, dur: 1.6, del: 1.80, spoke: false },
  { xf: 0.31,  yf: 0.495, dur: 2.9, del: 3.10, spoke: true  },

  // Fyll venstre-midten
  { xf: 0.335, yf: 0.465, dur: 1.7, del: 0.90, spoke: false },
  { xf: 0.348, yf: 0.472, dur: 2.5, del: 2.40, spoke: true  },

  // Venstre 2. bue
  { xf: 0.373, yf: 0.490, dur: 2.0, del: 0.20, spoke: false },
  { xf: 0.374, yf: 0.485, dur: 1.5, del: 1.60, spoke: true  },
  { xf: 0.382, yf: 0.495, dur: 2.7, del: 3.00, spoke: true  },

  // Midten venstre
  { xf: 0.46,  yf: 0.519, dur: 1.9, del: 1.10, spoke: true  },
  { xf: 0.47,  yf: 0.521, dur: 2.6, del: 0.50, spoke: true  },
  { xf: 0.47,  yf: 0.520, dur: 1.4, del: 2.80, spoke: false },
  { xf: 0.48,  yf: 0.500, dur: 2.1, del: 0.00, spoke: true  },

  // Midten 3. bue
  { xf: 0.500, yf: 0.514, dur: 2.5, del: 1.70, spoke: false },
  { xf: 0.52,  yf: 0.515, dur: 1.7, del: 0.30, spoke: true  },
  { xf: 0.53,  yf: 0.522, dur: 3.0, del: 2.20, spoke: true  },
  { xf: 0.54,  yf: 0.520, dur: 1.8, del: 0.70, spoke: false },
  { xf: 0.545, yf: 0.528, dur: 2.4, del: 3.30, spoke: false },
  { xf: 0.56,  yf: 0.527, dur: 1.5, del: 1.40, spoke: true  },
  { xf: 0.575, yf: 0.538, dur: 2.2, del: 2.70, spoke: true  },
  { xf: 0.58,  yf: 0.540, dur: 1.9, del: 0.10, spoke: false },
  { xf: 0.585, yf: 0.542, dur: 2.8, del: 1.90, spoke: false },

  // 4. bue fra venstre
  { xf: 0.628, yf: 0.536, dur: 2.3, del: 0.60, spoke: false },
  { xf: 0.628, yf: 0.525, dur: 1.6, del: 2.00, spoke: true  },
  { xf: 0.63,  yf: 0.526, dur: 3.1, del: 1.20, spoke: false },
  { xf: 0.655, yf: 0.515, dur: 1.8, del: 2.80, spoke: false },
  { xf: 0.662, yf: 0.512, dur: 2.5, del: 0.40, spoke: true  },
  { xf: 0.67,  yf: 0.506, dur: 1.4, del: 3.20, spoke: true  },
  { xf: 0.68,  yf: 0.507, dur: 2.0, del: 1.00, spoke: false },

  // Høyre spiss (to dråper fra samme punkt, forskjellig takt)
  { xf: 0.72,  yf: 0.540, dur: 1.9, del: 2.40, spoke: true  },
  { xf: 0.72,  yf: 0.540, dur: 3.0, del: 0.80, spoke: false },

  // Høyre kant
  { xf: 0.73,  yf: 0.470, dur: 2.2, del: 1.60, spoke: false },
  { xf: 0.738, yf: 0.490, dur: 1.6, del: 3.10, spoke: false },
  { xf: 0.74,  yf: 0.480, dur: 2.7, del: 0.30, spoke: true  },
];
// ➤ For å flytte dråpen inn mot midten
// → ØK xf

// ➤ For å flytte dråpen nedover
// → ØK yf

// ➤ For å flytte dråpen oppover
// → SENK yf


// Rain drops matching canvas raindrops.js:
//   speed = (2–4) * 3 px/frame @ 60fps = 360–720 px/s
//   → duration for ~900px viewport = 1.25–2.5s
const DROPS = Array.from({ length: 42 }, (_, i) => ({
  x:   +((i * 2.39 + 1.8) % 100).toFixed(1),
  del: +((i * 0.17) % 2.8).toFixed(2),
  dur: +(1.25 + (i * 0.13) % 1.25).toFixed(2),
  rx:  +(0.4  + (i * 0.07) % 0.8).toFixed(1),
  ry:  +(1.4  + (i * 0.20) % 2.2).toFixed(1),
  // Ripple lands at a random y within the bottom 25% of the screen
  landY: +(75 + (i * 3.71 + 2.3) % 23).toFixed(1),
}))

const RAIN_CSS = `
@keyframes rf {
  from { transform: translateY(-20px); }
  to   { transform: translateY(110vh); }
}
@keyframes rp {
  0%   { transform: scale(0.1);  opacity: 0.9; }
  35%  { transform: scale(1);    opacity: 0.5; }
  100% { transform: scale(1.4);  opacity: 0;   }
}
`

/** Fixed rain backdrop — does NOT move with the umbrella */
export function RainBackdrop({ opacity }) {
  return (
    <motion.div style={{
      position: "fixed", inset: 0,
      zIndex: 9997,
      pointerEvents: "none",
      opacity,
    }}>
      <svg width="100%" height="100%" style={{ display: "block", overflow: "visible" }}>
        <style>{RAIN_CSS}</style>

        {/* Falling drops */}
        {DROPS.map((d, i) => (
          <ellipse
            key={i}
            cx={`${d.x}%`}
            cy={0}
            rx={d.rx}
            ry={d.ry}
            fill="rgba(219, 226, 242, 0.8)"
            stroke="rgba(177, 191, 218, 0.9)"
            strokeWidth="0.6"
            style={{
              transformBox: "fill-box",
              transformOrigin: "center top",
              animation: `rf ${d.dur}s linear ${d.del}s infinite`,
            }}
          />
        ))}

        {/* Ripples — spredt over bunnen, dråpen lander ved sin individuelle landY */}
        {DROPS.map((d, i) => {
          // Dråpen faller fra -20px til 110vh — totalt 110vh + 20px ≈ 110vh
          // landY er i %, regnet fra toppen av viewporten
          // Andelen av reisen: (landY - 0) / 110 (siden vi bruker vh og dråpen starter ca. ved 0)
          const fraction = (d.landY) / 110
          const rippleDel = +(d.del + d.dur * fraction).toFixed(2)
          return (
            <ellipse
              key={`r${i}`}
              cx={`${d.x}%`}
              cy={`${d.landY}%`}
              rx={20}
              ry={4}
              fill="none"
              stroke="rgba(177, 191, 218, 0.80)"
              strokeWidth="1.1"
              style={{
                transformBox: "fill-box",
                transformOrigin: "center center",
                animation: `rp ${+(d.dur * 0.85).toFixed(2)}s ease-out ${rippleDel}s infinite`,
              }}
            />
          )
        })}
      </svg>
    </motion.div>
  )
}

/**
 * Canopy drips — placed INSIDE the umbrella's motion.div so they inherit
 * its y-transform. Each drip slides down the spoke toward the tip, forms
 * a hanging bead, then falls. Spoke tips get larger, more frequent drops.
 */
export function RimDrips({ umbrellaLeft, umbrellaW, umbrellaH, opacity }) {
  // Generate per-drip keyframes so each drip slides along its own spoke
  const drips = RIM_DRIPS.map(({ xf, yf, dur, del, spoke }, i) => {
    const tipX = umbrellaLeft + xf * umbrellaW
    const tipY = yf * umbrellaH

    // Offset from spoke start (~80% from spike toward tip) to tip
    const T = 0.80
    const dx = Math.round((SPIKE_XF + T * (xf - SPIKE_XF) - xf) * umbrellaW)
    const dy = Math.round((SPIKE_YF + T * (yf - SPIKE_YF) - yf) * umbrellaH)

    const rx    = spoke ? 1.4 : 1.0
    const ry    = spoke ? 3.2 : 2.2
    const fall  = spoke ? 38  : 28

    return { tipX, tipY, dx, dy, rx, ry, fall, dur, del, i }
  })

  const css = drips.map(({ dx, dy, fall, i }) => `
    @keyframes sd${i} {
      0%   { transform: translate(${dx}px, ${dy}px) scaleY(0.5); opacity: 0;   }
      20%  { opacity: 1; }
      55%  { transform: translate(0px, 0px)         scaleY(1.4); opacity: 1;   }
      75%  { transform: translate(0px, 3px)         scaleY(1.6); opacity: 0.9; }
      100% { transform: translate(0px, ${fall}px)   scaleY(0.9); opacity: 0;   }
    }
  `).join('')

  return (
    <motion.svg
      style={{
        position: "absolute", top: 0, left: 0,
        width: "100%", height: "100%",
        overflow: "visible",
        zIndex: 2,
        opacity,
      }}
    >
      <style>{css}</style>
      {drips.map(({ tipX, tipY, rx, ry, dur, del, i }) => (
        <ellipse
          key={i}
          cx={tipX}
          cy={tipY}
          rx={rx}
          ry={ry}
          fill="rgba(219, 226, 242, 0.85)"
          stroke="rgba(177, 191, 218, 0.9)"
          strokeWidth="0.7"
          style={{
            transformBox: "fill-box",
            transformOrigin: "50% 0%",
            animation: `sd${i} ${dur}s ease-in ${del}s infinite`,
          }}
        />
      ))}
    </motion.svg>
  )
}
