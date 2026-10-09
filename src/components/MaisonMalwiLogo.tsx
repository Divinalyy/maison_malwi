import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSlogan?: boolean;
  className?: string;
}

export const MaisonMalwiLogo: React.FC<LogoProps> = ({
  size = 'md',
  showSlogan = true,
  className = '',
}) => {
  const circleSize = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
  }[size];

  const letterMSize = {
    sm: 'text-lg',
    md: 'text-3xl',
    lg: 'text-5xl',
  }[size];

  const titleSize = {
    sm: 'text-sm tracking-[0.25em]',
    md: 'text-2xl sm:text-3xl tracking-[0.3em]',
    lg: 'text-4xl tracking-[0.35em]',
  }[size];

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Circle Emblem with Serif M and flowing red wave */}
      <div
        className={`relative ${circleSize} rounded-full border border-white/80 flex items-center justify-center mb-3 bg-black/40 backdrop-blur-sm shadow-[0_0_25px_rgba(255,255,255,0.05)]`}
      >
        <span
          className={`font-serif-luxury font-normal text-white ${letterMSize} leading-none tracking-tight pt-0.5`}
        >
          M
        </span>
        {/* Flowing red wave ribbon line */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 22 64 C 36 67, 44 69, 53 66 C 62 63, 69 57, 78 59"
            stroke="#b3192b"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* MAISON in spaced red lettering */}
      <div className="text-[10px] sm:text-xs font-serif-luxury uppercase tracking-[0.55em] text-[#b3192b] font-medium pl-1 mb-1">
        M A I S O N
      </div>

      {/* MALWI in luxury white serif */}
      <div
        className={`font-serif-luxury text-white font-normal uppercase ${titleSize} pl-1`}
      >
        M A L W I
      </div>

      {/* Subtle crimson hairline divider */}
      <div className="w-10 h-[1.5px] bg-[#b3192b]/70 my-2.5 rounded-full" />

      {/* Slogan */}
      {showSlogan && (
        <div className="font-serif-luxury italic text-xs sm:text-sm text-neutral-300 tracking-wide">
          Votre couronne, sans compromis<span className="text-[#b3192b]">.</span>
        </div>
      )}
    </div>
  );
};
