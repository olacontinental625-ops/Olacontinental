import React from 'react';
import { MapPin, Phone, ShieldCheck, Mail, Clock, Lock, ArrowRight, HardHat } from 'lucide-react';
import { PageType } from '../types';

interface FooterProps {
  onNavigate: (page: PageType) => void;
  onOpenEducation: () => void;
  onOpenVault: () => void;
  onOpenAdmin: () => void;
  onOpenViewing: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenEducation,
  onOpenVault,
  onOpenAdmin,
  onOpenViewing,
}) => {
  return (
    <footer className="bg-[#040b19] text-[#F0F6FF] border-t border-[#1d4ed8]/30 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#1d4ed8]/20 text-xs">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-display text-xl font-bold text-white">
              Ola Continental Properties & Construction
            </h3>
            <p className="text-[#bfdbfe]/80 leading-relaxed pr-4">
              Real estate brokerage, turnkey building & civil construction, student hostel development, and farmland acquisitions across Ogbomoso and Lagos corridors since 2006. Grounded in verifiable titles, cadastral survey charting, and BS 8110 engineering codes.
            </p>

            <div className="pt-1 space-y-1.5 text-[#38bdf8]">
              <div><strong>Registration:</strong> CAC BN: 3189204</div>
              <div><strong>Principal Consultant & Civil Engineer:</strong> Engineer Samuel Aleji</div>
              <div><strong>Plus Code:</strong> 47X3+F5 Ogbomoso, Nigeria</div>
            </div>
          </div>

          {/* Location & Landmark */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-[#93c5fd] uppercase tracking-wider">
              Headquarters Landmark
            </h4>
            <div className="flex items-start gap-2 text-[#bfdbfe]/90 leading-relaxed">
              <MapPin className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
              <span>
                No. 2, Olukoko Street,<br />
                Behind LAUTECH Teaching Hospital,<br />
                Ogbomoso, Oyo State, Nigeria
              </span>
            </div>
            <div className="pt-2 text-[11px] text-[#bfdbfe]/60">
              Active engineering projects & properties in Ogbomoso corridors (Adenike, Under-G, Aroje) and Mushin Commercial District, Lagos.
            </div>
          </div>

          {/* Hours & Inspection Protocol */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-[#93c5fd] uppercase tracking-wider">
              Field, Site & Office Hours
            </h4>
            <div className="space-y-2 text-[#bfdbfe]/90">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Monday – Saturday</span>
                  <span>8:00 AM – 6:00 PM</span>
                </div>
              </div>
              <div className="p-2.5 bg-[#0b1e42] rounded-lg border border-[#1d4ed8]/30 text-[11px]">
                <strong className="text-[#38bdf8]">Tuesday:</strong> Dedicated On-Site Field Inspection & Structural Progress Day.
              </div>
              <div className="text-[11px] text-[#bfdbfe]/60">
                Sunday: By appointment for diaspora live 4K video consultations.
              </div>
            </div>
          </div>

          {/* Portals & Navigation */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-[#93c5fd] uppercase tracking-wider">
              Direct Pages
            </h4>
            <div className="flex flex-col gap-2 text-[#bfdbfe]/80">
              <button
                onClick={() => {
                  onNavigate('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left hover:text-[#38bdf8] transition-colors cursor-pointer"
              >
                Homepage (Grey Architecture)
              </button>
              <button
                onClick={() => {
                  onNavigate('about');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left hover:text-[#38bdf8] transition-colors cursor-pointer"
              >
                About Engineer Samuel Aleji (19-Year Story)
              </button>
              <button
                onClick={() => {
                  onNavigate('properties');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left hover:text-[#38bdf8] transition-colors cursor-pointer"
              >
                Verified Properties Repository
              </button>
              <button
                onClick={() => {
                  onNavigate('contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left hover:text-[#38bdf8] transition-colors cursor-pointer text-white font-medium flex items-center gap-1"
              >
                <span>Building & Civil Construction / Contact</span>
                <ArrowRight className="w-3 h-3 text-[#38bdf8]" />
              </button>
              <button
                onClick={() => {
                  onNavigate('corridors');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left hover:text-[#38bdf8] transition-colors cursor-pointer"
              >
                Operating Corridors
              </button>
              <button
                onClick={() => {
                  onNavigate('verification');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left hover:text-[#38bdf8] transition-colors cursor-pointer"
              >
                Due Diligence & Soil Verification
              </button>
              <button
                onClick={() => {
                  onNavigate('testimonials');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left hover:text-[#38bdf8] transition-colors cursor-pointer"
              >
                Client Testimonials & Field Reviews
              </button>
            </div>
          </div>

          {/* Direct Hotlines & Regulatory Portals */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-[#93c5fd] uppercase tracking-wider">
              Direct Desk
            </h4>
            <div className="space-y-2 text-[#bfdbfe]/90">
              <a
                href="tel:+2348033848107"
                className="flex items-center gap-2 hover:text-[#38bdf8] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#4ade80]" />
                <span className="font-data font-semibold text-white">+234 803 384 8107</span>
              </a>
              <a
                href="https://wa.me/2348033848107"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#4ade80] hover:underline"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp: 0803 384 8107</span>
              </a>

              <div className="pt-3 flex flex-col gap-1.5 text-[11px]">
                <button
                  onClick={onOpenEducation}
                  className="text-left text-[#bfdbfe]/70 hover:text-white transition-colors cursor-pointer"
                >
                  Buyer Due Diligence Guides
                </button>
                <button
                  onClick={onOpenVault}
                  className="text-left text-[#bfdbfe]/70 hover:text-white transition-colors cursor-pointer"
                >
                  Client Document Vault (Sample Titles)
                </button>
                <button
                  onClick={onOpenAdmin}
                  className="text-left text-[#38bdf8]/90 hover:text-[#38bdf8] transition-colors flex items-center gap-1 cursor-pointer pt-1"
                >
                  <Lock className="w-3 h-3" />
                  <span>Broker Management Portal</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Zero-Pill Copyright Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#bfdbfe]/60">
          <div>
            © 2006 – {new Date().getFullYear()} Ola Continental Properties & Construction Associates. All rights reserved. CAC BN: 3189204.
          </div>
          <div className="flex items-center gap-4">
            <span>Civil Engineering</span>
            <span aria-hidden="true" className="text-white/30">·</span>
            <span>Cadastral Survey Charted</span>
            <span aria-hidden="true" className="text-white/30">·</span>
            <span>Turnkey Construction</span>
            <span aria-hidden="true" className="text-white/30">·</span>
            <span>Zero Speculative Guarantees</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
