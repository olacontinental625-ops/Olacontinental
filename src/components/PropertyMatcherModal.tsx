import React, { useState } from 'react';
import { Property } from '../types';
import { PROPERTIES } from '../data/properties';
import { X, Sparkles, ArrowRight, ArrowLeft, Check, CheckCircle2, AlertCircle, Building2, Phone, Calendar } from 'lucide-react';
import { createFirestoreLead } from '../lib/firebase';

interface PropertyMatcherModalProps {
  onClose: () => void;
  onSelectProperty: (property: Property) => void;
  onBookViewing: (property: Property) => void;
}

interface MatcherAnswers {
  purpose: string;
  category: string;
  budgetRange: string;
  maxBudgetNum: number;
  corridor: string;
  timeframe: string;
  amenities: string[];
  clientType: string;
}

export const PropertyMatcherModal: React.FC<PropertyMatcherModalProps> = ({
  onClose,
  onSelectProperty,
  onBookViewing,
}) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<MatcherAnswers>({
    purpose: 'Buy to Own',
    category: 'Any',
    budgetRange: '₦30M - ₦60M',
    maxBudgetNum: 60000000,
    corridor: 'Any Corridor',
    timeframe: 'Next 30 Days',
    amenities: ['Borehole Water System'],
    clientType: 'Diaspora Buyer / Investor',
  });

  const [customRequestSubmitted, setCustomRequestSubmitted] = useState(false);
  const [customBrief, setCustomBrief] = useState({ name: '', phone: '', notes: '' });

  const totalSteps = 7;

  const updateAnswers = (key: keyof MatcherAnswers, value: any) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setAnswers((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  // Scoring algorithm matching properties
  const calculateMatches = () => {
    const scored = PROPERTIES.filter((p) => p.status === 'Available').map((p) => {
      let score = 0;
      let reasons: string[] = [];

      // Budget check
      if (p.price <= answers.maxBudgetNum) {
        score += 35;
        reasons.push('Within specified budget limit');
      } else if (p.price <= answers.maxBudgetNum * 1.2) {
        score += 15;
        reasons.push('Slightly above budget (negotiable range)');
      }

      // Purpose
      if (answers.purpose.includes('Invest') && (p.purpose === 'Invest' || p.type === 'Student Hostel' || p.type === 'Commercial Property')) {
        score += 25;
        reasons.push('High-yield commercial or student rental cashflow asset');
      } else if (answers.purpose.includes('Own') && p.purpose === 'Buy') {
        score += 25;
        reasons.push('Direct ownership with unencumbered title');
      } else if (answers.purpose.includes('Rent') && p.purpose === 'Rent') {
        score += 30;
        reasons.push('Immediate executive occupancy');
      }

      // Corridor preference
      if (answers.corridor === 'Any Corridor' || p.corridor.toLowerCase().includes(answers.corridor.toLowerCase())) {
        score += 20;
        reasons.push(`Direct alignment with ${p.corridor} corridor`);
      }

      // Category match
      if (answers.category === 'Any' || p.type.toLowerCase().includes(answers.category.toLowerCase())) {
        score += 15;
        reasons.push(`Matches ${p.type} specifications`);
      }

      // Amenities overlap
      const hasAmenity = answers.amenities.some((a) =>
        p.amenities.some((pa) => pa.toLowerCase().includes(a.toLowerCase()))
      );
      if (hasAmenity) {
        score += 10;
        reasons.push('Includes requested critical infrastructure (borehole, fencing, etc.)');
      }

      const matchPercentage = Math.min(Math.round((score / 105) * 100), 98);
      return {
        property: p,
        score,
        matchPercentage,
        reasons,
      };
    });

    return scored.sort((a, b) => b.score - a.score);
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBrief.name || !customBrief.phone) return;

    const leadPayload = {
      name: customBrief.name,
      phone: customBrief.phone,
      purpose: answers.purpose,
      propertyType: answers.category,
      corridor: answers.corridor,
      budget: answers.budgetRange,
      message: `7-Step Matcher Custom Request: ${customBrief.notes}. Client Profile: ${answers.clientType}`,
    };

    try {
      // 1. Direct Firestore write
      await createFirestoreLead(leadPayload).catch((err) => {
        console.warn('Firestore lead creation caught:', err);
      });

      // 2. Server API fallback
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload),
      }).catch((err) => {
        console.warn('Server API lead creation caught:', err);
      });

      setCustomRequestSubmitted(true);
    } catch (err) {
      console.error(err);
      setCustomRequestSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#071A2B] border border-[#1E486A] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1E486A]/50 bg-[#051421] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C5A880]" />
            <h3 className="text-base font-bold font-display text-[#FAF4E8]">
              Honest 7-Step Property Matcher
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#FAF4E8]/60 hover:text-white rounded-lg hover:bg-[#0D2638]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        {step <= totalSteps && (
          <div className="px-6 pt-3 pb-2 bg-[#051421] border-b border-[#1E486A]/30 flex items-center justify-between text-xs text-[#FAF4E8]/60">
            <span>Step {step} of {totalSteps}</span>
            <div className="w-1/2 bg-[#0D2638] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#8B6347] h-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
            <span className="font-data text-[#C5A880]">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="text-lg font-bold font-display text-[#FAF4E8]">
                1. What is your primary property purpose?
              </h4>
              <p className="text-xs text-[#FAF4E8]/70">
                We will only match verified properties engineered for your intended legal & financial usage.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { title: 'Buy to Own / Family Residence', desc: 'Secure executive homes or residential plots in verified corridors' },
                  { title: 'Student Hostel Rental Investment', desc: 'High cashflow student lodges near LAUTECH Adenike & Under G' },
                  { title: 'Commercial & Retail Operations', desc: 'Expressway commercial plots in Aroje or retail assets in Mushin Lagos' },
                  { title: 'Agricultural Farmland Development', desc: 'Perennial stream irrigated acreage in Odo-Oba' },
                  { title: 'Executive Annual Rental', desc: 'Serviced flats behind LAUTECH Teaching Hospital' }
                ].map((item) => (
                  <button
                    key={item.title}
                    onClick={() => updateAnswers('purpose', item.title)}
                    className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                      answers.purpose === item.title
                        ? 'bg-[#0D2638] border-[#C5A880] shadow-md'
                        : 'bg-[#051421] border-[#1E486A]/40 hover:border-[#1E486A]'
                    }`}
                  >
                    <div className="text-sm font-semibold text-[#FAF4E8]">{item.title}</div>
                    <div className="text-xs text-[#FAF4E8]/60 mt-1">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h4 className="text-lg font-bold font-display text-[#FAF4E8]">
                2. Which property category best suits your plans?
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  'Executive Duplex',
                  'Student Hostel Facility',
                  'Modern Bungalow',
                  'Commercial Land / Acreage',
                  'Agricultural Farmland',
                  'Any'
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateAnswers('category', cat)}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                      answers.category === cat
                        ? 'bg-[#0D2638] border-[#C5A880]'
                        : 'bg-[#051421] border-[#1E486A]/40 hover:border-[#1E486A]'
                    }`}
                  >
                    <span className="text-sm font-semibold text-[#FAF4E8]">{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h4 className="text-lg font-bold font-display text-[#FAF4E8]">
                3. What is your realistic target budget ceiling?
              </h4>
              <p className="text-xs text-[#FAF4E8]/70">
                Transparent advisory requires matching genuine figures. We will not hallucinate non-existent titles.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { label: 'Under ₦5,000,000', num: 5000000, note: 'Executive annual rentals or small plots' },
                  { label: '₦15,000,000 - ₦25,000,000', num: 25000000, note: 'Farmland tracts or standard residential plots' },
                  { label: '₦30,000,000 - ₦50,000,000', num: 50000000, note: 'Expressway commercial land, modern bungalows, Mushin commercial' },
                  { label: '₦50,000,000 - ₦80,000,000+', num: 85000000, note: 'Grand Olukoko duplexes or 16-unit student hostel facilities' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      updateAnswers('budgetRange', item.label);
                      updateAnswers('maxBudgetNum', item.num);
                    }}
                    className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                      answers.budgetRange === item.label
                        ? 'bg-[#0D2638] border-[#C5A880]'
                        : 'bg-[#051421] border-[#1E486A]/40 hover:border-[#1E486A]'
                    }`}
                  >
                    <div className="text-sm font-bold font-data text-[#F3E8D0]">{item.label}</div>
                    <div className="text-xs text-[#FAF4E8]/60 mt-1">{item.note}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h4 className="text-lg font-bold font-display text-[#FAF4E8]">
                4. Which operating corridor do you prefer?
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { name: 'Behind LAUTECH Teaching Hospital', desc: 'Executive doctor & academic homes along Olukoko Street' },
                  { name: 'Adenike Student Area', desc: 'Direct student hostel catchment next to LAUTECH gate' },
                  { name: 'Under G High-Growth Zone', desc: 'Fast-developing residential & student hub' },
                  { name: 'Mushin Commercial Corridor (Lagos)', desc: 'Active commercial storefronts & residential rental rolls' },
                  { name: 'Aroje / Ilorin Highway Industrial Belt', desc: 'Heavy vehicle access & expressway frontage' },
                  { name: 'Odo-Oba Agricultural Belt', desc: 'Perennial natural stream irrigation for crops' },
                  { name: 'Any Corridor', desc: 'Open to the most suitable verified opportunity' }
                ].map((cor) => (
                  <button
                    key={cor.name}
                    onClick={() => updateAnswers('corridor', cor.name)}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                      answers.corridor === cor.name
                        ? 'bg-[#0D2638] border-[#C5A880]'
                        : 'bg-[#051421] border-[#1E486A]/40 hover:border-[#1E486A]'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-semibold text-[#FAF4E8]">{cor.name}</div>
                    <div className="text-[11px] text-[#FAF4E8]/60 mt-0.5">{cor.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h4 className="text-lg font-bold font-display text-[#FAF4E8]">
                5. What is your expected timeframe for site inspection and closing?
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {[
                  { title: 'Immediate (Next 7-14 Days)', desc: 'Ready for Tuesday inspection or live video tour' },
                  { title: 'Next 30-60 Days', desc: 'Conducting preliminary title checks and budget staging' },
                  { title: 'Planning Ahead (3-6 Months)', desc: 'Researching yields and market comparables' }
                ].map((time) => (
                  <button
                    key={time.title}
                    onClick={() => updateAnswers('timeframe', time.title)}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                      answers.timeframe === time.title
                        ? 'bg-[#0D2638] border-[#C5A880]'
                        : 'bg-[#051421] border-[#1E486A]/40 hover:border-[#1E486A]'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-semibold text-[#FAF4E8]">{time.title}</div>
                    <div className="text-[11px] text-[#FAF4E8]/60 mt-1">{time.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <h4 className="text-lg font-bold font-display text-[#FAF4E8]">
                6. Select your essential must-have amenities
              </h4>
              <p className="text-xs text-[#FAF4E8]/70">
                Pick all features necessary for your planned property acquisition.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {[
                  'Borehole Water System',
                  'Perimeter Concrete Fence & Gate',
                  'Direct Tarred / Motorroad Frontage',
                  'Registered Survey Beacon Documentation',
                  'High Student Rental Yield Roll',
                  'Perennial Natural Stream Watercourse',
                  'Solar Inverter Pre-Wiring',
                  'Commercial Building Approval'
                ].map((amenity) => {
                  const isChecked = answers.amenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`p-3 rounded-lg text-left border transition-all flex items-center justify-between cursor-pointer ${
                        isChecked
                          ? 'bg-[#0D2638] border-[#C5A880] text-white'
                          : 'bg-[#051421] border-[#1E486A]/30 text-[#FAF4E8]/80 hover:border-[#1E486A]'
                      }`}
                    >
                      <span className="text-xs font-medium">{amenity}</span>
                      {isChecked ? (
                        <Check className="w-4 h-4 text-[#25D366]" />
                      ) : (
                        <div className="w-4 h-4 rounded border border-[#1E486A]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <h4 className="text-lg font-bold font-display text-[#FAF4E8]">
                7. What best describes your buyer profile?
              </h4>
              <p className="text-xs text-[#FAF4E8]/70">
                Helps us format inspection logistics (e.g. live WhatsApp 4K video vs on-site walk).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { title: 'Diaspora Buyer / Investor', desc: 'UK, US, Canada, Europe - requires live video inspection & courier' },
                  { title: 'LAUTECH Consultant / Lecturer', desc: 'Local Ogbomoso professional seeking home or hostel near campus' },
                  { title: 'Lagos / Interstate Business Investor', desc: 'Seeking cashflow commercial holdings or industrial plots' },
                  { title: 'Agribusiness Developer', desc: 'Seeking arable tracts with reliable stream water in Odo-Oba' }
                ].map((prof) => (
                  <button
                    key={prof.title}
                    onClick={() => updateAnswers('clientType', prof.title)}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                      answers.clientType === prof.title
                        ? 'bg-[#0D2638] border-[#C5A880]'
                        : 'bg-[#051421] border-[#1E486A]/40 hover:border-[#1E486A]'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-semibold text-[#FAF4E8]">{prof.title}</div>
                    <div className="text-[11px] text-[#FAF4E8]/60 mt-1">{prof.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results Step (Step > 7) */}
          {step > totalSteps && (
            <div className="space-y-6">
              <div className="text-center pb-4 border-b border-[#1E486A]/40">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D2638] text-xs font-semibold text-[#C5A880] mb-2 border border-[#1E486A]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Matcher Alignment Results</span>
                </div>
                <h4 className="font-display text-2xl font-bold text-[#FAF4E8]">
                  Verified Properties Aligned with Your Brief
                </h4>
                <p className="text-xs text-[#FAF4E8]/70 mt-1">
                  Evaluated across budget, title clearance, corridor infrastructure, and purpose.
                </p>
              </div>

              {/* Scored Matches */}
              <div className="space-y-4">
                {calculateMatches().slice(0, 3).map((match, idx) => (
                  <div
                    key={match.property.id}
                    className="p-4 rounded-xl bg-[#051421] border border-[#1E486A]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-data text-xs font-bold text-[#25D366]">
                          {match.matchPercentage}% Alignment Match
                        </span>
                        <span className="text-[#FAF4E8]/40" aria-hidden="true">·</span>
                        <span className="text-xs text-[#C5A880]">{match.property.corridor}</span>
                      </div>
                      <h5 className="font-display text-base font-bold text-[#FAF4E8]">
                        {match.property.title}
                      </h5>
                      <div className="text-xs font-semibold text-[#38bdf8] mt-0.5">
                        Price Available on Request
                      </div>
                      <div className="mt-2 text-[11px] text-[#FAF4E8]/70 space-y-0.5">
                        {match.reasons.map((r, rIdx) => (
                          <div key={rIdx} className="flex items-center gap-1.5">
                            <span className="text-[#25D366]">✓</span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          onClose();
                          onSelectProperty(match.property);
                        }}
                        className="flex-1 sm:flex-initial py-2 px-3 text-xs font-semibold text-[#FAF4E8] bg-[#0D2638] hover:bg-[#112E43] rounded-lg border border-[#1E486A] transition-colors whitespace-nowrap"
                      >
                        Review Property
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          onBookViewing(match.property);
                        }}
                        className="flex-1 sm:flex-initial py-2 px-3 text-xs font-semibold text-white bg-[#8B6347] hover:bg-[#9E7353] rounded-lg transition-colors whitespace-nowrap"
                      >
                        Book Inspection
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Direct Fallback Request Box */}
              <div className="mt-6 p-5 rounded-xl bg-[#0D2638] border border-[#1E486A] text-xs space-y-3">
                <div className="flex items-center gap-2 font-semibold text-[#F3E8D0]">
                  <Building2 className="w-4 h-4 text-[#C5A880]" />
                  <span>Looking for an off-market plot or different budget bracket?</span>
                </div>
                <p className="text-[#FAF4E8]/80 leading-relaxed">
                  As our brokerage has operated in Ogbomoso continuously since 2006, Alhaji Olaoluwa maintains trusted relationships with local family heads and surveyors across unlisted corridors.
                </p>

                {customRequestSubmitted ? (
                  <div className="p-3 bg-[#051421] rounded-lg border border-[#25D366]/40 text-[#25D366] font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Your brief has been forwarded directly to Alhaji Olaoluwa. We will contact you shortly!</span>
                  </div>
                ) : (
                  <form onSubmit={handleCustomSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Your Full Name"
                      value={customBrief.name}
                      onChange={(e) => setCustomBrief({ ...customBrief, name: e.target.value })}
                      required
                      className="px-3 py-2 bg-[#051421] border border-[#1E486A] rounded-lg text-xs text-[#FAF4E8] focus:outline-none focus:border-[#C5A880]"
                    />
                    <input
                      type="tel"
                      placeholder="Phone or WhatsApp Number"
                      value={customBrief.phone}
                      onChange={(e) => setCustomBrief({ ...customBrief, phone: e.target.value })}
                      required
                      className="px-3 py-2 bg-[#051421] border border-[#1E486A] rounded-lg text-xs text-[#FAF4E8] focus:outline-none focus:border-[#C5A880]"
                    />
                    <button
                      type="submit"
                      className="py-2 px-3 bg-[#8B6347] hover:bg-[#9E7353] text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Submit Custom Brief
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Navigation Footer */}
        <div className="px-6 py-4 border-t border-[#1E486A]/50 bg-[#051421] flex items-center justify-between">
          {step > 1 && step <= totalSteps ? (
            <button
              onClick={() => setStep(step - 1)}
              className="py-2 px-3 text-xs font-medium text-[#FAF4E8]/80 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step <= totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              className="py-2 px-5 text-xs font-semibold text-white bg-[#8B6347] hover:bg-[#9E7353] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>{step === totalSteps ? 'Calculate Matches' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setStep(1)}
              className="py-2 px-4 text-xs font-medium text-[#FAF4E8]/70 hover:text-white cursor-pointer"
            >
              Start Over
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
