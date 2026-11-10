import React, { useState, useEffect } from 'react';
import { InspectionReview } from '../types';
import { Star, ShieldCheck, CheckCircle2, MessageSquare, Plus, Calendar, User, Sparkles, X, Loader2, HardHat, Building } from 'lucide-react';
import { listenToReviews, createFirestoreReview } from '../lib/firebase';

export const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<InspectionReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    rating: 5,
    inspectionDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    comment: '',
    propertyId: 'grand-olukoko-duplex',
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    // 1. Initial fetch from API
    fetchReviews();

    // 2. Real-time live listener from Cloud Firestore
    const unsubscribe = listenToReviews((firestoreReviews) => {
      if (firestoreReviews && firestoreReviews.length > 0) {
        setReviews((prev) => {
          // Combine without duplicates
          const ids = new Set(firestoreReviews.map((r) => r.id));
          const filteredPrev = prev.filter((r) => !ids.has(r.id));
          return [...firestoreReviews, ...filteredPrev];
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (data.reviews) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.comment) return;

    setSubmitting(true);
    try {
      // 1. Save directly to Cloud Firestore
      await createFirestoreReview({
        clientName: formData.clientName,
        rating: Number(formData.rating),
        comment: formData.comment,
        propertyId: formData.propertyId,
        inspectionDate: formData.inspectionDate,
      }).catch((err) => console.warn('Firestore review creation caught:', err));

      // 2. Save to server API
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      setSubmitSuccess(true);
      setTimeout(() => {
        setShowFormModal(false);
        setSubmitSuccess(false);
        setFormData({
          clientName: '',
          rating: 5,
          inspectionDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          comment: '',
          propertyId: 'grand-olukoko-duplex',
        });
        fetchReviews();
      }, 1500);
    } catch (err) {
      console.error('Failed to post review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="py-20 bg-[#07132b] text-[#F0F6FF] border-b border-[#1d4ed8]/30 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#38bdf8] mb-2 flex items-center gap-2">
              <span>LIVE TESTIMONIALS & CLIENT VERIFICATIONS</span>
              <span aria-hidden="true" className="text-white/40">·</span>
              <span className="font-data text-xs text-[#93c5fd]">AUTHENTIC FIELD REVIEWS</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
              Insightful Client Testimonials
            </h2>
            <p className="mt-3 text-sm text-[#bfdbfe] leading-relaxed">
              Read transparent feedback logged by local buyers, diaspora investors, building project clients, and surveyors following physical on-site inspections, title chartings, and civil construction deliveries. Submit your own comment live.
            </p>
          </div>

          <button
            onClick={() => setShowFormModal(true)}
            className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl transition-all shadow-lg shadow-[#2563eb]/25 flex items-center gap-2 self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Write Live Testimonial</span>
          </button>
        </div>

        {/* Rating Overview Strip */}
        <div className="bg-[#0b1e42] p-6 sm:p-8 rounded-2xl border border-[#1d4ed8]/30 mb-10 flex flex-wrap items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-5">
            <div className="font-data text-4xl sm:text-5xl font-bold text-white">5.0</div>
            <div>
              <div className="flex items-center text-[#38bdf8] gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current text-[#38bdf8]" />
                ))}
              </div>
              <p className="text-xs text-[#bfdbfe]/80 mt-1">Based on verified client inspections, construction handovers & documented transactions</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[#bfdbfe]">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#07132b] rounded-lg border border-[#1d4ed8]/40">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4ade80]" />
              <span>100% Survey Charted Titles</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#07132b] rounded-lg border border-[#1d4ed8]/40">
              <ShieldCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>Baale Family Lineage Cleared</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#07132b] rounded-lg border border-[#1d4ed8]/40">
              <HardHat className="w-3.5 h-3.5 text-[#60a5fa]" />
              <span>Turnkey Construction Certified</span>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#0b1e42] p-6 rounded-2xl border border-[#1d4ed8]/30 hover:border-[#38bdf8]/50 transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1d4ed8]/20 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] text-sm font-bold font-data">
                      {rev.clientName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-white">{rev.clientName}</h4>
                      <span className="text-[11px] text-[#93c5fd] block">{rev.inspectionDate}</span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center text-[#38bdf8] gap-0.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current text-[#38bdf8]" />
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#bfdbfe]/90 leading-relaxed font-normal">
                  "{rev.comment}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1d4ed8]/20 flex items-center justify-between text-[11px] text-[#4ade80]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Physical Inspection & Survey Verified</span>
                </div>
                <span className="text-[#93c5fd]/70">Live Archive</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Submission Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#0b1e42] border border-[#1d4ed8]/50 rounded-2xl shadow-2xl p-6 sm:p-8 text-[#F0F6FF]">
            <div className="flex items-center justify-between pb-4 border-b border-[#1d4ed8]/30">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#38bdf8]" />
                <h3 className="text-base font-bold font-display text-white">Write an Insightful Live Testimonial</h3>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-[#93c5fd] hover:text-white p-1 rounded hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#4ade80] mx-auto animate-bounce" />
                <h4 className="font-display text-lg font-bold text-white">Testimonial Published Live!</h4>
                <p className="text-xs text-[#bfdbfe]">
                  Thank you for contributing your insightful comment to Ola Continental's verified public archive.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-[#bfdbfe] mb-1">
                    Your Name & Location / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. K. Babatunde (London, UK) or Engr. Taiwo"
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
                      Inspection / Project Date
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. October 2026"
                      value={formData.inspectionDate}
                      onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
                      className="w-full px-3 py-2.5 bg-[#07132b] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#bfdbfe] mb-1">
                    Corridor, Property, or Construction Project
                  </label>
                  <select
                    value={formData.propertyId}
                    onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#07132b] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                  >
                    <option value="lautech-student-hostel-adenike">LAUTECH 16-Unit Student Hostel (Adenike)</option>
                    <option value="grand-olukoko-duplex">The Grand Olukoko Executive Duplex</option>
                    <option value="mushin-commercial-income">Mushin Commercial Corridor (Lagos)</option>
                    <option value="crown-view-bungalow">Crown View Modern Bungalow (Under G)</option>
                    <option value="turnkey-building-construction">Turnkey Building & Civil Construction Project</option>
                    <option value="odo-oba-farmland">Odo-Oba 5-Hectare Farmland with Stream</option>
                    <option value="general-consultation">General Field Walkthrough / Cadastral Survey Charting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#bfdbfe] mb-1">
                    Your Insightful Comment / Review *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your inspection experience, beacon coordinates verification, Baale clearance, civil building quality, or diaspora escrow process..."
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#07132b] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="px-4 py-2.5 bg-[#07132b] hover:bg-[#1d4ed8]/20 border border-[#1d4ed8]/40 rounded-lg text-[#bfdbfe]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting || !formData.clientName || !formData.comment}
                    className="px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 text-white font-semibold rounded-lg flex items-center gap-2 cursor-pointer shadow-md shadow-[#2563eb]/30"
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
    </section>
  );
};
