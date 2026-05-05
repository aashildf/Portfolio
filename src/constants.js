// ── Juster disse seks tallene for å flytte P-delene ─────────────────
export const TOPP = { x: 25,  y: 90  }
export const BUE  = { x: 110, y: 85  }
export const BUNN = { x: 7,   y: 155 }
// ────────────────────────────────────────────────────────────────────

export const W      = BUE.x + 177        // viewBox-bredde
export const H      = BUNN.y + 228 + 20  // viewBox-høyde

export const BUNN_W      = 99   // bredde på P_bunn-formen
export const FRAME_INSET = 100  // px fra viewport-kant til rammen
export const GAP         = 14   // px luft rundt P_bunn i bunnlinjen
export const TEXT_PAD    = 10   // px luft mellom linjestump og tekst
export const WORD_GAP    = 20   // px mellom høyre nav-ord
export const CORNER_LEAD = 22   // px fra hjørne til første/siste ord
export const FONT_SIZE   = 20   // px
