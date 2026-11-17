'use client';

type Apparatus = 'flask' | 'beaker' | 'test-tube';

type LabApparatusProps = {
  type: Apparatus;
  liquidColor: string;
  className?: string;
};

const glassStroke = '#236f7d';
const glassHighlight = 'rgba(255,255,255,.72)';

export function LabApparatus({ type, liquidColor, className }: LabApparatusProps) {
  const shared = {
    fill: 'none',
    stroke: glassStroke,
    strokeWidth: 1.65,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  return (
    <svg
      aria-label={type === 'flask' ? '삼각 플라스크' : type === 'beaker' ? '비커' : '시험관'}
      className={className}
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`liquid-${type}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={liquidColor} stopOpacity=".76" />
          <stop offset="1" stopColor={liquidColor} stopOpacity=".98" />
        </linearGradient>
        <filter id={`shadow-${type}`} x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="8" floodColor="#155e75" floodOpacity=".12" stdDeviation="7" />
        </filter>
      </defs>

      {type === 'flask' && (
        <g filter={`url(#shadow-${type})`}>
          <path d="M96 36h48M102 36v55L55 180c-7 14 3 28 19 28h92c16 0 26-14 19-28l-47-89V36" {...shared} />
          <path d="M72 168c22 6 75-7 96 0l13 24c3 7-2 14-11 14H70c-9 0-14-7-11-14Z" fill={`url(#liquid-${type})`} stroke="none" />
          <path d="M72 168c22 6 75-7 96 0" {...shared} stroke={liquidColor} />
          <path d="M111 48v51l-35 66" fill="none" stroke={glassHighlight} strokeWidth="5" strokeLinecap="round" />
          <path d="M106 37h28" {...shared} stroke="#fff" strokeOpacity=".7" />
        </g>
      )}

      {type === 'beaker' && (
        <g filter={`url(#shadow-${type})`}>
          <path d="M63 48h122l-8 143c-.5 10-8 17-18 17H82c-10 0-17.5-7-18-17L56 48h17" {...shared} />
          <path d="M56 48c18 5 31-5 44 0s27 5 39 0 24-4 46 0" {...shared} />
          <path d="M66 137c31 7 76-6 113 0l-3 55c-.5 8-6 14-15 14H80c-8 0-14-6-14-14Z" fill={`url(#liquid-${type})`} stroke="none" />
          <path d="M66 137c31 7 76-6 113 0" {...shared} stroke={liquidColor} />
          <path d="M74 61l6 66" fill="none" stroke={glassHighlight} strokeWidth="5" strokeLinecap="round" />
          {[76, 94, 112].map((y, index) => <path key={y} d={`M157 ${y}h${index === 1 ? 15 : 10}`} {...shared} strokeOpacity=".62" />)}
        </g>
      )}

      {type === 'test-tube' && (
        <g filter={`url(#shadow-${type})`}>
          <path d="M91 37h58M98 37v126c0 31 44 31 44 0V37" {...shared} />
          <path d="M98 135c12 5 31-5 44 0v29c0 27-44 27-44 0Z" fill={`url(#liquid-${type})`} stroke="none" />
          <path d="M98 135c12 5 31-5 44 0" {...shared} stroke={liquidColor} />
          <path d="M108 50v76" fill="none" stroke={glassHighlight} strokeWidth="5" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

