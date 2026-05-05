// Imprint-elementer for ferdigheter-kortene.
// Hvert mottar { hovered: bool } og renderer et svakt, presset-inn symbol
// som trer frem og animerer ved hover.

// ─── 0: Frontend — hjørneornamenter som tegnes inn ved hover ─────────────────

export function FrontendImprint({ hovered }) {
  const SIZE = "74px";

  const svgStyle = (right, bottom) => ({
    position: "absolute",
    width: SIZE,
    height: SIZE,
    ...(right ? { right: 0 } : { left: 0 }),
    ...(bottom ? { bottom: 0 } : { top: 0 }),
    pointerEvents: "none",
    opacity: hovered ? 0.34 : 0.1,
    transition: "opacity 0.4s ease",
    overflow: "visible",
  });

  const ln = (d = 0) => ({
    stroke: "currentColor",
    strokeWidth: 0.8,
    fill: "none",
    strokeLinecap: "round",
    strokeDasharray: "1",
    strokeDashoffset: hovered ? "0" : "1",
    transition: `stroke-dashoffset 1.2s ease ${d}s`,
  });

  const Corner = () => (
    <>
      <path d="M 2 2 C 20 2, 34 10, 48 22" pathLength="1" style={ln(0.0)} />
      <path d="M 2 2 C 2 20, 10 34, 22 48" pathLength="1" style={ln(0.1)} />
    </>
  );

  return (
    <>
      {/* Øvre venstre */}
      <svg viewBox="0 0 30 30" style={svgStyle(false, false)}>
        {/* horisontal hjerte-sving */}
        <path
          d="
      M 0,0
      C 8,0 12,2 14,4
      C 16,6 14,8 10,7
      C 7,6 5,4 4,3
    "
          pathLength="1"
          style={ln(0.0)}
        />

        {/* vertikal hjerte-sving */}
        <path
          d="
      M 0,0
      C 0,8 2,12 4,14
      C 6,16 8,14 7,10
      C 6,7 4,5 3,4
    "
          pathLength="1"
          style={ln(0.08)}
        />

        {/* linje mot høyre */}
        <path
          d="
    M 0,0

    C 10,0 20,0 30,1

    C 38,2 42,4 44,6
    C 46,8 44,10 40,10
    C 36,10 34,8 36,6
  "
          pathLength="1"
          style={ln(0.12)}
        />

        {/* hjerte ved knekk på linje mot høyre — horisontal scroll */}
        <path
          d="M 32,1.5 C 29,1.5 27,2 25.5,3 C 24,4 25.5,5 27,4.5 C 28.5,4 30,3 30.5,2.5"
          pathLength="1"
          style={ln(0.80)}
        />
        {/* hjerte ved knekk på linje mot høyre — vertikal scroll */}
        <path
          d="M 32,1.5 C 32,4.5 33,6 34.5,6.5 C 36,7 36,5.5 35,4.5 C 34,3.5 32.5,2.5 32.5,2"
          pathLength="1"
          style={ln(0.88)}
        />

        {/* lilnje nedover*/}
        <path
          d="
      M 0,0

      C 0,10 0,20 0,30
      C 0,36 1,40 3,42

      C 5,44 7,44 8,42
      C 9,40 9,38 7,36

      C 5,34 4,35 4,37
    "
          pathLength="1"
          style={ln(0.12)}
        />

        {/* hjerte ved knekk på linje nedover — horisontal scroll */}
        <path
          d="M 1.5,32 C 4.5,32 6.5,33 7,34.5 C 7.5,36 6,36.5 5,35.5 C 4,34.5 3,33 2.5,32.5"
          pathLength="1"
          style={ln(0.80)}
        />
        {/* hjerte ved knekk på linje nedover — vertikal scroll */}
        <path
          d="M 1.5,32 C 1.5,29 2,27 3.5,25.5 C 5,24 6,25 5.5,26.5 C 5,28 3.5,29.5 3,30.5"
          pathLength="1"
          style={ln(0.88)}
        />
      </svg>

      {/* Nedre høyre */}
      <svg viewBox="0 0 30 30" style={svgStyle(true, true)}>
        {/* horisontal ornament‑sving (mot venstre) */}
        <path
          d="
      M 30,30
      C 22,30 18,28 16,26
      C 14,24 16,22 20,23
      C 23,24 25,26 26,27
    "
          pathLength="1"
          style={ln(0.14)}
        />

        {/* vertikal ornament‑sving (opp) */}
        <path
          d="
      M 30,30
      C 30,22 28,18 26,16
      C 24,14 22,16 23,20
      C 24,23 26,25 27,26
    "
          pathLength="1"
          style={ln(0.22)}
        />

        {/* linje mot venstre */}
        <path
          d="
      M 30,30
      C 20,30 10,30 0,29
      C -8,28 -12,26 -14,24
      C -16,22 -14,20 -10,20
      C -6,20 -4,22 -6,24
    "
          pathLength="1"
          style={ln(0.30)}
        />

        {/* hjerte ved knekk på linje mot venstre — vertikal scroll */}
        <path
          d="M -2,28 C -2,25 -3.5,23 -5,22.5 C -6.5,22 -7,23.5 -6,24.5 C -5,25.5 -3.5,26.5 -3,27"
          pathLength="1"
          style={ln(1.00)}
        />
        {/* hjerte ved knekk på linje mot venstre — horisontal scroll */}
        <path
          d="M -2,28 C 1,28 3,28.5 4.5,30 C 6,31.5 5,33 3.5,32.5 C 2,32 0.5,30.5 0,29.5"
          pathLength="1"
          style={ln(1.08)}
        />

        {/* linje oppover */}
        <path
          d="
      M 30,30
      C 30,20 30,10 30,0
      C 30,-6 29,-10 27,-12
      C 25,-14 23,-14 22,-12
      C 21,-10 21,-8 23,-6
      C 25,-4 26,-5 26,-7
    "
          pathLength="1"
          style={ln(0.30)}
        />

        {/* hjerte ved knekk på linje oppover — horisontal scroll */}
        <path
          d="M 28,-2 C 25,-2 23,-3 22.5,-4.5 C 22,-6 23.5,-6.5 24.5,-5.5 C 25.5,-4.5 26.5,-3 27,-2.5"
          pathLength="1"
          style={ln(1.10)}
        />
        {/* hjerte ved knekk på linje oppover — vertikal scroll */}
        <path
          d="M 28,-2 C 28,1 29,3 30.5,4 C 32,5 32.5,3.5 31.5,2.5 C 30.5,1.5 29,0.5 28.5,-0.5"
          pathLength="1"
          style={ln(1.18)}
        />
      </svg>
    </>
  );
}





// ─── 1: API & data — regnsky øverst til høyre med fallende dråper ───────────
export function ApiImprint({ hovered }) {
  const drops = [
    { cx: 26, cy: 74, delay: 0.00 },
    { cx: 36, cy: 79, delay: 0.08 },
    { cx: 46, cy: 74, delay: 0.16 },
    { cx: 56, cy: 79, delay: 0.06 },
    { cx: 66, cy: 74, delay: 0.14 },
    { cx: 76, cy: 79, delay: 0.22 },
    { cx: 31, cy: 87, delay: 0.24 },
    { cx: 51, cy: 89, delay: 0.18 },
    { cx: 71, cy: 87, delay: 0.30 },
  ]

  return (
    <div style={{
      position: "absolute",
      right: "3%",
      top: "2%",
      width: "22%",
      aspectRatio: "1",
      pointerEvents: "none",
      opacity: hovered ? 0.22 : 0.07,
      transition: "opacity 0.4s ease",
    }}>
      <svg
        viewBox="0 0 100 100"
        style={{ width: "100%", height: "100%", overflow: "visible" }}
      >
        {/* Regnsky */}
        <path
          d="M 24,62 C 12,62 6,53 6,44 C 6,34 13,27 22,27
             C 24,20 31,14 41,14 C 51,14 58,20 60,27
             C 63,23 70,19 77,21 C 85,24 89,33 86,41
             C 93,44 95,53 91,59 C 88,63 84,65 79,65
             C 72,65 62,70 52,68 C 42,66 36,62 24,62 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {/* Regndråper */}
        {drops.map(({ cx, cy, delay }, i) => (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx={1.4}
            ry={2.6}
            fill="currentColor"
            style={{
              opacity: hovered ? 0.9 : 0,
              transform: hovered ? "translateY(0px)" : "translateY(-10px)",
              transition: `opacity 0.35s ease ${delay}s, transform 0.55s ease ${delay}s`,
            }}
          />
        ))}
      </svg>
    </div>
  )
}

// ─── 2: Design — ekte rev-silhuett med lysstråle ved hover ───────────────────
const FOX_PATHS = {
  Head:             "M1044.5 236.5C1035.83 240.333 1010.6 252.9 979 272.5L974 275.5L966.5 272.5L957.5 263.5L944 253L926 245L905 236.5L869 222.5L832 208.5L806 196L786.5 177L775 161.5L769.5 139.5V120L772 106.5L789.5 66.5L826 15.5L843 1.5H851.5L862.5 6L894 26.5L917 36L947.5 42L981 43.5L1015.5 42L1044.5 36L1067 26.5L1086 15.5L1096.5 6H1103.5L1115 11L1130.5 26.5L1147.5 49L1159 66.5L1168.5 84.5L1175.5 101.5L1181 118.5V136L1175.5 156.5L1165 177L1143 196L1115 212.5L1076 227L1044.5 236.5Z",
  Body:             "M1113.5 661.5L1125.5 658.5L1113.5 640L1103.5 614.5L1096.5 586.5L1089.5 547.5L1080.5 494L1073.5 466L1054 429L1040.5 409L1014 387L982.5 371L942 357.5L909 349.5L879 341L857.5 330.5L843.5 321L833 304L825.5 290L811.5 297L790.5 307L758.5 317.5L714 324.5H670L640.5 321L624 317.5L628 324.5L638.5 343.5L642.5 354L635.5 360.5L618.5 357.5L589.5 343.5L541 331H503L487 334.5L470 367L454.5 412L433.5 541.5V642.5L446.5 651L463.5 648.5H483L490.5 642.5V625L497.5 614.5L541 571.5L589.5 541.5L649.5 517.5L723 504L803 502L869.5 511L930.5 528.5L991.5 559.5L1020 585H1021.5L1035 600.5L1050.5 614.5L1062.5 632.5L1073 650.5L1081.5 656.5L1097.5 661.5H1113.5Z",
  Tail:             "M1.5 129.5V118L4 114H11.5L22 122.5L43 145L73.5 170.5L111 191.5L139 199.5H166.5L195 195.5L247.5 180L309.5 162.5L352.5 157.5H400L440.5 166L484 184L520 206L559.5 236L592.5 272L621.5 312L630 325.5L636 338.5L641 346.5V352L638 356.5L632 358.5H626.5L621.5 356.5L594.5 346.5L564.5 336.5L535 331L500.5 332.5L466 338.5L411 356.5L358.5 368.5H313L271 360.5L224.5 344.5L143.5 299.5L76.5 245L49 217.5L18 173.5L7 148.5L1.5 129.5Z",
  Belly:            "M614.5 552L558.5 571.5L544 574.5L558.5 560L578 548L619.5 527.5L679 510.5L756.5 501.5H804L874 513L926.5 527.5L968.5 544.5L1008.5 571.5L1027.5 590.5L991 574.5L939 554.5L881.5 541.5L809 531.5H742L677.5 535.5L614.5 552Z",
  "Hind leg":       "M554 607.5L549.5 579.5V574.5L560 571L645.5 544L642 552.5L632.5 566L620.5 583.5L613 598L609 616.5L611 627.5L615.5 637L609 642H596H578L563 637L560 629.5L554 607.5Z",
  Chest:            "M1078.5 245.5L1083 229.5V224.5L1074 227L1051 236L1021.5 246.5L999 259L977.5 273L966 266.5L949 253L929 241.5L904.5 233L879.5 225L860 217.5L862 241.5L856.5 257L845 273L825.5 292L830 300L842.5 316.5L855 328.5L873 338.5L897 346L926 352.5L954 360.5L989.5 373L1018.5 390.5L1047 417L1063 443L1073.5 466L1087.5 532.5L1097 587.5L1102.5 609L1108.5 630L1116.5 645.5L1126.5 658H1133.5L1139.5 654V647L1126.5 622.5L1117.5 579.5V522L1123 437L1117.5 382L1095.5 310.5L1083 270.5L1078.5 245.5Z",
  Forehead:         "M889 39.5L882 26.5L898.5 31.5L925 39.5L949 44.5H972.5H1003L1025.5 42L1047.5 37L1064.5 30.5L1074.5 24L1072 30.5L1069.5 37L1061 49L1055.5 59.5L1050 67L1043 77.5L1037 84.5L1025.5 89.5L1011.5 96L998 103H979.5H964L942 96L925 89.5L913.5 77.5L905.5 67L896.5 52.5L889 39.5Z",
  "Left side face":  "M963 258V243.5V225.5L958 206.5L951 178.5L944 152L927.5 121.5L913 105L891.5 86.5L870.5 78L847.5 74.5L827.5 78L807 89.5L793.5 105L789.5 118.5V134.5L793.5 152L803 164.5L816 178.5L833 189.5L853 199.5L874 206.5L898 218L923 231L939.5 240L948 248.5L955 254L963 261",
  "Right side face": "M990.5 248.5V262L1002 253L1010.5 245L1023.5 236L1037.5 227.5L1060 219.5L1076.5 213.5L1093 207L1112 198.5L1126 191L1140 181.5L1151.5 170.5L1159.5 157.5L1163.5 140L1165 129.5L1159.5 111.5L1149.5 96.5L1140 89.5L1126 82L1107.5 79L1089 82L1067 89.5L1050 100L1037.5 111.5L1023.5 128L1010.5 153.5L1002 175.5L995 204L990.5 229.5V248.5Z",
  "Left eye":        "M917 188.5L925 183L917 168L911.5 152L903 140.5L893.5 128L883 120L870.5 116H861H851.5H837H827.5L817.5 120V124L823 140.5L827.5 152L837 168L848 177L861 183L877 188.5L893.5 192H903L917 188.5Z",
  "Right eye":       "M1032 168L1027.5 183V189L1041 193L1057.5 196L1077.5 193L1096.5 186L1108.5 178L1116.5 168L1124.5 158.5L1132.5 143L1136.5 127L1128 123L1116.5 119.5L1104.5 116.5L1090.5 119.5L1077.5 123L1067 127L1057.5 132.5L1047.5 143L1041 151.5L1032 168Z",
  "Left pupil":      "M850.5 134.5L848.5 138L847.5 139.5V141V143.5L847 146L847.5 149.5V152.5L848.5 156L849.5 158.5L852 162.5L855 166L858.5 169.5L862.5 172L868 174H870.5L876.5 173.5L881 173L885 171.5L889.5 169L893 166L896 163.5L897.5 161L899.5 157.5L900.5 154V149.5V146L899.5 141L898.5 137.5L896 134.5L893 132.5L889.5 130L885.5 127L882 124.5L878 122.5L873.5 121.5H870.5L866.5 122.5L863.5 123L861 124.5L858 127L855.5 128.5L853.5 131L850.5 134.5Z",
  "Right pupil":     "M1087.5 125.5L1083 123.5H1077.5L1072.5 125.5L1068 126L1063.5 128L1058.5 132L1054 135V136.5L1052 140.5V143.5V147V151.5V156L1054 161.5L1056.5 166.5L1060 169.5L1063.5 172.5L1069 176L1075 177.5H1083L1087.5 176L1093.5 172.5L1098 169.5L1102 163.5L1103.5 158.5V151.5V145L1102 140.5L1100 135L1096.5 132L1092.5 128L1087.5 125.5Z",
  "Left ear":        "M844.5 52.5L823 57L849 26L867.5 52.5H844.5Z",
  "Right ear":       "M1105 56H1085.5L1105 29.5L1129 63L1105 56Z",
}

export function DesignImprint({ hovered }) {
  // Hele reven, liten, nede til høyre.
  // Usynlig i ro. Ved hover: strek for strek tegnes inn, deretter fylles med farge.
  const paths = Object.entries(FOX_PATHS)
  return (
    <div style={{
      position: "absolute",
      right: 0,
      bottom: 0,
      width: "58%",
      height: "44%",
      pointerEvents: "none",
      overflow: "hidden",
    }}>
      <svg
        viewBox="0 0 1183 663"
        preserveAspectRatio="xMaxYMax meet"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        {paths.map(([id, d], i) => (
          <path
            key={id}
            d={d}
            pathLength="1"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinejoin="round"
            style={{
              strokeDasharray: "1",
              strokeDashoffset: hovered ? "0" : "1",
              fill: hovered ? "rgba(220, 235, 240, 0.35)" : "transparent",
              transition: [
                `stroke-dashoffset ${hovered ? `1.4s ease ${i * 0.9}s` : "0.15s ease 0s"}`,
                `fill ${hovered ? `4.0s ease ${2.0 + i * 0.5}s` : "0.15s ease 0s"}`,
              ].join(", "),
            }}
          />
        ))}
      </svg>
    </div>
  )
}

// ─── 3: Interaktivitet — ekte mynt-SVG (konvertert fra Lottie) + glint ────────
// Alle koordinater er ÷2 fra original Lottie (viewBox -100 -100 200 200)
const COIN_SYMBOL =
  "M 19.401,-5.012 C 15.860,-6.402 11.619,-7.668 6.688,-8.817 C 6.688,-8.817 6.688,-30.568 6.688,-30.568 C 8.327,-29.959 9.682,-29.078 10.749,-27.916 C 11.549,-27.045 12.206,-26.092 12.721,-25.055 C 14.625,-21.219 18.621,-18.655 23.169,-18.655 C 23.169,-18.655 23.813,-18.655 23.813,-18.655 C 32.789,-18.655 38.488,-27.770 33.838,-34.902 C 32.290,-37.276 30.349,-39.449 28.012,-41.423 C 22.415,-46.150 15.307,-48.963 6.688,-49.866 C 6.688,-49.866 6.688,-54.915 6.688,-54.915 C 6.688,-57.844 4.314,-60.219 1.385,-60.219 C -1.544,-60.219 -3.919,-57.844 -3.919,-54.915 C -3.919,-54.915 -3.919,-50.025 -3.919,-50.025 C -12.792,-49.347 -20.127,-46.498 -25.917,-41.469 C -32.610,-35.655 -35.955,-28.413 -35.955,-19.739 C -35.955,-4.951 -25.274,4.895 -3.919,9.805 C -3.919,9.805 -3.919,32.213 -3.919,32.213 C -6.709,31.652 -9.073,30.571 -11.007,28.961 C -12.492,27.726 -13.631,26.222 -14.430,24.445 C -16.129,20.663 -20.234,18.300 -24.645,18.300 C -33.150,18.300 -38.638,26.807 -34.465,33.691 C -34.242,34.059 -34.011,34.424 -33.771,34.788 C -30.411,39.879 -25.778,43.884 -19.869,46.805 C -15.107,49.159 -9.790,50.563 -3.919,51.020 C -3.919,51.020 -3.919,54.915 -3.919,54.915 C -3.919,57.845 -1.544,60.219 1.385,60.219 C 4.314,60.219 6.688,57.845 6.688,54.915 C 6.688,54.915 6.688,50.878 6.688,50.878 C 15.133,50.021 36.415,42.063 27.970,42.920 C 35.081,37.409 45.749,15.770 38.638,21.281 C 38.638,8.812 32.224,0.048 19.401,-5.012 Z"

const COIN_DETAIL_A =
  "M 11.464,29.819 C 10.196,30.830 8.598,31.561 6.688,32.034 C 6.688,32.034 6.688,12.887 6.688,12.887 C 8.237,13.506 9.549,14.150 10.623,14.821 C 13.564,16.659 15.034,19.172 15.034,22.365 C 15.034,25.437 13.844,27.921 11.464,29.819 Z"

const COIN_DETAIL_B =
  "M -8.781,-14.002 C -11.330,-15.778 -12.603,-18.113 -12.603,-21.004 C -12.603,-24.076 -11.484,-26.605 -9.243,-28.593 C -7.834,-29.844 -6.059,-30.699 -3.919,-31.163 C -3.919,-31.163 -3.919,-11.617 -3.919,-11.617 C -5.939,-12.357 -7.562,-13.151 -8.781,-14.002 Z"

export function CoinImprint({ hovered }) {
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        width: "46%",
        aspectRatio: "1",
        opacity: hovered ? 0.22 : 0.10,
        transform: hovered ? "scale(1.04)" : "scale(1)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>
        <svg
          viewBox="-100 -100 200 200"
          style={{ width: "100%", height: "100%", overflow: "visible" }}
        >
          <circle cx="0" cy="0" r="96.5"
            fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="0" cy="0" r="71.5"
            fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d={COIN_SYMBOL}
            fill={hovered ? "rgba(140,110,60,0.12)" : "transparent"}
            stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"
            style={{ transition: "fill 1.2s ease" }}
          />
          <path d={COIN_DETAIL_A}
            fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          <path d={COIN_DETAIL_B}
            fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}
