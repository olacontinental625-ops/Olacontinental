import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Award,
  MapPin,
  Compass,
  FileCheck,
  CheckCircle2,
  Phone,
  Calendar,
  ArrowRight,
  Building,
  Sparkles,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Users,
  HardHat,
  Factory,
  Globe2,
  HeartHandshake,
  Wrench,
  Layers,
  Ruler,
  CheckCircle,
  Truck,
  Video,
  Film,
  Volume2,
  VolumeX,
  Maximize2,
  Music,
  Radio,
  ExternalLink
} from 'lucide-react';

interface AboutSectionProps {
  onOpenViewing: () => void;
  onOpenChat: () => void;
}

export interface FieldVideoItem {
  id: string;
  videoUrl: string;
  posterImage: string;
  badge: string;
  title: string;
  location: string;
  description: string;
  keySpecs: string[];
  durationTag: string;
}

export const FIELD_VIDEOS: FieldVideoItem[] = [
  {
    id: 'international-partners-factory',
    videoUrl: '/assets/aistudio/VID-20261031-WA0101_110611a1.mp4',
    posterImage: '/assets/aistudio/IMG-20261021-WA0016_02ccb3b5.jpg',
    badge: 'INTERNATIONAL PARTNERSHIP',
    title: 'Engr. Samuel Aleji with Technical Partners in Industrial Agro Plant',
    location: 'Agro-Allied Industrial Belt, Oyo State',
    description: 'Engineer Samuel Aleji personally touring an expansive agro-processing factory complex alongside foreign industrial technical partners and machinery engineers. The inspection covers machine footing foundations, structural crane gantries, and industrial processing lines.',
    keySpecs: ['International Technical Collaboration', 'Agro-Industrial Food Processing Plant', 'Heavy Machinery Foundation Vetting'],
    durationTag: 'Plant Walkthrough',
  },
  {
    id: 'founder-live-factory-base',
    videoUrl: '/assets/aistudio/VID-20261031-WA0103_10a89c53.mp4',
    posterImage: '/assets/aistudio/IMG-20261031-WA0094_c444fb16.jpg',
    badge: 'FOUNDER LIVE SITE ADDRESS',
    title: 'Engr. Samuel Aleji Live: "Sky is the Limit with Ola Continental"',
    location: 'Warehouse & Industrial Site Operations',
    description: 'Founder Engineer Samuel Aleji addresses clients live on site against the backdrop of an active warehouse complex and hardcore stone road-base being leveled and concrete-cast: "Sky is the limit with Ola Continental! Take it or leave it, that is just the truth!"',
    keySpecs: ['Direct Founder Verification', 'Hardcore Stone Bed Casting', 'Massive Warehouse Superstructure'],
    durationTag: 'Live Address',
  },
  {
    id: 'deep-retaining-wall-pour',
    videoUrl: '/assets/aistudio/VID-20261031-WA0081_79f1cb6c.mp4',
    posterImage: '/assets/aistudio/IMG-20261031-WA0098_6ec284da.jpg',
    badge: 'CIVIL SUBSTRUCTURE',
    title: 'Reinforced Concrete Retaining Wall Casting & Team Supervision',
    location: 'Commercial Deep Foundation Ground',
    description: 'Engr. Samuel Aleji on site supervising the heavy civil crew casting deep reinforced concrete retaining walls, rebar mesh, and foundation formwork.',
    keySpecs: ['Engr. Samuel Aleji On-Site', 'Continuous Concrete Mixing & Pour', 'BS 8110 Structural Formwork'],
    durationTag: 'Deep Retaining Wall',
  },
  {
    id: 'active-site-crew-cheers',
    videoUrl: '/assets/aistudio/VID-20261031-WA0080_24375537.mp4',
    posterImage: '/assets/aistudio/IMG-20261031-WA0079_7a649416.jpg',
    badge: 'ACTIVE FIELD CREW',
    title: 'Live Construction Crew: "Ola Continental Properties & Associates!"',
    location: 'Residential Estate Development, Ogbomoso',
    description: 'High-morale site masonry team working briskly to lay vibrated concrete foundation blocks in trenches before dusk: "The boys are working live... everybody is happy... with Ola Continental Properties and Associates!"',
    keySpecs: ['Dedicated Site Artisans', 'High-Density Vibrated Blocks', 'Zero Time Lag on Delivery'],
    durationTag: 'Active Site Crew',
  },
  {
    id: 'site-logistics-hilux-blocks',
    videoUrl: '/assets/aistudio/VID-20261031-WA0104_cdfaed1e.mp4',
    posterImage: '/assets/aistudio/IMG-20261031-WA0093_54cdd052.jpg',
    badge: 'SITE LOGISTICS & FLEET',
    title: 'Field Fleet Offloading & Strip Foundation Masonry Distribution',
    location: 'Under G Corridor Axis',
    description: 'Ola Continental operations 4x4 Toyota Hilux unit on site while logistics handlers distribute solid blocks across excavated trench footings, ensuring smooth material workflow.',
    keySpecs: ['Dedicated 4x4 Hilux Fleet', 'Rapid Material Transit', 'Orderly Trench Masonry Stacking'],
    durationTag: 'Site Fleet & Logistics',
  },
  {
    id: 'reinforced-pedestals-gatehouse',
    videoUrl: '/assets/aistudio/VID-20261031-WA0102_12bca151.mp4',
    posterImage: '/assets/aistudio/IMG-20261031-WA0099_65c15e31.jpg',
    badge: 'STRUCTURAL PEDESTALS',
    title: 'Heavy Foundation Pedestals & Commercial Gatehouse Masonry',
    location: 'Aroje Industrial Belt Corridor',
    description: 'Site walkthrough inspecting massive square concrete foundation pads with vertical rebar starter dowels, concrete aggregate heaps, and the reinforced perimeter gatehouse.',
    keySpecs: ['Heavy Column Pedestals', 'Substructure Dowel Bars', 'Industrial Perimeter Gatehouse'],
    durationTag: 'Pedestal Footings',
  },
  {
    id: 'concrete-breaker-expansion',
    videoUrl: '/assets/aistudio/VID-20261031-WA0090_b829e724.mp4',
    posterImage: '/assets/aistudio/IMG-20261031-WA0095_6a943e17.jpg',
    badge: 'EXPANSION & REMODELING',
    title: 'Precision Demolition & Upper Floor Concrete Breaking',
    location: 'Elevated Multi-Storey Corridor',
    description: 'Ola Continental civil technician utilizing an electric jackhammer demolition tool along an upper floor walkway to prepare structural beam expansions and conduit channels.',
    keySpecs: ['Heavy Demolition Equipment', 'Upper Corridor Remodeling', 'Precision Expansion Jointing'],
    durationTag: 'Structural Breaking',
  },
  {
    id: 'bedrock-trench-excavation-ado',
    videoUrl: '/assets/aistudio/VID-20261031-WA0082_c7f310a8.mp4',
    posterImage: '/assets/aistudio/IMG-20261031-WA0100_49619ebf.jpg',
    badge: 'BEDROCK EXCAVATION',
    title: 'Manual Deep Strata Trench & Soakaway Excavation at Ado',
    location: 'Ado Construction Site',
    description: 'Skilled excavation artisan digging deep subterranean soakaway and load-bearing foundation trench down to unyielding bedrock strata, recorded live at Ado site.',
    keySpecs: ['Subterranean Bedrock Strata', 'Zero-Settlement Preparation', 'Ado Axis Foundation Work'],
    durationTag: 'Deep Pit Excavation',
  },
  {
    id: 'turnkey-residential-walkthrough',
    videoUrl: '/assets/aistudio/VID-20261021-WA0040_f76cccf8.mp4',
    posterImage: '/assets/aistudio/IMG-20261031-WA0097_f6d3f6dd.jpg',
    badge: 'TURNKEY HANDOVER',
    title: 'Residential Exterior Corridor & Paved Grounds Walkthrough',
    location: 'Behind LAUTECH Teaching Hospital',
    description: 'Comprehensive video inspection of finished exterior walkways, perimeter walls, and contemporary residence courtyard delivered by Ola Continental.',
    keySpecs: ['Finished Paved Interlocking', 'Perimeter Boundary Security', '100% Quality Compliance'],
    durationTag: 'Turnkey Walkthrough',
  },
];

interface StorySlide {
  image: string;
  tag: string;
  title: string;
  location: string;
  story: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  onOpenViewing,
  onOpenChat,
}) => {
  const whatsappUrl = `https://wa.me/2348033848107?text=${encodeURIComponent(
    'Hello Engineer Samuel Aleji, I read your detailed corporate and engineering story on the Ola Continental website and would like to schedule an executive consultation.'
  )}`;

  // Slides for the dynamic changing photo-reel (field stories, foreign partners, celebrations)
  const storySlides: StorySlide[] = [
    {
      image: '/assets/aistudio/IMG-20261021-WA0016_02ccb3b5.jpg',
      tag: 'INTERNATIONAL TECHNICAL PARTNERSHIP',
      title: 'Agro-Industrial & Machinery Collaborations',
      location: 'Oyo State Agricultural Processing Belt',
      story:
        'Engr. Samuel Aleji collaborating on-site with foreign industrial technical specialists. Under his direction, Ola Continental integrates verifiable land acquisitions with full-scale building construction and industrial plant setup, bringing precision engineering standards to local commercial agribusinesses.',
    },
    {
      image: '/assets/aistudio/IMG-20261021-WA0043_075442f9.jpg',
      tag: 'CLIENT HANDOVER & CELEBRATIONS',
      title: 'Family Trust, Clean Deeds & Landmark Keys',
      location: 'Residential Handover Ceremony',
      story:
        'Celebrating key handovers with client families and the executive construction team. Behind every square meter is a lifetime of hard-earned savings; Engr. Samuel Aleji ensures every buyer receives pristine root of title, registered cadastral surveys, and sound structural guarantees.',
    },
    {
      image: '/assets/aistudio/IMG-20261021-WA0015_4e01daf5.jpg',
      tag: 'AGRO-ALLIED PROCESSING PLANT',
      title: 'Tosmat Foods & Agro Products Complex',
      location: 'Odo-Oba / Industrial Corridor',
      story:
        'Engr. Samuel Aleji personally supervising interior logistics, heavy machine footings, and electrical installations at the Tosmat Foods commercial processing factory. He verifies heavy-duty civil foundation bearing capacity before heavy vibrating machinery is energized.',
    },
    {
      image: '/assets/aistudio/IMG-20261021-WA0017_848c5679.jpg',
      tag: 'INDUSTRIAL CIVIL & MECHANICAL VETTING',
      title: 'Heavy Equipment Vetting & Commissioning',
      location: 'Commercial Processing Complex',
      story:
        'Vetting mechanical sorting sieves, grain processing lines, and industrial agro-machinery. Engr. Aleji brings civil engineering discipline into every project, ensuring building structures and equipment floor beds meet strict operational tolerances.',
    },
    {
      image: '/assets/aistudio/IMG-20261021-WA0035_171c1087.jpg',
      tag: 'STRUCTURAL REBAR SUPERVISION',
      title: 'Hands-On Concrete Slab & Deck Inspection',
      location: 'LAUTECH Student Accommodation Construction Site',
      story:
        'Not an armchair executive: Engr. Samuel Aleji on the suspended deck verifying steel rebar spacing, beam deflection tolerances, and concrete slump test compliance before casting for multi-unit student hostels.',
    },
    {
      image: '/assets/aistudio/IMG-20261021-WA0042_64c78454.jpg',
      tag: 'INFRASTRUCTURE DELIVERY',
      title: 'Paved Estate Corridors & Road Networks',
      location: 'Serviced Residential Estate, Ogbomoso',
      story:
        'Standing on the newly paved interlocking road network in a verified residential corridor. Engr. Aleji personally inspects storm drainage culverts, solar street lighting, and underground conduit utilities to ensure longevity.',
    },
    {
      image: '/assets/aistudio/IMG-20261021-WA0033_6f6c30a9.jpg',
      tag: 'ARCHITECTURAL HANDOVER',
      title: 'Exterior Walkthrough on Contemporary Bungalow',
      location: 'Olukoko Residential Quarters',
      story:
        'Conducting final exterior punch-list checks on a newly completed 4-bedroom bungalow with stamped concrete courtyard prior to handing over keys to a diaspora homeowner based in Manchester, UK.',
    },
  ];

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Field Video Archive States
  const [archiveMode, setArchiveMode] = useState<'videos' | 'photos'>('videos');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isVideoAutoPlaying, setIsVideoAutoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Auto-play / control the video playback
  useEffect(() => {
    if (videoRef.current) {
      if (isVideoAutoPlaying && isVideoPlaying) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Browser autoplay restrictions handled gracefully
          });
        }
      } else {
        videoRef.current.pause();
      }
    }
  }, [currentVideoIndex, isVideoAutoPlaying, isVideoPlaying]);

  const handleNextVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % FIELD_VIDEOS.length);
    setIsVideoPlaying(true);
  };

  const handlePrevVideo = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + FIELD_VIDEOS.length) % FIELD_VIDEOS.length);
    setIsVideoPlaying(true);
  };

  const handleVideoEnded = () => {
    if (isVideoAutoPlaying) {
      handleNextVideo();
    }
  };

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsVideoPlaying(true);
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    } else {
      setIsVideoPlaying((prev) => !prev);
    }
  };

  const currentVideo = FIELD_VIDEOS[currentVideoIndex];

  // Auto-play slideshow every 4.5 seconds
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % storySlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying, storySlides.length]);

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % storySlides.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + storySlides.length) % storySlides.length);
  };

  const currentSlide = storySlides[currentSlideIndex];

  return (
    <section id="about" className="py-16 bg-[#07132b] text-[#f0f9ff] scroll-mt-20 relative overflow-hidden">
      {/* Royal blue and light blue ambient illumination */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#1d4ed8]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-10 w-[450px] h-[450px] bg-[#38bdf8]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-widest uppercase text-[#38bdf8] mb-3">
            <span>ABOUT OLA CONTINENTAL PROPERTIES & CIVIL CONSTRUCTION</span>
            <span aria-hidden="true" className="text-white/40">·</span>
            <span className="font-data text-xs text-[#93c5fd]/80">ESTABLISHED 2006</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Operating Continuously Since 2006.
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#bfdbfe] leading-relaxed font-normal">
            For over 19 unbroken years, Ola Continental has stood as the gold standard of transparent property brokerage, civil engineering design, turnkey building construction, and cadastral survey intelligence across Ogbomoso and Lagos State corridors.
          </p>
        </div>

        {/* =========================================================================
            SECTION 1: FOUNDER & OWNER IN SUIT + SECOND NATIVE ATTIRE (SIDE-BY-SIDE)
            Name: ENGINEER SAMUEL ALEJI
           ========================================================================= */}
        <div className="bg-[#0b1e42] border border-[#1d4ed8]/40 rounded-3xl p-6 sm:p-10 lg:p-12 mb-20 shadow-2xl relative overflow-hidden group hover:border-[#38bdf8]/60 transition-all duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Dual Portrait Container: Suit (First Image) + Second Image beside it */}
            <div className="lg:col-span-6 flex flex-col items-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {/* 1. Primary Portrait in Suit */}
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[#38bdf8] shadow-2xl bg-[#07132b] group/img">
                  <img
                    src="/assets/aistudio/file_00000000ec80821182da150a7f2f7169_-_Copy_5a663f39.png"
                    alt="Engineer Samuel Aleji in Black Suit - Founder & Principal Consultant"
                    className="w-full h-full object-cover object-top group-hover/img:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07132b] via-transparent to-transparent opacity-90" />
                  <div className="absolute bottom-3 left-3 right-3 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#38bdf8] bg-[#07132b]/90 px-2 py-0.5 rounded border border-[#38bdf8]/40 inline-block mb-1">
                      EXECUTIVE SUIT
                    </span>
                    <div className="font-bold text-xs text-white">ENGINEER SAMUEL ALEJI</div>
                    <div className="text-[10px] text-[#bfdbfe]">Founder & Chief Civil Consultant</div>
                  </div>
                </div>

                {/* 2. Second Portrait (Beside the Suit) in Traditional Native Attire */}
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#60a5fa]/40 shadow-2xl bg-[#07132b] group/img">
                  <img
                    src="/assets/aistudio/file_0000000043e082119fefa67732590eaa_-_Copy_cc9f78dc.png"
                    alt="Engineer Samuel Aleji in Traditional Attire - Community & Cultural Leadership"
                    className="w-full h-full object-cover object-top group-hover/img:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07132b] via-transparent to-transparent opacity-90" />
                  <div className="absolute bottom-3 left-3 right-3 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#25D366] bg-[#07132b]/90 px-2 py-0.5 rounded border border-[#25D366]/40 inline-block mb-1">
                      COMMUNITY PATRON
                    </span>
                    <div className="font-bold text-xs text-white">ENG. SAMUEL ALEJI</div>
                    <div className="text-[10px] text-[#bfdbfe]">Traditional & Cultural Patron</div>
                  </div>
                </div>
              </div>

              {/* Direct Verification Credential Chips */}
              <div className="mt-5 flex flex-wrap justify-center gap-2 text-[11px] text-[#e0f2fe] w-full">
                <span className="px-3 py-1 bg-[#07132b] border border-[#1d4ed8]/50 rounded-md font-data text-[#93c5fd]">
                  CAC BN: 3189204
                </span>
                <span className="px-3 py-1 bg-[#1d4ed8]/30 border border-[#38bdf8]/40 text-[#38bdf8] rounded-md font-semibold">
                  Civil Engineering & Construction
                </span>
                <span className="px-3 py-1 bg-[#07132b] border border-[#1d4ed8]/50 rounded-md text-[#bfdbfe]">
                  Cadastral GIS Verification
                </span>
                <span className="px-3 py-1 bg-[#07132b] border border-[#1d4ed8]/50 rounded-md text-[#bfdbfe]">
                  Operating Since 2006
                </span>
              </div>
            </div>

            {/* Founder Story, Philosophy & Credentials */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
              <div>
                <div className="text-xs uppercase tracking-wider text-[#38bdf8] font-semibold mb-1 flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#38bdf8]" />
                  <span>FOUNDER & MANAGING DIRECTOR</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                  Engineer Samuel Aleji
                </h2>
                <p className="text-xs text-[#93c5fd] font-semibold mt-1">
                  Founder, Ola Continental Properties, Building & Civil Engineering Construction
                </p>
              </div>

              {/* Inspiring Personal Quote */}
              <blockquote className="border-l-3 border-[#38bdf8] pl-5 italic text-sm sm:text-base text-[#e0f2fe] leading-relaxed font-serif bg-[#07132b]/50 py-3 rounded-r-xl">
                "When I established Ola Continental in 2006, my covenant was absolute: no investor—whether a resident medical consultant in Ogbomoso or a nurse working double night shifts in London—should ever lose a kobo to boundary deceit, counterfeit land titles, or structural contractor fraud. We merge civil engineering rigor, certified cadastral charting, and unbreakable escrow so every client builds with total confidence."
              </blockquote>

              <p className="text-xs sm:text-sm text-[#bfdbfe] leading-relaxed">
                As a registered engineer and structural consultant, Engineer Samuel Aleji has led the direct construction and delivery of over 180 executive residential bungalows and duplexes, 45+ purpose-built LAUTECH student hostel facilities, commercial logistics warehouses, and industrial agro-allied processing factories across Oyo State and Lagos.
              </p>

              {/* Key Trust Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
                <div className="bg-[#07132b] p-4 rounded-xl border border-[#1d4ed8]/40">
                  <div className="font-data text-2xl sm:text-3xl font-bold text-[#38bdf8]">19+</div>
                  <div className="text-xs text-[#bfdbfe] mt-1">Years Operations (Since 2006)</div>
                </div>

                <div className="bg-[#07132b] p-4 rounded-xl border border-[#1d4ed8]/40">
                  <div className="font-data text-2xl sm:text-3xl font-bold text-white">1,400+</div>
                  <div className="text-xs text-[#bfdbfe] mt-1">Properties & Structures Delivered</div>
                </div>

                <div className="bg-[#07132b] p-4 rounded-xl border border-[#1d4ed8]/40 col-span-2 sm:col-span-1">
                  <div className="font-data text-2xl sm:text-3xl font-bold text-[#25D366]">0</div>
                  <div className="text-xs text-[#bfdbfe] mt-1">Litigations or Building Failures</div>
                </div>
              </div>

              {/* Direct Founder Contact Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#25D366] hover:bg-[#20b859] rounded-lg transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Consult Engr. Samuel Aleji Directly</span>
                </a>

                <button
                  onClick={onOpenViewing}
                  className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#1d4ed8] hover:bg-[#0284c7] rounded-lg transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Field Walkthrough</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 2: AUTHENTIC FIELD ARCHIVE (VIDEOS, MUSIC & PHOTO-REEL)
            Field Presence, International Partnerships & Construction with Autoplay
            and Aaron Smith - Dancin (Krono Afro House Remix) Soundtrack
           ========================================================================= */}
        <div className="mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="max-w-2xl">
              <div className="text-xs font-semibold tracking-wider uppercase text-[#38bdf8] mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#38bdf8]" />
                <span>ON THE GROUND WITH ENGR. SAMUEL ALEJI · AUTHENTIC FIELD ARCHIVE</span>
              </div>
              <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Field Presence, International Partnerships & Construction
              </h3>
              <p className="mt-2 text-sm text-[#bfdbfe] leading-relaxed">
                Watch authentic broadcast recordings from our construction sites: industrial agro-machinery installations with foreign technical partners, deep retaining wall concrete pours, and live founder site addresses.
              </p>
            </div>

            {/* Media Archive Switcher (Videos / Photos) */}
            <div className="flex items-center gap-2 bg-[#0b1e42] p-1.5 rounded-2xl border border-[#1d4ed8]/40 self-start md:self-end">
              <button
                onClick={() => setArchiveMode('videos')}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  archiveMode === 'videos'
                    ? 'bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/30'
                    : 'text-[#93c5fd] hover:text-white hover:bg-[#1d4ed8]/20'
                }`}
              >
                <Video className="w-4 h-4 text-[#38bdf8]" />
                <span>Live Site Videos (9)</span>
              </button>
              <button
                onClick={() => setArchiveMode('photos')}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  archiveMode === 'photos'
                    ? 'bg-[#2563eb] text-white shadow-md shadow-[#2563eb]/30'
                    : 'text-[#93c5fd] hover:text-white hover:bg-[#1d4ed8]/20'
                }`}
              >
                <Film className="w-4 h-4 text-[#38bdf8]" />
                <span>Photo Stories (7)</span>
              </button>
            </div>
          </div>

          {/* MAIN MEDIA BROADCAST DECK */}
          {archiveMode === 'videos' ? (
            /* TAB 1: 9-VIDEO AUTHENTIC FIELD ARCHIVE WITH AUTOPLAY */
            <div className="bg-[#0b1e42] border border-[#1d4ed8]/50 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left Column: Live Video Player with Autoplay */}
                <div className="lg:col-span-7 flex flex-col">
                  <div className="relative aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden border border-[#38bdf8]/40 bg-black shadow-2xl group">
                    <video
                      key={currentVideo.videoUrl}
                      ref={videoRef}
                      src={currentVideo.videoUrl}
                      poster={currentVideo.posterImage}
                      autoPlay
                      muted={isVideoMuted}
                      playsInline
                      onEnded={handleVideoEnded}
                      onPlay={() => setIsVideoPlaying(true)}
                      onPause={() => setIsVideoPlaying(false)}
                      className="w-full h-full object-cover"
                    />

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                    {/* Top Status Badges */}
                    <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
                      <span className="px-3 py-1.5 text-[11px] font-semibold text-white bg-black/80 backdrop-blur-md border border-[#38bdf8]/50 rounded-lg flex items-center gap-2 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
                        <span>{currentVideo.location}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-[#2563eb]/90 backdrop-blur-md rounded-md border border-[#38bdf8]/40">
                          {isVideoAutoPlaying ? 'Autoplay: ON' : 'Autoplay: PAUSED'}
                        </span>
                        <span className="px-2 py-1 text-[10px] font-data text-[#93c5fd] bg-black/70 rounded-md">
                          {currentVideoIndex + 1} / {FIELD_VIDEOS.length}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Video Controller Bar */}
                    <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold tracking-widest uppercase text-[#38bdf8] bg-black/80 px-2 py-0.5 rounded border border-[#38bdf8]/40 inline-block mb-1">
                          {currentVideo.badge}
                        </span>
                        <h4 className="font-display text-sm sm:text-base font-bold text-white drop-shadow truncate max-w-md">
                          {currentVideo.title}
                        </h4>
                      </div>

                      {/* Video Player Action Buttons */}
                      <div className="flex items-center gap-2">
                        {/* Play/Pause Video */}
                        <button
                          onClick={toggleVideoPlay}
                          className="p-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white transition-all cursor-pointer shadow-lg"
                          title={isVideoPlaying ? 'Pause Video' : 'Play Video'}
                        >
                          {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                        </button>

                        {/* Video Sound / Mute Toggle */}
                        <button
                          onClick={() => setIsVideoMuted(!isVideoMuted)}
                          className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                            !isVideoMuted
                              ? 'bg-[#4ade80] text-black font-semibold shadow-lg shadow-[#4ade80]/30'
                              : 'bg-black/80 hover:bg-black text-white border border-white/20'
                          }`}
                          title={isVideoMuted ? 'Unmute Site Audio' : 'Mute Site Audio'}
                        >
                          {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>

                        {/* Prev / Next Video */}
                        <button
                          onClick={handlePrevVideo}
                          className="p-2.5 rounded-xl bg-black/80 hover:bg-[#1d4ed8] text-white border border-white/20 transition-all cursor-pointer"
                          title="Previous Video"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleNextVideo}
                          className="p-2.5 rounded-xl bg-black/80 hover:bg-[#1d4ed8] text-white border border-white/20 transition-all cursor-pointer"
                          title="Next Video"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Video Helper Strip */}
                  <div className="mt-3 flex items-center justify-between text-xs text-[#93c5fd] px-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                      <span>{isVideoMuted ? 'Site video muted for seamless autoplay' : 'Site ambient audio playing'}</span>
                    </span>
                    <button
                      onClick={() => setIsVideoAutoPlaying(!isVideoAutoPlaying)}
                      className="text-[#38bdf8] hover:underline cursor-pointer font-medium"
                    >
                      {isVideoAutoPlaying ? 'Pause Continuous Autoplay' : 'Resume Continuous Autoplay'}
                    </button>
                  </div>
                </div>

                {/* Right Column: Detailed Engineering Narrative for Active Video */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
                  <div>
                    <div className="flex items-center justify-between text-xs font-data text-[#38bdf8] mb-2">
                      <span>BROADCAST REEL {currentVideoIndex + 1} OF {FIELD_VIDEOS.length}</span>
                      <span className="px-2 py-0.5 rounded bg-[#1d4ed8]/30 border border-[#38bdf8]/30 text-[#93c5fd]">
                        AUTHENTIC FIELD ARCHIVE
                      </span>
                    </div>

                    <span className="text-xs uppercase font-bold tracking-wider text-[#38bdf8] block mb-1">
                      {currentVideo.badge}
                    </span>

                    <h4 className="font-display text-xl sm:text-2xl font-bold text-white leading-snug">
                      {currentVideo.title}
                    </h4>

                    <div className="mt-4 p-5 bg-[#07132b] rounded-2xl border border-[#1d4ed8]/40 text-xs sm:text-sm text-[#bfdbfe] leading-relaxed">
                      {currentVideo.description}
                    </div>

                    {/* Technical Specs Tags */}
                    <div className="mt-4 space-y-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#93c5fd] block">
                        Verified Civil Standards:
                      </span>
                      {currentVideo.keySpecs.map((spec, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2 text-xs text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-[#4ade80] shrink-0" />
                          <span>{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={onOpenViewing}
                      className="px-4 py-2.5 text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl transition-all shadow-md shadow-[#2563eb]/30 cursor-pointer flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book On-Site Field Walkthrough</span>
                    </button>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 text-xs font-semibold text-white bg-[#25D366] hover:bg-[#20b859] rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>WhatsApp Engr. Samuel</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* 9-Video Playlist Thumbnail Strip */}
              <div className="pt-6 border-t border-[#1d4ed8]/40">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#38bdf8] flex items-center gap-2">
                    <Video className="w-3.5 h-3.5" />
                    <span>Select Any of the 9 Field Videos to Watch</span>
                  </span>
                  <span className="text-xs text-[#93c5fd]">
                    Click to switch broadcast
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
                  {FIELD_VIDEOS.map((vid, vIdx) => (
                    <button
                      key={vid.id}
                      onClick={() => {
                        setCurrentVideoIndex(vIdx);
                        setIsVideoPlaying(true);
                      }}
                      className={`relative rounded-xl overflow-hidden border p-1 text-left transition-all cursor-pointer flex flex-col justify-between group ${
                        currentVideoIndex === vIdx
                          ? 'bg-[#1d4ed8]/40 border-[#38bdf8] ring-2 ring-[#38bdf8]/60 shadow-lg'
                          : 'bg-[#07132b]/80 border-[#1d4ed8]/30 hover:border-[#38bdf8]/60 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-1.5">
                        <img
                          src={vid.posterImage}
                          alt={vid.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          {currentVideoIndex === vIdx && isVideoPlaying ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80] animate-ping" />
                          ) : (
                            <Play className="w-3.5 h-3.5 text-white fill-current opacity-80 group-hover:opacity-100" />
                          )}
                        </div>
                        <span className="absolute bottom-1 right-1 px-1 text-[9px] font-data bg-black/80 text-[#93c5fd] rounded">
                          0{vIdx + 1}
                        </span>
                      </div>
                      <div className="px-1 pb-1">
                        <span className="text-[10px] font-bold text-white block line-clamp-1 group-hover:text-[#38bdf8] transition-colors">
                          {vid.durationTag}
                        </span>
                        <span className="text-[9px] text-[#93c5fd] block truncate">
                          {vid.badge}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* TAB 2: PHOTO STORIES COLLAGE & FIELD PHOTO-REEL */
            <div className="bg-[#0b1e42] border border-[#1d4ed8]/40 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left Column: Changing Image Reel */}
                <div className="lg:col-span-7 flex flex-col">
                  <div className="relative aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden border border-[#38bdf8]/30 bg-[#07132b] shadow-2xl">
                    <img
                      key={currentSlide.image}
                      src={currentSlide.image}
                      alt={currentSlide.title}
                      className="w-full h-full object-cover animate-fadeIn transition-all duration-700 hover:scale-105"
                    />

                    {/* Gradient Scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07132b] via-transparent to-transparent pointer-events-none opacity-90" />

                    {/* Top Location Badge */}
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                      <span className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#07132b]/90 backdrop-blur-md border border-[#38bdf8]/40 rounded-md flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#38bdf8]" />
                        <span>{currentSlide.location}</span>
                      </span>
                    </div>

                    {/* Progress Bar Strip */}
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#07132b] z-20">
                      <div
                        className={`h-full bg-[#38bdf8] transition-all duration-300 ${
                          isPlaying ? 'animate-pulse' : ''
                        }`}
                        style={{
                          width: `${((currentSlideIndex + 1) / storySlides.length) * 100}%`,
                        }}
                      />
                    </div>

                    {/* Caption on image */}
                    <div className="absolute bottom-4 left-4 right-4 z-10 text-left">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-[#38bdf8] bg-[#07132b]/90 px-2 py-0.5 rounded border border-[#38bdf8]/40 inline-block mb-1">
                        {currentSlide.tag}
                      </span>
                      <h4 className="font-display text-lg sm:text-xl font-bold text-white drop-shadow">
                        {currentSlide.title}
                      </h4>
                    </div>
                  </div>

                  {/* Thumbnail / Slide Selector Strip */}
                  <div className="mt-4 grid grid-cols-7 gap-2">
                    {storySlides.map((slide, idx) => (
                      <button
                        key={slide.image}
                        onClick={() => {
                          setCurrentSlideIndex(idx);
                          setIsPlaying(false);
                        }}
                        className={`relative aspect-video rounded-lg overflow-hidden border transition-all cursor-pointer ${
                          currentSlideIndex === idx
                            ? 'border-[#38bdf8] ring-2 ring-[#38bdf8]/50 scale-105'
                            : 'border-[#1d4ed8]/30 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={slide.image}
                          alt={`Slide ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Column: Detailed Story Beside the Changing Collage */}
                <div className="lg:col-span-5 flex flex-col justify-center space-y-5">
                  <div className="flex items-center justify-between text-xs font-data text-[#38bdf8]">
                    <span>REEL {currentSlideIndex + 1} OF {storySlides.length}</span>
                    <span className="text-[#93c5fd]">AUTHENTIC FIELD ARCHIVE</span>
                  </div>

                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-[#38bdf8] block mb-1">
                      {currentSlide.tag}
                    </span>
                    <h4 className="font-display text-2xl font-bold text-white">
                      {currentSlide.title}
                    </h4>
                  </div>

                  <p className="text-sm text-[#bfdbfe] leading-relaxed bg-[#07132b] p-5 rounded-2xl border border-[#1d4ed8]/40 font-normal">
                    {currentSlide.story}
                  </p>

                  {/* Four Institutional Pillars */}
                  <div className="space-y-2.5 pt-2 text-xs">
                    <div className="flex items-start gap-2.5 text-[#e0f2fe]">
                      <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                      <span><strong>100% Real Field Sites:</strong> No 3D renderings—all photos represent actual building projects developed under Engr. Samuel Aleji.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-[#e0f2fe]">
                      <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                      <span><strong>Accredited Technical Partners:</strong> Direct collaboration with industrial food processing & civil engineers.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-[#e0f2fe]">
                      <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                      <span><strong>Diaspora Construction Shield:</strong> Milestone-based escrow and timestamped 4K video reporting delivered worldwide.</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={onOpenChat}
                      className="px-4 py-2.5 text-xs font-semibold text-white bg-[#1d4ed8] hover:bg-[#0284c7] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
                      <span>Ask Ola AI About This Project</span>
                    </button>
                    <button
                      onClick={onOpenViewing}
                      className="px-4 py-2.5 text-xs font-semibold text-[#bfdbfe] bg-[#07132b] hover:bg-[#113e94] border border-[#1d4ed8]/40 rounded-lg transition-colors cursor-pointer"
                    >
                      Request Field Inspection
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            SECTION 3: EXTENSIVE BIOGRAPHICAL & CORPORATE PROFILE STORY
            Deep, inspiring narrative answering "about profile story is too short"
           ========================================================================= */}
        <div className="bg-[#0b1e42] border border-[#1d4ed8]/40 rounded-3xl p-8 sm:p-12 mb-20 shadow-2xl">
          <div className="max-w-4xl mx-auto">
            <div className="text-xs font-bold uppercase tracking-wider text-[#38bdf8] mb-2 flex items-center gap-2">
              <BookOpenIcon className="w-4 h-4 text-[#38bdf8]" />
              <span>THE COMPLETE BIOGRAPHICAL CHRONICLE · 2006 TO DATE</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              From Soil & Concrete to Institutional Leadership: The Story of Engineer Samuel Aleji
            </h2>

            <div className="space-y-6 text-sm text-[#bfdbfe] leading-relaxed font-normal">
              <p>
                In 2006, the real estate landscape in southwestern Nigeria was marred by profound volatility. Innocent families and overseas diaspora investors were routinely defrauded by unscrupulous middlemen selling disputed customary land, presenting falsified perimeter surveys, or handing over substandard buildings that developed structural cracks within months of occupancy.
              </p>

              <p>
                Seeing this pervasive devastation, <strong>Engineer Samuel Aleji</strong> founded <strong>Ola Continental Properties, Building & Civil Engineering Construction</strong> with a singular mission: to eradicate uncertainty from Nigerian property transactions through unforgiving engineering discipline, absolute title transparency, and direct boots-on-the-ground supervision.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                <div className="bg-[#07132b] p-6 rounded-2xl border border-[#1d4ed8]/40 space-y-3">
                  <div className="flex items-center gap-2 font-display text-lg font-bold text-white">
                    <Ruler className="w-5 h-5 text-[#38bdf8]" />
                    <span>Civil Engineering & Turnkey Construction</span>
                  </div>
                  <p className="text-xs text-[#93c5fd] leading-relaxed">
                    Ola Continental is not a brokerage that simply markets properties from behind a desk. We design architectural blueprints, calculate structural load capacities, cast reinforced concrete slabs, erect industrial warehouse portal frames, and pave residential estate road corridors. Every structural element meets strict British Standard (BS 8110) structural codes.
                  </p>
                </div>

                <div className="bg-[#07132b] p-6 rounded-2xl border border-[#1d4ed8]/40 space-y-3">
                  <div className="flex items-center gap-2 font-display text-lg font-bold text-white">
                    <ShieldCheck className="w-5 h-5 text-[#38bdf8]" />
                    <span>The Unbroken Cadastral Verification Rule</span>
                  </div>
                  <p className="text-xs text-[#93c5fd] leading-relaxed">
                    Under Engineer Samuel Aleji’s doctrine, no property is listed or sold without certified ground coordinate beacon pillars and mandatory charting at the Surveyor General’s Office in Agodi Secretariat, Ibadan (or Alausa, Lagos). Every root of title is confirmed in person with the ancestral Baale councils to guarantee zero boundary overlap and zero inheritance litigation.
                  </p>
                </div>
              </div>

              <h3 className="font-display text-2xl font-bold text-white pt-4">
                Pioneering Campus Accommodations & Industrial Corridors
              </h3>
              <p>
                In Ogbomoso, the expansion of Ladoke Akintola University of Technology (LAUTECH) sparked massive student accommodation shortages. Engineer Samuel Aleji responded by pioneering purpose-built, secure multi-unit student hostels in the Adenike and Under-G corridors. His designs prioritized private kitchenettes, dedicated industrial borehole water systems, prepaid submeters, and structural anti-climb perimeter fencing—delivering dependable 14% to 18% annual cashflows to investors with 100% student occupancy rates.
              </p>

              <p>
                Simultaneously, in the agro-allied belts of Odo-Oba and along the Aroje–Ilorin Interstate Expressway, Engr. Aleji facilitated the acquisition and civil construction of major commercial projects, including food processing mills (such as Tosmat Foods & Agro Products) and logistics warehouses with wide-span industrial loading docks capable of accommodating 40-foot articulated freight trucks.
              </p>

              <h3 className="font-display text-2xl font-bold text-white pt-4">
                The Diaspora Shield: Protecting Hard-Earned Capital
              </h3>
              <p>
                For nearly two decades, over 60% of Ola Continental’s clients have been Nigerians living in the United Kingdom, United States, Canada, the European Union, and the Gulf states. Knowing the pervasive heartbreak of sending construction funds to untrustworthy proxies or relatives only to find an empty foundation years later, Engr. Samuel Aleji instituted the <strong>Diaspora Milestone Escrow Protocol</strong>.
              </p>
              <p>
                Under this protocol, diaspora clients receive unedited timestamped 4K drone video inspection reports at every construction stage (Foundation &rarr; German Floor &rarr; Lintel/Decking &rarr; Roof Truss &rarr; Plastering &rarr; Handover). All contracts are executed by NBA-accredited solicitors, and original stamped Deeds of Assignment and registered survey plans are securely shipped directly to your overseas residence via DHL Express.
              </p>

              {/* Callout Strip */}
              <div className="mt-8 p-6 bg-[#07132b] rounded-2xl border border-[#38bdf8]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-display text-base font-bold text-white">
                    Need a Turnkey Building Contractor or Land Due Diligence in Oyo / Lagos?
                  </h4>
                  <p className="text-xs text-[#93c5fd] mt-0.5">
                    Engr. Samuel Aleji is available for executive project consultations.
                  </p>
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#25D366] hover:bg-[#20b859] text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shrink-0"
                >
                  <Phone className="w-4 h-4" />
                  <span>WhatsApp Engr. Samuel</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 4: BUILDING & CIVIL CONSTRUCTION SERVICES BREAKDOWN
           ========================================================================= */}
        <div className="mb-20">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="text-xs font-semibold tracking-wider uppercase text-[#38bdf8] mb-2">
              COMPREHENSIVE CAPABILITIES
            </div>
            <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              Building Construction & Civil Engineering Services
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#bfdbfe]">
              Ola Continental provides complete end-to-end architectural, engineering, and structural construction services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0b1e42] p-7 rounded-2xl border border-[#1d4ed8]/40 hover:border-[#38bdf8]/60 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#07132b] border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8]">
                <Building className="w-5 h-5" />
              </div>
              <h4 className="font-display text-xl font-bold text-white">Residential Turnkey Homes</h4>
              <p className="text-xs text-[#bfdbfe] leading-relaxed">
                Design and construction of modern 3-to-5 bedroom executive bungalows and duplexes with stamped concrete driveways, perimeter fences, POP ceilings, and automated boreholes.
              </p>
              <div className="text-[11px] text-[#38bdf8] font-semibold pt-1">
                From Soil Testing to Key Handover &rarr;
              </div>
            </div>

            <div className="bg-[#0b1e42] p-7 rounded-2xl border border-[#1d4ed8]/40 hover:border-[#38bdf8]/60 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#07132b] border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8]">
                <HardHat className="w-5 h-5" />
              </div>
              <h4 className="font-display text-xl font-bold text-white">Student Accommodation Hostels</h4>
              <p className="text-xs text-[#bfdbfe] leading-relaxed">
                Purpose-built multi-storey hostels engineered specifically for LAUTECH student tenant demand, with individual submeters, water storage towers, and resident security lodges.
              </p>
              <div className="text-[11px] text-[#38bdf8] font-semibold pt-1">
                14% – 18% Annual Rental Cashflow &rarr;
              </div>
            </div>

            <div className="bg-[#0b1e42] p-7 rounded-2xl border border-[#1d4ed8]/40 hover:border-[#38bdf8]/60 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#07132b] border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8]">
                <Factory className="w-5 h-5" />
              </div>
              <h4 className="font-display text-xl font-bold text-white">Commercial & Industrial Facilities</h4>
              <p className="text-xs text-[#bfdbfe] leading-relaxed">
                Heavy industrial warehouse construction, commercial shopping plazas, agro-processing factory setups, and expressway logistics depots with reinforced foundation beds.
              </p>
              <div className="text-[11px] text-[#38bdf8] font-semibold pt-1">
                Heavy Load Capacities & Structural Steel &rarr;
              </div>
            </div>
          </div>
        </div>

        {/* 19-Year Corporate Milestones Timeline */}
        <div className="mb-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-semibold tracking-wider uppercase text-[#38bdf8] mb-2">
              19-YEAR TRACK RECORD
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Milestones in Verifiable Land Intelligence & Construction
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#0b1e42] p-6 rounded-2xl border border-[#1d4ed8]/40 relative">
              <span className="font-data text-xs font-bold text-[#38bdf8] bg-[#07132b] border border-[#38bdf8]/30 px-2 py-1 rounded">2006</span>
              <h4 className="font-display text-lg font-bold text-white mt-3 mb-1">Company Founded</h4>
              <p className="text-xs text-[#bfdbfe] leading-relaxed">
                Established in Ogbomoso by Engineer Samuel Aleji. Initial focus on physical beacon demarcation, civil construction, and eradicating customary land litigation.
              </p>
            </div>

            <div className="bg-[#0b1e42] p-6 rounded-2xl border border-[#1d4ed8]/40 relative">
              <span className="font-data text-xs font-bold text-[#38bdf8] bg-[#07132b] border border-[#38bdf8]/30 px-2 py-1 rounded">2011</span>
              <h4 className="font-display text-lg font-bold text-white mt-3 mb-1">LAUTECH Hostel Syndicate</h4>
              <p className="text-xs text-[#bfdbfe] leading-relaxed">
                Pioneered high-yield off-campus student accommodation design and construction in Adenike and Under G with guaranteed session rent rolls.
              </p>
            </div>

            <div className="bg-[#0b1e42] p-6 rounded-2xl border border-[#1d4ed8]/40 relative">
              <span className="font-data text-xs font-bold text-[#38bdf8] bg-[#07132b] border border-[#38bdf8]/30 px-2 py-1 rounded">2018</span>
              <h4 className="font-display text-lg font-bold text-white mt-3 mb-1">Lagos Corridor Expansion</h4>
              <p className="text-xs text-[#bfdbfe] leading-relaxed">
                Expanded verified brokerage and civil works into commercial warehousing and multi-family assets in Lagos State, notably along the Mushin Commercial Axis.
              </p>
            </div>

            <div className="bg-[#0b1e42] p-6 rounded-2xl border border-[#1d4ed8]/40 relative">
              <span className="font-data text-xs font-bold text-[#38bdf8] bg-[#07132b] border border-[#38bdf8]/30 px-2 py-1 rounded">2026</span>
              <h4 className="font-display text-lg font-bold text-white mt-3 mb-1">AI Concierge & Live CRM</h4>
              <p className="text-xs text-[#bfdbfe] leading-relaxed">
                Deployed Ola AI Concierge, automated SendPulse CRM lead collection, and real-time cloud title verification for global clients.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
