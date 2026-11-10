import React, { useState, useEffect } from 'react';

interface CategoryItem {
  title: string;
  tag: string;
  accent: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    title: 'LUXURY REAL ESTATE',
    tag: 'Prestige Residential Holdings',
    accent: '#F3E8D0',
  },
  {
    title: 'STUDENT HOSTELS',
    tag: 'Campus Accommodations & Lodges',
    accent: '#C5A880',
  },
  {
    title: 'VERIFIED LAND IN OGBOMOSO',
    tag: 'Unencumbered Titles & Surveyed Plots',
    accent: '#FAF4E8',
  },
  {
    title: 'EXECUTIVE DUPLEXES & FLATS',
    tag: 'Hospital & Residential Corridors',
    accent: '#F3E8D0',
  },
  {
    title: 'STRATEGIC COMMERCIAL PLOTS',
    tag: 'Expressway & Commercial Belts',
    accent: '#C5A880',
  },
  {
    title: 'BUILD THE RIGHT FUTURE',
    tag: 'Direct Landowner Mandates',
    accent: '#FAF4E8',
  },
];

export const KineticText: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      // Trigger smooth exit flip
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % CATEGORIES.length);
        setIsFlipping(false);
      }, 400); // half transition duration
    }, 3800);
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
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className="min-h-[5.5rem] sm:min-h-[6.5rem] md:min-h-[7.5rem] flex flex-col justify-center items-start">
        <div
          className={`preserve-3d backface-hidden transform-gpu transition-all duration-500 ease-out ${
            isFlipping
              ? 'opacity-0 -translate-y-4 rotate-x-45 scale-95'
              : 'opacity-100 translate-y-0 rotate-x-0 scale-100'
          }`}
        >
          {/* Tag / Context Kicker - Clean unboxed metadata discipline */}
          <div className="text-xs sm:text-sm font-medium tracking-widest uppercase text-[#C5A880] mb-1.5 flex items-center gap-2">
            <span>{current.tag}</span>
            <span className="text-[#8B6347] font-normal" aria-hidden="true">·</span>
            <span className="font-data text-[11px] text-[#FAF4E8]/60">0{currentIndex + 1} / 06</span>
          </div>

          {/* Kinetic Title */}
          <h2
            className="font-display font-bold tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase"
            style={{
              color: current.accent,
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
            }}
          >
            {current.title}
          </h2>
        </div>
      </div>
    </div>
  );
};
