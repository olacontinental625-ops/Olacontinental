import React, { useState } from 'react';
import { Property } from '../types';
import { MapPin, Bed, Bath, Layers, CheckSquare, Square, Eye, Calendar, Sparkles, Building2 } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  onBookViewing: (property: Property) => void;
  isCompared: boolean;
  onToggleCompare: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect,
  onBookViewing,
  isCompared,
  onToggleCompare,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <article className="group bg-[#0b1e42] rounded-2xl overflow-hidden border border-[#1d4ed8]/35 hover:border-[#38bdf8]/70 transition-all duration-300 flex flex-col shadow-xl hover:shadow-2xl hover:shadow-[#1d4ed8]/20">
      {/* Visual Asset Container with Fallback */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#07132b]">
        {!imageError ? (
          <img
            src={property.featuredImage}
            alt={property.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#07132b]">
            <Building2 className="w-12 h-12 text-[#38bdf8]/60 mb-2" />
            <span className="text-xs font-semibold text-white">{property.title}</span>
            <span className="text-[10px] text-[#93c5fd] mt-1">{property.corridor}</span>
          </div>
        )}

        {/* Scrim Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07132b] via-transparent to-black/40 pointer-events-none" />

        {/* Status Indicator */}
        <div className="absolute top-3 left-3 z-10 text-xs font-semibold tracking-wide text-white bg-[#07132b]/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-[#1d4ed8]/50 flex items-center gap-1.5 shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
          <span>{property.purpose}</span>
          <span className="text-white/40" aria-hidden="true">·</span>
          <span className="text-[#38bdf8]">{property.type}</span>
        </div>

        {/* Compare Checkbox Toggle */}
        <button
          onClick={() => onToggleCompare(property)}
          className={`absolute top-3 right-3 z-10 px-2.5 py-1 rounded-md text-xs font-medium backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
            isCompared
              ? 'bg-[#2563eb] text-white'
              : 'bg-[#07132b]/85 text-white/80 hover:text-white hover:bg-[#07132b]'
          }`}
          title="Add to side-by-side comparison"
        >
          {isCompared ? <CheckSquare className="w-3.5 h-3.5 text-white" /> : <Square className="w-3.5 h-3.5" />}
          <span>Compare</span>
        </button>

        {/* Availability & Verification Overlay at Bottom (Prices Removed) */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-end justify-between">
          <div>
            <div className="text-[11px] font-medium text-[#38bdf8] uppercase tracking-wider">
              {property.status === 'Available' ? 'Verified Title' : property.status}
            </div>
            <div className="text-sm sm:text-base font-bold text-white drop-shadow-md flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#4ade80]" />
              <span>{property.status === 'Available' ? 'Available for Inspection' : property.status}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#bfdbfe]/80 block">Pricing</span>
            <span className="text-xs font-semibold text-[#38bdf8]">
              Available on Request
            </span>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location & Corridor */}
          <div className="flex items-center gap-1.5 text-xs text-[#93c5fd] mb-2">
            <MapPin className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
            <span className="truncate">{property.corridor}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(property)}
            className="font-display text-lg sm:text-xl font-bold text-white hover:text-[#38bdf8] transition-colors cursor-pointer line-clamp-1"
          >
            {property.title}
          </h3>

          {/* Description */}
          <p className="mt-2 text-xs text-[#bfdbfe]/85 leading-relaxed line-clamp-2">
            {property.shortDescription}
          </p>

          {/* Specs Grid */}
          <div className="mt-4 pt-3 border-t border-[#1d4ed8]/20 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#bfdbfe] font-data">
            {property.bedrooms && (
              <div className="flex items-center gap-1">
                <Bed className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>{property.bedrooms} Beds</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center gap-1">
                <Bath className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>{property.bathrooms} Baths</span>
              </div>
            )}
            {property.units && (
              <div className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>{property.units} Units</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>{property.landSize}</span>
            </div>
          </div>

          {/* Title Type Tag */}
          <div className="mt-3 text-[11px] text-[#93c5fd] truncate">
            <span className="text-[#bfdbfe]/50">Title: </span>
            <span className="font-semibold text-[#38bdf8]">{property.titleType}</span>
          </div>
        </div>

        {/* Card Actions */}
        <div className="mt-5 pt-3 border-t border-[#1d4ed8]/20 flex items-center gap-2">
          <button
            onClick={() => onSelect(property)}
            className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-[#07132b] hover:bg-[#1d4ed8]/30 border border-[#1d4ed8]/50 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Details & Survey</span>
          </button>

          <button
            onClick={() => onBookViewing(property)}
            className="py-2 px-3 text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-[#2563eb]/25"
            title="Book Inspection"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Inspect</span>
          </button>
        </div>
      </div>
    </article>
  );
};
