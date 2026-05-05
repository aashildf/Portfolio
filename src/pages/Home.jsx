import { TOPP, BUE, BUNN, W, H } from '../constants'
import { BASE } from '../utils/assetUrl'

const PATH_TOPP = "M78.9287 0C91.0222 8.69869e-05 99.487 4.63714 104.325 13.9102L76.4785 185.424L0 28.6953C28.8126 9.56538 55.1222 0 78.9287 0Z"
const PATH_BUE  = "M88.1621 0C106.366 0 122.064 4.46591 135.255 13.3975C148.71 22.3292 158.868 34.1427 165.728 48.8369C172.851 63.5309 176.412 79.5215 176.412 96.8086C176.412 118.13 171.531 138.587 161.77 158.179C152.008 177.482 137.102 193.329 117.052 205.718C97.2648 218.107 72.9923 224.302 44.2354 224.302C32.8911 224.302 22.9979 223.293 14.5557 221.276C11.9503 220.542 9.3057 219.659 6.62012 218.632L0 215.37L7.2666 168.264L12.6934 169.519L12.707 169.458C16.1836 170.004 19.7018 170.279 23.2617 170.279C35.3975 170.279 46.346 167.398 56.1074 161.636C66.1328 155.873 73.9157 147.806 79.4561 137.434C85.2602 127.061 88.1621 115.537 88.1621 102.859C88.1621 89.6059 84.6007 78.3692 77.4775 69.1494C70.6182 59.9297 60.8568 55.3194 48.1934 55.3193C42.6998 55.3193 37.1431 56.3622 31.5225 58.4443L23.8779 60.6055L31.3213 12.375C37.4074 9.33111 44.0862 6.79031 51.3584 4.75391C61.9113 1.58462 74.1795 2.88222e-05 88.1621 0Z"
const PATH_BUNN = "M88.5742 132.48C86.9504 144.242 86.1367 152.963 86.1367 158.643C86.1367 171.023 86.9342 180.982 88.5293 188.518C90.3903 196.054 93.5811 202.917 98.1006 209.107C82.9469 221.219 66.4636 227.275 48.6514 227.275C31.6367 227.275 19.2742 222.969 11.5645 214.356C3.85466 205.744 0 191.882 0 172.772C5.91653e-06 160.93 1.5949 143.166 4.78516 119.48C8.16873 96.2924 14.7374 56.4656 24.4912 0L88.5742 132.48Z"

// Litt overstyrt bildestørrelse så kantene ikke vises under zoom
const PAD = 0.08
const IX = -W * PAD
const IY = -H * PAD
const IW =  W * (1 + PAD * 2)
const IH =  H * (1 + PAD * 2)

export default function Home({ idSuffix = '' }) {
  return (
    <svg
      className="p-svg"
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Portfolio – velg prosjekt"
      overflow="visible"
    >
      <defs>
        <pattern
          id={`bg-topp${idSuffix}`}
          patternUnits="userSpaceOnUse"
          x={-TOPP.x}
          y={-TOPP.y}
          width={W}
          height={H}
        >
          <image
            className="ken-burns"
            href={`${BASE}bergen.jpg`}
            x={IX}
            y={IY}
            width={IW}
            height={IH}
            preserveAspectRatio="xMidYMid slice"
          />
        </pattern>
        <pattern
          id={`bg-bue${idSuffix}`}
          patternUnits="userSpaceOnUse"
          x={-BUE.x}
          y={-BUE.y}
          width={W}
          height={H}
        >
          <image
            className="ken-burns"
            href={`${BASE}bergen.jpg`}
            x={IX}
            y={IY}
            width={IW}
            height={IH}
            preserveAspectRatio="xMidYMid slice"
          />
        </pattern>
        <pattern
          id={`bg-bunn${idSuffix}`}
          patternUnits="userSpaceOnUse"
          x={-BUNN.x}
          y={-BUNN.y}
          width={W}
          height={H}
        >
          <image
            className="ken-burns"
            href={`${BASE}bergen.jpg`}
            x={IX}
            y={IY}
            width={IW}
            height={IH}
            preserveAspectRatio="xMidYMid slice"
          />
        </pattern>
      </defs>

      {/* toppen av p */}

      <g transform={`translate(${TOPP.x},${TOPP.y})`}>
        <a
          href="/prosjekt1"
          aria-label="Prosjekt 1"
          style={{ cursor: "pointer" }}
        >
          <path
            d={PATH_TOPP}
            fill={`url(#bg-topp${idSuffix})`}
            stroke="rgba(60, 90, 100, 0.35)" //  blågrå
            strokeWidth="0.4"
            style={{
              filter:
                "drop-shadow(2px 2px 2px rgba(0,0,0,0.3)) drop-shadow(-2px -2px 2px rgba(255,255,255,0.2))",
            }}
          />
        </a>

        {/* buen av p */}
      </g>
      <g transform={`translate(${BUE.x},${BUE.y})`}>
        <a
          href="/prosjekt2"
          aria-label="Prosjekt 2"
          style={{ cursor: "pointer" }}
        >
          <path
            d={PATH_BUE}
            fill={`url(#bg-bue${idSuffix})`}
            stroke="rgba(60, 90, 100, 0.35)" //  blågrå
            strokeWidth="0.4"
            style={{
              filter:
                "drop-shadow(2px 2px 2px rgba(0,0,0,0.3)) drop-shadow(-2px -2px 2px rgba(255,255,255,0.2))",
            }}
          />
        </a>

        {/* streken/bunnen i p */}
      </g>
      <g transform={`translate(${BUNN.x},${BUNN.y})`}>
        <a
          href="/prosjekt3"
          aria-label="Prosjekt 3"
          style={{ cursor: "pointer" }}
        >
          <path
            d={PATH_BUNN}
            fill={`url(#bg-bunn${idSuffix})`}
            stroke="rgba(60, 90, 100, 0.35)" // blågrå
            strokeWidth="0.4"
            style={{
              filter:
                "drop-shadow(2px 2px 2px rgba(0,0,0,0.3)) drop-shadow(-2px -2px 2px rgba(255,255,255,0.2))",
            }}
          />
        </a>
      </g>
    </svg>
  );
}
