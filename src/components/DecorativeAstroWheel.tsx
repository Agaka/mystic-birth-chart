export function DecorativeAstroWheel({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      {/* Outer orbital ring */}
      <svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] animate-spin-slow opacity-[0.08]"
        viewBox="0 0 800 800"
        fill="none"
      >
        <circle cx="400" cy="400" r="350" stroke="#C9A45C" strokeWidth="0.5" />
        <circle cx="400" cy="400" r="300" stroke="#C9A45C" strokeWidth="0.3" />
        <circle cx="400" cy="400" r="250" stroke="#C9A45C" strokeWidth="0.3" />
        <circle cx="400" cy="400" r="200" stroke="#C9A45C" strokeWidth="0.5" />
        {/* Cross lines */}
        <line x1="400" y1="50" x2="400" y2="750" stroke="#C9A45C" strokeWidth="0.3" />
        <line x1="50" y1="400" x2="750" y2="400" stroke="#C9A45C" strokeWidth="0.3" />
        <line x1="153" y1="153" x2="647" y2="647" stroke="#C9A45C" strokeWidth="0.2" />
        <line x1="647" y1="153" x2="153" y2="647" stroke="#C9A45C" strokeWidth="0.2" />
        {/* Small marks on the outer ring */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const x1 = 400 + 340 * Math.cos(angle);
          const y1 = 400 + 340 * Math.sin(angle);
          const x2 = 400 + 360 * Math.cos(angle);
          const y2 = 400 + 360 * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#C9A45C"
              strokeWidth="0.5"
            />
          );
        })}
      </svg>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-midnight to-transparent" />
    </div>
  );
}
