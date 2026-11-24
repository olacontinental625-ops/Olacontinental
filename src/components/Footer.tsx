import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  Star,
  CheckCircle2,
  Plus,
  Sparkles,
  X,
  Loader2,
} from 'lucide-react';
import { PageType, InspectionReview } from '../types';
import { listenToReviews, createFirestoreReview } from '../lib/firebase';
import { OlaLogoMark } from './OlaLogoMark';

interface FooterProps {
  onNavigate: (page: PageType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [reviews, setReviews] = useState<InspectionReview[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    rating: 5,
    inspectionDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    comment: '',
    propertyId: 'grand-olukoko-duplex',
  });

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (data.reviews) {
        setReviews(data.reviews);
      }
    } catch {
      // ignore fetch error
    }
  };

  useEffect(() => {
    fetchReviews();
    const unsubscribe = listenToReviews((firestoreReviews) => {
      if (firestoreReviews && firestoreReviews.length > 0) {
        setReviews((prev) => {
          const ids = new Set(firestoreReviews.map((r) => r.id));
          const filteredPrev = prev.filter((r) => !ids.has(r.id));
          return [...firestoreReviews, ...filteredPrev];
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.comment) return;

    setSubmitting(true);
    try {
      await createFirestoreReview({
        clientName: formData.clientName,
        rating: Number(formData.rating),
        comment: formData.comment,
        propertyId: formData.propertyId,
        inspectionDate: formData.inspectionDate,
      }).catch(() => {});

      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        setShowReviewModal(false);
        setSubmitSuccess(false);
        setFormData({
          clientName: '',
          rating: 5,
          inspectionDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          comment: '',
          propertyId: 'grand-olukoko-duplex',
        });
        fetchReviews();
      }, 1400);
    } finally {
      setSubmitting(false);
    }
  };

  const featuredReviews = reviews.slice(0, 2);

  return (
    <footer className="bg-[#040b19] text-[#F0F6FF] border-t border-[#1d4ed8]/30 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Footer Directory Grid: Brand + Headquarters Landmark (with Direct Desk attached) + Hours + Direct Pages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#1d4ed8]/20 text-xs">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <OlaLogoMark variant="footer" />
            <p className="text-[#bfdbfe]/80 leading-relaxed pr-4">
              Real estate brokerage, turnkey building &amp; civil construction, student hostel development, and farmland acquisitions across Ogbomoso and Lagos corridors since 2006. Grounded in verifiable titles, cadastral survey charting, and BS 8110 engineering codes.
            </p>

            <div className="pt-1 space-y-1.5 text-[#38bdf8]">
              <div><strong>Registration:</strong> RC: 203356 · CAC BN: 3189204</div>
              <div><strong>Principal Consultant &amp; Civil Engineer:</strong> Engineer Samuel Aleji</div>
              <div><strong>Plus Code:</strong> 47X3+F5 Ogbomoso, Nigeria</div>
            </div>
          </div>

          {/* Headquarters Landmark + Attached Direct Desk */}
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-[#93c5fd] uppercase tracking-wider">
                Headquarters Landmark
              </h4>
              <div className="flex items-start gap-2 text-[#bfdbfe]/90 leading-relaxed">
                <MapPin className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
                <span>
                  No. 2, Olukoko Street,<br />
                  Behind LAUTECH Teaching Hospital,<br />
                  Ogbomoso, Oyo State, Nigeria
                </span>
              </div>
              <div className="text-[11px] text-[#bfdbfe]/60">
                Active engineering projects & properties in Ogbomoso corridors (Adenike, Under-G, Aroje) and Mushin Commercial District, Lagos.
              </div>
            </div>

            {/* Direct Desk Attached Directly to Headquarters Landmark */}
            <div className="pt-3 border-t border-[#1d4ed8]/25 space-y-2">
              <h4 className="font-semibold text-xs text-[#93c5fd] uppercase tracking-wider">
                Direct Desk
              </h4>
              <div className="space-y-1.5 text-[#bfdbfe]/90">
                <a
                  href="tel:+2348033848107"
                  className="flex items-center gap-2 hover:text-[#38bdf8] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#4ade80]" />
                  <span className="font-data font-semibold text-white">+234 803 384 8107</span>
                </a>
                <a
                  href="https://wa.me/2348033848107"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#4ade80] hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp: 0803 384 8107</span>
                </a>
              </div>
            </div>
          </div>

          {/* Hours & Inspection Protocol */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-[#93c5fd] uppercase tracking-wider">
              Field, Site & Office Hours
            </h4>
            <div className="space-y-2 text-[#bfdbfe]/90">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#38bdf8] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Monday – Saturday</span>
                  <span>8:00 AM – 6:00 PM</span>
                </div>
              </div>
              <div className="p-2.5 bg-[#0b1e42] rounded-lg border border-[#1d4ed8]/30 text-[11px]">
                <strong className="text-[#38bdf8]">Tuesday:</strong> Dedicated On-Site Field Inspection & Structural Progress Day.
              </div>
              <div className="text-[11px] text-[#bfdbfe]/60">
                Sunday: By appointment for diaspora live 4K video consultations.
              </div>
            </div>
          </div>

          {/* Direct Pages */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-[#93c5fd] uppercase tracking-wider">
              Direct Pages
            </h4>
            <div className="flex flex-col gap-2 text-[#bfdbfe]/80">
              <button
                onClick={() => {
                  onNavigate('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left hover:text-[#38bdf8] transition-colors cursor-pointer"
              >
                Homepage (Grey Architecture)
              </button>
              <button
                onClick={() => {
                  onNavigate('about');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left hover:text-[#38bdf8] transition-colors cursor-pointer"
              >
                About Us (Engineer Samuel Aleji)
              </button>
              <button
                onClick={() => {
                  onNavigate('properties');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left hover:text-[#38bdf8] transition-colors cursor-pointer"
              >
                Verified Properties Repository
              </button>
              <button
                onClick={() => {
                  onNavigate('constructions');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left hover:text-[#38bdf8] transition-colors cursor-pointer text-white font-medium flex items-center gap-1"
              >
                <span>Constructions (Ongoing &amp; Finished)</span>
                <ArrowRight className="w-3 h-3 text-[#38bdf8]" />
              </button>
              <button
                onClick={() => {
                  onNavigate('corridors');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left hover:text-[#38bdf8] transition-colors cursor-pointer"
              >
                Operating Corridors
              </button>
              <button
                onClick={() => {
                  onNavigate('blogs');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left text-[#38bdf8] hover:text-white font-semibold transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>Blogs</span>
                <span className="text-[10px] text-[#38bdf8] bg-[#1d4ed8]/20 px-1.5 py-0.2 rounded font-mono">
                  Articles
                </span>
              </button>
              <button
                onClick={() => {
                  onNavigate('customer-login');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left text-[#F5C451] hover:text-white font-semibold transition-colors cursor-pointer"
              >
                Customer Sign Up / Login
              </button>
              <button
                onClick={() => {
                  onNavigate('admin-login');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-left text-[#bfdbfe]/90 hover:text-[#38bdf8] transition-colors cursor-pointer"
              >
                Owner Admin Login
              </button>
            </div>
          </div>
        </div>

        {/* CENTRALIZED TESTIMONIAL SECTION IN THE MIDDLE AT THE BOTTOM LEVEL */}
        <div
          id="testimonials-bottom"
          className="py-12 border-b border-[#1d4ed8]/20 max-w-4xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-widest uppercase text-[#38bdf8] mb-2">
            <Star className="w-3.5 h-3.5 fill-current text-[#38bdf8]" />
            <span>CLIENT TESTIMONIALS &amp; VERIFIED FIELD REVIEWS</span>
            <Star className="w-3.5 h-3.5 fill-current text-[#38bdf8]" />
          </div>

          <h3 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Trusted by Local Professionals &amp; Diaspora Investors
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-[#bfdbfe]/80 max-w-2xl mx-auto leading-relaxed">
            5.0/5 verified satisfaction across physical Tuesday inspections, cadastral survey chartings, and turnkey building construction handovers.
          </p>

          {/* Centered Featured Reviews Cards */}
          {featuredReviews.length > 0 && (
            <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
              {featuredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-[#0b1e42]/80 border border-[#1d4ed8]/30 rounded-2xl p-5 flex flex-col justify-between shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div>
                        <div className="text-xs font-bold text-white">{rev.clientName}</div>
                        <div className="text-[11px] text-[#93c5fd]">{rev.inspectionDate}</div>
                      </div>
                      <div className="flex items-center gap-0.5 text-[#38bdf8]">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[#bfdbfe]/90 leading-relaxed">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-[#1d4ed8]/20 flex items-center justify-center gap-1.5 text-[11px] text-[#4ade80]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Physical Inspection &amp; Survey Verified</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Centered Actions */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl transition-all shadow-md shadow-[#2563eb]/25 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Write Live Testimonial</span>
            </button>

            <button
              onClick={() => {
                onNavigate('testimonials');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-4 py-2.5 text-xs font-semibold text-[#bfdbfe] hover:text-white bg-[#0b1e42] hover:bg-[#1d4ed8]/30 border border-[#1d4ed8]/40 rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>View All Testimonials</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#38bdf8]" />
            </button>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#bfdbfe]/60">
          <div>
            © 2006 – {new Date().getFullYear()} Ola Continental Properties & Construction Associates. All rights reserved. CAC BN: 3189204.
          </div>
          <div className="flex items-center gap-4">
            <span>Civil Engineering</span>
            <span aria-hidden="true" className="text-white/30">·</span>
            <span>Cadastral Survey Charted</span>
            <span aria-hidden="true" className="text-white/30">·</span>
            <span>Turnkey Construction</span>
            <span aria-hidden="true" className="text-white/30">·</span>
            <span>Zero Speculative Guarantees</span>
          </div>
        </div>
      </div>

      {/* Live Testimonial Submission Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#0b1e42] border border-[#1d4ed8]/50 rounded-2xl shadow-2xl p-6 sm:p-8 text-[#F0F6FF]">
            <div className="flex items-center justify-between pb-4 border-b border-[#1d4ed8]/30">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#38bdf8]" />
                <h3 className="text-base font-bold font-display text-white">
                  Write an Insightful Live Testimonial
                </h3>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-[#93c5fd] hover:text-white p-1 rounded hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#4ade80] mx-auto animate-bounce" />
                <h4 className="font-display text-lg font-bold text-white">
                  Testimonial Published Live!
                </h4>
                <p className="text-xs text-[#bfdbfe]">
                  Thank you for contributing your comment to Ola Continental&apos;s verified archive.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-[#bfdbfe] mb-1">
                    Your Name &amp; Location / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. K. Babatunde (London, UK)"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#07132b] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#bfdbfe] mb-1">
                      Rating
                    </label>
                    <select
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-[#07132b] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                    >
                      <option value={5}>5 Stars - Exceptional</option>
                      <option value={4}>4 Stars - Very Good</option>
                      <option value={3}>3 Stars - Satisfactory</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#bfdbfe] mb-1">
                      Inspection Date
                    </label>
                    <input
                      type="text"
                      value={formData.inspectionDate}
                      onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                      className="w-full px-3 py-2.5 bg-[#07132b] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#bfdbfe] mb-1">
                    Your Comment / Review *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your inspection experience, survey verification, or building construction delivery..."
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#07132b] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2.5 bg-[#07132b] hover:bg-[#1d4ed8]/20 border border-[#1d4ed8]/40 rounded-lg text-[#bfdbfe] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !formData.clientName || !formData.comment}
                    className="px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 text-white font-semibold rounded-lg flex items-center gap-2 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <span>Publish Live Testimonial</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </footer>
  );
};
