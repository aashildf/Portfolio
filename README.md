# Portfolio 2026 — Åshild Færøy




![Portfolio 2026 screenshot](./public/skjermbilde.png)

Personlig porteføljenettsted som viser hvordan jeg jobber med frontend, UI-design og visuelle brukeropplevelser gjennom egne prosjekter.


## Teknologi

- **React 19** — komponentbasert UI
- **Framer Motion 12** — scroll-drevne animasjoner og overganger
- **Vite 8** — byggesystem og utviklingsserver
- **CSS** — custom design tokens, scroll-snap, CSS-animasjoner

## Struktur

```
src/
  components/
    Layout.jsx          # Fast SVG-ramme og navigasjon
    IntroAnimasjon.jsx  # Alle scroll-animasjoner og seksjonsoverganger
    CustomCursor.jsx    # Egendefinert sky-peker
    Regn.jsx            # Regn- og dråpeanimasjon (kontakt-overgang)
    Fox.jsx             # Reveillustrasjon (ferdigheter)
  pages/
    Home.jsx            # Hjemside med P-logo
    OmMeg.jsx           # Om meg-seksjon
    Ferdigheter.jsx     # Skill-kort med flip-animasjon
    Prosjekter.jsx      # Prosjektkort-grid
    Kontakt.jsx         # Kontaktside med paraply-animasjon
  tokens.css            # Design tokens (farger, typografi, spacing)
  index.css             # Globale stiler
assets/
  svg/                  # SVG-illustrasjoner (paraply, P-logo m.m.)
  bilder/               # Bilder brukt i animasjoner
public/                 # Statiske filer (bilder, video, ikoner)
```

## Sider

Siden er én lang scrollside med fem seksjoner som animeres inn basert på scroll-posisjon:

| Seksjon | Scroll-posisjon |
|---|---|
| Hjem | 0 |
| Om meg | ~100vh |
| Ferdigheter | ~258vh |
| Prosjekter | ~335vh |
| Kontakt | ~460vh |

JavaScript-basert scroll-snap sørger for at siden alltid lander på en seksjon.

## Kom i gang

```bash
npm install
npm run dev
```



## Bygg

```bash
npm run build
npm run preview
```
