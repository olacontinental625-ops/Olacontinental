import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { VideoHero } from './components/VideoHero';
import { SearchFilterBar } from './components/SearchFilterBar';
import { PropertyCard } from './components/PropertyCard';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { PropertyMatcherModal } from './components/PropertyMatcherModal';
import { PropertyCompareModal } from './components/PropertyCompareModal';
import { CorridorsSection } from './components/CorridorsSection';
import { ReviewsSection } from './components/ReviewsSection';
import { AboutSection } from './components/AboutSection';
import { ConstructionsSection } from './components/ConstructionsSection';
import { BlogsSection } from './components/BlogsSection';
import { OlaLogoMark } from './components/OlaLogoMark';
import { BuildingConstructionShowcase } from './components/BuildingConstructionShowcase';
import { BuyerEducationModal } from './components/BuyerEducationModal';
import { DocumentVaultModal } from './components/DocumentVaultModal';
import { ScheduleViewingModal } from './components/ScheduleViewingModal';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { CustomerAuthSection } from './components/CustomerAuthSection';
import { AdminSection } from './components/AdminSection';
import { Footer } from './components/Footer';
import { PROPERTIES } from './data/properties';
import { listenToProperties } from './lib/firebase';
import { Property, PropertyPurpose, PropertyType, Corridor, PageType, ContactInquiry, CustomerProfile } from './types';
import {
  Layers,
  Sparkles,
  MessageCircle,
  Scale,
  Building2,
  Phone,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Award,
  CheckCircle2,
  FileCheck2,
  Compass,
  Star,
  UserCheck,
  HardHat,
  Mail,
  Home,
  CheckSquare,
  BookOpen
} from 'lucide-react';

export default function App() {
  // Page Routing State ('home' | 'about' | 'properties' | 'corridors' | 'testimonials' | 'constructions' | 'blogs' | 'customer-login' | 'admin-login')
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [activeContactInquiry, setActiveContactInquiry] = useState<ContactInquiry | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [dynamicProperties, setDynamicProperties] = useState<any[]>([]);

  // Restore customer session cookie & subscribe to live dynamic property catalog
  useEffect(() => {
    let active = true;
    fetch('/api/customers/me')
      .then((res) => res.json())
      .then((data) => {
        if (active && data.authenticated && data.customer) {
          setCustomerProfile(data.customer);
        }
      })
      .catch(() => {});

    fetch('/api/properties')
      .then((res) => res.json())
      .then((data) => {
        if (active && Array.isArray(data.properties)) {
          setDynamicProperties(data.properties);
        }
      })
      .catch(() => {});

    const unsubProps = listenToProperties((fsProps) => {
      if (!active || fsProps.length === 0) return;
      setDynamicProperties((prev) => {
        const seen = new Set(fsProps.map((p) => p.id));
        return [...fsProps, ...prev.filter((p) => !seen.has(p.id))];
      });
    });

    return () => {
      active = false;
      unsubProps();
    };
  }, []);

  const handleCustomerSignOut = async () => {
    try {
      await fetch('/api/customers/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setCustomerProfile(null);
  };

  // Sync with browser hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim();
      if (rawHash === 'contact') {
        setCurrentPage('constructions');
      } else if (
        [
          'about',
          'properties',
          'corridors',
          'testimonials',
          'constructions',
          'blogs',
          'customer-login',
          'admin-login',
        ].includes(rawHash)
      ) {
        setCurrentPage(rawHash as PageType);
      } else if (!rawHash || rawHash === 'home') {
        setCurrentPage('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: PageType) => {
    setCurrentPage(page);
    if (page === 'properties') {
      fetch('/api/properties')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.properties)) {
            setDynamicProperties(data.properties);
          }
        })
        .catch(() => {});
    }
    if (page === 'home') {
      if (window.location.hash) {
        window.history.pushState(null, '', window.location.pathname);
      }
    } else {
      window.location.hash = page;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Search & Filter States
  const [selectedPurpose, setSelectedPurpose] = useState<PropertyPurpose>('All');
  const [selectedType, setSelectedType] = useState<PropertyType>('All');
  const [selectedCorridor, setSelectedCorridor] = useState<Corridor>('All Corridors');
  const [maxBudget, setMaxBudget] = useState<number>(80000000);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers States
  const [selectedPropertyForDetail, setSelectedPropertyForDetail] = useState<Property | null>(null);
  const [comparedProperties, setComparedProperties] = useState<Property[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isMatcherOpen, setIsMatcherOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEducationOpen, setIsEducationOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isViewingModalOpen, setIsViewingModalOpen] = useState(false);
  const [targetPropertyForViewing, setTargetPropertyForViewing] = useState<Property | null>(null);

  const allProperties = useMemo<Property[]>(() => {
    const overrideMap = new Map<string, any>();
    const customFullProps: Property[] = [];
    for (const rec of dynamicProperties) {
      overrideMap.set(rec.id, rec);
      if (!rec.isOverride && !PROPERTIES.some((bp) => bp.id === rec.id)) {
        customFullProps.push(rec as Property);
      }
    }
    const mergedBuiltIns = PROPERTIES.map((bp) => {
      const ov = overrideMap.get(bp.id);
      return ov ? { ...bp, ...ov } : bp;
    });
    return [...customFullProps, ...mergedBuiltIns];
  }, [dynamicProperties]);

  // Filter Logic
  const filteredProperties = useMemo(() => {
    return allProperties.filter((property) => {
      // Purpose filter
      if (selectedPurpose !== 'All' && property.purpose !== selectedPurpose) {
        return false;
      }
      // Type filter
      if (selectedType !== 'All' && property.type !== selectedType) {
        return false;
      }
      // Corridor filter
      if (selectedCorridor !== 'All Corridors' && property.corridor !== selectedCorridor) {
        return false;
      }
      // Keyword search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = property.title.toLowerCase().includes(q);
        const matchesDesc = property.shortDescription.toLowerCase().includes(q) || property.fullDescription.toLowerCase().includes(q);
        const matchesCorridor = property.corridor.toLowerCase().includes(q);
        const matchesAmenities = property.amenities.some((a) => a.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesCorridor && !matchesAmenities) {
          return false;
        }
      }
      return true;
    });
  }, [allProperties, selectedPurpose, selectedType, selectedCorridor, searchQuery]);

  // Comparison Handlers
  const handleToggleCompare = (property: Property) => {
    setComparedProperties((prev) => {
      const exists = prev.some((p) => p.id === property.id);
      if (exists) {
        return prev.filter((p) => p.id !== property.id);
      } else {
        if (prev.length >= 3) {
          return [...prev.slice(1), property];
        }
        return [...prev, property];
      }
    });
  };

  const handleBookViewing = (property: Property | null) => {
    setTargetPropertyForViewing(property);
    setIsViewingModalOpen(true);
  };

  const handleResetFilters = () => {
    setSelectedPurpose('All');
    setSelectedType('All');
    setSelectedCorridor('All Corridors');
    setMaxBudget(80000000);
    setSearchQuery('');
  };

  const isHome = currentPage === 'home';

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-[#2563eb] selection:text-white transition-colors duration-300 ${
      isHome ? 'bg-[#181a20] text-slate-100' : 'bg-[#07132b] text-[#F0F6FF]'
    }`}>
      {/* 3-Zone Sticky Navigation Bar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={navigateTo}
        onOpenViewing={() => handleBookViewing(null)}
        onOpenMatcher={() => setIsMatcherOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenEducation={() => setIsEducationOpen(true)}
        onOpenVault={() => setIsVaultOpen(true)}
        customerProfile={customerProfile}
      />

      <main className="flex-1">
        {/* =========================================================================
            VIEW 1: HOMEPAGE (Architectural Grey Theme)
            Each division is represented by a showcase portal card that takes the user
            directly to that specific section as an independent page.
           ========================================================================= */}
        {currentPage === 'home' && (
          <div className="bg-[#181a20]">
            {/* Split Hero: Text with Logo Design Concept on Left, Uploadable Video on Right */}
            <VideoHero
              onExploreProperties={() => navigateTo('properties')}
              onOpenConstructions={() => navigateTo('constructions')}
              onOpenChat={() => setIsChatOpen(true)}
              onOpenViewing={() => handleBookViewing(null)}
            />

            {/* Homepage Department Showcase Portals in Architectural Grey */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="max-w-3xl">
                  <div className="mb-4">
                    <OlaLogoMark variant="section" />
                  </div>
                  <div className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#38bdf8] mb-2 flex items-center gap-2">
                    <span>ARCHITECTURAL &amp; CIVIL ENGINEERING DIVISIONS</span>
                    <span aria-hidden="true" className="text-slate-500">·</span>
                    <span className="font-data text-xs text-slate-400">ESTABLISHED 2006</span>
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                    Explore Ola Continental Divisions
                  </h2>
                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                    Under the leadership of Engineer Samuel Aleji, Ola Continental delivers certified real estate brokerage and turnkey building construction across Ogbomoso and Lagos. Explore each dedicated division below.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigateTo('properties')}
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-[#b91c1c] hover:bg-[#991b1b] rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    <span>Browse All Listings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Grid of 6 Luxury Portal Cards in Architectural Slate Grey */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Portal Card 1: About Us */}
                <div
                  onClick={() => navigateTo('about')}
                  className="group bg-[#222630] border border-slate-700/70 hover:border-[#38bdf8]/60 rounded-2xl p-7 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-950/40 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-semibold tracking-widest uppercase text-[#38bdf8] bg-[#181a20]/80 border border-slate-700 px-2.5 py-1 rounded-md">
                        Since 2006 · CAC BN: 3189204
                      </span>
                      <Award className="w-5 h-5 text-[#38bdf8] group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white group-hover:text-[#38bdf8] transition-colors mb-3">
                      About Us
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      Discover our 19-year legacy under Engineer Samuel Aleji, established in 2006. Learn about his civil engineering discipline, 180+ completed homes, 45+ student hostels, and executive leadership.
                    </p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-slate-700/60 flex items-center justify-between text-xs font-semibold text-[#38bdf8] group-hover:text-white transition-colors">
                    <span>Read About Us &amp; Our 19-Year Story</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Portal Card 2: Constructions (Ongoing & Finished Properties) */}
                <div
                  onClick={() => navigateTo('constructions')}
                  className="group bg-[#222630] border border-slate-700/70 hover:border-[#38bdf8]/60 rounded-2xl p-7 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-950/40 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-semibold tracking-widest uppercase text-[#4ade80] bg-[#181a20]/80 border border-slate-700 px-2.5 py-1 rounded-md">
                        Ongoing &amp; Finished Works
                      </span>
                      <HardHat className="w-5 h-5 text-[#4ade80] group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white group-hover:text-[#38bdf8] transition-colors mb-3">
                      Constructions &amp; Finished Properties
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      Inspect active building sites currently worked on alongside completed turnkey duplexes, student hostels, industrial weighbridges, and corporate estates.
                    </p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-slate-700/60 flex items-center justify-between text-xs font-semibold text-[#4ade80] group-hover:text-white transition-colors">
                    <span>Open Constructions Portfolio</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Portal Card 3: Verified Properties Repository */}
                <div
                  onClick={() => navigateTo('properties')}
                  className="group bg-[#222630] border border-slate-700/70 hover:border-[#38bdf8]/60 rounded-2xl p-7 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-950/40 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-semibold tracking-widest uppercase text-[#38bdf8] bg-[#181a20]/80 border border-slate-700 px-2.5 py-1 rounded-md">
                        15+ Verified Listings
                      </span>
                      <Building2 className="w-5 h-5 text-[#38bdf8] group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white group-hover:text-[#38bdf8] transition-colors mb-3">
                      Verified Properties Repository
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      Explore active student hostels, modern bungalows, executive duplexes, commercial land, and fertile farms across Ogbomoso and Lagos corridors with live GPS beacon coordinates.
                    </p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-slate-700/60 flex items-center justify-between text-xs font-semibold text-[#38bdf8] group-hover:text-white transition-colors">
                    <span>Open Properties Page</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Portal Card 4: Operating Corridors & Zones */}
                <div
                  onClick={() => navigateTo('corridors')}
                  className="group bg-[#222630] border border-slate-700/70 hover:border-[#38bdf8]/60 rounded-2xl p-7 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-950/40 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-300 bg-[#181a20]/80 border border-slate-700 px-2.5 py-1 rounded-md">
                        Ogbomoso & Lagos
                      </span>
                      <MapPin className="w-5 h-5 text-[#38bdf8] group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white group-hover:text-[#38bdf8] transition-colors mb-3">
                      Operating Corridors & Zones
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      Strategic geospatial zoning across LAUTECH Hospital quarters, Under-G student rentals, Adenike, Aroje Industrial Highway, Takie, and Mushin Commercial District.
                    </p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-slate-700/60 flex items-center justify-between text-xs font-semibold text-[#38bdf8] group-hover:text-white transition-colors">
                    <span>Explore Corridors</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Portal Card 5: Client Sign Up & Ask Ola AI Access */}
                <div
                  onClick={() => navigateTo('customer-login')}
                  className="group bg-[#222630] border border-slate-700/70 hover:border-[#F5C451]/60 rounded-2xl p-7 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-950/40 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-semibold tracking-widest uppercase text-[#F5C451] bg-[#181a20]/80 border border-slate-700 px-2.5 py-1 rounded-md">
                        Nigeria &amp; Diaspora Access
                      </span>
                      <UserCheck className="w-5 h-5 text-[#F5C451] group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white group-hover:text-[#F5C451] transition-colors mb-3">
                      Customer Sign Up &amp; Ask Ola AI
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      Register with your Full Name, Phone, Email, and WhatsApp Number to unlock personalized Ola AI real estate and construction guidance across Nigeria and abroad.
                    </p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-slate-700/60 flex items-center justify-between text-xs font-semibold text-[#F5C451] group-hover:text-white transition-colors">
                    <span>Sign Up or Access Portal</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Portal Card 6: Real Estate & Civil Engineering Blogs */}
                <div
                  onClick={() => navigateTo('blogs')}
                  className="group bg-[#222630] border border-slate-700/70 hover:border-[#38bdf8]/60 rounded-2xl p-7 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-950/40 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-semibold tracking-widest uppercase text-[#38bdf8] bg-[#181a20]/80 border border-slate-700 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#38bdf8]" />
                        <span>Field Journal</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Articles</span>
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white group-hover:text-[#38bdf8] transition-colors mb-3">
                      Real Estate &amp; Construction Blogs
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      Technical guides written by Engineer Samuel Aleji covering Oyo State cadastral charting, LAUTECH student hostel ROI, BS 8110 structural standards, and remote diaspora building protocols.
                    </p>
                  </div>
                  <div className="pt-6 mt-6 border-t border-slate-700/60 flex items-center justify-between text-xs font-semibold text-[#38bdf8] group-hover:text-white transition-colors">
                    <span>Read Editorial Blogs</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Quick Inquiry Callout Strip in Architectural Grey */}
              <div className="mt-14 bg-[#222630] border border-slate-700/70 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="space-y-1.5 text-center md:text-left">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#38bdf8] flex items-center gap-2 justify-center md:justify-start">
                    <HardHat className="w-4 h-4 text-[#4ade80]" />
                    <span>Real Estate & Civil Construction Desk</span>
                  </div>
                  <h4 className="font-display text-xl font-bold text-white">
                    Need Custom Building Works or Verified Land Acquisition?
                  </h4>
                  <p className="text-xs text-slate-300 max-w-xl">
                    Reach Engineer Samuel Aleji directly for structural engineering consultations, student hostel developments, or dedicated diaspora inspection reports.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                  <button
                    onClick={() => navigateTo('constructions')}
                    className="px-4 py-2.5 text-xs font-semibold text-white bg-[#b91c1c] hover:bg-[#991b1b] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    <HardHat className="w-3.5 h-3.5" />
                    <span>Explore Constructions</span>
                  </button>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="px-4 py-2.5 text-xs font-semibold text-slate-200 bg-[#181a20] hover:bg-[#282c37] border border-slate-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>Ask Ola AI</span>
                  </button>
                  <a
                    href="https://wa.me/2348033848107?text=Hello%20Engineer%20Samuel%20Aleji,%20I%20am%20inquiring%20about%20Ola%20Continental%20Properties%20and%20Construction"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 text-xs font-semibold text-[#4ade80] bg-[#181a20] border border-[#4ade80]/40 hover:border-[#4ade80] rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp: 0803 384 8107</span>
                  </a>
                </div>
              </div>
            </section>

            {/* Dedicated Homepage Blog Section */}
            <BlogsSection
              variant="homepage"
              onOpenViewing={() => handleBookViewing(null)}
              onOpenChat={() => setIsChatOpen(true)}
              onNavigateProperties={() => navigateTo('properties')}
              onViewAllBlogs={() => navigateTo('blogs')}
            />
          </div>
        )}

        {/* =========================================================================
            VIEW 2: DEDICATED ABOUT PAGE (Royal Blue & Light Blue Theme)
            Deep biographical chronicle of Engr. Samuel Aleji, building & construction
            division, dual portraits, and animated reel collage.
           ========================================================================= */}
        {currentPage === 'about' && (
          <div className="min-h-[80vh] bg-[#07132b]">
            {/* Dedicated Page Breadcrumb Banner */}
            <div className="bg-[#0b1e42] border-b border-[#1d4ed8]/30 py-5 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#bfdbfe]">
                  <button
                    onClick={() => navigateTo('home')}
                    className="hover:text-[#38bdf8] transition-colors flex items-center gap-1.5 cursor-pointer font-semibold text-white"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#38bdf8]" />
                    <span>Homepage</span>
                  </button>
                  <span className="text-white/30">/</span>
                  <span className="text-[#38bdf8] font-semibold">About Us · Ola Continental &amp; Engineer Samuel Aleji Profile</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigateTo('constructions')}
                    className="text-xs font-medium text-[#bfdbfe] hover:text-white transition-colors cursor-pointer"
                  >
                    Constructions Portfolio →
                  </button>
                </div>
              </div>
            </div>

            {/* Standalone About Section */}
            <AboutSection
              onOpenViewing={() => handleBookViewing(null)}
              onOpenChat={() => setIsChatOpen(true)}
            />
          </div>
        )}

        {/* =========================================================================
            VIEW 3: DEDICATED PROPERTIES PAGE (Royal Blue & Light Blue Theme)
            Full Search, Filters, Repository Cards with authentic construction assets.
           ========================================================================= */}
        {currentPage === 'properties' && (
          <div className="min-h-[80vh] bg-[#07132b]">
            {/* Dedicated Page Breadcrumb Banner */}
            <div className="bg-[#0b1e42] border-b border-[#1d4ed8]/30 py-5 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#bfdbfe]">
                  <button
                    onClick={() => navigateTo('home')}
                    className="hover:text-[#38bdf8] transition-colors flex items-center gap-1.5 cursor-pointer font-semibold text-white"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#38bdf8]" />
                    <span>Homepage</span>
                  </button>
                  <span className="text-white/30">/</span>
                  <span className="text-[#38bdf8] font-semibold">Verified Properties Repository</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsMatcherOpen(true)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#07132b] hover:bg-[#1d4ed8]/40 border border-[#38bdf8]/40 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>7-Step Matcher</span>
                  </button>
                </div>
              </div>
            </div>

            <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div className="max-w-2xl">
                  <div className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#38bdf8] mb-2 flex items-center gap-2">
                    <span>VERIFIED PROPERTY REPOSITORY</span>
                    <span aria-hidden="true" className="text-white/40">·</span>
                    <span className="font-data text-xs text-[#93c5fd]">OGBOMOSO & LAGOS</span>
                  </div>
                  <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                    Current Verified Portfolio
                  </h1>
                  <p className="mt-3 text-sm text-[#bfdbfe] leading-relaxed">
                    Every listing is backed by actual survey beacon coordinates, physical ground walkthrough records, civil construction durability, and verifiable root-of-title documentation.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleBookViewing(null)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl transition-colors cursor-pointer shadow-md shadow-[#2563eb]/25"
                  >
                    Schedule Field Inspection
                  </button>
                </div>
              </div>

              {/* Interactive Search & Filter Controls in Royal Blue */}
              <SearchFilterBar
                selectedPurpose={selectedPurpose}
                onSelectPurpose={setSelectedPurpose}
                selectedType={selectedType}
                onSelectType={setSelectedType}
                selectedCorridor={selectedCorridor}
                onSelectCorridor={setSelectedCorridor}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onReset={handleResetFilters}
                onOpenMatcher={() => setIsMatcherOpen(true)}
                totalResults={filteredProperties.length}
              />

              {/* Property Cards Grid */}
              {filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onSelect={(p) => setSelectedPropertyForDetail(p)}
                      onBookViewing={(p) => handleBookViewing(p)}
                      isCompared={comparedProperties.some((cp) => cp.id === property.id)}
                      onToggleCompare={handleToggleCompare}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-[#0b1e42] border border-[#1d4ed8]/30 rounded-2xl space-y-4 shadow-xl">
                  <Building2 className="w-12 h-12 text-[#38bdf8]/60 mx-auto" />
                  <h3 className="font-display text-xl font-bold text-white">No Properties Match This Exact Filter</h3>
                  <p className="text-xs text-[#bfdbfe]/80 max-w-md mx-auto">
                    We adhere strictly to real properties and do not invent placeholder records. Adjust your category, purpose, or corridor filters to review other verified holdings.
                  </p>
                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 bg-[#07132b] hover:bg-[#1d4ed8]/30 text-xs font-semibold text-white rounded-lg border border-[#1d4ed8]/40"
                    >
                      Reset Filters
                    </button>
                    <button
                      onClick={() => setIsMatcherOpen(true)}
                      className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-xs font-semibold text-white rounded-lg"
                    >
                      Request Off-Market Search
                    </button>
                  </div>
                </div>
              )}

              {/* DEDICATED BUILDING & CONSTRUCTION DIVISION ON PROPERTIES PAGE */}
              <BuildingConstructionShowcase
                onOpenViewingModal={() => handleBookViewing(null)}
                onOpenChat={() => setIsChatOpen(true)}
              />
            </section>
          </div>
        )}

        {/* =========================================================================
            VIEW 4: DEDICATED CORRIDORS PAGE (Royal Blue & Light Blue Theme)
           ========================================================================= */}
        {currentPage === 'corridors' && (
          <div className="min-h-[80vh] bg-[#07132b]">
            {/* Dedicated Page Breadcrumb Banner */}
            <div className="bg-[#0b1e42] border-b border-[#1d4ed8]/30 py-5 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#bfdbfe]">
                  <button
                    onClick={() => navigateTo('home')}
                    className="hover:text-[#38bdf8] transition-colors flex items-center gap-1.5 cursor-pointer font-semibold text-white"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#38bdf8]" />
                    <span>Homepage</span>
                  </button>
                  <span className="text-white/30">/</span>
                  <span className="text-[#38bdf8] font-semibold">Operating Corridors (Ogbomoso & Lagos)</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigateTo('properties')}
                    className="text-xs font-medium text-[#bfdbfe] hover:text-white transition-colors cursor-pointer"
                  >
                    View Properties in Corridors →
                  </button>
                </div>
              </div>
            </div>

            {/* Standalone Operating Corridors Section */}
            <CorridorsSection
              onSelectCorridor={(corridor) => {
                setSelectedCorridor(corridor);
                navigateTo('properties');
              }}
              onOpenViewing={() => handleBookViewing(null)}
            />
          </div>
        )}

        {/* =========================================================================
            VIEW 6: DEDICATED TESTIMONIALS PAGE (Royal Blue & Light Blue Theme)
           ========================================================================= */}
        {currentPage === 'testimonials' && (
          <div className="min-h-[80vh] bg-[#07132b]">
            {/* Dedicated Page Breadcrumb Banner */}
            <div className="bg-[#0b1e42] border-b border-[#1d4ed8]/30 py-5 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#bfdbfe]">
                  <button
                    onClick={() => navigateTo('home')}
                    className="hover:text-[#38bdf8] transition-colors flex items-center gap-1.5 cursor-pointer font-semibold text-white"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#38bdf8]" />
                    <span>Homepage</span>
                  </button>
                  <span className="text-white/30">/</span>
                  <span className="text-[#38bdf8] font-semibold">Client Testimonials & Live Field Reviews</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleBookViewing(null)}
                    className="text-xs font-medium text-[#bfdbfe] hover:text-white transition-colors cursor-pointer"
                  >
                    Schedule an Inspection →
                  </button>
                </div>
              </div>
            </div>

            {/* Standalone Client Reviews & Live Testimonial Submission Section */}
            <ReviewsSection />
          </div>
        )}

        {/* =========================================================================
            VIEW 7: DEDICATED CONSTRUCTIONS PAGE (Ongoing Constructions & Finished Properties)
           ========================================================================= */}
        {currentPage === 'constructions' && (
          <div className="min-h-[80vh] bg-[#07132b]">
            {/* Dedicated Page Breadcrumb Banner */}
            <div className="bg-[#0b1e42] border-b border-[#1d4ed8]/30 py-5 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#bfdbfe]">
                  <button
                    onClick={() => navigateTo('home')}
                    className="hover:text-[#38bdf8] transition-colors flex items-center gap-1.5 cursor-pointer font-semibold text-white"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#38bdf8]" />
                    <span>Homepage</span>
                  </button>
                  <span className="text-white/30">/</span>
                  <span className="text-[#38bdf8] font-semibold">
                    Constructions &amp; Finished Properties Portfolio
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="https://wa.me/2348033848107?text=Hello%20Engineer%20Samuel%20Aleji,%20I%20am%20inquiring%20about%20Ola%20Continental%20Constructions%20and%20Finished%20Properties"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-[#4ade80] hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>WhatsApp Engr. Samuel Aleji</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Standalone Constructions Section: Ongoing Constructions & Finished Properties */}
            <ConstructionsSection
              onOpenViewing={() => handleBookViewing(null)}
              onOpenChat={() => setIsChatOpen(true)}
              onConnectWithAi={(inquiry) => {
                setActiveContactInquiry(inquiry);
                setIsChatOpen(true);
              }}
            />
          </div>
        )}

        {/* =========================================================================
            VIEW 8: DEDICATED REAL ESTATE & CONSTRUCTION BLOGS PAGE (Royal Blue Theme)
           ========================================================================= */}
        {currentPage === 'blogs' && (
          <div className="min-h-[80vh] bg-[#07132b]">
            {/* Dedicated Page Breadcrumb Banner */}
            <div className="bg-[#0b1e42] border-b border-[#1d4ed8]/30 py-5 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#bfdbfe]">
                  <button
                    onClick={() => navigateTo('home')}
                    className="hover:text-[#38bdf8] transition-colors flex items-center gap-1.5 cursor-pointer font-semibold text-white"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#38bdf8]" />
                    <span>Homepage</span>
                  </button>
                  <span className="text-white/30">/</span>
                  <span className="text-[#38bdf8] font-semibold">Real Estate & Civil Engineering Blogs</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigateTo('properties')}
                    className="text-xs font-medium text-[#bfdbfe] hover:text-white transition-colors cursor-pointer"
                  >
                    Browse Properties →
                  </button>
                </div>
              </div>
            </div>

            <BlogsSection
              onOpenViewing={() => handleBookViewing(null)}
              onOpenChat={() => setIsChatOpen(true)}
              onNavigateProperties={() => navigateTo('properties')}
            />
          </div>
        )}

        {/* =========================================================================
            VIEW 9: CUSTOMER LOGIN / SIGN UP SECTION
           ========================================================================= */}
        {currentPage === 'customer-login' && (
          <div className="min-h-[80vh] bg-[#07132b]">
            <div className="bg-[#0b1e42] border-b border-[#1d4ed8]/30 py-5 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#bfdbfe]">
                  <button
                    onClick={() => navigateTo('home')}
                    className="hover:text-[#38bdf8] transition-colors flex items-center gap-1.5 cursor-pointer font-semibold text-white"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#38bdf8]" />
                    <span>Homepage</span>
                  </button>
                  <span className="text-white/30">/</span>
                  <span className="text-[#F5C451] font-semibold">Customer Sign Up &amp; Ask Ola AI Access</span>
                </div>
              </div>
            </div>

            <CustomerAuthSection
              customerProfile={customerProfile}
              onCustomerRegistered={(customer) => setCustomerProfile(customer)}
              onCustomerSignOut={handleCustomerSignOut}
              onOpenChat={() => setIsChatOpen(true)}
              onNavigate={navigateTo}
            />
          </div>
        )}

        {/* =========================================================================
            VIEW 10: OWNER ADMIN LOGIN SECTION & REGISTERED CUSTOMERS DIRECTORY
           ========================================================================= */}
        {currentPage === 'admin-login' && (
          <div className="min-h-[80vh] bg-[#07132b]">
            <div className="bg-[#0b1e42] border-b border-[#1d4ed8]/30 py-5 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#bfdbfe]">
                  <button
                    onClick={() => navigateTo('home')}
                    className="hover:text-[#38bdf8] transition-colors flex items-center gap-1.5 cursor-pointer font-semibold text-white"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#38bdf8]" />
                    <span>Homepage</span>
                  </button>
                  <span className="text-white/30">/</span>
                  <span className="text-[#38bdf8] font-semibold">Real Estate Owner Admin Login &amp; Customer Records</span>
                </div>
              </div>
            </div>

            <AdminSection onNavigate={navigateTo} />
          </div>
        )}
      </main>

      {/* Side-by-Side Property Comparison Floating Dock */}
      {comparedProperties.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-[#0b1e42]/95 border border-[#38bdf8]/50 shadow-2xl rounded-2xl px-5 py-3.5 flex items-center gap-4 text-white backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Scale className="w-4 h-4 text-[#38bdf8]" />
            <span>Comparing {comparedProperties.length} of 3 properties</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#2563eb] hover:bg-[#1d4ed8] rounded-lg transition-colors cursor-pointer"
            >
              Compare Side-by-Side
            </button>
            <button
              onClick={() => setComparedProperties([])}
              className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white text-xs cursor-pointer"
              title="Clear Comparison"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Global Interactive Modals & Drawers */}
      {selectedPropertyForDetail && (
        <PropertyDetailModal
          property={selectedPropertyForDetail}
          onClose={() => setSelectedPropertyForDetail(null)}
          onBookViewing={(p) => handleBookViewing(p)}
          isCompared={comparedProperties.some((cp) => cp.id === selectedPropertyForDetail.id)}
          onToggleCompare={handleToggleCompare}
        />
      )}

      {isCompareModalOpen && (
        <PropertyCompareModal
          properties={comparedProperties}
          onClose={() => setIsCompareModalOpen(false)}
          onRemove={(propertyId: string) => {
            setComparedProperties((prev) => prev.filter((p) => p.id !== propertyId));
          }}
          onSelectProperty={(p) => setSelectedPropertyForDetail(p)}
          onBookViewing={(p) => handleBookViewing(p)}
        />
      )}

      {isMatcherOpen && (
        <PropertyMatcherModal
          onClose={() => setIsMatcherOpen(false)}
          onSelectProperty={(p) => setSelectedPropertyForDetail(p)}
          onBookViewing={(p) => handleBookViewing(p)}
        />
      )}

      {isViewingModalOpen && (
        <ScheduleViewingModal
          property={targetPropertyForViewing}
          onClose={() => {
            setIsViewingModalOpen(false);
            setTargetPropertyForViewing(null);
          }}
        />
      )}

      {isEducationOpen && (
        <BuyerEducationModal
          onClose={() => setIsEducationOpen(false)}
          onOpenViewing={() => handleBookViewing(null)}
        />
      )}

      {isVaultOpen && (
        <DocumentVaultModal
          onClose={() => setIsVaultOpen(false)}
          onOpenViewing={() => handleBookViewing(null)}
        />
      )}

      {isAdminOpen && (
        <AdminDashboardModal onClose={() => setIsAdminOpen(false)} />
      )}

      {/* Ola AI Concierge Drawer */}
      {isChatOpen && (
        <AiAssistantDrawer
          onClose={() => setIsChatOpen(false)}
          onOpenViewing={() => handleBookViewing(null)}
          initialInquiry={activeContactInquiry}
          customerProfile={customerProfile}
          onCustomerRegistered={(customer) => setCustomerProfile(customer)}
          onOpenCustomerLoginPage={() => navigateTo('customer-login')}
        />
      )}

      {/* Floating Action Trigger for Ola AI */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setIsChatOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 border border-[#38bdf8]/40 cursor-pointer"
          aria-label="Open Ola AI Concierge"
        >
          <Sparkles className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
          <span className="font-semibold text-xs pr-1">Ask Ola AI</span>
        </button>
      </div>

      {/* Comprehensive Corporate Footer with Centralized Bottom Testimonials */}
      <Footer onNavigate={navigateTo} />
    </div>
  );
}
