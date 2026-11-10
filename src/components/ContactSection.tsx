import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
  Building2,
  HardHat,
  ShieldCheck,
  Calendar,
  MessageSquare,
  Globe2,
  ArrowRight
} from 'lucide-react';
import { createFirestoreLead } from '../lib/firebase';

interface ContactSectionProps {
  onOpenViewing: () => void;
  onOpenChat: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  onOpenViewing,
  onOpenChat,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    serviceType: 'Building Construction & Architectural Design',
    corridor: 'Behind LAUTECH Teaching Hospital',
    budget: '₦20M - ₦50M',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMsg('Please enter your full name and valid phone/WhatsApp number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // 1. Save directly to Cloud Firestore
      await createFirestoreLead({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        propertyType: formData.serviceType,
        corridor: formData.corridor,
        budget: formData.budget,
        message: formData.message || 'Direct inquiry from Contact Section',
        purpose: 'Invest',
      }).catch((err) => console.warn('Firestore contact submit warning:', err));

      // 2. Post to API backend (with SendPulse sync)
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: 'Contact Page Inquiry',
        }),
      });

      setIsSubmitted(true);
      setFormData({
        name: '',
        phone: '',
        email: '',
        serviceType: 'Building Construction & Architectural Design',
        corridor: 'Behind LAUTECH Teaching Hospital',
        budget: '₦20M - ₦50M',
        message: '',
      });
    } catch (err: any) {
      console.error('Contact submission error:', err);
      setErrorMsg('Submission error. Please connect directly via WhatsApp at +234 803 384 8107.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappDirectUrl = `https://wa.me/2348033848107?text=${encodeURIComponent(
    'Hello Engineer Samuel Aleji, I am reaching out through the Ola Continental contact page to inquire about your property and building construction services.'
  )}`;

  return (
    <section className="py-16 bg-[#07132b] text-[#f0f9ff] min-h-[85vh] relative overflow-hidden">
      {/* Royal blue & light blue ambient glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#1d4ed8]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#38bdf8]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-widest uppercase text-[#38bdf8] mb-3">
            <span>DIRECT ENGAGEMENT & HEADQUARTERS</span>
            <span aria-hidden="true" className="text-white/40">·</span>
            <span className="font-data text-xs text-[#93c5fd]/80">OGBOMOSO & LAGOS</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Contact Ola Continental
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#bfdbfe] leading-relaxed font-normal">
            Whether you are commissioning a turnkey building construction project, acquiring verified land with charted survey beacons, or scheduling a Tuesday on-site walkthrough, our civil engineering and real estate desk is ready to assist.
          </p>
        </div>

        {/* 3-Column Executive Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Card 1: Executive Desk */}
          <div className="bg-[#0b1e42] border border-[#1d4ed8]/30 hover:border-[#38bdf8]/60 rounded-2xl p-7 transition-all duration-300 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#38bdf8] bg-[#1d4ed8]/20 px-2.5 py-1 rounded-md border border-[#38bdf8]/30">
                  Principal Desk
                </span>
                <Phone className="w-5 h-5 text-[#38bdf8]" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-1">
                Engr. Samuel Aleji
              </h3>
              <p className="text-xs text-[#93c5fd] mb-4">
                Founder, Principal Consultant & Chief Civil Engineer
              </p>
              <div className="space-y-2 text-xs text-[#e0f2fe]">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#25D366] shrink-0" />
                  <a href="tel:+2348033848107" className="font-data font-semibold hover:text-[#38bdf8] transition-colors">
                    +234 803 384 8107
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#25D366] shrink-0" />
                  <a href={whatsappDirectUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#25D366] hover:underline">
                    WhatsApp 0803 384 8107
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#38bdf8] shrink-0" />
                  <span className="font-data text-[11px] text-[#bfdbfe]">olacontinental625@gmail.com</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#1d4ed8]/30">
              <a
                href={whatsappDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20b859] text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Chat on WhatsApp Directly</span>
              </a>
            </div>
          </div>

          {/* Card 2: Ogbomoso Headquarters Landmark */}
          <div className="bg-[#0b1e42] border border-[#1d4ed8]/30 hover:border-[#38bdf8]/60 rounded-2xl p-7 transition-all duration-300 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#60a5fa] bg-[#1d4ed8]/20 px-2.5 py-1 rounded-md border border-[#60a5fa]/30">
                  Headquarters
                </span>
                <MapPin className="w-5 h-5 text-[#38bdf8]" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-1">
                Ogbomoso Landmark
              </h3>
              <p className="text-xs text-[#93c5fd] mb-3">
                Behind LAUTECH Teaching Hospital
              </p>
              <div className="space-y-2 text-xs text-[#e0f2fe]">
                <p className="leading-relaxed text-xs text-[#bfdbfe]">
                  No. 2, Olukoko Street,<br />
                  Behind LAUTECH Teaching Hospital,<br />
                  Ogbomoso, Oyo State, Nigeria
                </p>
                <div className="text-[11px] text-[#38bdf8] font-data pt-1">
                  Plus Code: 47X3+F5 Ogbomoso
                </div>
                <div className="pt-2 text-[11px] text-[#bfdbfe]">
                  <strong>Inspection Day:</strong> Every Tuesday dedicated on-site walkthrough with GPS total stations.
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#1d4ed8]/30">
              <button
                onClick={onOpenViewing}
                className="w-full py-2.5 px-4 bg-[#1d4ed8] hover:bg-[#0284c7] text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Tuesday Walkthrough</span>
              </button>
            </div>
          </div>

          {/* Card 3: Building & Civil Construction Division */}
          <div className="bg-[#0b1e42] border border-[#1d4ed8]/30 hover:border-[#38bdf8]/60 rounded-2xl p-7 transition-all duration-300 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#38bdf8] bg-[#1d4ed8]/20 px-2.5 py-1 rounded-md border border-[#38bdf8]/30">
                  Engineering Division
                </span>
                <HardHat className="w-5 h-5 text-[#38bdf8]" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-1">
                Building & Construction
              </h3>
              <p className="text-xs text-[#93c5fd] mb-3">
                Civil Contracts, Hostels & Factories
              </p>
              <div className="space-y-1.5 text-xs text-[#e0f2fe]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Architectural & Structural Drawings</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>LAUTECH Multi-Unit Hostels</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Industrial Warehouse & Agro Plants</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8]" />
                  <span>Lagos Mushin Commercial Works</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#1d4ed8]/30">
              <button
                onClick={onOpenChat}
                className="w-full py-2.5 px-4 bg-[#0c2a63] hover:bg-[#113e94] border border-[#38bdf8]/40 text-[#e0f2fe] hover:text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#38bdf8]" />
                <span>Consult Civil Engineering AI</span>
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Inquiry Form + Office Protocols Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* Left Form: 7 Columns */}
          <div className="lg:col-span-7 bg-[#0b1e42] border border-[#1d4ed8]/40 rounded-3xl p-6 sm:p-10 shadow-2xl">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#38bdf8] mb-1">
                <Send className="w-3.5 h-3.5" />
                <span>DIRECT INQUIRY & CONTRACT BRIEF</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                Send Us a Message
              </h2>
              <p className="text-xs text-[#bfdbfe] mt-1">
                Inquiries are delivered directly to Engr. Samuel Aleji and logged in our priority management portal.
              </p>
            </div>

            {isSubmitted ? (
              <div className="p-8 bg-[#07132b] border border-[#38bdf8]/50 rounded-2xl text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-[#25D366] mx-auto animate-bounce" />
                <h4 className="font-display text-xl font-bold text-white">
                  Message Successfully Delivered!
                </h4>
                <p className="text-xs text-[#bfdbfe] max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out. Engineer Samuel Aleji and the technical desk have received your specifications and will respond within 4 business hours.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-3">
                  <a
                    href={whatsappDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#25D366] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Follow Up on WhatsApp</span>
                  </a>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-4 py-2 bg-[#1d4ed8] text-white text-xs font-semibold rounded-lg"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {errorMsg && (
                  <div className="p-3 bg-red-950/80 border border-red-500/40 text-red-200 rounded-lg text-xs">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#e0f2fe] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Dr. Olawale Johnson"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#07132b] border border-[#1d4ed8]/50 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#e0f2fe] mb-1">
                      Phone / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g., +234 803 123 4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#07132b] border border-[#1d4ed8]/50 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#e0f2fe] mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g., johnson@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#07132b] border border-[#1d4ed8]/50 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#e0f2fe] mb-1">
                      Service or Project Required *
                    </label>
                    <select
                      value={formData.serviceType}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#07132b] border border-[#1d4ed8]/50 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                    >
                      <option value="Building Construction & Architectural Design">Building Construction & Architectural Design</option>
                      <option value="Turnkey Campus Student Hostel Project">Turnkey Campus Student Hostel Project</option>
                      <option value="Industrial Warehouse / Agro-Processing Facility">Industrial Warehouse / Agro-Processing Facility</option>
                      <option value="Residential Property Acquisition (House / Duplex)">Residential Property Acquisition (House / Duplex)</option>
                      <option value="Verified Land Purchase & Cadastral Survey">Verified Land Purchase & Cadastral Survey</option>
                      <option value="Commercial Real Estate (Lagos / Mushin)">Commercial Real Estate (Lagos / Mushin)</option>
                      <option value="Tuesday On-Site Field Walkthrough">Tuesday On-Site Field Walkthrough</option>
                      <option value="Diaspora Remote 4K Video Inspection">Diaspora Remote 4K Video Inspection</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#e0f2fe] mb-1">
                      Target Corridor / Location
                    </label>
                    <select
                      value={formData.corridor}
                      onChange={(e) => setFormData({ ...formData, corridor: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#07132b] border border-[#1d4ed8]/50 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                    >
                      <option value="Behind LAUTECH Teaching Hospital">Behind LAUTECH Teaching Hospital</option>
                      <option value="Under G High-Growth Zone">Under G High-Growth Zone</option>
                      <option value="Adenike Student Belt">Adenike Student Belt</option>
                      <option value="Mushin Commercial Corridor, Lagos">Mushin Commercial Corridor, Lagos</option>
                      <option value="Aroje Industrial Interstate Highway">Aroje Industrial Interstate Highway</option>
                      <option value="Odo-Oba Agricultural Belt">Odo-Oba Agricultural Belt</option>
                      <option value="Takie Square Civic Center">Takie Square Civic Center</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#e0f2fe] mb-1">
                      Estimated Project Budget
                    </label>
                    <select
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#07132b] border border-[#1d4ed8]/50 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                    >
                      <option value="Under ₦15M">Under ₦15M</option>
                      <option value="₦15M - ₦35M">₦15M - ₦35M</option>
                      <option value="₦35M - ₦65M">₦35M - ₦65M</option>
                      <option value="₦65M - ₦100M">₦65M - ₦100M</option>
                      <option value="₦100M+ (Institutional / Multi-Unit)">₦100M+ (Institutional / Multi-Unit)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#e0f2fe] mb-1">
                    Project Brief or Specific Questions
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your land coordinates, structural requirements, intended completion date, or inspection schedule..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#07132b] border border-[#1d4ed8]/50 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 bg-[#1d4ed8] hover:bg-[#0284c7] text-white font-semibold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Transmitting to Technical Desk...' : 'Submit Inquiry to Technical Desk'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Office Protocols & Working Hours (5 Columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0b1e42] border border-[#1d4ed8]/40 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#38bdf8]">
                <Clock className="w-4 h-4" />
                <span>OPERATIONAL HOURS & FIELD CYCLES</span>
              </div>

              <div className="space-y-3 text-xs text-[#bfdbfe]">
                <div className="flex items-start justify-between pb-2.5 border-b border-[#1d4ed8]/30">
                  <span className="font-semibold text-white">Monday – Friday</span>
                  <span className="font-data">8:00 AM – 6:00 PM</span>
                </div>
                <div className="flex items-start justify-between pb-2.5 border-b border-[#1d4ed8]/30">
                  <span className="font-semibold text-white">Saturday (Site Audits)</span>
                  <span className="font-data">9:00 AM – 4:00 PM</span>
                </div>
                <div className="flex items-start justify-between pb-2.5 border-b border-[#1d4ed8]/30">
                  <span className="font-semibold text-white">Tuesday Dedicated Inspection Day</span>
                  <span className="text-[#38bdf8] font-bold">All Day Field Tours</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-white">Sunday</span>
                  <span className="text-[#93c5fd]">Diaspora Video Consults Only</span>
                </div>
              </div>

              <div className="p-4 bg-[#07132b] border border-[#1d4ed8]/50 rounded-2xl text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-[#38bdf8]">
                  <ShieldCheck className="w-4 h-4 text-[#25D366]" />
                  <span>Cadastral Escrow Guarantee</span>
                </div>
                <p className="text-[11px] text-[#bfdbfe] leading-relaxed">
                  No funds are disbursed until boundary coordinates are charted clean of road setbacks and customary disputes at the Oyo State Surveyor General's office.
                </p>
              </div>
            </div>

            {/* Diaspora Shield Callout */}
            <div className="bg-[#0c2a63] border border-[#38bdf8]/40 rounded-3xl p-6 sm:p-8 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#38bdf8]">
                <Globe2 className="w-4 h-4 text-[#38bdf8]" />
                <span>FOR DIASPORA CLIENTS (UK, US, CANADA)</span>
              </div>
              <h3 className="font-display text-lg font-bold text-white">
                Protecting Overseas Capital Since 2006
              </h3>
              <p className="text-xs text-[#bfdbfe] leading-relaxed">
                We eliminate reliance on unreliable proxies or relatives. Receive timestamped 4K drone video progress reports for your construction projects and original stamped Deeds sent via DHL courier.
              </p>
              <div className="pt-2">
                <a
                  href={whatsappDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#38bdf8] hover:text-white transition-colors"
                >
                  <span>Request International Client Briefing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
