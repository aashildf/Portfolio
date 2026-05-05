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
    github: "https://aashildf.github.io/my-portfolio-api-site",
    sirkel: "#8FA09F",
  },
  {
    id: 2,
    tittel: "Colorbook",
    beskrivelse:
      "Interaktiv fargeleggingsapp for barn.\n Designet i Figma, bygget med React.",
    bilde: imgColorbook,
    github: "https://aashildf.github.io/Fargevelger/",
    sirkel: "#AFD0B8",
  },
  {
    id: 3,
    tittel: "Gutendex",
    beskrivelse:
      "Utforske og les klassisk litteratur. Velg blant tusenvis av bøker via Gutendex API.",
    bilde: imgGutendex,
    github: "https://aashildf.github.io/Gutenberg_booksearch",
    sirkel: "#453925",
  },
  {
    id: 4,
    tittel: "Playloop",
    beskrivelse:
      "En retro spillportal  bygget med React, Tailwind og Framer Motion.",
    bilde: imgPlayloop,
    github: "https://aashildf.github.io/PlayLoop/",
    sirkel: "#683E99",
  },
  {
    id: 6,
    tittel: "Bergen Værapp",
    beskrivelse:
      "Værapp for Bergen, med daglig prognose og illustrasjoner. MET Norway Weather API",
    bilde: imgVærapp,
    github: "https://aashildf.github.io/Weather-app/",
    sirkel: "#8B9FA8",
  },
];

export default prosjekter
