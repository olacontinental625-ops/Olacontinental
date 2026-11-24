import React, { useState } from 'react';
import { Menu, X, Phone, Sparkles, UserCheck, Lock } from 'lucide-react';
import { PageType, CustomerProfile } from '../types';
import { OlaLogoMark } from './OlaLogoMark';

interface NavbarProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  onOpenViewing: () => void;
  onOpenMatcher: () => void;
  onOpenChat: () => void;
  onOpenEducation: () => void;
  onOpenVault: () => void;
  customerProfile: CustomerProfile | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenViewing,
  onOpenMatcher,
  onOpenChat,
  customerProfile,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { label: string; page: PageType }[] = [
    { label: 'About Us', page: 'about' },
    { label: 'Properties', page: 'properties' },
    { label: 'Corridors', page: 'corridors' },
    { label: 'Constructions', page: 'constructions' },
    { label: 'Blogs', page: 'blogs' },
  ];

  const isHome = currentPage === 'home';
  const isLoginActive = currentPage === 'customer-login' || currentPage === 'admin-login';

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
      isHome
        ? 'bg-[#181a20]/95 border-slate-700/60 text-slate-100'
        : 'bg-[#07132b]/95 border-[#1d4ed8]/30 text-[#F0F6FF]'
    }`}>
      {/* 3-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark with Logo Crest */}
        <button
          onClick={() => {
            onNavigate('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-left group cursor-pointer focus:outline-none shrink-0"
          aria-label="Ola Continental Properties & Associate Home"
        >
          <OlaLogoMark variant="navbar" />
        </button>

        {/* Zone 2: Navigation Links with active page state */}
        <nav className="hidden lg:flex items-center gap-4 text-[13px] font-medium">
          <button
            onClick={() => {
              onNavigate('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`py-1.5 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              currentPage === 'home'
                ? 'text-[#38bdf8] border-[#38bdf8] font-semibold'
                : 'text-slate-300 hover:text-white border-transparent'
            }`}
          >
            Home
          </button>

          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => {
                  onNavigate(item.page);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`py-1.5 transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'text-[#38bdf8] border-[#38bdf8] font-semibold'
                    : isHome
                      ? 'text-slate-300 hover:text-white border-transparent'
                      : 'text-[#bfdbfe] hover:text-white border-transparent'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <button
            onClick={() => {
              onNavigate('customer-login');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`py-1.5 transition-colors cursor-pointer border-b-2 whitespace-nowrap inline-flex items-center gap-1 ${
              isLoginActive
                ? 'text-[#F5C451] border-[#F5C451] font-semibold'
                : isHome
                  ? 'text-slate-300 hover:text-white border-transparent'
                  : 'text-[#bfdbfe] hover:text-white border-transparent'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-[#F5C451]" />
            <span>{customerProfile ? customerProfile.fullName.split(' ')[0] : 'Sign Up / Login'}</span>
          </button>
        </nav>

        {/* Zone 3: Quick AI & 1 Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenChat}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              isHome
                ? 'text-slate-200 bg-[#222630] border border-slate-700 hover:bg-[#2b303d] hover:border-[#38bdf8]/50'
                : 'text-white bg-[#0b1e42] border border-[#1d4ed8]/40 hover:bg-[#1d4ed8]/30 hover:border-[#38bdf8]/60'
            }`}
            title="Ask Ola AI Concierge"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Ola AI</span>
          </button>

          <button
            onClick={onOpenViewing}
            className="px-3.5 py-2 text-xs font-semibold tracking-wide uppercase text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-lg transition-all shadow-md shadow-[#2563eb]/20 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Schedule Viewing
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white hover:text-[#38bdf8] focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className={`lg:hidden border-b px-4 pt-3 pb-6 space-y-4 ${
          isHome ? 'bg-[#181a20] border-slate-700/60' : 'bg-[#07132b] border-[#1d4ed8]/30'
        }`}>
          <div className="flex flex-col space-y-1.5 text-sm font-medium">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`text-left px-3 py-2.5 rounded-lg transition-colors ${
                currentPage === 'home'
                  ? 'bg-white/10 text-[#38bdf8] font-semibold border-l-2 border-[#38bdf8]'
                  : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              Home (Architectural Overview)
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`text-left px-3 py-2.5 rounded-lg transition-colors ${
                currentPage === 'about'
                  ? 'bg-[#1d4ed8]/20 text-[#38bdf8] font-semibold border-l-2 border-[#38bdf8]'
                  : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              About Us · Engineer Samuel Aleji &amp; Story (Since 2006)
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('properties');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`text-left px-3 py-2.5 rounded-lg transition-colors ${
                currentPage === 'properties'
                  ? 'bg-[#1d4ed8]/20 text-[#38bdf8] font-semibold border-l-2 border-[#38bdf8]'
                  : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              Verified Properties Repository
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('corridors');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`text-left px-3 py-2.5 rounded-lg transition-colors ${
                currentPage === 'corridors'
                  ? 'bg-[#1d4ed8]/20 text-[#38bdf8] font-semibold border-l-2 border-[#38bdf8]'
                  : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              Operating Corridors (Ogbomoso &amp; Mushin Lagos)
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('constructions');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`text-left px-3 py-2.5 rounded-lg transition-colors ${
                currentPage === 'constructions'
                  ? 'bg-[#1d4ed8]/20 text-[#38bdf8] font-semibold'
                  : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              Constructions (Ongoing &amp; Finished)
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('blogs');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`text-left px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between ${
                currentPage === 'blogs'
                  ? 'bg-[#1d4ed8]/20 text-[#38bdf8] font-semibold border-l-2 border-[#38bdf8]'
                  : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>Blogs</span>
              <span className="text-[10px] font-mono text-[#38bdf8] bg-[#1d4ed8]/20 px-1.5 py-0.5 rounded">Articles</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('customer-login');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`text-left px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between ${
                currentPage === 'customer-login'
                  ? 'bg-[#1d4ed8]/20 text-[#F5C451] font-semibold border-l-2 border-[#F5C451]'
                  : 'text-[#F5C451] hover:bg-white/5'
              }`}
            >
              <span>Customer Sign Up / Login</span>
              <UserCheck className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('admin-login');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`text-left px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between ${
                currentPage === 'admin-login'
                  ? 'bg-[#1d4ed8]/20 text-[#38bdf8] font-semibold border-l-2 border-[#38bdf8]'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <span>Owner Admin Login</span>
              <Lock className="w-4 h-4 text-[#38bdf8]" />
            </button>
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenMatcher();
              }}
              className="w-full py-2.5 px-4 text-xs font-semibold text-center text-white bg-[#0b1e42] border border-[#1d4ed8]/40 rounded-lg"
            >
              Open 7-Step Property Matcher
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenChat();
              }}
              className="w-full py-2.5 px-4 text-xs font-semibold text-center text-white bg-[#2563eb] rounded-lg"
            >
              Talk with Ola AI Concierge
            </button>
            <a
              href="https://wa.me/2348033848107?text=Hello%20Engineer%20Samuel%20Aleji,%20I%20am%20inquiring%20about%20Ola%20Continental%20Properties"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 text-xs font-semibold text-center text-[#4ade80] bg-[#07132b] border border-[#4ade80]/30 rounded-lg flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Direct WhatsApp: 0803 384 8107</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
