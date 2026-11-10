import React, { useState } from 'react';
import { Property } from '../types';
import { X, MapPin, Bed, Bath, Layers, CheckCircle2, AlertCircle, Phone, MessageSquare, Calendar, Building2, ShieldCheck, Scale, FileText, CheckSquare, Square } from 'lucide-react';

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
  onBookViewing: (property: Property) => void;
  isCompared: boolean;
  onToggleCompare: (property: Property) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onBookViewing,
  isCompared,
  onToggleCompare,
}) => {
  const [activeImage, setActiveImage] = useState<string>(property.featuredImage);
  const [activeTab, setActiveTab] = useState<'overview' | 'survey' | 'fees'>('overview');

  const whatsappMessage = encodeURIComponent(
    `Hello Engineer Samuel Aleji, I am interested in inspecting "${property.title}" located at ${property.corridor}. Please share current availability, pricing, and coordinate beacon details.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#071A2B] border border-[#1E486A] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E486A]/50 bg-[#051421]">
          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#C5A880]">
              {property.corridor}
            </div>
            <span className="text-[#FAF4E8]/40" aria-hidden="true">·</span>
            <div className="text-xs font-medium text-[#FAF4E8]/70">
              {property.purpose} ({property.type})
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleCompare(property)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isCompared
                  ? 'bg-[#8B6347] border-[#8B6347] text-white'
                  : 'bg-[#0D2638] border-[#1E486A] text-[#FAF4E8]/80 hover:text-white'
              }`}
            >
              {isCompared ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
              <span>{isCompared ? 'In Compare List' : 'Add to Compare'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#FAF4E8]/70 hover:text-white hover:bg-[#0D2638] rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Main Visual Showcase */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-[#0D2638] border border-[#1E486A]/40">
              <img
                src={activeImage}
                alt={property.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between bg-black/60 backdrop-blur-md p-3 rounded-lg border border-white/10">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#C5A880] block">Valuation</span>
                  <span className="font-display text-lg sm:text-xl font-bold text-[#F3E8D0]">Available on Request</span>
                </div>
                <div className="text-right text-xs text-[#FAF4E8]/80">
                  <span>Land Size: <strong className="font-data text-white">{property.landSize}</strong></span>
                </div>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {property.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      activeImage === img ? 'border-[#C5A880] scale-95' : 'border-[#1E486A]/50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Key Coordinates */}
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#FAF4E8]">
              {property.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#FAF4E8]/80">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>{property.address}</span>
              </div>
              <span className="text-[#FAF4E8]/30" aria-hidden="true">·</span>
              <div className="font-data text-[#C5A880]">
                Beacon ID: {property.beaconCoordinates}
              </div>
            </div>
          </div>

          {/* Quick Specs Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#051421] rounded-xl border border-[#1E486A]/40 text-center text-xs">
            {property.bedrooms && (
              <div>
                <span className="text-[#FAF4E8]/50 block">Bedrooms</span>
                <span className="font-data text-base font-bold text-[#F3E8D0]">{property.bedrooms} Ensuite</span>
              </div>
            )}
            {property.units && (
              <div>
                <span className="text-[#FAF4E8]/50 block">Tenancy Units</span>
                <span className="font-data text-base font-bold text-[#F3E8D0]">{property.units} Self-Contained</span>
              </div>
            )}
            <div>
              <span className="text-[#FAF4E8]/50 block">Land Area</span>
              <span className="font-data text-base font-bold text-[#F3E8D0]">{property.landSize}</span>
            </div>
            <div>
              <span className="text-[#FAF4E8]/50 block">Title Status</span>
              <span className="font-data text-xs font-semibold text-[#25D366] truncate block">{property.titleType}</span>
            </div>
            <div>
              <span className="text-[#FAF4E8]/50 block">Field Inspection</span>
              <span className="text-xs font-medium text-[#C5A880] block">Tuesdays & Scheduled</span>
            </div>
          </div>

          {/* Modal Tab Navigation */}
          <div className="flex border-b border-[#1E486A]/50 gap-6 text-sm font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 transition-colors cursor-pointer ${
                activeTab === 'overview' ? 'text-[#F3E8D0] border-b-2 border-[#8B6347]' : 'text-[#FAF4E8]/60 hover:text-white'
              }`}
            >
              Description & Features
            </button>
            <button
              onClick={() => setActiveTab('survey')}
              className={`pb-2.5 transition-colors cursor-pointer ${
                activeTab === 'survey' ? 'text-[#F3E8D0] border-b-2 border-[#8B6347]' : 'text-[#FAF4E8]/60 hover:text-white'
              }`}
            >
              Due Diligence & Title Audit
            </button>
            <button
              onClick={() => setActiveTab('fees')}
              className={`pb-2.5 transition-colors cursor-pointer ${
                activeTab === 'fees' ? 'text-[#F3E8D0] border-b-2 border-[#8B6347]' : 'text-[#FAF4E8]/60 hover:text-white'
              }`}
            >
              Transparent Fee Schedule
            </button>
          </div>

          {/* Tab 1: Overview & Features */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-[#FAF4E8] mb-2">Property Overview</h4>
                <p className="text-xs sm:text-sm text-[#FAF4E8]/80 leading-relaxed">
                  {property.fullDescription}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-[#FAF4E8] mb-2.5">Key Infrastructure & Amenities</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {property.amenities.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#FAF4E8]/90 p-2 bg-[#051421]/60 rounded-lg border border-[#1E486A]/30">
                      <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {property.suitableFor && (
                <div>
                  <h4 className="text-sm font-semibold text-[#FAF4E8] mb-2">Ideal Client Suitability</h4>
                  <ul className="list-disc list-inside text-xs text-[#FAF4E8]/80 space-y-1">
                    {property.suitableFor.map((sub, idx) => (
                      <li key={idx}>{sub}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Due Diligence & Survey Charting */}
          {activeTab === 'survey' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#051421] rounded-xl border border-[#1E486A]/50">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#C5A880] mb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Ola Continental 3-Tier Verification Report</span>
                </div>
                <div className="space-y-2.5 text-xs text-[#FAF4E8]/85">
                  {property.dueDiligenceNotes.map((note, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-[#25D366] font-bold">✓</span>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-[#0D2638] rounded-xl border border-[#1E486A]/40 text-xs space-y-2">
                <h5 className="font-semibold text-[#FAF4E8] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#C5A880]" />
                  <span>Cadastral Coordinate Details</span>
                </h5>
                <p className="text-[#FAF4E8]/75">
                  Official Record: <code className="text-[#C5A880] font-data bg-[#051421] px-1.5 py-0.5 rounded">{property.beaconCoordinates}</code>
                </p>
                <p className="text-[#FAF4E8]/75">
                  Title Instrument: <span className="font-semibold text-white">{property.titleType}</span>
                </p>
                <p className="text-[11px] text-[#FAF4E8]/60 italic">
                  Note: All survey plans can be independently validated at the Oyo State Surveyor General’s Office (Agodi Secretariat, Ibadan) using these beacon numbers prior to any fund commitment.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Transparent Fee Schedule (Prices Removed) */}
          {activeTab === 'fees' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#051421] rounded-xl border border-[#1E486A]/40 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-[#1E486A]/30">
                  <span className="text-[#FAF4E8]/80">Property Acquisition Valuation</span>
                  <span className="font-semibold text-[#38bdf8]">Available on Formal Request</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-[#1E486A]/30">
                  <div>
                    <span className="text-[#FAF4E8]/80 block">Legal & Deed of Assignment Preparation</span>
                    <span className="text-[10px] text-[#FAF4E8]/50">Bar Solicitor draft, title search & execution</span>
                  </div>
                  <span className="font-semibold text-[#FAF4E8]">5% of Agreed Value</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-[#1E486A]/30">
                  <div>
                    <span className="text-[#FAF4E8]/80 block">Agency Brokerage Representation</span>
                    <span className="text-[10px] text-[#FAF4E8]/50">Ola Continental broker fee & closing negotiation</span>
                  </div>
                  <span className="font-semibold text-[#FAF4E8]">5% of Agreed Value</span>
                </div>
                {property.cadastralChartingEstimated > 0 && (
                  <div className="flex justify-between items-center pb-2 border-b border-[#1E486A]/30">
                    <div>
                      <span className="text-[#FAF4E8]/80 block">Survey Charting & Government Registry Search</span>
                      <span className="text-[10px] text-[#FAF4E8]/50">Official Oyo State Surveyor General search fee</span>
                    </div>
                    <span className="font-semibold text-[#FAF4E8]">Official Ministry Cost</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 font-semibold text-sm text-[#F3E8D0]">
                  <span>Total Outlay Structure</span>
                  <span className="text-xs text-[#25D366]">Zero Hidden Charges</span>
                </div>
              </div>

              <div className="p-3 bg-[#0D2638] rounded-lg border border-[#1E486A]/30 text-[11px] text-[#FAF4E8]/70">
                <strong>Zero Hidden Charges Policy:</strong> We do not levy arbitrary inspection registration fees. Physical Tuesday inspections in Ogbomoso are organized with complete transparency.
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-4 sm:p-5 bg-[#051421] border-t border-[#1E486A]/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/2348033848107?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#25D366] hover:bg-[#20ba59] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Inquiry</span>
            </a>

            <a
              href="tel:+2348033848107"
              className="px-3.5 py-2 text-xs font-medium text-[#FAF4E8] bg-[#0D2638] hover:bg-[#112E43] border border-[#1E486A] rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="hidden sm:inline">Call Agent (0803 384 8107)</span>
            </a>
          </div>

          <button
            onClick={() => {
              onClose();
              onBookViewing(property);
            }}
            className="px-5 py-2.5 text-xs font-semibold tracking-wide uppercase text-white bg-[#8B6347] hover:bg-[#9E7353] rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule Site Inspection</span>
          </button>
        </div>
      </div>
    </div>
  );
};
