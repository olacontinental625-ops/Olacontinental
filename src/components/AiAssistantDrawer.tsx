import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Phone, MessageSquare, ShieldCheck, Building2, User, Bot, Loader2, CheckCircle2, UserCheck, ArrowRight } from 'lucide-react';
import { ChatMessage, ContactInquiry } from '../types';
import { createFirestoreLead } from '../lib/firebase';

interface AiAssistantDrawerProps {
  onClose: () => void;
  onOpenViewing: () => void;
  initialInquiry?: ContactInquiry | null;
}

const DEFAULT_SUGGESTIONS = [
  'Tell me about student hostels in Adenike',
  'What is available behind LAUTECH Teaching Hospital?',
  'Do you have commercial property in Mushin Lagos?',
  'Explain the 5% agency and legal fee breakdown',
  'How does the Tuesday inspection day work?',
  'What is your title verification process in Oyo State?'
];

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  onClose,
  onOpenViewing,
  initialInquiry,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'lead'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialInquiry) {
      return [
        {
          id: 'contact-init',
          sender: 'assistant',
          text: `E kaabo & greetings ${initialInquiry.name}! 👋 I am Ola AI.\n\nI have received your inquiry from the Contact page regarding "${initialInquiry.serviceType}" in the ${initialInquiry.corridor} corridor (Budget: ${initialInquiry.budget}).\n\nYour message has been transmitted directly to Engineer Samuel Aleji. While he reviews your request, how can I assist you with site details, structural planning, or Tuesday inspection schedules right now?`,
          timestamp: 'Just now',
        },
      ];
    }
    return [
      {
        id: 'init-1',
        sender: 'assistant',
        text: 'E kaabo & warm greetings! 😊 I am Ola AI, your personal real estate consultant at Ola Continental Properties & Associates.\n\nWhether you are exploring high-yield LAUTECH student hostels in Adenike, executive duplexes behind LAUTECH Teaching Hospital, commercial investments in Mushin Lagos, or fertile farmland in Odo-Oba, I am here to assist your plans with total transparency and honesty.\n\nWhat kind of property or corridor would you like to explore today? You can also tap "Drop Lead / Fast Inquiry" above to request a priority callback from Engineer Samuel Aleji.',
        timestamp: 'Just now',
      },
    ];
  });
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lead Collection State
  const [leadForm, setLeadForm] = useState({
    name: initialInquiry?.name || '',
    phone: initialInquiry?.phone || '',
    email: initialInquiry?.email || '',
    propertyType: initialInquiry?.serviceType || 'Student Hostel',
    corridor: initialInquiry?.corridor || 'Adenike (LAUTECH)',
    budget: initialInquiry?.budget || '₦40M - ₦80M',
    message: initialInquiry?.message || '',
  });
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);

  useEffect(() => {
    if (initialInquiry) {
      setMessages([
        {
          id: `contact-init-${Date.now()}`,
          sender: 'assistant',
          text: `E kaabo & greetings ${initialInquiry.name}! 👋 I am Ola AI.\n\nI have received your inquiry from the Contact page regarding "${initialInquiry.serviceType}" in the ${initialInquiry.corridor} corridor (Budget: ${initialInquiry.budget}).\n\nYour message has been transmitted directly to Engineer Samuel Aleji. While he reviews your request, how can I assist you with site details, structural planning, or Tuesday inspection schedules right now?`,
          timestamp: 'Just now',
        },
      ]);
      setLeadForm({
        name: initialInquiry.name || '',
        phone: initialInquiry.phone || '',
        email: initialInquiry.email || '',
        propertyType: initialInquiry.serviceType || 'Student Hostel',
        corridor: initialInquiry.corridor || 'Adenike (LAUTECH)',
        budget: initialInquiry.budget || '₦40M - ₦80M',
        message: initialInquiry.message || '',
      });
    }
  }, [initialInquiry]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
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
          history: messages.slice(-6).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      const data = await res.json();
      const replyText = data.reply || data.fallback || 'Please contact Engineer Samuel Aleji directly on WhatsApp at +234 803 384 8107.';

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
          text: 'Thank you for your inquiry. To speak directly with our Founder & Principal Consultant Engineer Samuel Aleji, please call or WhatsApp +234 803 384 8107, or visit our office at No. 2, Olukoko Street behind LAUTECH Teaching Hospital.',
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
      // 1. Save directly to Cloud Firestore leads collection
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

      // 2. Save to server API (which triggers SendPulse CRM / Address book sync!)
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadForm,
          source: 'Ola AI Assistant',
        }),
      });
      const data = await res.json();

      setLeadSuccess(true);

      // Append confirmation message in chat thread
      const systemConfirmMsg: ChatMessage = {
        id: `lead-confirm-${Date.now()}`,
        sender: 'assistant',
        text: `✅ **Lead Successfully Dropped & Dispatched!**\n\nThank you, **${leadForm.name}**. Your inquiry regarding **${leadForm.propertyType}** in **${leadForm.corridor}** has been securely forwarded to Alhaji Olaoluwa and our senior surveyor desk (and synchronized to our SendPulse CRM).\n\nOur team will contact you directly via WhatsApp or phone at **${leadForm.phone}**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, systemConfirmMsg]);

      setTimeout(() => {
        setLeadSuccess(false);
        setActiveTab('chat');
        setLeadForm({
          name: '',
          phone: '',
          email: '',
          propertyType: 'Student Hostel',
          corridor: 'Adenike (LAUTECH)',
          budget: '₦40M - ₦80M',
          message: '',
        });
      }, 1800);
    } catch (err) {
      console.error('Failed to submit lead:', err);
    } finally {
      setLeadSubmitting(false);
    }
  };

  const currentWhatsappQuery = encodeURIComponent(
    `Hello Alhaji Olaoluwa, I was consulting with your Ola AI Concierge regarding Ola Continental Properties in Ogbomoso/Lagos and would like to speak directly with you.`
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
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                <span>Verified Property Intelligence · Online</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Chat Concierge vs Drop Lead */}
        <div className="flex border-b border-white/10 bg-[#0e0e14] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2.5 px-4 text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${
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
            className={`flex-1 py-2.5 px-4 text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'lead'
                ? 'border-[#C5A880] text-[#F3E8D0] bg-white/[0.03]'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Drop Lead & Inquiry</span>
          </button>
        </div>

        {/* Notice Strip */}
        <div className="px-4 py-2 bg-[#222630] border-b border-slate-700 text-[11px] text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4ade80] shrink-0" />
            <span>Direct link to Engr. Samuel Aleji & Survey Desk</span>
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
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {initialInquiry && (
                <div className="p-3 bg-[#0c2a63] border border-[#38bdf8]/40 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between text-[#38bdf8] font-semibold text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Connected Contact Form Inquiry</span>
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
                  <span>Ola AI is checking property ledgers...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Fast-Lead CTA Strip */}
            <div className="px-3 py-2 bg-[#0e0e14] border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-[11px] text-white/70">Want an executive callback?</span>
              <button
                onClick={() => setActiveTab('lead')}
                className="px-2.5 py-1 bg-[#8B6347] hover:bg-[#9E7353] text-white font-semibold rounded text-[11px] flex items-center gap-1 transition-colors"
              >
                <span>Drop Your Lead</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="p-3 bg-[#1e222b] border-t border-slate-700">
              <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 mb-2">
                Suggested Enquiries
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
                  placeholder="Ask about properties, student hostels, survey..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={loading}
                  className="flex-1 px-3 py-2.5 text-xs text-white bg-[#222630] border border-slate-700 rounded-xl focus:outline-none focus:border-[#38bdf8] transition-colors placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || loading}
                  className="p-2.5 text-white bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 rounded-xl transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-2 flex items-center justify-between text-[11px] text-[#FAF4E8]/60">
                <span>Principal Broker: Alhaji Olaoluwa</span>
                <button
                  onClick={() => {
                    onClose();
                    onOpenViewing();
                  }}
                  className="text-[#C5A880] hover:underline"
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
              <h4 className="font-display text-base font-bold text-[#FAF4E8]">Drop Your Lead & Property Inquiry</h4>
              <p className="text-[11px] text-white/70 mt-1">
                Provide your details below. Ola AI immediately logs your request into our secure database and forwards it to Alhaji Olaoluwa and SendPulse CRM for direct follow-up.
              </p>
            </div>

            {leadSuccess ? (
              <div className="p-6 bg-[#25D366]/10 border border-[#25D366]/40 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-[#25D366] mx-auto animate-bounce" />
                <h5 className="font-display text-sm font-bold text-white">Lead Successfully Dropped!</h5>
                <p className="text-[11px] text-white/80">
                  Your requirements have been synced. Alhaji Olaoluwa will reach you directly.
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
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
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
                      <option value="Adenike (LAUTECH)">Adenike (LAUTECH)</option>
                      <option value="Behind LAUTECH Hospital">Behind LAUTECH Hospital</option>
                      <option value="Under G High-Growth">Under G Zone</option>
                      <option value="Mushin Commercial (Lagos)">Mushin (Lagos)</option>
                      <option value="Aroje Industrial Belt">Aroje Expressway</option>
                      <option value="Odo-Oba Farmland">Odo-Oba Farmland</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-white/70 font-semibold mb-1">
                      Property Category
                    </label>
                    <select
                      value={leadForm.propertyType}
                      onChange={(e) => setLeadForm({ ...leadForm, propertyType: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#222630] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                    >
                      <option value="Student Hostel">Student Hostel</option>
                      <option value="Executive Duplex">Executive Duplex</option>
                      <option value="Commercial Property">Commercial Property</option>
                      <option value="Surveyed Land">Surveyed Land</option>
                      <option value="Farmland">Farmland</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-white/70 font-semibold mb-1">
                    Estimated Budget Range
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₦15M - ₦50M or $30,000"
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
                    placeholder="e.g., Interested in inspecting Tuesday or require verified rent roll for student hostel."
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
                      <span>Dropping Lead & Syncing...</span>
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
      </div>
    </div>
  );
};
