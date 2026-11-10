import React from 'react';
import { ShieldCheck, Video, Compass, FileCheck, Truck, BookOpen, Lock, CheckCircle2, ArrowRight, HardHat, Ruler, Scale } from 'lucide-react';

interface VerificationSectionProps {
  onOpenEducation: () => void;
  onOpenVault: () => void;
  onOpenViewing: () => void;
}

export const VerificationSection: React.FC<VerificationSectionProps> = ({
  onOpenEducation,
  onOpenVault,
  onOpenViewing,
}) => {
  return (
    <section id="verification" className="py-20 bg-[#07132b] text-[#F0F6FF] border-t border-b border-[#1d4ed8]/30 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#38bdf8] mb-2 flex items-center gap-2">
            <span>DUE DILIGENCE & VERIFICATION INFRASTRUCTURE</span>
            <span aria-hidden="true" className="text-white/40">·</span>
            <span className="font-data text-xs text-[#93c5fd]">ZERO COMPROMISE STANDARDS</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            How Every Title & Building Site Is Protected Before You Commit.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#bfdbfe] leading-relaxed">
            Our 19-year engineering and field brokerage record across Ogbomoso and Lagos has established that genuine peace of mind comes from rigorous physical ground checks, government survey charting, structural soil assessment, and customary lineage audits—never informal assurances.
          </p>
        </div>

        {/* 4 Pillars Grid (including Construction Soil Testing) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Pillar 1 */}
          <div className="bg-[#0b1e42] p-6 sm:p-7 rounded-2xl border border-[#1d4ed8]/30 relative overflow-hidden group hover:border-[#38bdf8]/60 transition-all shadow-xl hover:shadow-[#1d4ed8]/20">
            <div className="w-12 h-12 rounded-xl bg-[#1d4ed8]/20 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] mb-5">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-2">
              1. Cadastral Survey Charting
            </h3>
            <p className="text-xs sm:text-sm text-[#bfdbfe]/80 leading-relaxed">
              Every parcel undergoes coordinate charting at the Oyo State Surveyor General’s Office (Agodi Secretariat, Ibadan). We confirm whether land is free from agricultural reservations, highway setbacks, or government acquisitions.
            </p>
            <div className="mt-4 pt-3 border-t border-[#1d4ed8]/20 text-xs text-[#4ade80] font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Concrete beacon pillars verified on site</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-[#0b1e42] p-6 sm:p-7 rounded-2xl border border-[#1d4ed8]/30 relative overflow-hidden group hover:border-[#38bdf8]/60 transition-all shadow-xl hover:shadow-[#1d4ed8]/20">
            <div className="w-12 h-12 rounded-xl bg-[#1d4ed8]/20 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-2">
              2. Root of Title & Lineage Audit
            </h3>
            <p className="text-xs sm:text-sm text-[#bfdbfe]/80 leading-relaxed">
              Customary land disputes stem from unverified family signatories. Engineer Samuel Aleji personally validates root family history with the recognized Baale and accredited principal elders before any contract is signed.
            </p>
            <div className="mt-4 pt-3 border-t border-[#1d4ed8]/20 text-xs text-[#4ade80] font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Multi-generational lineage clearance</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-[#0b1e42] p-6 sm:p-7 rounded-2xl border border-[#1d4ed8]/30 relative overflow-hidden group hover:border-[#38bdf8]/60 transition-all shadow-xl hover:shadow-[#1d4ed8]/20">
            <div className="w-12 h-12 rounded-xl bg-[#1d4ed8]/20 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] mb-5">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-2">
              3. Physical Ground & Drainage Audit
            </h3>
            <p className="text-xs sm:text-sm text-[#bfdbfe]/80 leading-relaxed">
              We reject waterlogged floodplains and marshlands unless explicitly intended for seasonal aquaculture. We test borehole water yield, electrical transformer proximity, and municipal road access.
            </p>
            <div className="mt-4 pt-3 border-t border-[#1d4ed8]/20 text-xs text-[#4ade80] font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Dry, build-ready topography</span>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="bg-[#0b1e42] p-6 sm:p-7 rounded-2xl border border-[#1d4ed8]/30 relative overflow-hidden group hover:border-[#38bdf8]/60 transition-all shadow-xl hover:shadow-[#1d4ed8]/20">
            <div className="w-12 h-12 rounded-xl bg-[#1d4ed8]/20 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] mb-5">
              <HardHat className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-2">
              4. Civil Structural Soil Testing
            </h3>
            <p className="text-xs sm:text-sm text-[#bfdbfe]/80 leading-relaxed">
              Backed by our Building & Civil Construction division, we assess safe soil bearing capacity (kN/m²) and water table depth, determining exact foundation engineering (raft, pad, or strip) before construction begins.
            </p>
            <div className="mt-4 pt-3 border-t border-[#1d4ed8]/20 text-xs text-[#4ade80] font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>BS 8110 engineering compliance</span>
            </div>
          </div>
        </div>

        {/* Diaspora Protocol & Remote Inspection Strip */}
        <div className="bg-[#0b1e42] rounded-3xl p-6 sm:p-10 border border-[#1d4ed8]/40 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-[#1d4ed8]/30">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#38bdf8] mb-1">
                FOR INTERNATIONAL & DIASPORA CLIENTS
              </div>
              <h3 className="font-display text-2xl font-bold text-white">
                Diaspora Remote Acquisition Protocol
              </h3>
              <p className="text-xs sm:text-sm text-[#bfdbfe] mt-1 max-w-2xl">
                Serving buyers in the United Kingdom, United States, Canada, Ireland, and Europe who require complete remote due diligence without trusting hearsay.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onOpenVault}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-[#1d4ed8]/40 hover:bg-[#1d4ed8]/60 border border-[#38bdf8]/30 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Document Vault</span>
              </button>
              <button
                onClick={onOpenEducation}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-[#2563eb]/30 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Read Due Diligence Guide</span>
              </button>
            </div>
          </div>

          {/* 4 Protocol Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-data text-xs font-bold text-[#38bdf8] px-2 py-0.5 bg-[#1d4ed8]/30 rounded">01</span>
                <span className="font-semibold text-xs text-white">Live 4K WhatsApp Walk</span>
              </div>
              <p className="text-xs text-[#bfdbfe]/80 leading-relaxed">
                Direct live video walkthrough showing neighboring buildings, access roads, and soil condition in real-time daylight.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-data text-xs font-bold text-[#38bdf8] px-2 py-0.5 bg-[#1d4ed8]/30 rounded">02</span>
                <span className="font-semibold text-xs text-white">Surveyor Beacon Verification</span>
              </div>
              <p className="text-xs text-[#bfdbfe]/80 leading-relaxed">
                Registered surveyor reads GPS total station coordinates right on camera matching the official charting lodgement.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-data text-xs font-bold text-[#38bdf8] px-2 py-0.5 bg-[#1d4ed8]/30 rounded">03</span>
                <span className="font-semibold text-xs text-white">Milestone Escrow Staging</span>
              </div>
              <p className="text-xs text-[#bfdbfe]/80 leading-relaxed">
                Funds are held securely and only disbursed upon complete execution of the Deed of Assignment and Baale signatures.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-data text-xs font-bold text-[#38bdf8] px-2 py-0.5 bg-[#1d4ed8]/30 rounded">04</span>
                <span className="font-semibold text-xs text-white">Insured International Courier</span>
              </div>
              <p className="text-xs text-[#bfdbfe]/80 leading-relaxed">
                Original stamped survey plans, registered deeds, and purchase receipts dispatched to your overseas address via DHL/FedEx.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
