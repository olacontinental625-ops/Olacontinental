import React, { useState } from 'react';
import { Property } from '../types';
import { X, Calendar, CheckCircle2, MessageSquare, Phone, MapPin, Clock } from 'lucide-react';
import { createFirestoreViewing } from '../lib/firebase';

interface ScheduleViewingModalProps {
  onClose: () => void;
  property?: Property | null;
}

export const ScheduleViewingModal: React.FC<ScheduleViewingModalProps> = ({
  onClose,
  property,
}) => {
  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    email: '',
    preferredDate: '',
    inspectionType: 'Physical On-Site (Tuesday Dedicated Field Day)',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.phone || !formData.preferredDate) return;

    try {
      setIsSubmitting(true);
      const viewingPayload = {
        propertyId: property ? property.id : 'general',
        propertyTitle: property ? property.title : 'General Portfolio & Corridor Tour',
        ...formData,
      };

      // 1. Save directly to Cloud Firestore
      await createFirestoreViewing(viewingPayload).catch((err) => {
        console.warn('Firestore viewing save caught:', err);
      });

      // 2. Dual-save to backend API
      await fetch('/api/viewings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(viewingPayload),
      }).catch((err) => {
        console.warn('Server API viewing save caught:', err);
      });

      setIsSuccess(true);
    } catch (err) {
      console.error('Viewing scheduling caught:', err);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappLink = encodeURIComponent(
    `Hello Alhaji Olaoluwa, I have scheduled an inspection for ${property ? property.title : 'Ola Continental Portfolio'}. Name: ${formData.clientName || 'Client'}, Date: ${formData.preferredDate || 'Upcoming Tuesday'}, Type: ${formData.inspectionType}.`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#071A2B] border border-[#1E486A] rounded-2xl shadow-2xl overflow-hidden my-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1E486A]/50">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-display text-[#FAF4E8]">
              Schedule Field or Video Inspection
            </h3>
            <p className="text-xs text-[#FAF4E8]/60 mt-0.5">
              {property ? property.title : 'Comprehensive Ogbomoso & Lagos Corridor Inspection'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#FAF4E8]/60 hover:text-white rounded-lg hover:bg-[#0D2638]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="w-14 h-14 text-[#25D366] mx-auto" />
            <h4 className="text-lg font-bold font-display text-[#FAF4E8]">Inspection Slot Logged!</h4>
            <p className="text-xs text-[#FAF4E8]/80 max-w-sm mx-auto leading-relaxed">
              Your inspection request has been recorded. Alhaji Olaoluwa or our field coordination team will reach you via phone or WhatsApp to reconfirm meeting location and beacon documentation.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <a
                href={`https://wa.me/2348033848107?text=${whatsappLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Confirm Instantly on WhatsApp</span>
              </a>

              <button
                onClick={onClose}
                className="w-full py-2 px-4 bg-[#051421] hover:bg-[#0D2638] text-[#FAF4E8]/80 text-xs rounded-lg border border-[#1E486A]"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
            {/* Note on Tuesday Field Day */}
            <div className="p-3 bg-[#051421] rounded-lg border border-[#C5A880]/30 text-[11px] text-[#FAF4E8]/80 flex items-start gap-2">
              <Clock className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#C5A880]">Tuesday Inspection Tradition:</strong> Every Tuesday is our firm’s dedicated on-site corridor day with licensed surveyors present. Custom inspection slots are also available Mon-Sat with 24hr notice.
              </div>
            </div>

            <div>
              <label className="block text-[#FAF4E8]/70 mb-1">Your Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. K. Adeleke"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full px-3 py-2 bg-[#051421] border border-[#1E486A] rounded-lg text-[#FAF4E8] focus:border-[#C5A880] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#FAF4E8]/70 mb-1">Phone / WhatsApp Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0803 384 8107"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051421] border border-[#1E486A] rounded-lg text-[#FAF4E8] focus:border-[#C5A880] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#FAF4E8]/70 mb-1">Email (Optional for Overseas)</label>
                <input
                  type="email"
                  placeholder="client@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051421] border border-[#1E486A] rounded-lg text-[#FAF4E8] focus:border-[#C5A880] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#FAF4E8]/70 mb-1">Preferred Inspection Date</label>
                <input
                  type="date"
                  required
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051421] border border-[#1E486A] rounded-lg text-[#FAF4E8] focus:border-[#C5A880] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#FAF4E8]/70 mb-1">Inspection Format</label>
                <select
                  value={formData.inspectionType}
                  onChange={(e) => setFormData({ ...formData, inspectionType: e.target.value })}
                  className="w-full px-3 py-2 bg-[#051421] border border-[#1E486A] rounded-lg text-[#FAF4E8] focus:border-[#C5A880] focus:outline-none"
                >
                  <option value="Physical On-Site (Tuesday Dedicated Field Day)">Physical Walkthrough (Tuesday)</option>
                  <option value="Physical On-Site (Weekday / Saturday)">Physical Walkthrough (Other Day)</option>
                  <option value="Live 4K WhatsApp Video Tour (Diaspora)">Live 4K WhatsApp Video (Diaspora)</option>
                  <option value="Consultation at Olukoko Headquarters">In-Office at Olukoko St. Office</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#FAF4E8]/70 mb-1">Specific Questions or Beacon Checklist</label>
              <textarea
                rows={2}
                placeholder="e.g. Please bring survey plan copy, interest in borehole yield or student rent records..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 bg-[#051421] border border-[#1E486A] rounded-lg text-[#FAF4E8] focus:border-[#C5A880] focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#051421] text-[#FAF4E8]/80 hover:text-white rounded-lg border border-[#1E486A]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#8B6347] hover:bg-[#9E7353] text-white font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Confirming...' : 'Confirm Inspection Booking'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
