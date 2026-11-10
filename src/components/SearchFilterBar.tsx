import React from 'react';
import { Search, RotateCcw, Filter, Sparkles, Building2, MapPin } from 'lucide-react';
import { PropertyPurpose, PropertyType, Corridor } from '../types';

interface SearchFilterBarProps {
  selectedPurpose: PropertyPurpose;
  onSelectPurpose: (purpose: PropertyPurpose) => void;
  selectedType: PropertyType;
  onSelectType: (type: PropertyType) => void;
  selectedCorridor: Corridor;
  onSelectCorridor: (corridor: Corridor) => void;
  maxBudget?: number;
  onBudgetChange?: (val: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onReset: () => void;
  onOpenMatcher: () => void;
  totalResults: number;
}

const PURPOSES: PropertyPurpose[] = ['All', 'Buy', 'Invest', 'Rent', 'Lease'];

const TYPES: PropertyType[] = ['All', 'House', 'Student Hostel', 'Apartment', 'Land', 'Commercial Property'];

const CORRIDORS: Corridor[] = [
  'All Corridors',
  'Behind LAUTECH Teaching Hospital',
  'Under G',
  'Adenike',
  'Mushin Commercial Corridor',
  'Aroje',
  'Takie',
  'Odo-Oba'
];

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  selectedPurpose,
  onSelectPurpose,
  selectedType,
  onSelectType,
  selectedCorridor,
  onSelectCorridor,
  searchQuery,
  onSearchChange,
  onReset,
  onOpenMatcher,
  totalResults,
}) => {

  return (
    <div className="bg-[#0b1e42] border border-[#1d4ed8]/40 rounded-2xl p-4 sm:p-6 shadow-2xl mb-10">
      {/* Top Segmented Controls for Purpose */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1d4ed8]/30">
        <div className="flex items-center gap-1.5 p-1 bg-[#07132b] rounded-xl border border-[#1d4ed8]/40 overflow-x-auto max-w-full">
          {PURPOSES.map((purpose) => {
            const isActive = selectedPurpose === purpose;
            return (
              <button
                key={purpose}
                onClick={() => onSelectPurpose(purpose)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#2563eb] text-white shadow-sm'
                    : 'text-[#bfdbfe]/80 hover:text-white hover:bg-white/5'
                }`}
              >
                {purpose === 'All' ? 'All Purposes' : purpose}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMatcher}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#07132b] hover:bg-[#1d4ed8]/30 border border-[#38bdf8]/40 rounded-lg transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Honest 7-Step Matcher</span>
          </button>

          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#93c5fd] hover:text-white transition-colors cursor-pointer"
            title="Reset Filters"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Filter Controls Grid (3-Column Layout without prices) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        {/* Keyword Search */}
        <div>
          <label className="block text-xs font-medium text-[#bfdbfe] mb-1.5">Search Keywords</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#93c5fd]/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="e.g. Duplex, Borehole, Adenike..."
              className="w-full pl-9 pr-3 py-2 text-xs text-white bg-[#07132b] border border-[#1d4ed8]/40 rounded-lg focus:outline-none focus:border-[#38bdf8] transition-colors placeholder:text-[#93c5fd]/50"
            />
          </div>
        </div>

        {/* Property Type Dropdown */}
        <div>
          <label className="block text-xs font-medium text-[#bfdbfe] mb-1.5">Property Category</label>
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => onSelectType(e.target.value as PropertyType)}
              className="w-full px-3 py-2 text-xs text-white bg-[#07132b] border border-[#1d4ed8]/40 rounded-lg focus:outline-none focus:border-[#38bdf8] transition-colors appearance-none cursor-pointer"
            >
              {TYPES.map((t) => (
                <option key={t} value={t} className="bg-[#07132b] text-white">
                  {t === 'All' ? 'All Categories' : t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Corridor Dropdown */}
        <div>
          <label className="block text-xs font-medium text-[#bfdbfe] mb-1.5">Corridor / Location</label>
          <div className="relative">
            <select
              value={selectedCorridor}
              onChange={(e) => onSelectCorridor(e.target.value as Corridor)}
              className="w-full px-3 py-2 text-xs text-white bg-[#07132b] border border-[#1d4ed8]/40 rounded-lg focus:outline-none focus:border-[#38bdf8] transition-colors appearance-none cursor-pointer"
            >
              {CORRIDORS.map((c) => (
                <option key={c} value={c} className="bg-[#07132b] text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count Strip */}
      <div className="mt-4 pt-3 border-t border-[#1d4ed8]/20 flex items-center justify-between text-xs text-[#bfdbfe]/80">
        <div className="flex items-center gap-2">
          <span className="font-data font-bold text-[#38bdf8]">{totalResults}</span>
          <span>verified listings found</span>
        </div>
        <div className="text-[11px] text-[#93c5fd]">
          All verified by Cadastral Charting & Root Audit
        </div>
      </div>
    </div>
  );
};
