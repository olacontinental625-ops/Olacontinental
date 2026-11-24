import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Phone,
  MessageSquare,
  ShieldCheck,
  User,
  Bot,
  Loader2,
  CheckCircle2,
  UserCheck,
  ArrowRight,
  Mail,
  MessageCircle,
  Globe,
  CopyCheck,
} from 'lucide-react';
import { ChatMessage, ContactInquiry, CustomerProfile } from '../types';
import { createFirestoreLead, createFirestoreCustomer } from '../lib/firebase';
import { OlaLogoMark } from './OlaLogoMark';

interface AiAssistantDrawerProps {
  onClose: () => void;
  onOpenViewing: () => void;
  initialInquiry?: ContactInquiry | null;
  customerProfile: CustomerProfile | null;
  onCustomerRegistered: (customer: CustomerProfile) => void;
  onOpenCustomerLoginPage?: () => void;
}

const DEFAULT_SUGGESTIONS = [
  'I live outside Nigeria — how do I buy or build safely?',
  'Show me residential duplexes & homes behind LAUTECH Hospital',
  'Do you have commercial properties in Mushin Lagos?',
  'Tell me about ongoing constructions & custom building quotes',
  'What titled land or farmland is available in Ogbomoso?',
  'Explain your 5% agency & legal fee breakdown',
];

function buildInitialGreeting(
  customer: CustomerProfile | null,
  inquiry?: ContactInquiry | null
): ChatMessage[] {
  const clientName = customer?.fullName || inquiry?.name;
  const personalizedIntro = clientName ? `E kaabo & warm greetings, ${clientName}!` : 'E kaabo & warm greetings!';

  if (inquiry) {
    return [
      {
        id: `contact-init-${Date.now()}`,
        sender: 'assistant',
        text: `${personalizedIntro} I am Ola AI, your real estate and construction consultant at Ola Continental Properties & Associates.\n\nI have received your inquiry from the Constructions & Inquiry form regarding "${inquiry.serviceType}" in the ${inquiry.corridor} corridor (Budget: ${inquiry.budget}).\n\nWhether you are based in Nigeria or outside Nigeria in the diaspora, your message has been transmitted directly to Engineer Samuel Aleji. How can I assist you with property options, structural planning, or inspection schedules right now?`,
        timestamp: 'Just now',
      },
    ];
  }

  return [
    {
      id: 'init-1',
      sender: 'assistant',
      text: `${personalizedIntro} I am Ola AI, your personal real estate and construction consultant at Ola Continental Properties & Associates.\n\nWe serve individuals, families, business owners, and investors across Nigeria AND Nigerians or partners living outside Nigeria (UK, USA, Canada, Europe, and worldwide). Whether you are exploring residential homes and executive duplexes, commercial buildings in Mushin Lagos, ongoing or finished construction projects, titled land and fertile farmland in Odo-Oba, or campus investments, I am here to help with total transparency.\n\nWhat would you like to explore or accomplish on our website today? You can also tap "Drop Lead & Inquiry" above to request a priority callback from Engineer Samuel Aleji.`,
      timestamp: 'Just now',
    },
  ];
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  onClose,
  onOpenViewing,
  initialInquiry,
  customerProfile,
  onCustomerRegistered,
  onOpenCustomerLoginPage,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'lead'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    buildInitialGreeting(customerProfile, initialInquiry)
  );
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mandatory Customer Sign-Up Gate State (if customerProfile is null)
  const [regFullName, setRegFullName] = useState(initialInquiry?.name || '');
  const [regPhone, setRegPhone] = useState(initialInquiry?.phone || '');
  const [regEmail, setRegEmail] = useState(initialInquiry?.email || '');
  const [regWhatsapp, setRegWhatsapp] = useState(initialInquiry?.phone || '');
  const [regSameAsPhone, setRegSameAsPhone] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);

  // Lead Collection State
  const [leadForm, setLeadForm] = useState({
    name: customerProfile?.fullName || initialInquiry?.name || '',
    phone: customerProfile?.phone || initialInquiry?.phone || '',
    email: customerProfile?.email || initialInquiry?.email || '',
    propertyType: initialInquiry?.serviceType || 'Residential Duplex / House',
    corridor: initialInquiry?.corridor || 'Behind LAUTECH Hospital',
    budget: initialInquiry?.budget || '₦40M - ₦80M',
    message: initialInquiry?.message || '',
  });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  useEffect(() => {
    setMessages(buildInitialGreeting(customerProfile, initialInquiry));
    setLeadForm((prev) => ({
      ...prev,
      name: customerProfile?.fullName || initialInquiry?.name || prev.name,
      phone: customerProfile?.phone || initialInquiry?.phone || prev.phone,
      email: customerProfile?.email || initialInquiry?.email || prev.email,
      propertyType: initialInquiry?.serviceType || prev.propertyType,
      corridor: initialInquiry?.corridor || prev.corridor,
      budget: initialInquiry?.budget || prev.budget,
      message: initialInquiry?.message || prev.message,
    }));
  }, [customerProfile, initialInquiry]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleGatePhoneChange = (val: string) => {
    setRegPhone(val);
    if (regSameAsPhone) {
      setRegWhatsapp(val);
    }
  };

  const handleToggleGateSameAsPhone = () => {
    const next = !regSameAsPhone;
    setRegSameAsPhone(next);
    if (next && regPhone.trim()) {
      setRegWhatsapp(regPhone);
    }
  };

  const handleGateSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    const cleanName = regFullName.trim();
    const cleanPhone = regPhone.trim();
    const cleanEmail = regEmail.trim();
    const cleanWhatsapp = regWhatsapp.trim();

    if (cleanName.length < 2) {
      setRegError('Full Name is required.');
      return;
    }
    if (cleanPhone.length < 5) {
      setRegError('Phone Number is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setRegError('Valid Email Address is required.');
      return;
    }
    if (cleanWhatsapp.length < 5) {
      setRegError('WhatsApp Number is required (non-optional).');
      return;
    }

    setRegSubmitting(true);
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          whatsapp: cleanWhatsapp,
          source: 'Ask Ola AI Gate',
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.customer) {
        throw new Error(data.error || 'Could not complete registration.');
      }

      const savedCustomer: CustomerProfile = data.customer;
      await createFirestoreCustomer(savedCustomer).catch((err) =>
        console.warn('Firestore customer sync warning:', err)
      );

      onCustomerRegistered(savedCustomer);
    } catch (err: any) {
      setRegError(err?.message || 'Sign-up failed. Please verify all 4 required fields.');
    } finally {
      setRegSubmitting(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    if (!customerProfile) return;
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          customerProfile,
          history: messages.slice(-6).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      const data = await res.json();
      const replyText =
        data.reply ||
        data.fallback ||
        data.error ||
        'Please contact Engineer Samuel Aleji directly on WhatsApp at +234 803 384 8107.';

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error('Chat request failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: 'Thank you for your inquiry. To speak directly with Engineer Samuel Aleji, please call or WhatsApp +234 803 384 8107, or visit our office at No. 2, Olukoko Street behind LAUTECH Teaching Hospital.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.phone) return;

    setLeadSubmitting(true);
    try {
      await createFirestoreLead({
        name: leadForm.name,
        phone: leadForm.phone,
        email: leadForm.email,
        propertyType: leadForm.propertyType,
        corridor: leadForm.corridor,
        budget: leadForm.budget,
        message: leadForm.message || 'Dropped via Ola AI Assistant Concierge',
        purpose: 'Buy',
      }).catch((err) => console.warn('Firestore lead creation caught:', err));

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadForm,
          source: 'Ola AI Assistant',
        }),
      });
      await res.json();

      setLeadSuccess(true);

      const systemConfirmMsg: ChatMessage = {
        id: `lead-confirm-${Date.now()}`,
        sender: 'assistant',
        text: `Lead Successfully Dropped & Dispatched!\n\nThank you, **${leadForm.name}**. Your inquiry regarding **${leadForm.propertyType}** in **${leadForm.corridor}** has been saved and forwarded to Engineer Samuel Aleji and our senior engineering desk.\n\nOur team will contact you directly via WhatsApp or phone at **${leadForm.phone}**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, systemConfirmMsg]);

      setTimeout(() => {
        setLeadSuccess(false);
        setActiveTab('chat');
      }, 1600);
    } catch (err) {
      console.error('Failed to submit lead:', err);
    } finally {
      setLeadSubmitting(false);
    }
  };

  const currentWhatsappQuery = encodeURIComponent(
    `Hello Engineer Samuel Aleji, I am ${customerProfile?.fullName || 'inquiring'} via Ola AI Concierge regarding Ola Continental Properties & Construction.`
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md h-full bg-[#181a20] border-l border-slate-700/80 flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-4 bg-[#1e222b] border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white">Ola AI Concierge</h3>
              <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-[#38bdf8]" />
                <span>Nigeria &amp; Diaspora Real Estate Desk</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Ask Ola AI"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MANDATORY CUSTOMER SIGN-UP GATE */}
        {!customerProfile ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div className="bg-[#222630] border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="h-1.5 w-full flex">
                <div className="w-1/2 bg-[#b91c1c]" />
                <div className="w-1/2 bg-[#172554]" />
              </div>
              <div className="p-5 space-y-3">
                <OlaLogoMark variant="section" />
                <h4 className="font-display text-lg font-bold text-white leading-snug">
                  Sign Up Required to Ask Ola AI
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Serving clients inside <strong className="text-white">Nigeria</strong> and{' '}
                  <strong className="text-white">outside Nigeria (Diaspora)</strong> across homes, duplexes, commercial buildings, titled land, construction, farmland, and hostels. Enter your required details below to unlock instant AI answers tailored to what you need on our website.
                </p>
              </div>
            </div>

            {regError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-200">
                {regError}
              </div>
            )}

            <form onSubmit={handleGateSignUp} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] text-slate-200 font-semibold mb-1">
                  Full Name <span className="text-[#f87171]">* (Required)</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={120}
                    placeholder="Enter your Full Name"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#222630] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-200 font-semibold mb-1">
                  Phone Number <span className="text-[#f87171]">* (Required)</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    minLength={5}
                    maxLength={40}
                    placeholder="+234 ... or international number"
                    value={regPhone}
                    onChange={(e) => handleGatePhoneChange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#222630] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-200 font-semibold mb-1">
                  Email Address <span className="text-[#f87171]">* (Required)</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    maxLength={150}
                    placeholder="you@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#222630] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] text-slate-200 font-semibold">
                    WhatsApp Number <span className="text-[#f87171]">* (Required)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleToggleGateSameAsPhone}
                    className="text-[10px] text-[#38bdf8] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CopyCheck className="w-3 h-3" />
                    <span>{regSameAsPhone ? 'Synced' : 'Same as Phone'}</span>
                  </button>
                </div>
                <div className="relative">
                  <MessageCircle className="w-3.5 h-3.5 text-[#4ade80] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    minLength={5}
                    maxLength={40}
                    placeholder="Active WhatsApp number"
                    value={regWhatsapp}
                    onChange={(e) => {
                      setRegSameAsPhone(false);
                      setRegWhatsapp(e.target.value);
                    }}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#222630] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-[#4ade80]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={regSubmitting}
                className="w-full py-3 bg-[#b91c1c] hover:bg-[#991b1b] disabled:opacity-60 text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                {regSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving &amp; Unlocking Ola AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#F5C451]" />
                    <span>Submit &amp; Start Asking Ola AI</span>
                  </>
                )}
              </button>
            </form>

            {onOpenCustomerLoginPage && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCustomerLoginPage();
                  }}
                  className="text-[11px] text-[#38bdf8] hover:underline cursor-pointer"
                >
                  Already signed up? Returning Customer Login / Full Sign-Up Page →
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Tab Switcher: Chat Concierge vs Drop Lead */}
            <div className="flex border-b border-white/10 bg-[#0e0e14] text-xs font-semibold">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-2.5 px-4 text-center border-b-2 transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'chat'
                    ? 'border-[#C5A880] text-[#F3E8D0] bg-white/[0.03]'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>AI Consultation</span>
              </button>

              <button
                onClick={() => setActiveTab('lead')}
                className={`flex-1 py-2.5 px-4 text-center border-b-2 transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'lead'
                    ? 'border-[#C5A880] text-[#F3E8D0] bg-white/[0.03]'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Drop Lead &amp; Inquiry</span>
              </button>
            </div>

            {/* Signed-In Client & Direct Desk Strip */}
            <div className="px-4 py-2 bg-[#222630] border-b border-slate-700 text-[11px] text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5 truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4ade80] shrink-0" />
                <span className="truncate">
                  Client: <strong className="text-white">{customerProfile.fullName}</strong>
                </span>
              </span>
              <a
                href={`https://wa.me/2348033848107?text=${currentWhatsappQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4ade80] hover:underline font-semibold ml-2 shrink-0 flex items-center gap-1"
              >
                <Phone className="w-3 h-3" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* TAB 1: Chat Mode */}
            {activeTab === 'chat' && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                  {initialInquiry && (
                    <div className="p-3 bg-[#0c2a63] border border-[#38bdf8]/40 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between text-[#38bdf8] font-semibold text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Connected Construction &amp; Inquiry Form</span>
                        </span>
                        <span className="font-mono text-[10px] text-emerald-400">Synced</span>
                      </div>
                      <div className="text-[#e0f2fe] text-[11px] leading-tight">
                        <strong>Client:</strong> {initialInquiry.name} · {initialInquiry.serviceType} ({initialInquiry.corridor})
                      </div>
                    </div>
                  )}

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 ${
                        msg.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {msg.sender === 'assistant' && (
                        <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#C5A880] shrink-0 mt-0.5">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-[#8B6347] text-white rounded-tr-none'
                            : 'bg-[#121217] text-[#FAF4E8]/90 border border-white/10 rounded-tl-none'
                        }`}
                      >
                        <div className="whitespace-pre-line">{msg.text}</div>
                        <div
                          className={`mt-1.5 text-[10px] text-right ${
                            msg.sender === 'user' ? 'text-white/60' : 'text-[#FAF4E8]/40'
                          }`}
                        >
                          {msg.timestamp}
                        </div>
                      </div>

                      {msg.sender === 'user' && (
                        <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#FAF4E8]/80 shrink-0 mt-0.5">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}

                  {loading && (
                    <div className="flex items-center gap-2 text-xs text-[#FAF4E8]/60 bg-[#121217] p-3 rounded-xl border border-white/10 w-fit">
                      <Loader2 className="w-4 h-4 text-[#C5A880] animate-spin" />
                      <span>Ola AI is checking property &amp; construction ledgers...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Fast-Lead CTA Strip */}
                <div className="px-3 py-2 bg-[#0e0e14] border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-white/70">Want an executive callback?</span>
                  <button
                    onClick={() => setActiveTab('lead')}
                    className="px-2.5 py-1 bg-[#8B6347] hover:bg-[#9E7353] text-white font-semibold rounded text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Drop Your Lead</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Quick Suggestion Chips */}
                <div className="p-3 bg-[#1e222b] border-t border-slate-700">
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 mb-2">
                    Suggested Enquiries (Nigeria &amp; Diaspora)
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {DEFAULT_SUGGESTIONS.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(s)}
                        className="px-2.5 py-1 text-[11px] bg-[#282c37] hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Bar */}
                <div className="p-3 bg-[#181a20] border-t border-slate-700">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Ask about homes, land, commercial assets, constructions..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      disabled={loading}
                      className="flex-1 px-3 py-2.5 text-xs text-white bg-[#222630] border border-slate-700 rounded-xl focus:outline-none focus:border-[#38bdf8] transition-colors placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim() || loading}
                      className="p-2.5 text-white bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#FAF4E8]/60">
                    <span>Principal Consultant: Engineer Samuel Aleji</span>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenViewing();
                      }}
                      className="text-[#C5A880] hover:underline cursor-pointer"
                    >
                      Book Inspection Slot
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: Dedicated Lead Drop Form */}
            {activeTab === 'lead' && (
              <div className="flex-1 overflow-y-auto p-5 text-xs">
                <div className="mb-4">
                  <h4 className="font-display text-base font-bold text-[#FAF4E8]">Drop Your Lead &amp; Property Inquiry</h4>
                  <p className="text-[11px] text-white/70 mt-1">
                    Provide your preferences below. Ola AI immediately logs your request for direct follow-up by Engineer Samuel Aleji.
                  </p>
                </div>

                {leadSuccess ? (
                  <div className="p-6 bg-[#25D366]/10 border border-[#25D366]/40 rounded-2xl text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-[#25D366] mx-auto animate-bounce" />
                    <h5 className="font-display text-sm font-bold text-white">Lead Successfully Dropped!</h5>
                    <p className="text-[11px] text-white/80">
                      Your requirements have been synced. Engineer Samuel Aleji will reach you directly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleLeadSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] text-white/70 font-semibold mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Dr. Olumide Adeleke"
                        value={leadForm.name}
                        onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-[#222630] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-white/70 font-semibold mb-1">
                        Phone / WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+234 803 ... or +44 7..."
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-[#222630] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-white/70 font-semibold mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={leadForm.email}
                        onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-[#222630] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] text-white/70 font-semibold mb-1">
                          Target Corridor
                        </label>
                        <select
                          value={leadForm.corridor}
                          onChange={(e) => setLeadForm({ ...leadForm, corridor: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-[#222630] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                        >
                          <option value="Behind LAUTECH Hospital">Behind LAUTECH Hospital</option>
                          <option value="Mushin Commercial (Lagos)">Mushin (Lagos)</option>
                          <option value="Under G High-Growth">Under G Zone</option>
                          <option value="Adenike (LAUTECH)">Adenike (LAUTECH)</option>
                          <option value="Aroje Industrial Belt">Aroje Expressway</option>
                          <option value="Odo-Oba Farmland">Odo-Oba Farmland</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-white/70 font-semibold mb-1">
                          Property / Service Category
                        </label>
                        <select
                          value={leadForm.propertyType}
                          onChange={(e) => setLeadForm({ ...leadForm, propertyType: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-[#222630] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                        >
                          <option value="Residential Duplex / House">Residential Duplex / House</option>
                          <option value="Custom Building Construction">Custom Building Construction</option>
                          <option value="Commercial Property">Commercial Property</option>
                          <option value="Surveyed Land">Surveyed Land</option>
                          <option value="Farmland">Farmland</option>
                          <option value="Student Hostel">Student Hostel</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-white/70 font-semibold mb-1">
                        Estimated Budget Range
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ₦15M - ₦50M or £40,000 / $50,000"
                        value={leadForm.budget}
                        onChange={(e) => setLeadForm({ ...leadForm, budget: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-[#222630] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-white/70 font-semibold mb-1">
                        Specific Requests or Timeline
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g., Buying from UK, interested in residential duplex inspection or building quote."
                        value={leadForm.message}
                        onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-[#222630] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={leadSubmitting || !leadForm.name || !leadForm.phone}
                      className="w-full py-3 bg-[#8B6347] hover:bg-[#9E7353] disabled:opacity-50 text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      {leadSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Dropping Lead &amp; Syncing...</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>Drop Lead to Ola Continental</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
