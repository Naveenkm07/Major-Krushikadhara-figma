import { useLang } from "@/krushika/i18n"

export default function SplashScreen() {
  const { t } = useLang()
  return (
    <div className="relative flex size-full min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#0f4a19] via-[#1c6b2a] to-[#3a9d47] px-8 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] text-center" role="status" aria-live="polite">
      {/* faint furrowed-field horizon */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] w-full opacity-[0.12]"
        viewBox="0 0 400 220"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path
            key={i}
            d={`M-20 ${60 + i * 28} Q 100 ${20 + i * 28} 200 ${55 + i * 28} T 420 ${45 + i * 28}`}
            stroke="#f6efd8"
            strokeWidth="2.5"
          />
        ))}
      </svg>

      {/* soft radial glow behind the logo */}
      <div
        className="pointer-events-none absolute left-1/2 top-[38%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 65%)",
        }}
      />

      <div className="relative flex flex-col items-center">
        {/* Logo badge */}
        <div
          className="flex h-36 w-36 items-center justify-center rounded-full bg-white/12 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-sm"
          style={{ animation: "splash-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) both" }}
        >
          <WheatMark className="h-16 w-16" />
        </div>

        {/* Wordmark */}
        <h1
          className="mt-8 text-[2.6rem] font-bold leading-none tracking-tight text-white"
          style={{ animation: "splash-rise 0.6s ease-out 0.15s both" }}
        >
          KrushikaDhara
        </h1>

        {/* Kannada */}
        <p
          className="font-kannada mt-2 text-3xl font-semibold text-white"
          style={{ animation: "splash-rise 0.6s ease-out 0.28s both" }}
        >
          ಕೃಷಿಕಧಾರಾ
        </p>

        {/* Tagline */}
        <p
          className="mt-4 text-lg font-medium tracking-wide text-[#f6efd8]/85"
          style={{ animation: "splash-rise 0.6s ease-out 0.42s both" }}
        >
          {t.x.info.splash.tagline}
        </p>
      </div>

      {/* Loader */}
      <div
        className="absolute bottom-[max(6rem,calc(env(safe-area-inset-bottom)+4rem))] flex items-center gap-2"
        style={{ animation: "splash-rise 0.6s ease-out 0.6s both" }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2.5 w-2.5 rounded-full bg-[#f6efd8]"
            style={{ animation: `splash-dot 1.2s ease-in-out ${i * 0.16}s infinite` }}
          />
        ))}
      </div>
    </div>
  )
}

function WheatMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      {/* green stalk / leaf */}
      <path
        d="M20 58c0-14 4-26 14-36"
        stroke="#7cc142"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M22 44c-6-1-11-5-13-11 6-1 11 1 14 6"
        fill="#5aa832"
      />
      {/* golden wheat ear */}
      <g fill="#f4b400">
        <path d="M38 12c-4 3-6 7-6 12 5 0 9-2 12-6-2-3-4-5-6-6Z" />
        <path d="M40 22c-4 3-6 7-6 12 5 0 9-2 12-6-2-3-4-5-6-6Z" />
        <path d="M42 32c-4 3-6 7-6 12 5 0 9-2 12-6-2-3-4-5-6-6Z" />
      </g>
      <path
        d="M44 8c-4 2-7 5-9 9"
        stroke="#f4b400"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  )
}
