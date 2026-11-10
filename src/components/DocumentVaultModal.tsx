import React, { useState } from 'react';
import { X, Lock, FileText, CheckCircle2, Download, ShieldCheck, Eye, Compass } from 'lucide-react';

interface DocumentVaultModalProps {
  onClose: () => void;
  onOpenViewing: () => void;
}

export const DocumentVaultModal: React.FC<DocumentVaultModalProps> = ({
  onClose,
  onOpenViewing,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<'survey' | 'deed' | 'charting' | 'checklist'>('survey');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#071A2B] border border-[#1E486A] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1E486A]/50 bg-[#051421] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-[#C5A880]" />
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-[#FAF4E8]">
                Ola Continental Client Document Vault
              </h3>
              <p className="text-xs text-[#FAF4E8]/60">Verified Document Templates & Inspection Records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#FAF4E8]/60 hover:text-white rounded-lg hover:bg-[#0D2638]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Layout Split: Sidebar Docs List + Preview Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="p-4 bg-[#051421] border-r border-[#1E486A]/40 space-y-2 overflow-y-auto">
            <div className="text-[10px] uppercase font-semibold text-[#C5A880] tracking-wider mb-2">
              Verified Legal Instruments
            </div>

            <button
              onClick={() => setSelectedDoc('survey')}
              className={`w-full p-3 rounded-xl text-left border transition-all cursor-pointer ${
                selectedDoc === 'survey'
                  ? 'bg-[#0D2638] border-[#C5A880] text-white'
                  : 'bg-[#071A2B] border-[#1E486A]/40 text-[#FAF4E8]/70 hover:border-[#1E486A]'
              }`}
            >
              <div className="text-xs font-semibold">Registered Cadastral Survey Plan</div>
              <div className="text-[11px] text-[#FAF4E8]/50 mt-0.5">Beacon SG/OY/2023/1104</div>
            </button>

            <button
              onClick={() => setSelectedDoc('deed')}
              className={`w-full p-3 rounded-xl text-left border transition-all cursor-pointer ${
                selectedDoc === 'deed'
                  ? 'bg-[#0D2638] border-[#C5A880] text-white'
                  : 'bg-[#071A2B] border-[#1E486A]/40 text-[#FAF4E8]/70 hover:border-[#1E486A]'
              }`}
            >
              <div className="text-xs font-semibold">Executed Deed of Assignment</div>
              <div className="text-[11px] text-[#FAF4E8]/50 mt-0.5">Baale & Principal Signatories</div>
            </button>

            <button
              onClick={() => setSelectedDoc('charting')}
              className={`w-full p-3 rounded-xl text-left border transition-all cursor-pointer ${
                selectedDoc === 'charting'
                  ? 'bg-[#0D2638] border-[#C5A880] text-white'
                  : 'bg-[#071A2B] border-[#1E486A]/40 text-[#FAF4E8]/70 hover:border-[#1E486A]'
              }`}
            >
              <div className="text-xs font-semibold">Ministry Charting Clearance</div>
              <div className="text-[11px] text-[#FAF4E8]/50 mt-0.5">Surveyor General Oyo State</div>
            </button>

            <button
              onClick={() => setSelectedDoc('checklist')}
              className={`w-full p-3 rounded-xl text-left border transition-all cursor-pointer ${
                selectedDoc === 'checklist'
                  ? 'bg-[#0D2638] border-[#C5A880] text-white'
                  : 'bg-[#071A2B] border-[#1E486A]/40 text-[#FAF4E8]/70 hover:border-[#1E486A]'
              }`}
            >
              <div className="text-xs font-semibold">10-Point Ground Checklist</div>
              <div className="text-[11px] text-[#FAF4E8]/50 mt-0.5">Physical Inspection Protocol</div>
            </button>
          </div>

          {/* Preview Panel */}
          <div className="col-span-2 p-6 overflow-y-auto bg-[#071A2B] space-y-4">
            {selectedDoc === 'survey' && (
              <div className="space-y-4">
                <div className="p-4 bg-[#051421] rounded-xl border border-[#1E486A] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-data text-xs text-[#C5A880] font-bold">PLAN NO: SC/OY/2023/1104</span>
                    <span className="text-[11px] text-[#25D366] font-medium">Lodged & Charted</span>
                  </div>
                  <h4 className="font-display text-lg font-bold text-[#FAF4E8]">
                    Survey Plan Specimen: Olukoko Hospital Corridor
                  </h4>
                  <p className="text-xs text-[#FAF4E8]/75 leading-relaxed">
                    Shows 4 concrete boundary beacons (P1, P2, P3, P4) coordinated to Nigerian Transverse Mercator (NTM) projection. Includes certified surveyor stamp, lodgement date, and official red line setback.
                  </p>
                </div>

                <div className="p-4 bg-[#0D2638] rounded-xl border border-[#1E486A]/40 text-xs font-data space-y-1.5 text-[#FAF4E8]/80">
                  <div className="text-[#C5A880] font-semibold">Beacon Coordinates Extract:</div>
                  <div>P1: Lat 8.14081° N, Lon 4.25362° E (Elevation 312m)</div>
                  <div>P2: Lat 8.14098° N, Lon 4.25390° E (Elevation 312m)</div>
                  <div>P3: Lat 8.14065° N, Lon 4.25412° E (Elevation 311m)</div>
                  <div>P4: Lat 8.14048° N, Lon 4.25384° E (Elevation 311m)</div>
                  <div className="pt-2 text-[11px] text-[#FAF4E8]/60 font-sans">
                    ✓ Verified free of stream buffer encroachments or federal road widening reservations.
                  </div>
                </div>
              </div>
            )}

            {selectedDoc === 'deed' && (
              <div className="space-y-4">
                <div className="p-4 bg-[#051421] rounded-xl border border-[#1E486A] space-y-2">
                  <h4 className="font-display text-lg font-bold text-[#FAF4E8]">
                    Specimen Deed of Assignment
                  </h4>
                  <p className="text-xs text-[#FAF4E8]/75 leading-relaxed">
                    Prepared under Nigerian Real Property Conveyancing Law by our retained Nigerian Bar Association (NBA) Solicitor. Outlines recitals of root title, indemnification against third-party challenges, and execution in the presence of traditional elders.
                  </p>
                </div>

                <div className="p-4 bg-[#0D2638] rounded-xl border border-[#1E486A]/40 text-xs space-y-2 text-[#FAF4E8]/80">
                  <div className="font-semibold text-[#F3E8D0]">Critical Clauses Included in Every Deed:</div>
                  <ul className="list-disc list-inside space-y-1 text-xs text-[#FAF4E8]/75">
                    <li>Indemnity against any customary family claims or sibling contestations</li>
                    <li>Full surrender of unencumbered possession and original survey tracing</li>
                    <li>Attestation by the ruling family head and secretary with community seal</li>
                    <li>Solicitor’s Stamp and Seal under Supreme Court of Nigeria roll</li>
                  </ul>
                </div>
              </div>
            )}

            {selectedDoc === 'charting' && (
              <div className="space-y-4">
                <div className="p-4 bg-[#051421] rounded-xl border border-[#1E486A] space-y-2">
                  <h4 className="font-display text-lg font-bold text-[#FAF4E8]">
                    Surveyor General Charting Certificate
                  </h4>
                  <p className="text-xs text-[#FAF4E8]/75 leading-relaxed">
                    Official search record conducted at the Lands Bureau and Survey Department, Ibadan, confirming that the land coordinate polygon does not intersect government agricultural acquisitions or institutional allocations.
                  </p>
                </div>

                <div className="p-4 bg-[#0D2638] rounded-xl border border-[#1E486A]/40 text-xs space-y-1 text-[#25D366]">
                  <div className="font-semibold text-white">Status: Uncommitted / Non-Acquired</div>
                  <div>Certified clear for Governor’s Consent / Certificate of Occupancy application.</div>
                </div>
              </div>
            )}

            {selectedDoc === 'checklist' && (
              <div className="space-y-4">
                <div className="p-4 bg-[#051421] rounded-xl border border-[#1E486A] space-y-2">
                  <h4 className="font-display text-lg font-bold text-[#FAF4E8]">
                    Ola Continental 10-Point Ground Checklist
                  </h4>
                  <p className="text-xs text-[#FAF4E8]/75 leading-relaxed">
                    Standard protocol applied on every physical Tuesday inspection:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    '1. Verify all 4 corner beacon pillars in concrete',
                    '2. Measure plot perimeter with steel tape & GNSS',
                    '3. Audit slope & rain runoff patterns',
                    '4. Probe aquifer depth for borehole drilling',
                    '5. Check proximity to PHCN transformer feeder',
                    '6. Inspect motorable road width (minimum 30ft)',
                    '7. Verify absence of burial shrines or graves',
                    '8. Interview adjoining property owners',
                    '9. Inspect building permit setback from road',
                    '10. Cross-reference survey lodgement stamp'
                  ].map((item, i) => (
                    <div key={i} className="p-2 bg-[#051421] rounded-lg border border-[#1E486A]/30 text-[#FAF4E8]/80 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1E486A]/50 bg-[#051421] flex items-center justify-between">
          <span className="text-xs text-[#FAF4E8]/60">Physical inspection copies available at Olukoko Street office</span>
          <button
            onClick={() => {
              onClose();
              onOpenViewing();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#8B6347] hover:bg-[#9E7353] rounded-lg transition-colors cursor-pointer"
          >
            Request Inspection of Specific Survey
          </button>
        </div>
      </div>
    </div>
  );
};
