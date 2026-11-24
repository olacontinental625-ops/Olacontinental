import React, { useState, useRef, useEffect } from 'react';
import { KineticText } from './KineticText';
import { OlaLogoMark } from './OlaLogoMark';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Maximize2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Building2,
  Phone,
  HardHat,
  Upload,
  RotateCcw,
  Film,
  Loader2,
} from 'lucide-react';

interface VideoHeroProps {
  onExploreProperties: () => void;
  onOpenConstructions: () => void;
  onOpenChat: () => void;
  onOpenViewing: () => void;
}

const DEFAULT_YOUTUBE_ID = 'IK7vm03cIFY';

export const VideoHero: React.FC<VideoHeroProps> = ({
  onExploreProperties,
  onOpenConstructions,
  onOpenChat,
  onOpenViewing,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showFullVideoModal, setShowFullVideoModal] = useState(false);

  // Uploaded custom video state
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch saved hero video from server on mount
  useEffect(() => {
    let active = true;
    fetch('/api/hero-video')
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data?.videoUrl) {
          setUploadedVideoUrl(data.videoUrl);
          setUploadedFileName(data.fileName || 'Custom Showcase Video');
        }
      })
      .catch(() => {
        // Fallback silently to default video
      });
    return () => {
      active = false;
    };
  }, []);

  // Sync play/pause & mute state on <video> element when custom video is active
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !uploadedVideoUrl) return;
    vid.muted = isMuted;
    if (isPlaying) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  }, [isPlaying, isMuted, uploadedVideoUrl]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const handleVideoUpload = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      setUploadError('Please select a valid video file (MP4, WebM, or MOV).');
      return;
    }

    setUploadError(null);
    setUploading(true);

    const localPreviewUrl = URL.createObjectURL(file);
    setUploadedVideoUrl(localPreviewUrl);
    setUploadedFileName(file.name);
    setIsPlaying(true);

    try {
      const response = await fetch('/api/hero-video', {
        method: 'POST',
        headers: {
          'Content-Type': file.type || 'video/mp4',
          'x-file-name': encodeURIComponent(file.name),
        },
        body: file,
      });

      const data = await response.json();
      if (!response.ok || !data.videoUrl) {
        throw new Error(data.error || 'Video upload failed.');
      }

      setUploadedVideoUrl(data.videoUrl);
      setUploadedFileName(data.fileName || file.name);
      URL.revokeObjectURL(localPreviewUrl);
    } catch (err: any) {
      setUploadError(err?.message || 'Upload preview active locally; server storage error.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleVideoUpload(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleVideoUpload(file);
    }
  };

  const handleResetVideo = async () => {
    setUploadError(null);
    try {
      await fetch('/api/hero-video', { method: 'DELETE' });
    } catch {
      // ignore network error on reset
    }
    setUploadedVideoUrl(null);
    setUploadedFileName(null);
    setIsPlaying(true);
  };

  return (
    <section className="relative bg-[#181a20] overflow-hidden border-b border-slate-700/60">
      {/* Subtle Logo-Inspired Ambient Glows (Crimson Red & Royal Navy) */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#b91c1c]/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-[#1d4ed8]/12 rounded-full blur-3xl pointer-events-none" />

      {/* Split 2-Column Hero Container: TEXT ON LEFT (with Logo Design Concept), VIDEO ON RIGHT */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* LEFT-HAND SIDE: Editorial Copy Styled with the OLA Continental Logo Design Concept */}
          <div className="lg:col-span-6 order-1 flex flex-col">
            <div className="flex-1 bg-[#222630] border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
              {/* Top Crimson-Red & Royal-Navy Logo Accent Bar */}
              <div className="h-2 w-full flex">
                <div className="w-1/2 bg-[#b91c1c]" />
                <div className="w-1/2 bg-[#172554]" />
              </div>

              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  {/* Signature Signboard Crest Lockup */}
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <OlaLogoMark variant="hero" />
                  </div>

                  {/* Clean Metadata Line */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wider text-slate-300 mb-3">
                    <span className="text-[#f87171]">ESTABLISHED 2006</span>
                    <span aria-hidden="true" className="text-slate-500">·</span>
                    <span className="font-data text-slate-300">RC: 203356</span>
                    <span aria-hidden="true" className="text-slate-500">·</span>
                    <span className="font-data text-slate-400">CAC BN: 3189204</span>
                  </div>

                  {/* Display Headline Echoing the Logo's Bold "OLA" + Italic Crimson "Continental" */}
                  <h1 className="font-display text-3xl sm:text-4xl xl:text-5xl font-bold tracking-tight text-white leading-[1.1] text-balance">
                    <span className="inline-flex items-baseline gap-2.5 flex-wrap">
                      <span className="font-sans font-black tracking-tight bg-[#172554] text-white px-2.5 py-0.5 rounded border-2 border-[#dc2626] text-2xl sm:text-3xl align-middle">
                        OLA
                      </span>
                      <span className="italic text-[#f87171]">Continental</span>
                    </span>
                    <span className="block mt-2 text-white">
                      Properties &amp; Civil Construction.
                    </span>
                  </h1>

                  {/* 3D Kinetic Typography Secondary Line */}
                  <KineticText />

                  {/* Grounded Value Statement */}
                  <p className="mt-4 text-sm sm:text-base text-slate-200 max-w-xl font-normal leading-relaxed">
                    Led by Engineer Samuel Aleji for over 19 years. Verified real estate brokerage, cadastral survey charting, ongoing civil building works, and finished executive estates across Ogbomoso and Lagos corridors.
                  </p>
                </div>

                {/* Primary & Secondary Action Row */}
                <div className="mt-7 pt-6 border-t border-slate-700/70 flex flex-wrap items-center gap-3">
                  <button
                    onClick={onExploreProperties}
                    className="px-5 py-3 text-xs sm:text-sm font-semibold tracking-wide text-white bg-[#b91c1c] hover:bg-[#991b1b] rounded-xl transition-all shadow-lg shadow-[#b91c1c]/25 inline-flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 group"
                  >
                    <span>Explore Verified Properties</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={onOpenConstructions}
                    className="px-4 py-3 text-xs sm:text-sm font-semibold text-white bg-[#172554] hover:bg-[#1e3a8a] border border-[#38bdf8]/40 rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 whitespace-nowrap shrink-0 shadow-md"
                  >
                    <HardHat className="w-4 h-4 text-[#38bdf8]" />
                    <span>View Constructions</span>
                  </button>

                  <button
                    onClick={() => setShowFullVideoModal(true)}
                    className="px-4 py-3 text-xs sm:text-sm font-semibold text-slate-100 bg-[#181a20] hover:bg-slate-800 border border-slate-600 rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 whitespace-nowrap shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-[#4ade80] text-[#4ade80]" />
                    <span>Fullscreen Tour</span>
                  </button>

                  <button
                    onClick={onOpenChat}
                    className="px-3.5 py-3 text-xs sm:text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/70 rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Sparkles className="w-4 h-4 text-[#38bdf8]" />
                    <span>Ask Ola AI</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT-HAND SIDE: Video Showcase & Upload Panel */}
          <div className="lg:col-span-6 order-2 flex flex-col">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex-1 bg-[#222630] border rounded-2xl overflow-hidden shadow-2xl transition-all flex flex-col justify-between ${
                isDragging
                  ? 'border-[#dc2626] ring-2 ring-[#dc2626]/40'
                  : 'border-slate-700/80'
              }`}
            >
              {/* Video Viewport */}
              <div className="relative flex-1 min-h-[280px] sm:min-h-[340px] bg-black overflow-hidden">
                {uploadedVideoUrl ? (
                  <video
                    ref={videoRef}
                    src={uploadedVideoUrl}
                    autoPlay
                    muted={isMuted}
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : isPlaying ? (
                  <iframe
                    className="w-full h-full pointer-events-none scale-[1.06]"
                    src={`https://www.youtube-nocookie.com/embed/${DEFAULT_YOUTUBE_ID}?autoplay=1&mute=${
                      isMuted ? '1' : '0'
                    }&controls=0&loop=1&playlist=${DEFAULT_YOUTUBE_ID}&playsinline=1&rel=0&showinfo=0&modestbranding=1&enablejsapi=1`}
                    title="Ola Continental Property Showcase Video"
                    allow="autoplay; encrypted-media; picture-in-picture"
                  />
                ) : (
                  <div
                    className="w-full h-full bg-cover bg-center flex items-center justify-center"
                    style={{
                      backgroundImage: `linear-gradient(rgba(24,26,32,0.55), rgba(24,26,32,0.7)), url('/assets/aistudio/910713664_1455940486721545_188622865862031933_n_c003821d.jpg')`,
                    }}
                  >
                    <button
                      onClick={togglePlay}
                      className="w-14 h-14 rounded-full bg-[#b91c1c] hover:bg-[#991b1b] text-white flex items-center justify-center shadow-xl cursor-pointer transition-transform hover:scale-105"
                      aria-label="Play Video"
                    >
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    </button>
                  </div>
                )}

                {/* Compact Floating Playback Buttons */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-lg bg-[#181a20]/85 hover:bg-[#181a20] text-slate-200 border border-slate-700 backdrop-blur-md transition-colors cursor-pointer"
                    title={isMuted ? 'Unmute Video' : 'Mute Video'}
                    aria-label={isMuted ? 'Unmute Video' : 'Mute Video'}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-[#4ade80]" />
                    )}
                  </button>
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-lg bg-[#181a20]/85 hover:bg-[#181a20] text-slate-200 border border-slate-700 backdrop-blur-md transition-colors cursor-pointer"
                    title={isPlaying ? 'Pause Video' : 'Play Video'}
                    aria-label={isPlaying ? 'Pause Video' : 'Play Video'}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 text-[#38bdf8]" />
                    )}
                  </button>
                  <button
                    onClick={() => setShowFullVideoModal(true)}
                    className="p-2 rounded-lg bg-[#181a20]/85 hover:bg-[#181a20] text-slate-200 border border-slate-700 backdrop-blur-md transition-colors cursor-pointer"
                    title="Expand Fullscreen Tour"
                    aria-label="Expand Fullscreen Tour"
                  >
                    <Maximize2 className="w-4 h-4 text-[#38bdf8]" />
                  </button>
                </div>

                {/* Drag-and-Drop Overlay Prompt */}
                {isDragging && (
                  <div className="absolute inset-0 bg-[#181a20]/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-20">
                    <Upload className="w-10 h-10 text-[#dc2626] mb-2 animate-bounce" />
                    <p className="text-sm font-semibold text-white">Drop video file to set homepage video</p>
                    <p className="text-xs text-slate-400 mt-1">Supports MP4, WebM, and MOV</p>
                  </div>
                )}
              </div>

              {/* Dedicated Video Upload & Management Bar */}
              <div className="p-4 bg-[#1e222b] border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#172554] border border-[#dc2626]/60 flex items-center justify-center text-white shrink-0">
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Film className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-[240px]">
                      {uploading
                        ? 'Uploading video...'
                        : uploadedFileName
                        ? uploadedFileName
                        : 'Field Showcase & Site Tour'}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {uploadError ? (
                        <span className="text-amber-400">{uploadError}</span>
                      ) : uploadedVideoUrl ? (
                        'Custom uploaded video active'
                      ) : (
                        'Drop a video or upload MP4 / WebM / MOV'
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-label="Upload Hero Video"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-[#172554] hover:bg-[#1e3a8a] border border-[#dc2626]/70 disabled:opacity-60 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-md"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadedVideoUrl ? 'Replace Video' : 'Upload Video'}</span>
                  </button>

                  {uploadedVideoUrl && (
                    <button
                      type="button"
                      onClick={handleResetVideo}
                      className="px-2.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-[#181a20] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                      title="Restore Default Showcase Video"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Strip & Core Attributes - 4-Column Full-Width Row Below Hero Split */}
      <div className="relative z-10 w-full bg-[#222630] border-t border-slate-700/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#f87171] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white">Institutional Title Security</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Cadastral survey charting, zero government acquisition, and certified lineage escrow.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#38bdf8] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white">Headquarters Landmark</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  No. 2, Olukoko St., Behind LAUTECH Teaching Hospital, Ogbomoso.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-[#38bdf8] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white">Active Operating Corridors</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Under G, Adenike Hostels, Aroje Belt, Odo-Oba, &amp; Mushin Commercial (Lagos).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#4ade80] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white">Direct WhatsApp &amp; Phone</h4>
                <a
                  href="https://wa.me/2348033848107?text=Hello%20Engineer%20Samuel%20Aleji,%20I%20am%20inquiring%20about%20Ola%20Continental%20Properties"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-data text-xs text-[#4ade80] hover:underline block mt-0.5 tabular-nums"
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
          <div className="relative w-full max-w-3xl bg-[#222630] rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-[#1e222b]">
              <div>
                <h3 className="text-lg font-bold font-display text-white">
                  Ola Continental Video Tour
                </h3>
                <p className="text-xs text-slate-300">
                  {uploadedFileName
                    ? `Uploaded Video: ${uploadedFileName}`
                    : 'Authentic Field Showcase & Property Walkthrough'}
                </p>
              </div>
              <button
                onClick={() => setShowFullVideoModal(false)}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-[#282c37] hover:bg-slate-700 rounded-lg border border-slate-700 cursor-pointer transition-colors"
              >
                Close (ESC)
              </button>
            </div>
            <div className="w-full flex justify-center bg-[#181a20] p-4 sm:p-6 overflow-y-auto">
              {uploadedVideoUrl ? (
                <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-black">
                  <video
                    ref={modalVideoRef}
                    src={uploadedVideoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-full max-w-sm aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-black">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube-nocookie.com/embed/${DEFAULT_YOUTUBE_ID}?autoplay=1&controls=1&rel=0&loop=1&playlist=${DEFAULT_YOUTUBE_ID}`}
                    title="Ola Continental Official Video Tour"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
            <div className="p-4 bg-[#1e222b] border-t border-slate-700 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#4ade80]" />
                <span>Verified Holdings &amp; Live Site Walkthrough</span>
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
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#b91c1c] rounded-xl hover:bg-[#991b1b] cursor-pointer shadow-md"
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
