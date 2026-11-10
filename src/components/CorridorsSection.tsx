import React from 'react';
import { CORRIDORS_LIST } from '../data/properties';
import { Corridor } from '../types';
import { MapPin, Zap, Droplets, Compass, ArrowRight, Building, HardHat } from 'lucide-react';

interface CorridorsSectionProps {
  onSelectCorridor: (corridor: Corridor) => void;
  onOpenViewing: () => void;
}

export const CorridorsSection: React.FC<CorridorsSectionProps> = ({
  onSelectCorridor,
  onOpenViewing,
}) => {
  return (
    <section id="corridors" className="py-16 bg-[#07132b] text-[#f0f9ff] scroll-mt-20 relative overflow-hidden">
      {/* Royal blue and light blue ambient background */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#1d4ed8]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#38bdf8]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#38bdf8] mb-2 flex items-center gap-2">
              <span>GEOGRAPHIC REACH & CORRIDORS</span>
              <span aria-hidden="true" className="text-white/40">·</span>
              <span className="font-data text-xs text-[#93c5fd]/80">OGBOMOSO & LAGOS</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
              Strategic Operating Corridors
            </h1>
            <p className="mt-3 text-sm text-[#bfdbfe] leading-relaxed">
              We anchor our operations at No. 2 Olukoko Street behind LAUTECH Teaching Hospital while actively building and managing student hostels, commercial hubs in Mushin, and agricultural belts in Odo-Oba.
            </p>
          </div>

          <button
            onClick={onOpenViewing}
            className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-[#1d4ed8] hover:bg-[#0284c7] border border-[#38bdf8]/40 rounded-lg transition-colors whitespace-nowrap self-start md:self-auto cursor-pointer shadow-lg"
          >
            Join Tuesday Field Tour
          </button>
        </div>

        {/* Corridors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CORRIDORS_LIST.map((corridor, idx) => (
            <div
              key={corridor.name}
              className="bg-[#0b1e42] rounded-2xl p-6 border border-[#1d4ed8]/40 hover:border-[#38bdf8]/70 transition-all duration-300 flex flex-col justify-between group shadow-xl hover:shadow-[#38bdf8]/5"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#38bdf8] mb-2 font-medium">
                  <span className="font-data text-[11px] text-[#93c5fd]/70">CORRIDOR 0{idx + 1}</span>
                  <span className="text-[#60a5fa] font-semibold">{corridor.subtitle}</span>
                </div>

                <h3 className="font-display text-xl font-bold text-white group-hover:text-[#38bdf8] transition-colors">
                  {corridor.name}
                </h3>

                <p className="mt-2 text-xs text-[#bfdbfe] leading-relaxed">
                  {corridor.description}
                </p>

                {/* Infrastructure Badges */}
                <div className="mt-4 pt-3 border-t border-[#1d4ed8]/30 space-y-2 text-xs">
                  <div className="text-[11px] text-[#e0f2fe]">
                    <strong className="text-white">Primary Assets & Civil Works:</strong> {corridor.primaryTypes}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#bfdbfe]">
                    <Zap className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                    <span>Power: {corridor.powerReliability}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#bfdbfe]">
                    <Droplets className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                    <span>Water: {corridor.waterSource}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#1d4ed8]/30">
                <button
                  onClick={() => {
                    onSelectCorridor(corridor.name as Corridor);
                  }}
                  className="w-full py-2.5 px-3 text-xs font-semibold text-white hover:text-white bg-[#07132b] hover:bg-[#113e94] border border-[#1d4ed8]/60 hover:border-[#38bdf8]/60 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>Filter Properties in this Axis</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#38bdf8]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
