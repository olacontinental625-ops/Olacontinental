import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Globe,
  Building2,
  HardHat,
  ArrowRight,
  Lock,
  Loader2,
  LogOut,
  CopyCheck,
} from 'lucide-react';
import { CustomerProfile, PageType } from '../types';
import { OlaLogoMark } from './OlaLogoMark';
import { createFirestoreCustomer } from '../lib/firebase';

interface CustomerAuthSectionProps {
  customerProfile: CustomerProfile | null;
  onCustomerRegistered: (customer: CustomerProfile) => void;
  onCustomerSignOut: () => void;
  onOpenChat: () => void;
  onNavigate: (page: PageType) => void;
}

export const CustomerAuthSection: React.FC<CustomerAuthSectionProps> = ({
  customerProfile,
  onCustomerRegistered,
  onCustomerSignOut,
  onOpenChat,
  onNavigate,
}) => {
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [fullName, setFullName] = useState(customerProfile?.fullName || '');
  const [phone, setPhone] = useState(customerProfile?.phone || '');
  const [email, setEmail] = useState(customerProfile?.email || '');
  const [whatsapp, setWhatsapp] = useState(customerProfile?.whatsapp || '');
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (sameAsPhone) {
      setWhatsapp(val);
    }
  };

  const handleToggleSameAsPhone = () => {
    const next = !sameAsPhone;
    setSameAsPhone(next);
    if (next && phone.trim()) {
      setWhatsapp(phone);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();
    const cleanWhatsapp = whatsapp.trim();

    if (cleanName.length < 2) {
      setErrorMsg('Please enter your Full Name (minimum 2 characters).');
      return;
    }
    if (cleanPhone.length < 5) {
      setErrorMsg('Please enter a valid Phone Number.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('Please enter a valid Email Address.');
      return;
    }
    if (cleanWhatsapp.length < 5) {
      setErrorMsg('Please enter your WhatsApp Number (required, not optional).');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          whatsapp: cleanWhatsapp,
          source: 'Customer Sign Up Page',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.customer) {
        throw new Error(data.error || 'Could not complete sign up. Please check your details.');
      }

      const savedCustomer: CustomerProfile = data.customer;

      // Sync customer record to Cloud Firestore cleanly
      await createFirestoreCustomer(savedCustomer).catch((err) => {
        console.warn('Firestore customer sync warning:', err);
      });

      onCustomerRegistered(savedCustomer);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed. Please review your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturningLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = loginEmail.trim();
    const cleanPhone = loginPhone.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('Please enter the Email Address you registered with.');
      return;
    }
    if (cleanPhone.length < 5) {
      setErrorMsg('Please enter the Phone Number you registered with.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/customers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          phone: cleanPhone,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.customer) {
        throw new Error(data.error || 'Could not find a matching profile. Please complete New Customer Sign Up.');
      }
      onCustomerRegistered(data.customer);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not sign in. Please verify your Email and Phone Number.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-12 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Portal Switcher: Customer Sign Up vs Owner Admin Login */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 bg-[#0b1e42] border border-[#1d4ed8]/40 rounded-2xl p-3 sm:px-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('customer-login')}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#b91c1c] text-white shadow cursor-pointer"
          >
            Customer Sign Up / Login
          </button>
          <button
            type="button"
            onClick={() => onNavigate('admin-login')}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-[#bfdbfe] hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-[#F5C451]" />
            <span>Owner Admin Login</span>
          </button>
        </div>

        <div className="text-[11px] text-[#93c5fd] flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>Serving Clients Across Nigeria &amp; Worldwide Diaspora</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Branded Column with Ola Continental Logo */}
        <div className="lg:col-span-5 bg-[#0b1e42] border border-[#1d4ed8]/40 rounded-2xl overflow-hidden shadow-2xl">
          <div className="h-2 w-full flex">
            <div className="w-1/2 bg-[#b91c1c]" />
            <div className="w-1/2 bg-[#172554]" />
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <OlaLogoMark variant="hero" />
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase text-[#F5C451]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Client Consultation &amp; Ask Ola AI Access</span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight">
                Sign Up or Log In to Unlock Personalized Assistance
              </h1>

              <p className="text-xs sm:text-sm text-[#bfdbfe] leading-relaxed">
                Whether you are based in <strong className="text-white">Nigeria</strong> or living{' '}
                <strong className="text-white">outside Nigeria in the diaspora</strong> (UK, USA, Canada, Europe, or elsewhere), completing this quick registration saves your verified contact details so{' '}
                <strong className="text-white">Ask Ola AI</strong> and Engineer Samuel Aleji can answer every question you need across homes, duplexes, commercial buildings, titled land, construction works, farmland, and student properties.
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-[#1d4ed8]/30 text-xs">
              <div className="flex items-start gap-2.5 text-[#e0f2fe]">
                <ShieldCheck className="w-4 h-4 text-[#4ade80] shrink-0 mt-0.5" />
                <span>All 4 details are mandatory on Sign Up so our team can respond promptly with accurate schedules and deeds.</span>
              </div>
              <div className="flex items-start gap-2.5 text-[#e0f2fe]">
                <Building2 className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
                <span>Covers residential homes, Mushin Lagos commercial holdings, titled Ogbomoso estates, and arable farmland.</span>
              </div>
              <div className="flex items-start gap-2.5 text-[#e0f2fe]">
                <HardHat className="w-4 h-4 text-[#F5C451] shrink-0 mt-0.5" />
                <span>Direct follow-up available via Engineer Samuel Aleji (+234 803 384 8107).</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sign-Up / Sign-In Form OR Active Signed-In Card */}
        <div className="lg:col-span-7 bg-[#0b1e42] border border-[#1d4ed8]/40 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {customerProfile ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#1d4ed8]/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#16a34a]/20 border border-[#4ade80]/50 flex items-center justify-center text-[#4ade80]">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4ade80]">
                      Customer Access Active · Ask Ola AI Unlocked
                    </span>
                    <h2 className="font-display text-2xl font-bold text-white">
                      Welcome, {customerProfile.fullName}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onCustomerSignOut}
                  className="px-3 py-1.5 text-xs font-medium text-[#bfdbfe] hover:text-white bg-[#07132b] border border-[#1d4ed8]/40 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out / Switch Account</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#07132b] border border-[#1d4ed8]/30 rounded-xl space-y-1">
                  <div className="text-[#93c5fd] font-semibold uppercase tracking-wider text-[10px]">Full Name</div>
                  <div className="text-white font-semibold text-sm">{customerProfile.fullName}</div>
                </div>
                <div className="p-4 bg-[#07132b] border border-[#1d4ed8]/30 rounded-xl space-y-1">
                  <div className="text-[#93c5fd] font-semibold uppercase tracking-wider text-[10px]">Email Address</div>
                  <div className="text-white font-semibold text-sm break-all">{customerProfile.email}</div>
                </div>
                <div className="p-4 bg-[#07132b] border border-[#1d4ed8]/30 rounded-xl space-y-1">
                  <div className="text-[#93c5fd] font-semibold uppercase tracking-wider text-[10px]">Phone Number</div>
                  <div className="font-data text-[#38bdf8] font-semibold text-sm">{customerProfile.phone}</div>
                </div>
                <div className="p-4 bg-[#07132b] border border-[#1d4ed8]/30 rounded-xl space-y-1">
                  <div className="text-[#93c5fd] font-semibold uppercase tracking-wider text-[10px]">WhatsApp Number</div>
                  <div className="font-data text-[#4ade80] font-semibold text-sm">{customerProfile.whatsapp}</div>
                </div>
              </div>

              <div className="p-4 bg-[#172554]/60 border border-[#38bdf8]/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-xs text-[#e0f2fe]">
                  <strong className="text-white block mb-0.5">Your Ask Ola AI Concierge is Ready</strong>
                  Ask about residential duplexes, diaspora safe buying, commercial Mushin properties, construction estimates, or verified land.
                </div>
                <button
                  type="button"
                  onClick={onOpenChat}
                  className="px-5 py-3 text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl transition-all shadow-lg flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Open Ask Ola AI</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('properties')}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-[#07132b] hover:bg-[#1d4ed8]/30 border border-[#1d4ed8]/40 rounded-xl cursor-pointer"
                >
                  Browse Properties →
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('constructions')}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-[#07132b] hover:bg-[#1d4ed8]/30 border border-[#1d4ed8]/40 rounded-xl cursor-pointer"
                >
                  Explore Constructions →
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Header + Logo + SignUp/SignIn Switch */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1d4ed8]/30">
                <div>
                  <h2 className="font-display text-2xl font-bold text-white">
                    {authMode === 'signup' ? 'Customer Sign-Up Form' : 'Returning Customer Login'}
                  </h2>
                  <p className="text-xs text-[#bfdbfe] mt-1">
                    {authMode === 'signup' ? (
                      <>
                        All fields marked with <span className="text-[#f87171] font-bold">*</span> are strictly required (non-optional) to unlock Ask Ola AI.
                      </>
                    ) : (
                      'Already registered with Ola Continental? Enter your registered Email Address and Phone Number to restore your session.'
                    )}
                  </p>
                </div>
                <OlaLogoMark variant="navbar" />
              </div>

              {/* Mode Switch Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#07132b] border border-[#1d4ed8]/40 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setErrorMsg('');
                  }}
                  className={`py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-[#b91c1c] text-white shadow'
                      : 'text-[#bfdbfe] hover:text-white'
                  }`}
                >
                  New Customer Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg('');
                  }}
                  className={`py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-[#2563eb] text-white shadow'
                      : 'text-[#bfdbfe] hover:text-white'
                  }`}
                >
                  Returning Customer Login
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-200">
                  {errorMsg}
                </div>
              )}

              {authMode === 'signup' ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">
                      Full Name <span className="text-[#f87171]">* (Required)</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#93c5fd] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        minLength={2}
                        maxLength={120}
                        placeholder="e.g., Adewale Johnson or Mrs. Folake Adeyemi"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-sm bg-[#07132b] border border-[#1d4ed8]/50 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-[#38bdf8]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-white mb-1.5">
                        Phone Number <span className="text-[#f87171]">* (Required)</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-[#93c5fd] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          minLength={5}
                          maxLength={40}
                          placeholder="+234 803 ... or +44 7... / +1 ..."
                          value={phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 text-sm bg-[#07132b] border border-[#1d4ed8]/50 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-[#38bdf8]"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-white">
                          WhatsApp Number <span className="text-[#f87171]">* (Required)</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleToggleSameAsPhone}
                          className="text-[11px] text-[#38bdf8] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <CopyCheck className="w-3 h-3" />
                          <span>{sameAsPhone ? 'Synced with Phone' : 'Same as Phone'}</span>
                        </button>
                      </div>
                      <div className="relative">
                        <MessageCircle className="w-4 h-4 text-[#4ade80] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          minLength={5}
                          maxLength={40}
                          placeholder="WhatsApp number with country code"
                          value={whatsapp}
                          onChange={(e) => {
                            setSameAsPhone(false);
                            setWhatsapp(e.target.value);
                          }}
                          className="w-full pl-10 pr-4 py-3 text-sm bg-[#07132b] border border-[#1d4ed8]/50 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-[#4ade80]"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">
                      Email Address <span className="text-[#f87171]">* (Required)</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#93c5fd] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        maxLength={150}
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-sm bg-[#07132b] border border-[#1d4ed8]/50 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-[#38bdf8]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-6 text-sm font-semibold text-white bg-[#b91c1c] hover:bg-[#991b1b] disabled:opacity-60 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Details &amp; Unlocking Ola AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#F5C451]" />
                        <span>Complete Sign Up &amp; Unlock Ask Ola AI</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleReturningLogin} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">
                      Registered Email Address <span className="text-[#f87171]">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#93c5fd] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        maxLength={150}
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-sm bg-[#07132b] border border-[#1d4ed8]/50 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-[#38bdf8]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white mb-1.5">
                      Registered Phone Number <span className="text-[#f87171]">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#93c5fd] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        minLength={5}
                        maxLength={40}
                        placeholder="+234 803 ... or your registered phone"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 text-sm bg-[#07132b] border border-[#1d4ed8]/50 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-[#38bdf8]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-6 text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Your Profile...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
                        <span>Sign In &amp; Restore Ask Ola AI Access</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
