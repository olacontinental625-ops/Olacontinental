import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Building2,
  Lock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Printer,
  Phone,
  ArrowRight,
  Sparkles,
  HelpCircle,
  FileText,
  DollarSign,
  Briefcase,
  Layers,
  ChevronDown,
  ExternalLink,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { PaymentRecord } from '../types';
import { createFirestorePayment } from '../lib/firebase';

interface PaymentLandingPageProps {
  onOpenChat: () => void;
  onNavigateHome: () => void;
}

interface ServicePreset {
  id: string;
  title: string;
  tag: string;
  amount: number;
  description: string;
  features: string[];
}

const SERVICE_PRESETS: ServicePreset[] = [
  {
    id: 'inspection',
    title: 'Tuesday Dedicated Site Walkthrough & GPS Verification',
    tag: 'Field Inspection',
    amount: 25000,
    description: 'Covers physical site tour, GPS total-station boundary check, and transport across LAUTECH or Ogbomoso corridors.',
    features: [
      'Accompanied on-site tour with senior surveyor',
      'Instant coordinate capture & beacon confirmation',
      'Comprehensive inspection report with drone footage',
    ],
  },
  {
    id: 'survey-charting',
    title: 'Cadastral Survey & Ministry of Lands Charting Deposit',
    tag: 'Legal Verification',
    amount: 250000,
    description: 'Official search and charting at the Oyo State Surveyor General’s Office to certify acquisition freedom.',
    features: [
      'Direct filing at Oyo State Ministry of Lands',
      'Charted beacon coordinates search',
      'Official letter of due diligence clearance',
    ],
  },
  {
    id: 'architectural-retainer',
    title: 'Architectural & Structural Engineering Retainer',
    tag: 'Engineering Division',
    amount: 350000,
    description: 'Initial retainer for architectural drawings, 3D photorealistic renderings, structural engineering calculations, and soil test.',
    features: [
      'Comprehensive architectural drafting & floor plans',
      'Structural calculations certified by Engr. Samuel Aleji',
      'Bill of Quantities (BOQ) materials cost breakdown',
    ],
  },
  {
    id: 'escrow-deposit',
    title: 'Property Holding Commitment / Escrow Deposit',
    tag: 'Escrow Guarantee',
    amount: 500000,
    description: 'Locks and reserves selected property exclusively for 14 business days while legal documents and survey are finalized.',
    features: [
      'Halts all third-party negotiations immediately',
      'Escrow protection until deeds are signed',
      'Fully credited against total purchase price',
    ],
  },
  {
    id: 'custom',
    title: 'Custom Invoiced Retainer or Construction Milestone',
    tag: 'Custom Payment',
    amount: 0,
    description: 'Enter your tailored milestone amount or invoice number provided by Engineer Samuel Aleji.',
    features: [
      'Custom milestone billing for ongoing constructions',
      'Supports diaspora international card settlements',
      'Instant automated invoice matching',
    ],
  },
];

export const PaymentLandingPage: React.FC<PaymentLandingPageProps> = ({
  onOpenChat,
  onNavigateHome,
}) => {
  // Service selection
  const [selectedServiceId, setSelectedServiceId] = useState<string>('inspection');
  const [customAmount, setCustomAmount] = useState<string>('150000');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');

  // Client Details
  const [clientName, setClientName] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [projectTitle, setProjectTitle] = useState<string>('Adenike Student Hostel Project');
  const [clientNotes, setClientNotes] = useState<string>('');

  // Payment settings & methods
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'bank_transfer'>('paystack');
  const [paystackKey, setPaystackKey] = useState<string>('');
  const [showKeyConfig, setShowKeyConfig] = useState<boolean>(false);
  const [copiedBank, setCopiedBank] = useState<boolean>(false);

  // Status & processing
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<PaymentRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [bankProofSubmitted, setBankProofSubmitted] = useState<boolean>(false);

  // Load configured Paystack Public Key
  useEffect(() => {
    const savedKey = localStorage.getItem('ola_paystack_public_key');
    if (savedKey) {
      setPaystackKey(savedKey);
    } else {
      // Fetch server configured key or fallback to a standard test key
      fetch('/api/paystack/config')
        .then((r) => r.json())
        .then((data) => {
          if (data.publicKey) {
            setPaystackKey(data.publicKey);
          } else {
            setPaystackKey('pk_test_sample_ola_continental_key');
          }
        })
        .catch(() => {
          setPaystackKey('pk_test_sample_ola_continental_key');
        });
    }
  }, []);

  const handleSaveCustomKey = (key: string) => {
    const trimmed = key.trim();
    setPaystackKey(trimmed);
    localStorage.setItem('ola_paystack_public_key', trimmed);
    setShowKeyConfig(false);
  };

  const selectedPreset = SERVICE_PRESETS.find((p) => p.id === selectedServiceId) || SERVICE_PRESETS[0];

  const currentAmount = selectedServiceId === 'custom' 
    ? (parseFloat(customAmount.replace(/[^0-9.]/g, '')) || 0)
    : selectedPreset.amount;

  const formattedAmount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(currentAmount);

  // Handle Paystack Popup checkout
  const handlePaystackCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim()) {
      setErrorMessage('Please fill in your Full Name, Email Address, and Phone / WhatsApp Number.');
      return;
    }

    if (currentAmount <= 0) {
      setErrorMessage('Please specify a valid payment amount greater than ₦0.');
      return;
    }

    const paystackPop = (window as any).PaystackPop;
    if (!paystackPop) {
      setErrorMessage('Paystack Inline gateway is loading. If it persists, please use Direct Bank Transfer or refresh the page.');
      return;
    }

    setIsProcessing(true);

    const generatedRef = `OLA-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const effectiveKey = paystackKey || 'pk_test_sample_ola_continental_key';

    try {
      const handler = paystackPop.setup({
        key: effectiveKey,
        email: clientEmail.trim(),
        amount: Math.round(currentAmount * 100), // Paystack requires amount in Kobo
        currency: 'NGN',
        ref: generatedRef,
        metadata: {
          custom_fields: [
            { display_name: 'Client Name', variable_name: 'client_name', value: clientName },
            { display_name: 'Phone Number', variable_name: 'phone_number', value: clientPhone },
            { display_name: 'Service', variable_name: 'service', value: selectedPreset.title },
            { display_name: 'Project / Property', variable_name: 'project_title', value: projectTitle },
            { display_name: 'Invoice Number', variable_name: 'invoice_number', value: invoiceNumber || 'N/A' },
          ],
        },
        callback: async (response: any) => {
          setIsProcessing(false);
          const verifiedRecord: PaymentRecord = {
            reference: response.reference || generatedRef,
            amount: currentAmount,
            currency: 'NGN',
            clientName,
            clientEmail,
            clientPhone,
            serviceCategory: selectedPreset.title,
            propertyOrProjectTitle: projectTitle,
            paymentMethod: 'paystack',
            status: 'success',
            invoiceNumber: invoiceNumber || undefined,
            notes: clientNotes || undefined,
            createdAt: new Date().toISOString(),
          };

          // Record payment in Firestore
          createFirestorePayment(verifiedRecord).catch((err) =>
            console.warn('Firestore payment record failed:', err)
          );

          // Record payment in Server API
          fetch('/api/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(verifiedRecord),
          }).catch((err) => console.warn('API payment recording warning:', err));

          setPaymentSuccess(verifiedRecord);
        },
        onClose: () => {
          setIsProcessing(false);
        },
      });

      handler.openIframe();
    } catch (err: any) {
      setIsProcessing(false);
      console.error('Paystack error:', err);
      setErrorMessage(`Paystack could not open: ${err.message || 'Check your Paystack Public Key'}. You can also pay via Direct Corporate Bank Transfer below.`);
    }
  };

  // Handle Bank Transfer confirmation submission
  const handleBankTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      setErrorMessage('Please provide your name and phone number so we can verify your transfer.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    const bankRef = `TRANSFER-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const transferRecord: PaymentRecord = {
      reference: bankRef,
      amount: currentAmount,
      currency: 'NGN',
      clientName,
      clientEmail: clientEmail || 'client@olacontinental.com',
      clientPhone,
      serviceCategory: selectedPreset.title,
      propertyOrProjectTitle: projectTitle,
      paymentMethod: 'bank_transfer',
      status: 'pending',
      invoiceNumber: invoiceNumber || undefined,
      notes: `Bank Transfer logged. Client notes: ${clientNotes || 'None'}`,
      createdAt: new Date().toISOString(),
    };

    try {
      await createFirestorePayment(transferRecord).catch((e) => console.warn(e));
      await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferRecord),
      });

      setBankProofSubmitted(true);
      setPaymentSuccess(transferRecord);
    } catch (err) {
      console.error('Bank transfer log error:', err);
      setErrorMessage('Could not record transfer. Please notify Engineer Samuel Aleji on WhatsApp at +234 803 384 8107 directly.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('3189204012');
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2500);
  };

  const whatsappReceiptUrl = paymentSuccess
    ? `https://wa.me/2348033848107?text=${encodeURIComponent(
        `Hello Engineer Samuel Aleji, I have made a retainer payment to Ola Continental:\n\n• Ref: ${paymentSuccess.reference}\n• Client: ${paymentSuccess.clientName}\n• Amount: ₦${paymentSuccess.amount.toLocaleString()}\n• Service: ${paymentSuccess.serviceCategory}\n• Method: ${paymentSuccess.paymentMethod.toUpperCase()}\n\nPlease verify and provide receipt confirmation.`
      )}`
    : `https://wa.me/2348033848107`;

  return (
    <div className="min-h-screen bg-[#07132b] text-[#f0f9ff] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-[#1d4ed8]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#38bdf8]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-8 mb-8 border-b border-[#1d4ed8]/30">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-xs font-semibold text-[#bfdbfe] hover:text-[#38bdf8] transition-colors cursor-pointer"
          >
            <span>← Back to Ola Continental Homepage</span>
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowKeyConfig(!showKeyConfig)}
              className="text-xs text-[#93c5fd] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer bg-[#0b1e42] px-3 py-1.5 rounded-lg border border-[#1d4ed8]/40"
              title="Configure Paystack Public Key"
            >
              <Settings className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>Paystack Key Config</span>
            </button>
            <button
              onClick={onOpenChat}
              className="text-xs text-[#38bdf8] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Ola AI</span>
            </button>
          </div>
        </div>

        {/* Security Warning & Guidance Banner */}
        <div className="mb-8 p-4 sm:p-5 bg-[#0b1e42] border border-[#38bdf8]/40 rounded-2xl flex items-start gap-3 shadow-lg">
          <ShieldCheck className="w-6 h-6 text-[#25D366] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <h4 className="font-semibold text-white mb-0.5">
              Secure Paystack Payment Gateway & Direct Retainer Portal
            </h4>
            <p className="text-[#bfdbfe] text-xs leading-relaxed">
              <strong className="text-white">Security Notice:</strong> Never share your Paystack login password or secret key. All transactions are initialized client-side using standard Paystack Public Keys (<code className="bg-[#07132b] px-1.5 py-0.5 rounded text-[#38bdf8] font-mono">pk_live_...</code> or <code className="bg-[#07132b] px-1.5 py-0.5 rounded text-[#38bdf8] font-mono">pk_test_...</code>) with 256-bit bank encryption.
            </p>
          </div>
        </div>

        {/* Key Config Collapsible Drawer */}
        {showKeyConfig && (
          <div className="mb-8 p-6 bg-[#0c2a63] border border-[#38bdf8]/60 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#38bdf8]" />
                <span>Paystack Public Key Configuration</span>
              </h4>
              <button
                onClick={() => setShowKeyConfig(false)}
                className="text-xs text-[#bfdbfe] hover:text-white"
              >
                Close ✕
              </button>
            </div>
            <p className="text-xs text-[#bfdbfe] mb-3">
              To connect your own Paystack account, copy your <strong>Public Key</strong> from your Paystack Dashboard (Settings → API Keys & Webhooks → <em>Public Key</em>). It begins with <code>pk_live_</code> or <code>pk_test_</code>. <strong>Do NOT enter your secret key or password.</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="e.g. pk_live_xxxxxxxxxxxxxxxxxxxx or pk_test_xxxxxxxxxxxxxxxxxxxx"
                defaultValue={paystackKey}
                id="customPaystackKeyInput"
                className="flex-1 px-3.5 py-2.5 bg-[#07132b] border border-[#1d4ed8] rounded-lg text-white font-mono text-xs focus:outline-none focus:border-[#38bdf8]"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('customPaystackKeyInput') as HTMLInputElement;
                  if (input) handleSaveCustomKey(input.value);
                }}
                className="px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Save Public Key
              </button>
            </div>
            <div className="mt-2 text-[11px] text-[#93c5fd]">
              Active Key: <code className="text-[#38bdf8] font-mono">{paystackKey ? `${paystackKey.substring(0, 14)}...` : 'Using system default'}</code>
            </div>
          </div>
        )}

        {/* Success / Printable Receipt Modal View */}
        {paymentSuccess ? (
          <div className="bg-[#0b1e42] border border-[#38bdf8]/60 rounded-3xl p-6 sm:p-10 shadow-2xl text-center max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 bg-[#25D366]/20 border border-[#25D366]/40 rounded-full flex items-center justify-center mx-auto text-[#25D366]">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div>
              <span className="text-[11px] uppercase font-bold tracking-widest text-[#38bdf8] bg-[#1d4ed8]/20 px-3 py-1 rounded-full border border-[#38bdf8]/30">
                {paymentSuccess.paymentMethod === 'paystack' ? 'Payment Confirmed' : 'Transfer Logged'}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-3">
                {paymentSuccess.paymentMethod === 'paystack' ? 'Official Payment Receipt' : 'Bank Transfer Pending Verification'}
              </h2>
              <p className="text-xs text-[#bfdbfe] mt-1">
                Ola Continental Properties & Building Construction (CAC BN: 3189204)
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-[#07132b] border border-[#1d4ed8]/50 rounded-2xl p-6 text-left space-y-3 font-mono text-xs">
              <div className="flex justify-between pb-2 border-b border-white/10">
                <span className="text-[#93c5fd]">Transaction Reference:</span>
                <span className="text-white font-bold">{paymentSuccess.reference}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-white/10">
                <span className="text-[#93c5fd]">Client Name:</span>
                <span className="text-white">{paymentSuccess.clientName}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-white/10">
                <span className="text-[#93c5fd]">Amount Paid:</span>
                <span className="text-[#38bdf8] font-bold text-sm">
                  ₦{paymentSuccess.amount.toLocaleString()} NGN
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-white/10">
                <span className="text-[#93c5fd]">Service / Purpose:</span>
                <span className="text-white">{paymentSuccess.serviceCategory}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-white/10">
                <span className="text-[#93c5fd]">Project Title:</span>
                <span className="text-white">{paymentSuccess.propertyOrProjectTitle || 'General Client Retainer'}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-white/10">
                <span className="text-[#93c5fd]">Date / Timestamp:</span>
                <span className="text-white">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#93c5fd]">Payment Channel:</span>
                <span className="text-[#25D366] font-bold uppercase">{paymentSuccess.paymentMethod}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <a
                href={whatsappReceiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-[#25D366] hover:bg-[#20b859] text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg"
              >
                <Phone className="w-4 h-4" />
                <span>Confirm on WhatsApp with Engr. Samuel Aleji</span>
              </a>

              <button
                onClick={() => window.print()}
                className="px-5 py-3 bg-[#1d4ed8] hover:bg-[#0284c7] text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>

              <button
                onClick={() => {
                  setPaymentSuccess(null);
                  setBankProofSubmitted(false);
                }}
                className="px-5 py-3 bg-[#07132b] hover:bg-white/10 border border-white/20 text-[#bfdbfe] text-xs font-semibold rounded-xl transition-all"
              >
                Make Another Payment
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (7 cols): Service Presets & Retainer Selection */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#38bdf8] mb-2">
                  <CreditCard className="w-4 h-4" />
                  <span>CLIENT RETAINER & SECURE SETTLEMENT</span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Ola Continental Payment Portal
                </h1>
                <p className="mt-2 text-sm text-[#bfdbfe] leading-relaxed">
                  Select a certified civil engineering service or custom milestone retainer. Instant receipts are automatically logged with our principal executive desk.
                </p>
              </div>

              {/* Service Cards Radio Grid */}
              <div className="space-y-3.5">
                {SERVICE_PRESETS.map((preset) => {
                  const isSelected = selectedServiceId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedServiceId(preset.id)}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0b1e42] border-[#38bdf8] shadow-xl shadow-[#1d4ed8]/20 ring-1 ring-[#38bdf8]'
                          : 'bg-[#07132b]/80 border-[#1d4ed8]/30 hover:border-[#38bdf8]/50 hover:bg-[#0b1e42]/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold tracking-wider uppercase text-[#38bdf8] bg-[#1d4ed8]/20 px-2 py-0.5 rounded border border-[#38bdf8]/30">
                              {preset.tag}
                            </span>
                            {preset.id === 'inspection' && (
                              <span className="text-[10px] font-semibold text-[#4ade80] bg-[#4ade80]/10 px-2 py-0.5 rounded">
                                Highly Requested
                              </span>
                            )}
                          </div>
                          <h3 className="font-display text-base sm:text-lg font-bold text-white">
                            {preset.title}
                          </h3>
                          <p className="text-xs text-[#bfdbfe] mt-1 leading-relaxed">
                            {preset.description}
                          </p>

                          <ul className="mt-3 space-y-1 text-[11px] text-[#93c5fd]">
                            {preset.features.map((feat, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-base sm:text-xl font-bold font-data text-[#38bdf8]">
                            {preset.amount > 0 ? `₦${preset.amount.toLocaleString()}` : 'Custom'}
                          </div>
                          <span className="text-[10px] text-[#93c5fd]">NGN Retainer</span>
                        </div>
                      </div>

                      {/* Custom Amount Sub-Input */}
                      {isSelected && preset.id === 'custom' && (
                        <div className="mt-4 pt-4 border-t border-[#1d4ed8]/30 grid grid-cols-1 sm:grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#e0f2fe] mb-1">
                              Custom Amount (₦ NGN) *
                            </label>
                            <input
                              type="number"
                              min="1000"
                              placeholder="e.g. 500000"
                              value={customAmount}
                              onChange={(e) => setCustomAmount(e.target.value)}
                              className="w-full px-3 py-2 bg-[#07132b] border border-[#1d4ed8] rounded-lg text-white font-data text-xs focus:outline-none focus:border-[#38bdf8]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#e0f2fe] mb-1">
                              Invoice / Contract Ref (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. INV-2025-042"
                              value={invoiceNumber}
                              onChange={(e) => setInvoiceNumber(e.target.value)}
                              className="w-full px-3 py-2 bg-[#07132b] border border-[#1d4ed8] rounded-lg text-white text-xs focus:outline-none focus:border-[#38bdf8]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Direct Bank Transfer Accordion / Alternate Method */}
              <div className="p-5 bg-[#0b1e42] border border-[#1d4ed8]/40 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#38bdf8]" />
                    <h3 className="font-display text-sm font-bold text-white">
                      Direct Corporate Bank Transfer Option
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#25D366] font-semibold bg-[#25D366]/10 px-2 py-0.5 rounded">
                    First Bank of Nigeria
                  </span>
                </div>

                <p className="text-xs text-[#bfdbfe] leading-relaxed">
                  For large diaspora transfers, institutional retainers, or corporate payments, you may transfer directly to the corporate account below:
                </p>

                <div className="p-4 bg-[#07132b] border border-[#1d4ed8]/50 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#93c5fd]">Account Name:</span>
                    <span className="font-semibold text-white">Ola Continental Properties & Associates</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#93c5fd]">Bank Name:</span>
                    <span className="font-semibold text-white">First Bank of Nigeria</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[#93c5fd]">Account Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#38bdf8] text-sm">3189204012</span>
                      <button
                        type="button"
                        onClick={handleCopyAccount}
                        className="px-2 py-1 bg-[#1d4ed8]/30 hover:bg-[#1d4ed8] text-white text-[10px] rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedBank ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Payment Form & Trigger */}
            <div className="lg:col-span-5 bg-[#0b1e42] border border-[#1d4ed8]/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
              <div className="border-b border-[#1d4ed8]/40 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-[#93c5fd]">Total Retainer Due</span>
                  <span className="text-[11px] font-mono text-[#38bdf8]">Zero Concealed Surcharges</span>
                </div>
                <div className="text-3xl font-bold font-data text-white">
                  {formattedAmount}
                </div>
                <div className="text-xs text-[#bfdbfe] mt-0.5">
                  For: <span className="font-medium text-white">{selectedPreset.title}</span>
                </div>
              </div>

              {/* Payment Channel Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#07132b] rounded-xl border border-[#1d4ed8]/40 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('paystack')}
                  className={`py-2 px-3 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'paystack'
                      ? 'bg-[#2563eb] text-white shadow'
                      : 'text-[#bfdbfe] hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Paystack Inline</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`py-2 px-3 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    paymentMethod === 'bank_transfer'
                      ? 'bg-[#2563eb] text-white shadow'
                      : 'text-[#bfdbfe] hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Bank Transfer</span>
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-950/80 border border-red-500/40 text-red-200 rounded-lg text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Client Details Form */}
              <form onSubmit={paymentMethod === 'paystack' ? handlePaystackCheckout : handleBankTransferSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-[#e0f2fe] mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Kehinde Adeleke"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#07132b] border border-[#1d4ed8]/50 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#e0f2fe] mb-1">
                    Email Address (For Instant Receipt) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. adeleke@gmail.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
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
                    placeholder="e.g. +234 803 123 4567"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#07132b] border border-[#1d4ed8]/50 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#e0f2fe] mb-1">
                    Project, Corridor or Property Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Adenike Student Hostel Land / Teaching Hospital Duplex"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#07132b] border border-[#1d4ed8]/50 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#e0f2fe] mb-1">
                    Special Instructions / Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Additional notes, surveyor requests, or milestone specifications..."
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#07132b] border border-[#1d4ed8]/50 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>

                {paymentMethod === 'paystack' ? (
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 px-6 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-xs rounded-xl transition-all shadow-lg shadow-[#2563eb]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    <span>
                      {isProcessing ? 'Connecting to Paystack...' : `Pay ${formattedAmount} via Paystack`}
                    </span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 px-6 bg-[#25D366] hover:bg-[#20b859] text-white font-semibold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isProcessing ? 'Logging Transfer...' : 'I Have Transferred - Submit Proof'}
                    </span>
                  </button>
                )}

                <div className="pt-2 text-[11px] text-[#93c5fd]/80 text-center flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>Protected by 256-bit TLS encryption & Paystack PCI-DSS Level 1</span>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
