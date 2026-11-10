import React, { useState, useRef } from 'react';
import { KineticText } from './KineticText';
import { Volume2, VolumeX, Play, Pause, Maximize2, Sparkles, ArrowRight, ShieldCheck, MapPin, Building2, Phone, HardHat } from 'lucide-react';

interface VideoHeroProps {
  onExploreProperties: () => void;
  onOpenMatcher: () => void;
  onOpenChat: () => void;
  onOpenViewing: () => void;
}

export const VideoHero: React.FC<VideoHeroProps> = ({
  onExploreProperties,
  onOpenMatcher,
  onOpenChat,
  onOpenViewing,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showFullVideoModal, setShowFullVideoModal] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-between bg-[#181a20] overflow-hidden border-b border-slate-700/60">
      {/* Background Video Layer with Dark Luxury Scrim */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {isPlaying ? (
          <iframe
            ref={iframeRef}
            className="w-[300%] h-[300%] -top-[100%] -left-[100%] absolute object-cover filter brightness-[0.65] contrast-[1.08] pointer-events-none scale-105"
            src={`https://www.youtube-nocookie.com/embed/IK7vm03cIFY?autoplay=1&mute=${isMuted ? '1' : '0'}&controls=0&loop=1&playlist=IK7vm03cIFY&playsinline=1&rel=0&showinfo=0&modestbranding=1&enablejsapi=1`}
            title="Ola Continental Property Showcase Video"
            allow="autoplay; encrypted-media; picture-in-picture"
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center filter brightness-[0.5]"
            style={{ backgroundImage: `url('/src/assets/images/hero_duplex_luxury_1792162749850.jpg')` }}
          />
        )}

        {/* Cinematic Vignette Overlays in Architectural Slate Grey */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#181a20] via-[#181a20]/60 to-[#181a20]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#181a20]/90 via-[#181a20]/50 to-transparent" />
      </div>

      {/* Floating Video Controls Pill */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
        <button
          onClick={toggleMute}
          className="p-2.5 rounded-full bg-[#222630]/90 hover:bg-[#282c37] text-[#F3E8D0] border border-slate-700 backdrop-blur-md transition-all cursor-pointer shadow-md"
          title={isMuted ? 'Unmute Background Audio' : 'Mute Audio'}
          aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#25D366]" />}
        </button>
        <button
          onClick={togglePlay}
          className="p-2.5 rounded-full bg-[#222630]/90 hover:bg-[#282c37] text-[#F3E8D0] border border-slate-700 backdrop-blur-md transition-all cursor-pointer shadow-md"
          title={isPlaying ? 'Pause Background Video' : 'Play Background Video'}
          aria-label={isPlaying ? 'Pause Video' : 'Play Video'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-[#C5A880]" />}
        </button>
        <button
          onClick={() => setShowFullVideoModal(true)}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#222630]/90 hover:bg-[#282c37] text-xs font-medium text-[#FAF4E8] border border-slate-700 backdrop-blur-md transition-all cursor-pointer shadow-md"
          title="Open Fullscreen Property Tour"
        >
          <Maximize2 className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>Fullscreen Tour</span>
        </button>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 flex-1 flex flex-col justify-center">
        <div className="max-w-3xl">
          {/* Natural Editorial Kicker */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold tracking-wider text-[#38bdf8] mb-4">
            <span className="flex items-center gap-1.5 bg-[#222630]/90 border border-slate-700/80 px-2.5 py-1 rounded-md backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
              LIVE FIELD VIDEO AUTOPLAY
            </span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="text-slate-300">ESTABLISHED 2006</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="font-data text-xs text-slate-400">CAC BN: 3189204</span>
          </div>

          {/* Display Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] text-balance">
            Ola Continental <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-[#38bdf8]">
              Properties & Engineering.
            </span>
          </h1>

          {/* 3D Kinetic Typography Secondary Line */}
          <KineticText />

          {/* Concise Grounded Value Statement */}
          <p className="mt-4 text-base sm:text-lg text-slate-200 max-w-2xl font-normal leading-relaxed drop-shadow-sm">
            Led by Engineer Samuel Aleji for over 19 years. Continuous real estate advisory, certified land holdings, and turnkey building construction across Ogbomoso and Lagos corridors.
          </p>

          {/* Primary Action Row */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={onExploreProperties}
              className="px-6 py-3.5 text-sm font-semibold tracking-wide uppercase text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl transition-all shadow-lg shadow-[#2563eb]/25 inline-flex items-center gap-2 cursor-pointer group"
            >
              <span>Explore Verified Listings</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setShowFullVideoModal(true)}
              className="px-5 py-3.5 text-sm font-semibold text-white bg-[#222630]/90 hover:bg-[#282c37] border border-[#38bdf8]/60 hover:border-[#38bdf8] rounded-xl transition-all backdrop-blur-md cursor-pointer inline-flex items-center gap-2.5 shadow-lg group"
            >
              <div className="w-6 h-6 rounded-full bg-[#4ade80]/20 flex items-center justify-center text-[#4ade80] group-hover:scale-110 transition-transform">
                <Play className="w-3.5 h-3.5 fill-[#4ade80]" />
              </div>
              <span>Fullscreen Tour</span>
            </button>

            <button
              onClick={onOpenViewing}
              className="px-5 py-3.5 text-sm font-semibold text-slate-100 bg-[#222630]/90 hover:bg-[#282c37] border border-slate-700 rounded-xl transition-all backdrop-blur-md cursor-pointer inline-flex items-center gap-2 shadow-md"
            >
              <HardHat className="w-4 h-4 text-[#4ade80]" />
              <span>Request Quote</span>
            </button>

            <button
              onClick={onOpenChat}
              className="px-4 py-3.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer border border-transparent hover:border-slate-700"
            >
              <Sparkles className="w-4 h-4 text-[#38bdf8]" />
              <span>Ask AI Concierge</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trust Strip & Core Attributes - 4-Column Responsive Strip in Architectural Grey */}
      <div className="relative z-10 w-full bg-[#222630] border-t border-slate-700/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#38bdf8] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white">Institutional Title Security</h4>
                <p className="text-xs text-slate-300 mt-0.5">Cadastral survey charting, zero government acquisition, and certified lineage escrow.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#38bdf8] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white">Headquarters Landmark</h4>
                <p className="text-xs text-slate-300 mt-0.5">No. 2, Olukoko St., Behind LAUTECH Teaching Hospital, Ogbomoso.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-[#38bdf8] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white">Active Operating Corridors</h4>
                <p className="text-xs text-slate-300 mt-0.5">Under G, Adenike Hostels, Aroje Belt, Odo-Oba, & Mushin Commercial (Lagos).</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#4ade80] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white">Direct WhatsApp & Phone</h4>
                <a
                  href="https://wa.me/2348033848107?text=Hello%20Engineer%20Samuel%20Aleji,%20I%20am%20inquiring%20about%20Ola%20Continental%20Properties"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-data text-xs text-[#4ade80] hover:underline block mt-0.5"
                >
                  +234 803 384 8107 (Engr. Samuel Aleji)
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Video Tour Modal */}
      {showFullVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#181a20]/90 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#222630] rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-[#1e222b]">
              <div>
                <h3 className="text-lg font-bold font-display text-white">Ola Continental Video Tour</h3>
                <p className="text-xs text-slate-300">Authentic Field Showcase & Property Walkthrough</p>
              </div>
              <button
                onClick={() => setShowFullVideoModal(false)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-[#282c37] hover:bg-slate-700 rounded-lg border border-slate-700 cursor-pointer transition-colors"
              >
                Close (ESC)
              </button>
            </div>
            <div className="w-full flex justify-center bg-[#181a20] p-4 sm:p-6 overflow-y-auto">
              <div className="w-full max-w-sm aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-black">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube-nocookie.com/embed/IK7vm03cIFY?autoplay=1&controls=1&rel=0&loop=1&playlist=IK7vm03cIFY"
                  title="Ola Continental Official Video Tour"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
            <div className="p-4 bg-[#1e222b] border-t border-slate-700 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#4ade80]" />
                <span>Verified Holdings & Live Site Walkthrough</span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="https://wa.me/2348033848107?text=Hello%20Engineer%20Samuel%20Aleji,%20I%20just%20watched%20the%20Ola%20Continental%20Video%20Tour%20and%20would%20like%20to%20inquire."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-xs font-semibold text-[#4ade80] bg-[#181a20] border border-[#4ade80]/40 hover:border-[#4ade80] rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>WhatsApp Inquiries</span>
                </a>
                <button
                  onClick={() => {
                    setShowFullVideoModal(false);
                    onOpenViewing();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#2563eb] rounded-xl hover:bg-[#1d4ed8] cursor-pointer shadow-md"
                >
                  Book Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
