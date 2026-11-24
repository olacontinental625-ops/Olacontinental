import React from 'react';

interface OlaLogoMarkProps {
  variant?: 'navbar' | 'hero' | 'section' | 'footer';
  className?: string;
}

/**
 * Brand Lockup faithful to the Ola Continental Properties & Associate signboard crest:
 * - Bold geometric "OLA" emblem framed in deep royal navy (#172554) and crimson red (#b91c1c)
 * - Italic serif crimson-red "Continental" script/display lettering
 * - Crisp "Properties & Associate" subtitle with dark navy RC: 203356 / CAC BN: 3189204 registration mark
 */
export const OlaLogoMark: React.FC<OlaLogoMarkProps> = ({
  variant = 'section',
  className = '',
}) => {
  if (variant === 'navbar') {
    return (
      <div className={`inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 ${className}`}>
        {/* Crisp Ivory & Crimson/Navy Signboard Emblem */}
        <div className="bg-white rounded-lg px-2 py-1 border-2 border-[#b91c1c] shadow-sm flex items-center gap-1.5">
          <span className="bg-[#172554] text-white font-extrabold tracking-tight text-sm sm:text-base px-1.5 py-0.5 rounded border border-[#dc2626] leading-none">
            OLA
          </span>
          <div className="flex flex-col leading-none text-left">
            <span className="font-display italic font-bold text-[#c81e1e] text-base sm:text-lg leading-none">
              Continental
            </span>
            <span className="text-[9px] font-bold tracking-tight text-[#172554] leading-tight">
              Properties &amp; Associate
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className={`inline-flex flex-wrap items-center gap-3 ${className}`}>
        <div className="bg-white rounded-xl px-3.5 py-2 border-2 border-[#b91c1c] shadow-lg flex items-center gap-3">
          {/* OLA Crimson & Navy Block */}
          <div className="bg-[#172554] text-white px-2.5 py-1.5 rounded-lg border-2 border-[#dc2626] flex flex-col items-center justify-center shadow-inner">
            <span className="font-sans font-black tracking-wider text-xl sm:text-2xl leading-none text-white drop-shadow-sm">
              OLA
            </span>
            <span className="w-full h-0.5 bg-[#dc2626] mt-1 rounded-full" />
          </div>

          {/* Continental + Subtitle */}
          <div className="flex flex-col leading-none text-left pr-1">
            <span className="font-display italic font-bold text-[#c81e1e] text-2xl sm:text-3xl leading-none">
              Continental
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-bold text-[#172554] tracking-tight">
                Properties &amp; Associate
              </span>
              <span className="bg-[#172554] text-white font-data text-[9px] font-semibold px-1.5 py-0.5 rounded">
                RC: 203356
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 'section' or 'footer' lockup
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className="bg-white rounded-xl px-3 py-1.5 border-2 border-[#b91c1c] shadow-md inline-flex items-center gap-2.5">
        <div className="bg-[#172554] text-white px-2 py-1 rounded border border-[#dc2626] leading-none">
          <span className="font-sans font-black tracking-wider text-base sm:text-lg text-white">
            OLA
          </span>
        </div>
        <div className="flex flex-col leading-none text-left">
          <span className="font-display italic font-bold text-[#c81e1e] text-xl sm:text-2xl leading-none">
            Continental
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-bold text-[#172554]">
              Properties &amp; Associate
            </span>
            <span className="bg-[#172554] text-white font-data text-[8px] px-1 py-0.2 rounded">
              RC: 203356
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
