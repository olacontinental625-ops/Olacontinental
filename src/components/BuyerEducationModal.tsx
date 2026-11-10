import React, { useState } from 'react';
import { X, BookOpen, Compass, ShieldCheck, TrendingUp, Layers, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

interface BuyerEducationModalProps {
  onClose: () => void;
  onOpenViewing: () => void;
}

export const BuyerEducationModal: React.FC<BuyerEducationModalProps> = ({
  onClose,
  onOpenViewing,
}) => {
  const [activeTab, setActiveTab] = useState<'land' | 'diaspora' | 'hostel' | 'corridors'>('land');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#071A2B] border border-[#1E486A] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1E486A]/50 bg-[#051421] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#C5A880]" />
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-[#FAF4E8]">
                Ola Continental Buyer Education Hub
              </h3>
              <p className="text-xs text-[#FAF4E8]/60">Transparent guides & due diligence rules established since 2006</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#FAF4E8]/60 hover:text-white rounded-lg hover:bg-[#0D2638]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#1E486A]/40 bg-[#051421]/60 px-6 gap-6 text-xs sm:text-sm font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('land')}
            className={`py-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'land' ? 'border-[#8B6347] text-[#F3E8D0] font-semibold' : 'border-transparent text-[#FAF4E8]/60 hover:text-white'
            }`}
          >
            Land Due Diligence in Oyo State
          </button>
          <button
            onClick={() => setActiveTab('diaspora')}
            className={`py-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'diaspora' ? 'border-[#8B6347] text-[#F3E8D0] font-semibold' : 'border-transparent text-[#FAF4E8]/60 hover:text-white'
            }`}
          >
            Diaspora Remote Buying Protocol
          </button>
          <button
            onClick={() => setActiveTab('hostel')}
            className={`py-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'hostel' ? 'border-[#8B6347] text-[#F3E8D0] font-semibold' : 'border-transparent text-[#FAF4E8]/60 hover:text-white'
            }`}
          >
            LAUTECH Student Hostel Cashflows
          </button>
          <button
            onClick={() => setActiveTab('corridors')}
            className={`py-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'corridors' ? 'border-[#8B6347] text-[#F3E8D0] font-semibold' : 'border-transparent text-[#FAF4E8]/60 hover:text-white'
            }`}
          >
            Soil, Drainage & Power Comparisons
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs sm:text-sm text-[#FAF4E8]/85 leading-relaxed">
          {activeTab === 'land' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold font-display text-[#FAF4E8]">
                How to Verify Real Estate in Ogbomoso & Oyo State
              </h4>
              <p>
                In Oyo State, securing genuine land requires moving beyond customary paper receipts. An unencumbered property must satisfy three verifiable steps:
              </p>

              <div className="space-y-3">
                <div className="p-4 bg-[#051421] rounded-xl border border-[#1E486A]/40">
                  <h5 className="font-semibold text-[#F3E8D0] mb-1 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#C5A880]" />
                    <span>Step 1: Ministry of Lands Cadastral Charting</span>
                  </h5>
                  <p className="text-xs text-[#FAF4E8]/75">
                    Every survey plan features beacon coordinate numbers (e.g., SG/OY/...). These numbers must be lodged at the Surveyor General’s Office at Agodi Secretariat, Ibadan, to confirm whether the plot is under government acquisition or committed agricultural reserve.
                  </p>
                </div>

                <div className="p-4 bg-[#051421] rounded-xl border border-[#1E486A]/40">
                  <h5 className="font-semibold text-[#F3E8D0] mb-1 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
                    <span>Step 2: Root of Title & Baale Traditional Consent</span>
                  </h5>
                  <p className="text-xs text-[#FAF4E8]/75">
                    Family land disputes happen when buyers transact with unauthorized siblings or distant relatives. Our firm verifies the principal family head (Baale / Mogaji) and ensures all key family branches sign the Deed of Assignment before any capital changes hands.
                  </p>
                </div>

                <div className="p-4 bg-[#051421] rounded-xl border border-[#1E486A]/40">
                  <h5 className="font-semibold text-[#F3E8D0] mb-1 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#C5A880]" />
                    <span>Step 3: Physical Beacon Pillar Inspection</span>
                  </h5>
                  <p className="text-xs text-[#FAF4E8]/75">
                    Never buy land based solely on a paper diagram. We insist on our Tuesday Field Day walkthrough where a total station GPS verifies that the physical concrete pegs on the ground match the coordinates stated on the survey plan.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'diaspora' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold font-display text-[#FAF4E8]">
                Safe Escrow & Inspection for Diaspora Buyers
              </h4>
              <p>
                Many Nigerians living in the diaspora have experienced disappointing outcomes trusting friends or informal agents. Ola Continental has resolved this since 2006 through our transparent remote escrow protocol:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-[#051421] rounded-xl border border-[#1E486A]/40">
                  <div className="font-data text-xs text-[#C5A880] mb-1 font-bold">PROTOCOL 01</div>
                  <h5 className="font-semibold text-white mb-1">Live 4K Interactive WhatsApp Video</h5>
                  <p className="text-xs text-[#FAF4E8]/70">
                    We walk the property live during daylight hours, recording access routes, power poles, neighboring houses, and slope topography in real-time.
                  </p>
                </div>

                <div className="p-4 bg-[#051421] rounded-xl border border-[#1E486A]/40">
                  <div className="font-data text-xs text-[#C5A880] mb-1 font-bold">PROTOCOL 02</div>
                  <h5 className="font-semibold text-white mb-1">Independent Surveyor Verification</h5>
                  <p className="text-xs text-[#FAF4E8]/70">
                    You may appoint your own independent surveyor or solicitor in Nigeria to cross-check beacon pegs and ministry registry records.
                  </p>
                </div>

                <div className="p-4 bg-[#051421] rounded-xl border border-[#1E486A]/40">
                  <div className="font-data text-xs text-[#C5A880] mb-1 font-bold">PROTOCOL 03</div>
                  <h5 className="font-semibold text-white mb-1">Staged Escrow Milestones</h5>
                  <p className="text-xs text-[#FAF4E8]/70">
                    Funds are disbursed strictly in verified phases: title validation, deed execution with family elders, and physical possession.
                  </p>
                </div>

                <div className="p-4 bg-[#051421] rounded-xl border border-[#1E486A]/40">
                  <div className="font-data text-xs text-[#C5A880] mb-1 font-bold">PROTOCOL 04</div>
                  <h5 className="font-semibold text-white mb-1">Insured International Courier</h5>
                  <p className="text-xs text-[#FAF4E8]/70">
                    All original documents, executed deeds, survey plans, and payment vouchers are couriered directly via DHL to your overseas residence.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hostel' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold font-display text-[#FAF4E8]">
                Student Hostel Economics in Adenike & Under G (LAUTECH)
              </h4>
              <p>
                Student accommodation around Ladoke Akintola University of Technology (LAUTECH) represents one of the highest cashflow property segments in southwestern Nigeria.
              </p>

              <div className="p-4 bg-[#051421] rounded-xl border border-[#1E486A]/40 space-y-2">
                <h5 className="font-semibold text-[#F3E8D0] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#25D366]" />
                  <span>Why Student Lodges Maintain 100% Annual Occupancy</span>
                </h5>
                <p className="text-xs text-[#FAF4E8]/75">
                  LAUTECH operates on an off-campus residency model where the overwhelming majority of students seek private housing in the Adenike and Under G corridors. Annual rents are collected upfront for the academic session, offering predictable cashflow.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-[#0D2638] rounded-lg border border-[#1E486A]/30">
                  <strong className="text-white block mb-1">1. Industrial Borehole</strong>
                  <span className="text-[#FAF4E8]/70">Reliable water supply is the #1 amenity students demand. Hostels with private industrial boreholes command premium rents.</span>
                </div>
                <div className="p-3 bg-[#0D2638] rounded-lg border border-[#1E486A]/30">
                  <strong className="text-white block mb-1">2. Prepaid Sub-Meters</strong>
                  <span className="text-[#FAF4E8]/70">Individual prepaid meters prevent utility disputes and keep operational overhead completely off the landlord.</span>
                </div>
                <div className="p-3 bg-[#0D2638] rounded-lg border border-[#1E486A]/30">
                  <strong className="text-white block mb-1">3. Security Razor Wire</strong>
                  <span className="text-[#FAF4E8]/70">High perimeter walls with guard lodges ensure safety and parental preference during hostel selection.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'corridors' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold font-display text-[#FAF4E8]">
                Soil, Elevation, & Power Grid Comparisons Across Corridors
              </h4>

              <div className="space-y-3">
                <div className="p-3.5 bg-[#051421] rounded-xl border border-[#1E486A]/40">
                  <h5 className="font-semibold text-[#F3E8D0]">Behind LAUTECH Hospital (Olukoko Axis)</h5>
                  <p className="text-xs text-[#FAF4E8]/70 mt-1">
                    Upland firm soil with virtually zero flood risk. Connected to the hospital priority electricity band. Best suited for executive duplexes and medical consultants.
                  </p>
                </div>

                <div className="p-3.5 bg-[#051421] rounded-xl border border-[#1E486A]/40">
                  <h5 className="font-semibold text-[#F3E8D0]">Adenike & Under G</h5>
                  <p className="text-xs text-[#FAF4E8]/70 mt-1">
                    High commercial activity and rapid land value appreciation. Sandy-clay soil requires standard strip footings. Ideal for student hostels and commercial rental flats.
                  </p>
                </div>

                <div className="p-3.5 bg-[#051421] rounded-xl border border-[#1E486A]/40">
                  <h5 className="font-semibold text-[#F3E8D0]">Odo-Oba Farm Belt</h5>
                  <p className="text-xs text-[#FAF4E8]/70 mt-1">
                    Rich loamy alluvium along perennial natural stream courses. Ideal for commercial agriculture, vegetable cultivation, and agro-allied ventures without dry-season water stress.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#1E486A]/50 bg-[#051421] flex items-center justify-between">
          <span className="text-xs text-[#FAF4E8]/60">Have a specific legal inquiry?</span>
          <button
            onClick={() => {
              onClose();
              onOpenViewing();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#8B6347] hover:bg-[#9E7353] rounded-lg transition-colors cursor-pointer"
          >
            Schedule On-Site Inspection
          </button>
        </div>
      </div>
    </div>
  );
};
