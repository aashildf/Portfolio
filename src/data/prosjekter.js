import imgApi         from '../../assets/bilder/prosjektbilder/api_screens.jpg'
import imgColorbook   from '../../assets/bilder/prosjektbilder/fargelegging_skjermbilde.jpg'
import imgGutendex    from '../../assets/bilder/prosjektbilder/gutendex_screens.jpg'
import imgPlayloop    from '../../assets/bilder/prosjektbilder/playloop_screens.jpg'
import imgVærapp      from '../../assets/bilder/prosjektbilder/weather_screens.jpg'

const prosjekter = [
  {
    id: 1,
    tittel: "API-Studio",
    beskrivelse:
      "Oversikt over alle norske offentlige API-er med søk og kategorier, bygget med React.",
    bilde: imgApi,
    demo: "https://aashildf.github.io/my-portfolio-api-site",
    repo: "https://github.com/aashildf/my-portfolio-api-site",
    sirkel: "#8FA09F",
  },
  {
    id: 2,
    tittel: "Colorbook",
    beskrivelse:
      "Fargeleggingsapp bygget med React, med håndtegnet illustrasjon og fargepalett inspirert av klassisk animasjonsfilm.",
    bilde: imgColorbook,
    demo: "https://aashildf.github.io/Fargevelger/",
    repo: "https://github.com/aashildf/Fargevelger",
    sirkel: "#AFD0B8",
  },
  {
    id: 3,
    tittel: "Gutendex",
    beskrivelse:
      "Webapplikasjon for å utforske, søke og lagre klassisk litteratur fra Project Gutenberg. Dynamisk bibliotek som henter tusenvis av bøker i sanntid via Gutendex API.",
    bilde: imgGutendex,
    demo: "https://aashildf.github.io/Gutenberg_booksearch",
    repo: "https://github.com/aashildf/Gutenberg_booksearch",
    sirkel: "#453925",
  },
  {
    id: 4,
    tittel: "Playloop",
    beskrivelse:
      "En interaktiv spillportal inspirert av retro spillestetikk og arkadekultur. Bygget med React, Tailwind og Framer Motion.",
    bilde: imgPlayloop,
    demo: "https://aashildf.github.io/PlayLoop/",
    repo: "https://github.com/aashildf/PlayLoop",
    sirkel: "#683E99",
  },
  {
    id: 6,
    tittel: "Bergen Værapp",
    beskrivelse:
      "Lokal værapp med dynamiske illustrasjoner og 7-dagers prognose. Bygget med React og OpenWeatherMap API.",
    bilde: imgVærapp,
    demo: "https://aashildf.github.io/Weather-app/",
    repo: "https://github.com/aashildf/Weather-app",
    sirkel: "#8B9FA8",
  },
];

export default prosjekter
