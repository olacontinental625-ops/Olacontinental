import React, { useState } from 'react';
import {
  HardHat,
  Compass,
  Layers,
  Wrench,
  CheckCircle2,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageSquare,
  ShieldCheck,
  Building,
  Factory,
  Paintbrush,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export interface ConstructionProjectImage {
  id: string;
  image: string;
  title: string;
  category: 'foundations' | 'superstructures' | 'industrial' | 'pop-ceilings';
  categoryLabel: string;
  stage: string;
  description: string;
  technicalSpecs: string[];
  locationNote: string;
  leadEngineer: string;
}

export const CONSTRUCTION_GALLERY: ConstructionProjectImage[] = [
  {
    id: 'foundation-aleji-supervision',
    image: '/assets/aistudio/IMG-20261031-WA0100_49619ebf.jpg',
    title: 'Site Earthwork & Deep Excavation Supervision',
    category: 'foundations',
    categoryLabel: 'Foundations & Earthworks',
    stage: 'Substructure Excavation & Leveling',
    description: 'Engineer Samuel Aleji personally supervising massive deep foundation excavation and site gradient leveling in red laterite virgin soil, ensuring optimal load-bearing strata compliance before concrete blinding.',
    technicalSpecs: ['Soil Strata Compaction >250 kPa', 'Precision Cut-and-Fill Gradient', 'Personal On-Site Engineering Supervision'],
    locationNote: 'Under G Corridor Axis, Ogbomoso',
    leadEngineer: 'Engineer Samuel Aleji',
  },
  {
    id: 'foundation-reinforced-retaining-wall',
    image: '/assets/aistudio/IMG-20261031-WA0099_65c15e31.jpg',
    title: 'Reinforced Concrete Retaining Wall & Foundation Pit',
    category: 'foundations',
    categoryLabel: 'Foundations & Earthworks',
    stage: 'Heavy Substructure & Shuttering',
    description: 'Heavy-duty subterranean foundation pit featuring dense vertical high-tensile steel rebar columns, waterproof structural retaining wall formwork, and precision marine-board shuttering designed for multi-storey loads.',
    technicalSpecs: ['BS 8110 Structural Standards', 'High-Tensile T16 & T20 Rebar Cages', 'Waterproof C25/30 Concrete Mix'],
    locationNote: 'Commercial Belt Project, Ogbomoso',
    leadEngineer: 'Ola Continental Structural Team',
  },
  {
    id: 'industrial-reservoir-foundation',
    image: '/assets/aistudio/IMG-20261031-WA0098_6ec284da.jpg',
    title: 'Dual-Chamber Reinforced Concrete Industrial Reservoir',
    category: 'foundations',
    categoryLabel: 'Foundations & Earthworks',
    stage: 'Massive Liquid Storage & Raft Base',
    description: 'Civil engineering team assembling extensive cross-meshed rebar cages and braced timber formwork for a massive twin-chamber industrial water reservoir foundation, built to resist hydrostatic pressure.',
    technicalSpecs: ['Hydrostatic Pressure Resistance', 'Dual-Layer High-Yield Steel Mesh', 'Integrated Anti-Seepage Waterstop'],
    locationNote: 'Agro-Allied Plant Zone, Oyo State',
    leadEngineer: 'Engineer Samuel Aleji & Site Crew',
  },
  {
    id: 'strip-foundation-trench-masonry',
    image: '/assets/aistudio/IMG-20261031-WA0079_7a649416.jpg',
    title: 'Load-Bearing Strip Foundation & Trench Blockwork',
    category: 'foundations',
    categoryLabel: 'Foundations & Earthworks',
    stage: 'Foundation Masonry & Substructure Plinth',
    description: 'Bricklayers and civil technicians laying high-density vibrated concrete foundation blocks in excavated strip footings, leveled with optical water instrumentation before dpc casting.',
    technicalSpecs: ['9-inch Vibrated Solid Sandcrete Blocks', '1:3 Cement-Sand Mortar Matrix', 'Laser-Calibrated Alignment'],
    locationNote: 'Residential Estate Plot, Ogbomoso',
    leadEngineer: 'Ola Continental Masonry Unit',
  },
  {
    id: 'superstructure-contemporary-complex',
    image: '/assets/aistudio/IMG-20261031-WA0095_6a943e17.jpg',
    title: 'Contemporary Glass-Facade Commercial Duplex & Paving',
    category: 'superstructures',
    categoryLabel: 'Superstructures & Turnkey',
    stage: 'Superstructure Finishing & Exterior Paving',
    description: 'Architectural two-storey executive commercial/residential duplex with floor-to-ceiling panoramic glass curtain walls, cantilever balconies, and mechanized compaction for heavy-duty interlocking paving stones.',
    technicalSpecs: ['Architectural Tempered Tinted Glazing', 'Heavy-Duty 60mm Interlocking Pavers', 'Reinforced Cantilever Balconies'],
    locationNote: 'Prime High-Traffic Transit Road, Ogbomoso',
    leadEngineer: 'Ola Continental Architectural Division',
  },
  {
    id: 'superstructure-modern-executive-bungalow',
    image: '/assets/aistudio/IMG-20261031-WA0097_f6d3f6dd.jpg',
    title: 'Contemporary Executive Bungalow Under Finishing',
    category: 'superstructures',
    categoryLabel: 'Superstructures & Turnkey',
    stage: 'Exterior Plastering, Paving & Kerb Alignment',
    description: 'Completed single-level modern luxury bungalow featuring parapet roof detailing, dark stone-coated aluminum step tiles, arched portico entrance, and active courtyard grading with perimeter kerb casting.',
    technicalSpecs: ['Stone-Coated Aluminum Shingles', 'Arched Architectural Porch Columns', 'Perimeter Pre-Cast Kerb Concrete'],
    locationNote: 'Behind LAUTECH Teaching Hospital Corridor',
    leadEngineer: 'Ola Continental Construction Team',
  },
  {
    id: 'superstructure-roof-trusses-scaffolding',
    image: '/assets/aistudio/IMG-20261031-WA0091_e3f350fd.jpg',
    title: 'Hardwood Timber Roof Trusses & Structural Scaffolding',
    category: 'superstructures',
    categoryLabel: 'Superstructures & Turnkey',
    stage: 'High-Pitch Roof Carpentry & Parapet Casting',
    description: 'Structural roofing carpentry featuring treated hardwood king-post trusses, timber battens, and scaffolding platform erected for seamless installation of steep-pitch architectural roof covering.',
    technicalSpecs: ['Anti-Termite Treated Hardwood Trusses', 'Engineered Wind-Resistant Bracing', 'Safety-Certified Perimeter Scaffolding'],
    locationNote: 'Executive Residential Project, Ogbomoso',
    leadEngineer: 'Ola Continental Roofing & Carpentry Team',
  },
  {
    id: 'industrial-processing-drum-gantry',
    image: '/assets/aistudio/IMG-20261031-WA0096_e86d1680.jpg',
    title: 'Heavy Industrial Rotary Processing Drum & Steel Gantry',
    category: 'industrial',
    categoryLabel: 'Industrial Machinery & Plants',
    stage: 'Heavy Machinery Rigging & Plant Installation',
    description: 'Ola Continental engineers and mechanical technicians assembling a large-scale industrial rotary processing drum on heavy steel structural support towers inside an industrial warehouse with heavy haulage DAF site logistics.',
    technicalSpecs: ['Structural Steel H-Beams & Gantry', 'Precision Mechanical Drum Alignment', 'Heavy Fleet Logistics & Crane Handling'],
    locationNote: 'Industrial Agro-Processing Depot, Oyo State',
    leadEngineer: 'Ola Continental Industrial Engineering',
  },
  {
    id: 'industrial-weighbridge-station',
    image: '/assets/aistudio/IMG-20261031-WA0094_c444fb16.jpg',
    title: 'Calibrated 60-Tonne Industrial Weighbridge Station',
    category: 'industrial',
    categoryLabel: 'Industrial Machinery & Plants',
    stage: 'Commissioning & Operational Vehicle Calibration',
    description: 'Turnkey installation of a full-length 60-tonne industrial electronic weighbridge deck with security weigh-cabin, heavy-duty concrete approach ramps, and live test calibration using Ola Continental site vehicles.',
    technicalSpecs: ['60,000 kg Weighing Capacity', 'Electronic Digital Load-Cell Array', 'Reinforced Heavy-Truck Concrete Approach'],
    locationNote: 'Aroje Industrial Belt Corridor',
    leadEngineer: 'Engineer Samuel Aleji & Plant Crew',
  },
  {
    id: 'industrial-steel-assembly-technicians',
    image: '/assets/aistudio/IMG-20261031-WA0092_338dad7e.jpg',
    title: 'Structural Steel Framing & Industrial Platform Fabrication',
    category: 'industrial',
    categoryLabel: 'Industrial Machinery & Plants',
    stage: 'Steel Beam Bolting & Leveling',
    description: 'Ola Continental technical crew assembling heavy industrial steel I-beams, cross-members, and high-tensile torque bolts on site foundation footings for factory weighbridge processing machinery.',
    technicalSpecs: ['Grade 50 High-Tensile Structural Steel', 'Corrosion-Resistant Primer Coating', 'Field Ultrasonic Weld & Bolt Quality Check'],
    locationNote: 'Factory Project Site, Ogbomoso',
    leadEngineer: 'Ola Continental Metal Fabricators',
  },
  {
    id: 'industrial-field-hilux-reconnaissance',
    image: '/assets/aistudio/IMG-20261031-WA0093_54cdd052.jpg',
    title: 'Ola Continental Dedicated 4x4 Field Inspection Vehicle',
    category: 'industrial',
    categoryLabel: 'Industrial Machinery & Plants',
    stage: 'Site Reconnaissance & Logistics Fleet',
    description: 'Ola Continental heavy-duty 4x4 Toyota Hilux field reconnaissance vehicle (KTU-133DX) used by Engineer Samuel Aleji and survey personnel for off-road site inspections, material transit, and beacon tracking.',
    technicalSpecs: ['All-Terrain 4WD Engineering Vehicle', 'Rapid Emergency Site Transit', 'Equipped with Leica Surveying GPS Kits'],
    locationNote: 'Active Field Operations, Oyo & Lagos States',
    leadEngineer: 'Ola Continental Logistics Fleet',
  },
  {
    id: 'pop-stepped-recessed-grooves',
    image: '/assets/aistudio/IMG-20261031-WA0088_97524763.jpg',
    title: 'Architectural Geometric Stepped POP Ceiling with Troughs',
    category: 'pop-ceilings',
    categoryLabel: 'Master POP Ceilings',
    stage: 'Interior Ceiling Plastering & Light Cavities',
    description: 'Handcrafted Plaster of Paris (POP) ceiling design featuring concentric stepped rectangular relief recesses, concealed cove lighting troughs, and ultra-smooth skim-coated finishing.',
    technicalSpecs: ['Premium Casting POP Plaster & Sisal Fibre', 'Concealed LED Strip Light Troughs', 'Seamless 90-Degree Stepped Reveals'],
    locationNote: 'Grand Olukoko Executive Duplex Living Hall',
    leadEngineer: 'Ola Continental Interior Finishes Team',
  },
  {
    id: 'pop-linear-grooves-centerpiece',
    image: '/assets/aistudio/IMG-20261031-WA0089_fc7755dc.jpg',
    title: 'Modern Linear Shadow-Line POP Ceiling Pattern',
    category: 'pop-ceilings',
    categoryLabel: 'Master POP Ceilings',
    stage: 'Architectural Groove Molding & Chandelier Anchor',
    description: 'Contemporary POP ceiling crafted with razor-sharp shadow-line grooves and a reinforced central ceiling medallion pre-wired for heavy luxury chandeliers.',
    technicalSpecs: ['Precision Shadow-Line Channel Detailing', 'Reinforced Chandelier Anchor Point', 'Acoustic Sound Damping Composition'],
    locationNote: 'Master Penthouse Suite, Ogbomoso',
    leadEngineer: 'Ola Continental Interior Finishes Team',
  },
  {
    id: 'pop-deep-tray-conduit-wiring',
    image: '/assets/aistudio/IMG-20261031-WA0087_c764a27c.jpg',
    title: 'Deep Recessed Tray POP Ceiling with Integrated Conduits',
    category: 'pop-ceilings',
    categoryLabel: 'Master POP Ceilings',
    stage: 'Suspended Ceiling Framework & Electrical Rough-In',
    description: 'Multi-layer suspended tray ceiling providing substantial vertical depth, integrated flame-retardant PVC electrical conduit channels, and multi-tier perimeter cornices.',
    technicalSpecs: ['Suspended Galvanized Wire Mesh Framework', 'Flame-Retardant Conduit Integration', 'Triple-Tier Perimeter Cornices'],
    locationNote: 'Executive Villa Dining Hall, Ogbomoso',
    leadEngineer: 'Ola Continental Interior Finishes Team',
  },
  {
    id: 'pop-corridor-linear-downlights',
    image: '/assets/aistudio/IMG-20261031-WA0086_215a48f6.jpg',
    title: 'Linear Hallway POP Ceiling with Directional LED Channels',
    category: 'pop-ceilings',
    categoryLabel: 'Master POP Ceilings',
    stage: 'Corridor Architectural Illumination Framing',
    description: 'Custom linear corridor POP ceiling designed to visually elongate interior passageways while providing structured cutouts for spotlights and recessed downlights.',
    technicalSpecs: ['Linear Continuous Axis Framing', 'Evenly Spaced 75mm Downlight Ports', 'Zero-Sag High-Strength POP Plaster'],
    locationNote: 'Upper Executive Corridor, Duplex Residence',
    leadEngineer: 'Ola Continental Interior Finishes Team',
  },
  {
    id: 'pop-floating-island-tray',
    image: '/assets/aistudio/IMG-20261031-WA0084_35adec33.jpg',
    title: 'Floating Acoustic Island POP Ceiling with Cantilever Edge',
    category: 'pop-ceilings',
    categoryLabel: 'Master POP Ceilings',
    stage: 'Cantilever Ceiling Island Construction',
    description: 'Innovative floating island POP ceiling design that creates an elegant negative space around the ceiling perimeter for 360-degree ambient mood illumination.',
    technicalSpecs: ['Cantilevered Floating Edge Framing', '360° Perimeter Light Spill Clearance', 'High Precision Plaster Alignment'],
    locationNote: 'Private Cinema & Lounge, Ogbomoso',
    leadEngineer: 'Ola Continental Interior Finishes Team',
  },
  {
    id: 'pop-multitier-cornice-craftsmanship',
    image: '/assets/aistudio/IMG-20261031-WA0085_a62c56ca.jpg',
    title: 'Multi-Tiered Stepped Cornice Architectural POP',
    category: 'pop-ceilings',
    categoryLabel: 'Master POP Ceilings',
    stage: 'Hand-Molded Architectural Cornices',
    description: 'Classical modern stepped cornice detailing hand-crafted along perimeter wall-ceiling junctions, creating sharp architectural shadow lines and preventing edge cracking.',
    technicalSpecs: ['Flexible Sisal Fibre Reinforcement', 'Hairline Crack Prevention Treatment', 'Hand-Crafted 90-Degree Internal Angles'],
    locationNote: 'Executive Bedroom Suite, Under G',
    leadEngineer: 'Ola Continental Interior Finishes Team',
  },
  {
    id: 'pop-triple-band-linear-minimalism',
    image: '/assets/aistudio/IMG-20261031-WA0083_b57d9f74.jpg',
    title: 'Triple-Band Minimalist Reveal POP Ceiling Design',
    category: 'pop-ceilings',
    categoryLabel: 'Master POP Ceilings',
    stage: 'Minimalist Modern Groove Detailing',
    description: 'Architectural minimalist POP ceiling featuring three parallel recessed reveals, perfectly suited for contemporary modern living rooms seeking refined understated elegance.',
    technicalSpecs: ['Triple Parallel 25mm Recessed Grooves', 'Symmetrical Centerline Balancing', 'Ultra-Smooth Primer Ready Surface'],
    locationNote: 'Family Lounge, Luxury Residence, Ogbomoso',
    leadEngineer: 'Ola Continental Interior Finishes Team',
  },
];

interface BuildingConstructionShowcaseProps {
  onOpenViewingModal?: () => void;
  onOpenChat?: () => void;
}

export const BuildingConstructionShowcase: React.FC<BuildingConstructionShowcaseProps> = ({
  onOpenViewingModal,
  onOpenChat,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'foundations' | 'superstructures' | 'industrial' | 'pop-ceilings'>('all');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const filteredItems = CONSTRUCTION_GALLERY.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const activeItem = selectedImageIndex !== null ? filteredItems[selectedImageIndex] : null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((prev) => (prev! > 0 ? prev! - 1 : filteredItems.length - 1));
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((prev) => (prev! < filteredItems.length - 1 ? prev! + 1 : 0));
    }
  };

  return (
    <section id="building-construction" className="mt-16 pt-16 border-t-2 border-[#1d4ed8]/30">
      {/* Grand Architectural Header in Royal Blue & Light Blue Palette */}
      <div className="bg-gradient-to-br from-[#07132b] via-[#0b1e42] to-[#0d2859] rounded-3xl p-8 sm:p-12 border border-[#1d4ed8]/40 shadow-2xl relative overflow-hidden mb-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2563eb]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#38bdf8]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#1d4ed8]/30 border border-[#38bdf8]/40 text-[#38bdf8] text-xs font-semibold tracking-wider uppercase mb-5">
            <HardHat className="w-4 h-4 text-[#38bdf8]" />
            <span>CIVIL ENGINEERING & INFRASTRUCTURE DIVISION · ESTABLISHED 2006</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            Ola Continental Building & Construction Division
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#bfdbfe] leading-relaxed">
            In addition to premier property brokerage, Ola Continental operates a registered, comprehensive Civil Engineering & Structural Construction practice under the direct personal supervision of <strong className="text-white font-semibold">Engineer Samuel Aleji</strong>. From deep substructure earthworks and high-tensile reinforced concrete to industrial factory plants, turnkey luxury duplexes, and master-crafted POP architectural ceilings.
          </p>

          {/* Civil Engineering Counter Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-[#1d4ed8]/40">
            <div className="bg-[#07132b]/80 border border-[#1d4ed8]/40 rounded-xl p-4">
              <div className="text-2xl sm:text-3xl font-bold text-white font-data">180+</div>
              <div className="text-xs text-[#93c5fd] mt-1 font-medium">Buildings Completed</div>
            </div>
            <div className="bg-[#07132b]/80 border border-[#1d4ed8]/40 rounded-xl p-4">
              <div className="text-2xl sm:text-3xl font-bold text-[#38bdf8] font-data">45+</div>
              <div className="text-xs text-[#93c5fd] mt-1 font-medium">Student Hostels Built</div>
            </div>
            <div className="bg-[#07132b]/80 border border-[#1d4ed8]/40 rounded-xl p-4">
              <div className="text-2xl sm:text-3xl font-bold text-white font-data">60-Tonne</div>
              <div className="text-xs text-[#93c5fd] mt-1 font-medium">Industrial Weighbridges</div>
            </div>
            <div className="bg-[#07132b]/80 border border-[#1d4ed8]/40 rounded-xl p-4">
              <div className="text-2xl sm:text-3xl font-bold text-[#4ade80] font-data">100%</div>
              <div className="text-xs text-[#93c5fd] mt-1 font-medium">Zero Structural Failure</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#38bdf8] font-semibold">Engineering Portfolio Showcase</span>
          <h3 className="text-2xl font-bold text-white font-display mt-0.5">
            18 Real Site Works & Architectural Finishes
          </h3>
          <p className="text-xs text-[#93c5fd] mt-1">
            Browse authentic site photography across all civil construction phases. Click any image for engineering details.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-[#0b1e42] p-1.5 rounded-2xl border border-[#1d4ed8]/40">
          <button
            onClick={() => { setActiveCategory('all'); setSelectedImageIndex(null); }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/30'
                : 'text-[#93c5fd] hover:text-white hover:bg-[#1d4ed8]/20'
            }`}
          >
            All Works (18)
          </button>
          <button
            onClick={() => { setActiveCategory('foundations'); setSelectedImageIndex(null); }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'foundations'
                ? 'bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/30'
                : 'text-[#93c5fd] hover:text-white hover:bg-[#1d4ed8]/20'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Foundations & Earthworks (4)</span>
          </button>
          <button
            onClick={() => { setActiveCategory('superstructures'); setSelectedImageIndex(null); }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'superstructures'
                ? 'bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/30'
                : 'text-[#93c5fd] hover:text-white hover:bg-[#1d4ed8]/20'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Superstructures & Turnkey (3)</span>
          </button>
          <button
            onClick={() => { setActiveCategory('industrial'); setSelectedImageIndex(null); }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'industrial'
                ? 'bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/30'
                : 'text-[#93c5fd] hover:text-white hover:bg-[#1d4ed8]/20'
            }`}
          >
            <Factory className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Industrial & Weighbridges (4)</span>
          </button>
          <button
            onClick={() => { setActiveCategory('pop-ceilings'); setSelectedImageIndex(null); }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeCategory === 'pop-ceilings'
                ? 'bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/30'
                : 'text-[#93c5fd] hover:text-white hover:bg-[#1d4ed8]/20'
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Master POP Ceilings (7)</span>
          </button>
        </div>
      </div>

      {/* 18-Image Interactive Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => (
          <div
            key={item.id}
            onClick={() => setSelectedImageIndex(index)}
            className="group bg-[#0b1e42] border border-[#1d4ed8]/40 hover:border-[#38bdf8] rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#2563eb]/20 flex flex-col cursor-pointer"
          >
            {/* Image Container with Aspect Ratio and Lightbox Trigger */}
            <div className="relative aspect-[4/3] bg-[#07132b] overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1e42] via-transparent to-black/30" />

              {/* Category & Stage Badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-md bg-[#07132b]/90 text-[#38bdf8] border border-[#1d4ed8]/60 backdrop-blur-sm">
                  {item.categoryLabel}
                </span>
                <span className="p-1.5 rounded-lg bg-black/60 text-white backdrop-blur-sm group-hover:bg-[#2563eb] transition-colors">
                  <Maximize2 className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Stage Overlay on Bottom */}
              <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
                <span className="text-[11px] font-medium text-white/90 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                  {item.stage}
                </span>
              </div>
            </div>

            {/* Description & Technical Specs */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-display text-lg font-bold text-white group-hover:text-[#38bdf8] transition-colors line-clamp-1 mb-2">
                  {item.title}
                </h4>
                <p className="text-xs text-[#bfdbfe] leading-relaxed line-clamp-3 mb-4">
                  {item.description}
                </p>

                {/* Technical Bullet Tags */}
                <div className="space-y-1.5 mb-4">
                  {item.technicalSpecs.slice(0, 2).map((spec, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-1.5 text-[11px] text-[#93c5fd]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                      <span className="line-clamp-1">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#1d4ed8]/30 flex items-center justify-between text-[11px] text-[#93c5fd]">
                <span className="truncate">{item.locationNote}</span>
                <span className="font-semibold text-[#38bdf8] group-hover:underline shrink-0 flex items-center gap-1">
                  Inspect Specs <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Turnkey Building Process & Call-to-Action Bar */}
      <div className="mt-14 bg-gradient-to-r from-[#0b1e42] via-[#0f2d6b] to-[#0b1e42] border border-[#1d4ed8]/50 rounded-2xl p-8 sm:p-10 shadow-xl">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#38bdf8] bg-[#07132b]/80 px-3 py-1 rounded-full border border-[#1d4ed8]/60 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4ade80]" />
            <span>TURNKEY CIVIL CONTRACTING & ARCHITECTURAL CONSULTING</span>
          </div>

          <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Have a Building Project in Ogbomoso or Lagos?
          </h3>

          <p className="mt-3 text-sm text-[#bfdbfe] leading-relaxed max-w-2xl mx-auto">
            From single-plot luxury bungalows and LAUTECH multi-unit student hostels to commercial factory warehouses, weighbridges, and interior POP gypsum ceiling artistry — Engineer Samuel Aleji provides vetted architectural plans, Bill of Engineering Quantities (BOQ), and turnkey site construction.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://wa.me/2348033848107?text=Hello%20Ola%20Continental%20and%20Engr%20Samuel%20Aleji,%20I%20would%20like%20to%20request%20a%20turnkey%20Building%20and%20Construction%20quote%20for%20my%20project."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-lg shadow-[#2563eb]/25 flex items-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Request Construction Quote on WhatsApp (+234 803 384 8107)</span>
            </a>

            {onOpenViewingModal && (
              <button
                onClick={onOpenViewingModal}
                className="px-6 py-3 bg-[#07132b] hover:bg-[#1d4ed8]/30 border border-[#38bdf8]/50 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <HardHat className="w-4 h-4 text-[#38bdf8]" />
                <span>Book On-Site Civil Engineering Inspection</span>
              </button>
            )}

            {onOpenChat && (
              <button
                onClick={onOpenChat}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#38bdf8]" />
                <span>Ask Ola AI Assistant for BOQ Estimate</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal for High-Resolution Full-Screen Engineering Inspection */}
      {activeItem && selectedImageIndex !== null && (
        <div
          onClick={() => setSelectedImageIndex(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#0b1e42] border border-[#1d4ed8] rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1d4ed8]/40 bg-[#07132b]">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#38bdf8] bg-[#1d4ed8]/30 px-3 py-1 rounded-md border border-[#38bdf8]/30">
                  {activeItem.categoryLabel}
                </span>
                <span className="text-xs text-[#93c5fd]">
                  {selectedImageIndex + 1} of {filteredItems.length}
                </span>
              </div>
              <button
                onClick={() => setSelectedImageIndex(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1">
              {/* High-Res Image with Next/Prev Controls */}
              <div className="lg:col-span-7 bg-black flex items-center justify-center relative min-h-[320px] sm:min-h-[440px]">
                <img
                  src={activeItem.image}
                  alt={activeItem.title}
                  className="max-h-[65vh] w-auto max-w-full object-contain"
                />

                {/* Left / Right Navigation Buttons */}
                <button
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-[#2563eb] text-white transition-colors cursor-pointer"
                  title="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-[#2563eb] text-white transition-colors cursor-pointer"
                  title="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Engineering Specs Sidebar */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-[#0b1e42]">
                <div>
                  <div className="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider mb-1">
                    {activeItem.stage}
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-3 leading-snug">
                    {activeItem.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#bfdbfe] leading-relaxed mb-6">
                    {activeItem.description}
                  </p>

                  <div className="space-y-4 mb-6">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#93c5fd]">
                        Technical Specifications & Methodology
                      </span>
                      <div className="mt-2 space-y-2">
                        {activeItem.technicalSpecs.map((spec, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                            <CheckCircle2 className="w-4 h-4 text-[#4ade80] shrink-0 mt-0.5" />
                            <span>{spec}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-[#07132b] rounded-xl border border-[#1d4ed8]/30 space-y-1 text-xs">
                      <div className="text-slate-400">
                        <span className="text-[#93c5fd] font-medium">Site Location:</span> {activeItem.locationNote}
                      </div>
                      <div className="text-slate-400">
                        <span className="text-[#93c5fd] font-medium">Lead Engineer:</span> {activeItem.leadEngineer}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1d4ed8]/40 space-y-2">
                  <a
                    href={`https://wa.me/2348033848107?text=Hello%20Ola%20Continental,%20I%20am%20inquiring%20about%20the%20${encodeURIComponent(activeItem.title)}%20shown%20on%20your%20Building%20and%20Construction%20page.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Inquire About Similar Site Work</span>
                  </a>
                  <button
                    onClick={() => setSelectedImageIndex(null)}
                    className="w-full py-2 bg-transparent hover:bg-white/5 text-slate-300 text-xs font-medium rounded-xl transition-colors"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
