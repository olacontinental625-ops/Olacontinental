import React, { useState, useEffect, useMemo } from 'react';
import {
  HardHat,
  CheckCircle2,
  MapPin,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageSquare,
  Sparkles,
  Send,
  Calendar,
  Building2,
  Wrench,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { OlaLogoMark } from './OlaLogoMark';
import { createFirestoreLead, createFirestoreContact, listenToConstructions } from '../lib/firebase';
import { ContactInquiry, ConstructionProject } from '../types';

export interface ConstructionProjectItem {
  id: string;
  image: string;
  title: string;
  status: 'ongoing' | 'finished';
  statusLabel: string;
  completionPercent: number;
  phase: string;
  location: string;
  description: string;
  specs: string[];
  leadEngineer: string;
}

export const CONSTRUCTION_PROJECTS: ConstructionProjectItem[] = [
  // ================= ONGOING CONSTRUCTIONS (WORKED ON) =================
  {
    id: 'ongoing-earthwork-excavation',
    image: '/assets/aistudio/IMG-20261031-WA0100_49619ebf.jpg',
    title: 'Site Earthwork & Deep Foundation Excavation',
    status: 'ongoing',
    statusLabel: 'Ongoing Construction',
    completionPercent: 35,
    phase: 'Substructure Excavation & Gradient Leveling',
    location: 'Under G Corridor Axis, Ogbomoso',
    description:
      'Active deep foundation trench excavation and virgin laterite strata leveling supervised directly on site by Engineer Samuel Aleji prior to concrete blinding.',
    specs: [
      'Soil Bearing Compaction >250 kPa',
      'Laser-Calibrated Cut-and-Fill Gradient',
      'Direct Civil Engineer On-Site Supervision',
    ],
    leadEngineer: 'Engr. Samuel Aleji',
  },
  {
    id: 'ongoing-retaining-wall-shuttering',
    image: '/assets/aistudio/IMG-20261031-WA0099_65c15e31.jpg',
    title: 'Reinforced Concrete Retaining Wall & Foundation Pit',
    status: 'ongoing',
    statusLabel: 'Ongoing Construction',
    completionPercent: 45,
    phase: 'Heavy Substructure & Rebar Shuttering',
    location: 'Commercial Belt Project, Ogbomoso',
    description:
      'Subterranean foundation pit actively being reinforced with dense high-tensile steel columns and waterproof marine-board retaining wall formwork.',
    specs: [
      'BS 8110 Structural Reinforcement Standard',
      'High-Tensile T16 & T20 Rebar Cages',
      'Waterproof C25/30 Concrete Mix Design',
    ],
    leadEngineer: 'Ola Continental Structural Team',
  },
  {
    id: 'ongoing-industrial-reservoir',
    image: '/assets/aistudio/IMG-20261031-WA0098_6ec284da.jpg',
    title: 'Dual-Chamber Reinforced Industrial Concrete Reservoir',
    status: 'ongoing',
    statusLabel: 'Ongoing Construction',
    completionPercent: 55,
    phase: 'Twin-Chamber Steel Mesh & Raft Base',
    location: 'Agro-Allied Plant Zone, Oyo State',
    description:
      'Civil crew assembling cross-meshed high-yield rebar and heavy braced formwork for an industrial liquid storage reservoir engineered against hydrostatic load.',
    specs: [
      'Dual-Layer High-Yield Steel Mesh',
      'Integrated Anti-Seepage Waterstop Joints',
      'Hydrostatic Wall Bracing',
    ],
    leadEngineer: 'Engr. Samuel Aleji & Site Crew',
  },
  {
    id: 'ongoing-strip-foundation-masonry',
    image: '/assets/aistudio/IMG-20261031-WA0079_7a649416.jpg',
    title: 'Load-Bearing Strip Foundation & Trench Blockwork',
    status: 'ongoing',
    statusLabel: 'Ongoing Construction',
    completionPercent: 40,
    phase: 'Foundation Masonry & Plinth Alignment',
    location: 'Residential Estate Plot, Ogbomoso',
    description:
      'Masonry team setting 9-inch vibrated solid sandcrete blocks in excavated strip footings ahead of damp-proof course concrete slab casting.',
    specs: [
      '9-Inch Vibrated Solid Sandcrete Blocks',
      '1:3 Rich Cement-Sand Mortar Matrix',
      'Optical Level Datum Alignment',
    ],
    leadEngineer: 'Ola Continental Masonry Unit',
  },
  {
    id: 'ongoing-roof-trusses-scaffolding',
    image: '/assets/aistudio/IMG-20261031-WA0091_e3f350fd.jpg',
    title: 'Hardwood Timber Roof Trusses & Structural Scaffolding',
    status: 'ongoing',
    statusLabel: 'Ongoing Construction',
    completionPercent: 70,
    phase: 'High-Pitch Roof Carpentry & Parapet Works',
    location: 'Executive Residential Site, Ogbomoso',
    description:
      'Structural carpentry crews erecting treated hardwood king-post trusses, wind bracing, and full perimeter scaffolding ahead of stone-coated roofing.',
    specs: [
      'Anti-Termite Treated Hardwood Trusses',
      'Engineered Wind-Uplift Bracing',
      'Full Perimeter Safety Scaffolding',
    ],
    leadEngineer: 'Ola Continental Roofing Team',
  },
  {
    id: 'ongoing-industrial-rotary-drum',
    image: '/assets/aistudio/IMG-20261031-WA0096_e86d1680.jpg',
    title: 'Industrial Rotary Processing Drum & Steel Gantry',
    status: 'ongoing',
    statusLabel: 'Ongoing Construction',
    completionPercent: 75,
    phase: 'Heavy Machinery Rigging & Steel Support',
    location: 'Agro-Processing Depot, Oyo State',
    description:
      'Mechanical and civil technicians rigging a full-scale industrial rotary processing drum onto heavy structural steel H-beam support towers.',
    specs: [
      'Structural Steel H-Beam Towers',
      'Precision Laser Drum Alignment',
      'Heavy Haulage & Crane Rigging',
    ],
    leadEngineer: 'Ola Continental Industrial Engineering',
  },
  {
    id: 'ongoing-steel-platform-framing',
    image: '/assets/aistudio/IMG-20261031-WA0092_338dad7e.jpg',
    title: 'Structural Steel Framing & Platform Fabrication',
    status: 'ongoing',
    statusLabel: 'Ongoing Construction',
    completionPercent: 65,
    phase: 'Steel I-Beam Bolting & Leveling',
    location: 'Factory Project Site, Ogbomoso',
    description:
      'Steel fabrication crew bolting Grade 50 structural I-beams and cross-members onto concrete foundation plinths for heavy industrial equipment.',
    specs: [
      'Grade 50 High-Tensile Steel I-Beams',
      'Anti-Corrosion Industrial Primer',
      'Torque-Calibrated Structural Bolting',
    ],
    leadEngineer: 'Ola Continental Metal Fabricators',
  },
  {
    id: 'ongoing-tray-pop-conduit',
    image: '/assets/aistudio/IMG-20261031-WA0087_c764a27c.jpg',
    title: 'Recessed Tray POP Ceiling & Conduit Rough-In',
    status: 'ongoing',
    statusLabel: 'Ongoing Construction',
    completionPercent: 80,
    phase: 'Suspended Ceiling Framework & MEP Rough-In',
    location: 'Executive Villa Dining Hall, Ogbomoso',
    description:
      'Multi-layer suspended POP tray framework actively fitted with flame-retardant PVC lighting conduits and triple-tier perimeter cornices.',
    specs: [
      'Galvanized Wire Mesh Suspension',
      'Flame-Retardant Electrical Conduits',
      'Triple-Tier Handcrafted Cornices',
    ],
    leadEngineer: 'Ola Continental Interior Finishes Team',
  },

  // ================= FINISHED PROPERTIES =================
  {
    id: 'finished-ola-headquarters',
    image: '/assets/aistudio/910713664_1455940486721545_188622865862031933_n_c003821d.jpg',
    title: 'Ola Continental Corporate Headquarters Building',
    status: 'finished',
    statusLabel: 'Finished Property',
    completionPercent: 100,
    phase: 'Completed Two-Storey Neoclassical Complex',
    location: 'No. 2 Olukoko St., Behind LAUTECH Hospital',
    description:
      'Signature brick-clad two-storey headquarters featuring monumental fluted columns, stepped gable roof, aluminum casement glazing, and paved perimeter forecourt.',
    specs: [
      'Reinforced Two-Storey Brick & Column Frame',
      'Long-Span Insulated Metal Roofing',
      'Operational Brokerage & Engineering Landmark',
    ],
    leadEngineer: 'Engr. Samuel Aleji (Principal Architect & Builder)',
  },
  {
    id: 'finished-grand-olukoko-duplex',
    image: '/assets/aistudio/IMG-20261031-WA0095_6a943e17.jpg',
    title: 'The Grand Olukoko 4-Bedroom Executive Duplex',
    status: 'finished',
    statusLabel: 'Finished Property',
    completionPercent: 100,
    phase: 'Completed Executive Residence & Paved Courtyard',
    location: 'Olukoko Extension, Behind LAUTECH Hospital',
    description:
      'Turnkey finished 4-bedroom detached luxury duplex with panoramic tinted glass curtain walls, cantilevered balconies, and compacted 60mm interlocking courtyard.',
    specs: [
      'Tempered Curtain Glazing & Cantilever Balconies',
      'Heavy-Duty 60mm Interlocking Paving',
      '650 sqm Registered Survey Title (SC/OY/2023/1104)',
    ],
    leadEngineer: 'Ola Continental Architectural Division',
  },
  {
    id: 'finished-crown-view-bungalow',
    image: '/assets/aistudio/IMG-20261031-WA0097_f6d3f6dd.jpg',
    title: 'Crown View Modern 3-Bedroom Executive Bungalow',
    status: 'finished',
    statusLabel: 'Finished Property',
    completionPercent: 100,
    phase: 'Completed Turnkey Single-Level Home',
    location: 'Under G Residential Corridor, Ogbomoso',
    description:
      'Finished single-level contemporary bungalow complete with parapet roof trim, stone-coated aluminum shingles, arched portico entrance, and pre-cast compound kerbs.',
    specs: [
      'Stone-Coated Aluminum Step Tiles',
      'All Bedrooms Ensuite + Borehole Tower',
      '500 sqm Charted Survey Plot (UG/OY/2024/0219)',
    ],
    leadEngineer: 'Ola Continental Construction Team',
  },
  {
    id: 'finished-lautech-student-hostel',
    image: '/assets/aistudio/IMG-20261021-WA0038_61f97529.jpg',
    title: 'LAUTECH 16-Unit Self-Contained Student Hostel',
    status: 'finished',
    statusLabel: 'Finished Property',
    completionPercent: 100,
    phase: 'Completed Multi-Unit Income Asset (100% Occupied)',
    location: 'Adenike Campus Belt, Ogbomoso',
    description:
      'Delivered 2-storey student hostel comprising 16 private ensuite studio apartments, commercial borehole water tower, prepaid submeters, and paved courtyard.',
    specs: [
      '16 Private Ensuite Student Units',
      'Commercial Borehole & Dual Water Towers',
      'Approved Oyo State Building Permit (BK/OY/2021/0458)',
    ],
    leadEngineer: 'Engr. Samuel Aleji',
  },
  {
    id: 'finished-weighbridge-station',
    image: '/assets/aistudio/IMG-20261031-WA0094_c444fb16.jpg',
    title: 'Calibrated 60-Tonne Industrial Weighbridge Station',
    status: 'finished',
    statusLabel: 'Finished Property',
    completionPercent: 100,
    phase: 'Commissioned & Calibrated Industrial Facility',
    location: 'Aroje Industrial Corridor, Ogbomoso',
    description:
      'Completed heavy-duty 60-tonne electronic truck weighbridge deck with reinforced concrete approach ramps, digital weigh cabin, and load calibration sign-off.',
    specs: [
      '60,000 kg Calibrated Weighing Deck',
      'Digital Load-Cell Telemetry & Cabin',
      'Heavy-Axle Concrete Approach Ramps',
    ],
    leadEngineer: 'Engr. Samuel Aleji & Plant Crew',
  },
  {
    id: 'finished-pop-suites-interiors',
    image: '/assets/aistudio/IMG-20261031-WA0088_97524763.jpg',
    title: 'Master Architectural POP Ceiling & Living Suites',
    status: 'finished',
    statusLabel: 'Finished Property',
    completionPercent: 100,
    phase: 'Handed-Over Luxury Interior Finishes',
    location: 'Olukoko & Under G Residences, Ogbomoso',
    description:
      'Completed handcrafted stepped POP ceilings featuring recessed LED illumination troughs, seamless shadow-line grooves, and skim-coated acoustic surfaces.',
    specs: [
      'Premium Casting POP & Sisal Fibre',
      'Concealed Perimeter LED Troughs',
      'Zero-Crack Skim-Coated Finish',
    ],
    leadEngineer: 'Ola Continental Interior Finishes Team',
  },
];

interface ConstructionsSectionProps {
  onOpenViewing: () => void;
  onOpenChat: () => void;
  onConnectWithAi?: (inquiry: ContactInquiry) => void;
}

export const ConstructionsSection: React.FC<ConstructionsSectionProps> = ({
  onOpenViewing,
  onOpenChat,
  onConnectWithAi,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'ongoing' | 'finished'>('all');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dynamicProjects, setDynamicProjects] = useState<ConstructionProject[]>([]);

  useEffect(() => {
    let active = true;
    fetch('/api/constructions')
      .then((res) => res.json())
      .then((data) => {
        if (active && Array.isArray(data.constructions)) {
          setDynamicProjects(data.constructions);
        }
      })
      .catch(() => {});

    const unsub = listenToConstructions((fsProjects) => {
      if (!active || fsProjects.length === 0) return;
      setDynamicProjects((prev) => {
        const seen = new Set(fsProjects.map((p) => p.id));
        return [...fsProjects, ...prev.filter((p) => !seen.has(p.id))];
      });
    });

    return () => {
      active = false;
      unsub();
    };
  }, []);

  const allProjects = useMemo<ConstructionProjectItem[]>(() => {
    const mapped: ConstructionProjectItem[] = dynamicProjects.map((p) => {
      const pctNum = parseInt(String(p.completionLabel || '').replace(/[^0-9]/g, ''), 10);
      return {
        id: p.id,
        image: p.image || '/assets/aistudio/IMG-20261031-WA0089_fc7755dc.jpg',
        title: p.title,
        status: p.category === 'finished' ? 'finished' : 'ongoing',
        statusLabel: p.category === 'finished' ? 'Finished Property' : 'Ongoing Construction',
        completionPercent: !Number.isNaN(pctNum) ? Math.min(100, Math.max(0, pctNum)) : p.category === 'finished' ? 100 : 50,
        phase: p.phaseOrType || (p.category === 'finished' ? 'Completed Turnkey Delivery' : 'Active Construction'),
        location: p.location,
        description: p.description,
        specs: p.specs ? p.specs.split(',').map((s) => s.trim()).filter(Boolean) : ['BS 8110 Structural Standard'],
        leadEngineer: 'Engr. Samuel Aleji',
      };
    });
    const seen = new Set(mapped.map((m) => m.id));
    return [...mapped, ...CONSTRUCTION_PROJECTS.filter((cp) => !seen.has(cp.id))];
  }, [dynamicProjects]);

  // Project Brief / Construction Inquiry State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    serviceType: 'New Building Construction & Architectural Design',
    corridor: 'Behind LAUTECH Teaching Hospital',
    budget: '₦35M - ₦65M',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastInquiry, setLastInquiry] = useState<ContactInquiry | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const visibleProjects = allProjects.filter((p) =>
    filterStatus === 'all' ? true : p.status === filterStatus
  );

  const ongoingProjects = allProjects.filter((p) => p.status === 'ongoing');
  const finishedProjects = allProjects.filter((p) => p.status === 'finished');

  const activeProject = selectedIndex !== null ? visibleProjects[selectedIndex] : null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : visibleProjects.length - 1));
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((prev) => (prev! < visibleProjects.length - 1 ? prev! + 1 : 0));
    }
  };

  const handleSubmit = async (e?: React.FormEvent, connectToAi = false) => {
    if (e) e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMsg('Please provide your full name and phone/WhatsApp number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const inquiryRecord: ContactInquiry = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      serviceType: formData.serviceType,
      corridor: formData.corridor,
      budget: formData.budget,
      message: formData.message || 'Construction / Finished Property inquiry',
      createdAt: new Date().toISOString(),
    };

    try {
      await Promise.all([
        createFirestoreContact(inquiryRecord).catch(() => {}),
        createFirestoreLead({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          propertyType: formData.serviceType,
          corridor: formData.corridor,
          budget: formData.budget,
          message: formData.message || 'Construction inquiry',
          purpose: 'Invest',
        }).catch(() => {}),
      ]);

      await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiryRecord),
      }).catch(() => {});

      setLastInquiry(inquiryRecord);
      setIsSubmitted(true);

      if (connectToAi && onConnectWithAi) {
        onConnectWithAi(inquiryRecord);
      }
    } catch {
      setErrorMsg('Submission error. Reach Engineer Samuel Aleji on WhatsApp +234 803 384 8107.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProjectCard = (item: ConstructionProjectItem, idxInVisible: number) => {
    const isOngoing = item.status === 'ongoing';

    return (
      <div
        key={item.id}
        onClick={() => setSelectedIndex(idxInVisible)}
        className="group bg-[#0b1e42] border border-[#1d4ed8]/40 hover:border-[#38bdf8] rounded-2xl overflow-hidden transition-all duration-300 shadow-xl flex flex-col cursor-pointer"
      >
        <div className="relative aspect-[4/3] bg-[#040b19] overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1e42] via-transparent to-black/35" />

          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md backdrop-blur-sm border inline-flex items-center gap-1.5 ${
                isOngoing
                  ? 'bg-[#b91c1c]/90 text-white border-white/25'
                  : 'bg-[#172554]/90 text-[#4ade80] border-[#4ade80]/40'
              }`}
            >
              {isOngoing ? <Wrench className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
              <span>{item.statusLabel}</span>
            </span>

            <span className="p-1.5 rounded-lg bg-black/60 text-white backdrop-blur-sm group-hover:bg-[#b91c1c] transition-colors">
              <Maximize2 className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="absolute bottom-3 left-3 right-3 pointer-events-none flex items-center justify-between gap-2 text-[11px] text-white/95">
            <span className="truncate bg-black/65 px-2.5 py-1 rounded backdrop-blur-sm">
              {item.phase}
            </span>
            <span className="font-data font-bold bg-black/75 px-2 py-1 rounded tabular-nums shrink-0">
              {item.completionPercent}%
            </span>
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="text-[11px] text-[#93c5fd] mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>

            <h3 className="font-display text-xl font-bold text-white group-hover:text-[#38bdf8] transition-colors mb-2 leading-snug">
              {item.title}
            </h3>

            <p className="text-xs text-[#bfdbfe] leading-relaxed line-clamp-3 mb-4">
              {item.description}
            </p>

            {/* Progress Bar for Clarity */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-[11px] text-[#93c5fd] mb-1">
                <span>{isOngoing ? 'Site Completion Progress' : 'Project Handover Status'}</span>
                <span className="font-data font-semibold text-white tabular-nums">
                  {item.completionPercent}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#040b19] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    isOngoing ? 'bg-[#dc2626]' : 'bg-[#4ade80]'
                  }`}
                  style={{ width: `${item.completionPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1d4ed8]/30 flex items-center justify-between text-[11px] text-[#93c5fd]">
            <span className="truncate">{item.leadEngineer}</span>
            <span className="font-semibold text-[#38bdf8] group-hover:text-white shrink-0 flex items-center gap-1 whitespace-nowrap">
              <span>Inspect Specs</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="py-14 bg-[#07132b] text-[#f0f9ff] min-h-[85vh] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Branded Constructions Showcase Header */}
        <div className="bg-[#0b1e42] border border-[#1d4ed8]/40 rounded-3xl overflow-hidden shadow-2xl mb-12">
          {/* Crimson & Navy Header Accent */}
          <div className="h-2 w-full flex">
            <div className="w-1/2 bg-[#b91c1c]" />
            <div className="w-1/2 bg-[#172554]" />
          </div>

          <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <OlaLogoMark variant="section" />

              <div className="text-xs font-semibold tracking-widest uppercase text-[#38bdf8]">
                CIVIL ENGINEERING &amp; TURNKEY BUILDING PORTFOLIO · SINCE 2006
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight text-balance">
                Constructions Worked On &amp; Finished Properties
              </h1>

              <p className="text-sm sm:text-base text-[#bfdbfe] leading-relaxed max-w-2xl">
                Review active civil construction sites currently under engineering execution alongside completed, handed-over properties built and supervised directly by <strong className="text-white">Engineer Samuel Aleji</strong> across Ogbomoso and Lagos corridors.
              </p>

              {/* Quantitative Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                <div className="bg-[#07132b] border border-[#1d4ed8]/40 rounded-xl p-3.5">
                  <div className="text-2xl font-bold text-white font-data tabular-nums">
                    {ongoingProjects.length}
                  </div>
                  <div className="text-[11px] text-[#f87171] font-semibold mt-0.5">
                    Active Site Works
                  </div>
                </div>
                <div className="bg-[#07132b] border border-[#1d4ed8]/40 rounded-xl p-3.5">
                  <div className="text-2xl font-bold text-[#4ade80] font-data tabular-nums">
                    180+
                  </div>
                  <div className="text-[11px] text-[#93c5fd] font-semibold mt-0.5">
                    Finished Buildings
                  </div>
                </div>
                <div className="bg-[#07132b] border border-[#1d4ed8]/40 rounded-xl p-3.5">
                  <div className="text-2xl font-bold text-white font-data tabular-nums">
                    45+
                  </div>
                  <div className="text-[11px] text-[#93c5fd] font-semibold mt-0.5">
                    Campus Hostels
                  </div>
                </div>
                <div className="bg-[#07132b] border border-[#1d4ed8]/40 rounded-xl p-3.5">
                  <div className="text-2xl font-bold text-[#38bdf8] font-data tabular-nums">
                    100%
                  </div>
                  <div className="text-[11px] text-[#93c5fd] font-semibold mt-0.5">
                    BS 8110 Compliance
                  </div>
                </div>
              </div>
            </div>

            {/* Authentic Headquarters Building Visual */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-[#38bdf8]/40 shadow-2xl bg-[#040b19]">
                <img
                  src="/assets/aistudio/910713664_1455940486721545_188622865862031933_n_c003821d.jpg"
                  alt="Ola Continental Properties & Associate Corporate Headquarters Building"
                  referrerPolicy="no-referrer"
                  className="w-full h-72 sm:h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040b19] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 bg-[#07132b]/90 backdrop-blur-md border border-[#1d4ed8]/50 rounded-xl p-3">
                  <div className="text-xs font-bold text-white">
                    Ola Continental Corporate Headquarters
                  </div>
                  <div className="text-[11px] text-[#93c5fd]">
                    No. 2 Olukoko St., Behind LAUTECH Teaching Hospital, Ogbomoso
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-[#1d4ed8]/30">
          <div>
            <div className="text-xs uppercase tracking-wider text-[#38bdf8] font-semibold">
              Engineering &amp; Property Delivery Catalog
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-0.5">
              Browse by Construction Stage
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#0b1e42] border border-[#1d4ed8]/40 rounded-xl">
            <button
              onClick={() => {
                setFilterStatus('all');
                setSelectedIndex(null);
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                filterStatus === 'all'
                  ? 'bg-[#b91c1c] text-white shadow'
                  : 'text-[#bfdbfe] hover:text-white hover:bg-white/5'
              }`}
            >
              All Projects ({allProjects.length})
            </button>
            <button
              onClick={() => {
                setFilterStatus('ongoing');
                setSelectedIndex(null);
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 ${
                filterStatus === 'ongoing'
                  ? 'bg-[#b91c1c] text-white shadow'
                  : 'text-[#bfdbfe] hover:text-white hover:bg-white/5'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Ongoing Constructions ({ongoingProjects.length})</span>
            </button>
            <button
              onClick={() => {
                setFilterStatus('finished');
                setSelectedIndex(null);
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 ${
                filterStatus === 'finished'
                  ? 'bg-[#1d4ed8] text-white shadow'
                  : 'text-[#bfdbfe] hover:text-white hover:bg-white/5'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Finished Properties ({finishedProjects.length})</span>
            </button>
          </div>
        </div>

        {/* Grouped View when "All" is selected, or Filtered Single Grid */}
        {filterStatus === 'all' ? (
          <div className="space-y-16 mb-16">
            {/* 01. Constructions Worked On */}
            <div>
              <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#f87171]">
                    01. Active Field Execution
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mt-0.5">
                    Constructions Currently Worked On
                  </h3>
                </div>
                <span className="text-xs text-[#bfdbfe]">
                  Live structural, foundation, industrial plant &amp; interior POP progress
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ongoingProjects.map((item) => {
                  const idx = visibleProjects.findIndex((p) => p.id === item.id);
                  return renderProjectCard(item, idx);
                })}
              </div>
            </div>

            {/* 02. Finished Properties */}
            <div className="pt-10 border-t border-[#1d4ed8]/30">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#4ade80]">
                    02. Completed &amp; Handed Over
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mt-0.5">
                    Finished Properties &amp; Delivered Estates
                  </h3>
                </div>
                <span className="text-xs text-[#bfdbfe]">
                  Ready residences, student hostels, industrial weighbridges &amp; finished interiors
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {finishedProjects.map((item) => {
                  const idx = visibleProjects.findIndex((p) => p.id === item.id);
                  return renderProjectCard(item, idx);
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {visibleProjects.map((item, idx) => renderProjectCard(item, idx))}
          </div>
        )}

        {/* Commission Construction / Project Desk Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-[#0b1e42] border border-[#1d4ed8]/40 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="lg:col-span-5 space-y-5">
            <OlaLogoMark variant="section" />
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Commission a Building Project or Inspect a Finished Property
            </h3>
            <p className="text-xs sm:text-sm text-[#bfdbfe] leading-relaxed">
              Submit your plot details, structural plan, or finished-property interest directly to <strong className="text-white">Engineer Samuel Aleji</strong>. Clients overseas receive bi-weekly 4K site video audits and transparent Bills of Quantities.
            </p>

            <div className="space-y-3 pt-2 text-xs text-[#bfdbfe]">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#38bdf8] shrink-0" />
                <span>Tuesday Dedicated On-Site Inspection &amp; Progress Audits</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-[#38bdf8] shrink-0" />
                <span>No. 2 Olukoko Street, Behind LAUTECH Teaching Hospital</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#4ade80] shrink-0" />
                <a
                  href="https://wa.me/2348033848107"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4ade80] font-data font-semibold hover:underline"
                >
                  +234 803 384 8107 (WhatsApp &amp; Direct Line)
                </a>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={onOpenViewing}
                className="px-4 py-2.5 bg-[#1d4ed8] hover:bg-[#0284c7] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Tuesday Site Tour</span>
              </button>
              <button
                onClick={onOpenChat}
                className="px-4 py-2.5 bg-[#07132b] hover:bg-[#172554] border border-[#38bdf8]/40 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-[#38bdf8]" />
                <span>Ask Ola AI for BOQ</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#07132b] border border-[#1d4ed8]/40 rounded-2xl p-6 sm:p-8">
            {isSubmitted ? (
              <div className="py-8 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-[#4ade80] mx-auto" />
                <h4 className="font-display text-xl font-bold text-white">
                  Project Brief Received!
                </h4>
                <p className="text-xs text-[#bfdbfe] max-w-md mx-auto">
                  Thank you. Engineer Samuel Aleji&apos;s construction desk has logged your specifications and will respond promptly.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-3">
                  {onConnectWithAi && lastInquiry && (
                    <button
                      onClick={() => onConnectWithAi(lastInquiry)}
                      className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Continue with Ola AI</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        name: '',
                        phone: '',
                        email: '',
                        serviceType: 'New Building Construction & Architectural Design',
                        corridor: 'Behind LAUTECH Teaching Hospital',
                        budget: '₦35M - ₦65M',
                        message: '',
                      });
                    }}
                    className="px-4 py-2 bg-[#0b1e42] border border-[#1d4ed8]/40 text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Submit Another Brief
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {errorMsg && (
                  <div className="p-3 bg-red-950/80 border border-red-500/40 text-red-200 rounded-lg">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#e0f2fe] mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Engr. Taiwo Adeyemi"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#0b1e42] border border-[#1d4ed8]/50 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#e0f2fe] mb-1">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+234 803 ..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#0b1e42] border border-[#1d4ed8]/50 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#e0f2fe] mb-1">
                      Construction / Property Scope
                    </label>
                    <select
                      value={formData.serviceType}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#0b1e42] border border-[#1d4ed8]/50 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                    >
                      <option value="New Building Construction & Architectural Design">
                        New Building Construction &amp; Architectural Design
                      </option>
                      <option value="Purchase Finished Executive Duplex / Bungalow">
                        Purchase Finished Executive Duplex / Bungalow
                      </option>
                      <option value="Turnkey Student Hostel Development">
                        Turnkey Student Hostel Development
                      </option>
                      <option value="Industrial Warehouse / Weighbridge Installation">
                        Industrial Warehouse / Weighbridge Installation
                      </option>
                      <option value="POP Ceiling & Luxury Interior Finishing">
                        POP Ceiling &amp; Luxury Interior Finishing
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-[#e0f2fe] mb-1">
                      Corridor / Site Location
                    </label>
                    <select
                      value={formData.corridor}
                      onChange={(e) => setFormData({ ...formData, corridor: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#0b1e42] border border-[#1d4ed8]/50 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                    >
                      <option value="Behind LAUTECH Teaching Hospital">
                        Behind LAUTECH Teaching Hospital
                      </option>
                      <option value="Under G Corridor, Ogbomoso">Under G Corridor, Ogbomoso</option>
                      <option value="Adenike Student Belt">Adenike Student Belt</option>
                      <option value="Aroje Industrial Corridor">Aroje Industrial Corridor</option>
                      <option value="Mushin Commercial Corridor, Lagos">
                        Mushin Commercial Corridor, Lagos
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#e0f2fe] mb-1">
                    Project Scope or Property Inquiry Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Share your plot size, construction stage, or which finished property you want to inspect..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#0b1e42] border border-[#1d4ed8]/50 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-[#b91c1c] hover:bg-[#991b1b] text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Sending...' : 'Submit Construction Brief'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit(undefined, true)}
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-[#172554] hover:bg-[#1e3a8a] border border-[#38bdf8]/40 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#38bdf8]" />
                    <span>Submit &amp; Ask Ola AI</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeProject && selectedIndex !== null && (
        <div
          onClick={() => setSelectedIndex(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#0b1e42] border border-[#1d4ed8] rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1d4ed8]/40 bg-[#07132b]">
              <div className="flex items-center gap-3 text-xs">
                <span
                  className={`font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                    activeProject.status === 'ongoing'
                      ? 'bg-[#b91c1c] text-white'
                      : 'bg-[#172554] text-[#4ade80] border border-[#4ade80]/40'
                  }`}
                >
                  {activeProject.statusLabel}
                </span>
                <span className="text-[#93c5fd] font-data tabular-nums">
                  {selectedIndex + 1} / {visibleProjects.length}
                </span>
              </div>
              <button
                onClick={() => setSelectedIndex(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1">
              <div className="lg:col-span-7 bg-black flex items-center justify-center relative min-h-[300px] sm:min-h-[420px]">
                <img
                  src={activeProject.image}
                  alt={activeProject.title}
                  className="max-h-[65vh] w-auto max-w-full object-contain"
                />
                <button
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-[#b91c1c] text-white transition-colors cursor-pointer"
                  aria-label="Previous project"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-[#b91c1c] text-white transition-colors cursor-pointer"
                  aria-label="Next project"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-[#0b1e42]">
                <div>
                  <div className="text-xs font-semibold text-[#38bdf8] uppercase tracking-wider mb-1">
                    {activeProject.phase}
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-3">
                    {activeProject.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#bfdbfe] leading-relaxed mb-5">
                    {activeProject.description}
                  </p>

                  <div className="space-y-2 mb-5">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#93c5fd]">
                      Engineering Specifications
                    </div>
                    {activeProject.specs.map((spec, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-[#4ade80] shrink-0 mt-0.5" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-[#07132b] rounded-xl border border-[#1d4ed8]/30 space-y-1 text-xs">
                    <div className="text-slate-300">
                      <span className="text-[#93c5fd] font-medium">Location:</span> {activeProject.location}
                    </div>
                    <div className="text-slate-300">
                      <span className="text-[#93c5fd] font-medium">Lead Engineer:</span>{' '}
                      {activeProject.leadEngineer}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-[#1d4ed8]/40 space-y-2">
                  <a
                    href={`https://wa.me/2348033848107?text=${encodeURIComponent(
                      `Hello Engineer Samuel Aleji, I am inquiring about "${activeProject.title}" (${activeProject.statusLabel}) on the Ola Continental Constructions page.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Inquire on WhatsApp</span>
                  </a>
                  <button
                    onClick={() => {
                      setSelectedIndex(null);
                      onOpenViewing();
                    }}
                    className="w-full py-2 bg-[#172554] hover:bg-[#1e3a8a] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Book Site Inspection
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
