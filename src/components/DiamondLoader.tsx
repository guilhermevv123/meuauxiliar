import { useId } from 'react'
import './DiamondLoader.css'

/**
 * DiamondLoader — a LOGO OFICIAL do Diamond animada como loader, portada do
 * componente Vue do Diamond CRM (mesmo path vetorizado com potrace, mesma
 * animação 100% CSS).
 *
 * Aqui o app é CLARO: a marca é navy profundo (contrasta no fundo branco) e o
 * raio que corre pelo contorno é ciano brilhante — o acento da marca.
 */
export default function DiamondLoader({
  size = 120,
  label = '',
  fullScreen = false,
  className = '',
}: {
  size?: number
  label?: string
  fullScreen?: boolean
  className?: string
}) {
  // ids únicos por instância (o gradiente e o filtro SVG são globais no DOM)
  const uid = useId().replace(/:/g, '')
  const gid = `dl-g-${uid}`
  const fid = `dl-f-${uid}`

  // `flex w-full justify-center` (não inline-grid + mx-auto): mx-auto não
  // centraliza elemento inline, então o loader nas listas ficava encostado à
  // esquerda. Aqui ele ocupa a largura toda e centraliza o conteúdo.
  const root = fullScreen
    ? 'fixed inset-0 z-[9999] grid place-items-center dl-overlay'
    : `flex w-full justify-center ${className}`

  return (
    <div className={root} role="status" aria-label={label || 'Carregando'}>
      <div className="flex flex-col items-center justify-center gap-5">
        <div className="dl-mark" style={{ width: size, height: size }}>
          <span className="dl-glow" aria-hidden="true" />
          <svg
            className="dl-svg"
            viewBox="-30 -30 529.964474 486"
            preserveAspectRatio="xMidYMid meet"
            shapeRendering="geometricPrecision"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0a2a44" />
                <stop offset="50%" stopColor="#0077b6" />
                <stop offset="100%" stopColor="#0a2a44" />
              </linearGradient>
              <filter id={fid} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
                <feGaussianBlur stdDeviation="2.5" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g transform="translate(-6.035919,432.000000) scale(0.100000,-0.100000)">
              <path className="dl-fill" d={PATH} fill={`url(#${gid})`} stroke="none" />
              <path
                className="dl-draw"
                d={PATH}
                fill="none"
                stroke={`url(#${gid})`}
                strokeWidth="26"
                strokeLinejoin="round"
                strokeLinecap="round"
                pathLength={100}
              />
              <path
                className="dl-comet"
                d={PATH}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="34"
                strokeLinejoin="round"
                strokeLinecap="round"
                pathLength={100}
                filter={`url(#${fid})`}
              />
            </g>
          </svg>
        </div>

        {label && (
          <div className="dl-label">
            <span>{label}</span>
            <span className="dl-dots" aria-hidden="true">
              <i className="dl-dot" style={{ animationDelay: '0s' }} />
              <i className="dl-dot" style={{ animationDelay: '0.16s' }} />
              <i className="dl-dot" style={{ animationDelay: '0.32s' }} />
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// Contorno da marca — vetorização (potrace) do PNG oficial do Diamond.
const PATH =
  'M1129 4262 l-45 -57 -205 -260 -205 -260 -46 -60 -47 -60 -260 -330 -261 -330 5 -12 4 -12 383 -477 383 -476 299 -372 299 -371 450 -563 451 -562 5 1 6 0 71 92 70 92 417 530 416 530 252 320 251 320 111 140 111 140 67 85 67 85 218 276 219 276 73 92 72 92 0 7 0 7 -952 -3 -952 -3 -15 -12 -14 -12 -88 -105 -88 -105 779 -5 779 -5 -52 -65 -52 -65 -170 -215 -170 -215 -55 -70 -55 -70 -114 -145 -114 -145 -76 -95 -75 -95 -51 -65 -52 -65 -243 -310 -244 -310 -180 -229 -180 -229 -37 44 -37 44 -158 196 -159 196 -305 378 -305 378 -95 117 -95 117 -137 169 -137 169 -239 295 -240 295 19 25 18 25 186 235 185 235 258 332 257 333 828 0 827 0 -216 -247 -217 -248 -83 -95 -82 -95 -78 -90 -78 -90 -155 -180 -155 -180 -100 -115 -99 -115 -20 -22 -19 -21 78 -94 78 -93 2 -3 2 -3 50 53 49 53 164 190 163 190 225 259 226 260 205 236 205 236 185 213 185 212 3 10 4 9 -1154 0 -1153 0 -46 -58z'
