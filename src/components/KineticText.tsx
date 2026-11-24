import React, { useState, useEffect } from 'react';

interface CategoryItem {
  goldText: string;
  whiteText: string;
  tag: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    goldText: 'LUXURY',
    whiteText: 'REAL ESTATE',
    tag: 'Prestige Residential Holdings',
  },
  {
    goldText: 'STUDENT',
    whiteText: 'HOSTELS',
    tag: 'Campus Accommodations & Lodges',
  },
  {
    goldText: 'VERIFIED LAND',
    whiteText: 'IN OGBOMOSO',
    tag: 'Unencumbered Titles & Surveyed Plots',
  },
  {
    goldText: 'EXECUTIVE',
    whiteText: 'DUPLEXES & FLATS',
    tag: 'Hospital & Residential Corridors',
  },
  {
    goldText: 'STRATEGIC',
    whiteText: 'COMMERCIAL PLOTS',
    tag: 'Expressway & Commercial Belts',
  },
];

export const KineticText: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPoppingOut, setIsPoppingOut] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setIsPoppingOut(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % CATEGORIES.length);
        setIsPoppingOut(false);
      }, 160);
    }, 1350);
    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const current = CATEGORIES[currentIndex];

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="perspective-1000 py-2 sm:py-3 cursor-default select-none overflow-hidden"
      style={{
        transform: `perspective(1000px) rotateX(${mousePos.y * -8}deg) rotateY(${mousePos.x * 8}deg)`,
        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className="min-h-[5rem] sm:min-h-[6rem] md:min-h-[6.5rem] flex flex-col justify-center items-start">
        <div
          className={`preserve-3d backface-hidden transform-gpu transition-all duration-200 ${
            isPoppingOut
              ? 'opacity-0 scale-75 translate-y-2'
              : 'opacity-100 scale-100 translate-y-0'
          }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Kicker in Gold (no countdown number) */}
          <div className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-[#F5C451] mb-1.5">
            {current.tag}
          </div>

          {/* Kinetic Title in Gold & White */}
          <h2
            className="font-display font-bold tracking-tight text-3xl sm:text-4xl md:text-5xl uppercase leading-tight"
            style={{
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.65)',
            }}
          >
            <span className="text-[#F5C451]">{current.goldText}</span>{' '}
            <span className="text-white">{current.whiteText}</span>
          </h2>
        </div>
      </div>
    </div>
  );
};
