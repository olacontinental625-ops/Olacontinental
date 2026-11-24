import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Clock,
  Calendar,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Phone,
  ShieldCheck,
  Tag,
  X,
  UserCheck,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { BlogPost, BlogCategory } from '../types';
import { BLOG_POSTS } from '../data/blogs';
import { listenToBlogs } from '../lib/firebase';
import { OlaLogoMark } from './OlaLogoMark';

interface BlogsSectionProps {
  onOpenViewing: () => void;
  onOpenChat: () => void;
  onNavigateProperties: () => void;
  variant?: 'page' | 'homepage';
  onViewAllBlogs?: () => void;
}

const CATEGORIES: BlogCategory[] = [
  'All',
  'Land Verification & Legal',
  'Student Hostel ROI',
  'Civil Construction',
  'Diaspora Guide',
  'Market Intelligence',
];

export const BlogsSection: React.FC<BlogsSectionProps> = ({
  onOpenViewing,
  onOpenChat,
  onNavigateProperties,
  variant = 'page',
  onViewAllBlogs,
}) => {
  const isHomePreview = variant === 'homepage';
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveBlogs, setLiveBlogs] = useState<BlogPost[]>([]);
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync live articles from Firestore and /api/blogs
  useEffect(() => {
    const unsub = listenToBlogs((firestorePosts) => {
      if (firestorePosts && firestorePosts.length > 0) {
        setLiveBlogs((prev) => {
          const ids = new Set(firestorePosts.map((b) => b.id));
          const remaining = prev.filter((b) => !ids.has(b.id));
          return [...firestorePosts, ...remaining];
        });
      }
    });

    fetch('/api/blogs')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.blogs) && data.blogs.length > 0) {
          setLiveBlogs((prev) => {
            const ids = new Set(data.blogs.map((b: BlogPost) => b.id));
            const remaining = prev.filter((b) => !ids.has(b.id));
            return [...data.blogs, ...remaining];
          });
        }
      })
      .catch((err) => console.warn('Blogs API load notice:', err));

    return () => unsub();
  }, []);

  // Merge live DB blogs with curated editorial articles (deduping by id)
  const allPosts = useMemo(() => {
    const seen = new Set<string>();
    const combined: BlogPost[] = [];
    for (const post of [...liveBlogs, ...BLOG_POSTS]) {
      if (!seen.has(post.id)) {
        seen.add(post.id);
        combined.push(post);
      }
    }
    return combined;
  }, [liveBlogs]);

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      if (selectedCategory !== 'All' && post.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = post.title.toLowerCase().includes(q);
        const matchExcerpt = post.excerpt.toLowerCase().includes(q);
        const matchCorridor = post.corridorTag.toLowerCase().includes(q);
        const matchTags = post.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchExcerpt && !matchCorridor && !matchTags) {
          return false;
        }
      }
      return true;
    });
  }, [allPosts, selectedCategory, searchQuery]);

  const featuredPost = useMemo(() => {
    return filteredPosts.find((p) => p.featured) || filteredPosts[0] || null;
  }, [filteredPosts]);

  const remainingPosts = useMemo(() => {
    if (!featuredPost) return filteredPosts;
    return filteredPosts.filter((p) => p.id !== featuredPost.id);
  }, [filteredPosts, featuredPost]);

  const handleCopyArticleSummary = (post: BlogPost) => {
    const url = `${window.location.origin}/#blogs`;
    navigator.clipboard.writeText(`${post.title} — Ola Continental Editorial\n${url}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const visibleRemainingPosts = isHomePreview ? remainingPosts.slice(0, 3) : remainingPosts;

  return (
    <section
      id="blogs-section"
      className={`py-16 relative overflow-hidden ${
        isHomePreview
          ? 'bg-[#181a20] text-slate-100 border-t border-slate-700/60'
          : 'bg-[#07132b] text-[#f0f9ff] min-h-[85vh]'
      }`}
    >
      {/* Ambient architectural lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#1d4ed8]/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#b91c1c]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Editorial Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
          <div className="max-w-3xl">
            <div className="mb-4">
              <OlaLogoMark variant="section" />
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-widest uppercase text-[#38bdf8] mb-2">
              <BookOpen className="w-4 h-4" />
              <span>FIELD JOURNAL &amp; ENGINEERING INSIGHTS</span>
              <span aria-hidden="true" className="text-white/40">·</span>
              <span className="font-data text-xs text-[#93c5fd]/80">OGBOMOSO &amp; LAGOS</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Real Estate &amp; Civil Construction Blog
            </h2>

            <p className="mt-3 text-sm sm:text-base text-[#bfdbfe] leading-relaxed font-normal">
              Practical field intelligence from Engineer Samuel Aleji covering Oyo State cadastral charting, LAUTECH student hostel ROI, BS 8110 building engineering, and safe diaspora acquisitions.
            </p>
          </div>

          {/* Search Input or View All Link */}
          <div className="w-full lg:w-80 shrink-0 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#38bdf8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles, corridors, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0b1e42] border border-[#1d4ed8]/50 rounded-xl text-xs text-white placeholder-[#93c5fd]/60 focus:outline-none focus:border-[#38bdf8] shadow-lg"
              />
            </div>
            {isHomePreview && onViewAllBlogs && (
              <button
                onClick={onViewAllBlogs}
                className="w-full py-2.5 px-4 bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow"
              >
                <span>Open Full Blog Archive ({allPosts.length} Articles)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-10 pb-6 border-b border-[#1d4ed8]/30">
          {CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-[#2563eb] text-white shadow-lg shadow-[#2563eb]/25 border border-[#38bdf8]/50'
                    : 'bg-[#0b1e42] text-[#bfdbfe] hover:text-white border border-[#1d4ed8]/30 hover:border-[#38bdf8]/40'
                }`}
              >
                {category === 'All' ? 'All Articles' : category}
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 ? (
          <div className="bg-[#0b1e42] border border-[#1d4ed8]/40 rounded-3xl p-12 text-center space-y-4">
            <BookOpen className="w-10 h-10 text-[#38bdf8] mx-auto opacity-80" />
            <h3 className="font-display text-2xl font-bold text-white">No Matching Articles Found</h3>
            <p className="text-xs text-[#bfdbfe] max-w-md mx-auto">
              No articles matched your current filter or search term. Reset filters to view all real estate and engineering publications.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Show All Articles
            </button>
          </div>
        ) : (
          <>
            {/* Featured Spotlight Article Card */}
            {featuredPost && (
              <div
                onClick={() => setActiveArticle(featuredPost)}
                className="group mb-12 bg-[#0b1e42] border border-[#1d4ed8]/40 hover:border-[#38bdf8]/60 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 cursor-pointer transition-all duration-300"
              >
                <div className="lg:col-span-6 relative min-h-[260px] sm:min-h-[340px] overflow-hidden bg-[#040b19]">
                  <img
                    src={featuredPost.coverImage}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07132b] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0b1e42]/80" />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#2563eb] text-white text-[10px] font-bold tracking-widest uppercase rounded-lg shadow">
                      Featured Guide
                    </span>
                    <span className="px-3 py-1 bg-[#07132b]/85 backdrop-blur-md text-[#38bdf8] border border-[#38bdf8]/30 text-[10px] font-semibold rounded-lg">
                      {featuredPost.category}
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-6 p-7 sm:p-10 flex flex-col justify-between space-y-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#93c5fd] mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#38bdf8]" />
                        <span>{featuredPost.publishedAt}</span>
                      </span>
                      <span className="text-white/30">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
                        <span>{featuredPost.readTime}</span>
                      </span>
                      <span className="text-white/30">·</span>
                      <span className="flex items-center gap-1 text-[#38bdf8]">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{featuredPost.corridorTag}</span>
                      </span>
                    </div>

                    <h2 className="font-display text-2xl sm:text-3xl font-bold text-white group-hover:text-[#38bdf8] transition-colors leading-snug">
                      {featuredPost.title}
                    </h2>

                    <p className="mt-3 text-xs sm:text-sm text-[#bfdbfe] leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                  </div>

                  <div className="pt-5 border-t border-[#1d4ed8]/30 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#1d4ed8]/30 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8] font-bold text-xs">
                        SA
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{featuredPost.author}</div>
                        <div className="text-[10px] text-[#93c5fd]">{featuredPost.authorRole}</div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1d4ed8] group-hover:bg-[#0284c7] text-white text-xs font-semibold rounded-xl transition-colors">
                      <span>Read Full Guide</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Editorial Articles Grid */}
            {visibleRemainingPosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
                {visibleRemainingPosts.map((post) => (
                  <article
                    key={post.id}
                    onClick={() => setActiveArticle(post)}
                    className="group bg-[#0b1e42] border border-[#1d4ed8]/30 hover:border-[#38bdf8]/60 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-1"
                  >
                    <div>
                      {/* Card Image */}
                      <div className="relative h-48 overflow-hidden bg-[#040b19]">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1e42] via-transparent to-transparent" />
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#07132b]/85 backdrop-blur-md border border-[#38bdf8]/30 text-[#38bdf8] text-[10px] font-bold uppercase tracking-wider rounded-md">
                          {post.category}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 space-y-3">
                        <div className="flex items-center gap-2.5 text-[11px] text-[#93c5fd]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#38bdf8]" />
                            <span>{post.publishedAt}</span>
                          </span>
                          <span className="text-white/30">·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#38bdf8]" />
                            <span>{post.readTime}</span>
                          </span>
                        </div>

                        <h3 className="font-display text-xl font-bold text-white group-hover:text-[#38bdf8] transition-colors leading-snug line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="text-xs text-[#bfdbfe] leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-4 border-t border-[#1d4ed8]/30 flex items-center justify-between text-xs">
                      <span className="text-[11px] font-medium text-[#93c5fd] truncate pr-2">
                        {post.author}
                      </span>
                      <span className="font-semibold text-[#38bdf8] group-hover:text-white flex items-center gap-1 shrink-0 transition-colors">
                        <span>Read Article</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {/* Bottom Interactive Consultation Callout */}
        <div className="bg-[#0b1e42] border border-[#1d4ed8]/40 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#38bdf8] flex items-center gap-2 justify-center md:justify-start">
              <ShieldCheck className="w-4 h-4 text-[#25D366]" />
              <span>Verify Before You Invest</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-white">
              Have Questions About Land Titles or Construction Costs?
            </h3>
            <p className="text-xs text-[#bfdbfe] max-w-2xl">
              Ask Ola AI for instant insights across Adenike, Under-G, Mushin Lagos, and Odo-Oba corridors or book a dedicated Tuesday on-site inspection with our senior survey team.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <button
              onClick={onOpenChat}
              className="px-4 py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>Ask Ola AI</span>
            </button>
            <button
              onClick={onOpenViewing}
              className="px-4 py-2.5 bg-[#07132b] hover:bg-[#0c2a63] border border-[#38bdf8]/40 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Schedule Tuesday Walkthrough</span>
            </button>
          </div>
        </div>
      </div>

      {/* Article Reader Modal */}
      {activeArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
          onClick={() => setActiveArticle(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-[#0b1e42] border border-[#1d4ed8]/50 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="px-6 py-4 bg-[#07132b] border-b border-[#1d4ed8]/40 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setActiveArticle(null)}
                  className="text-[#bfdbfe] hover:text-white flex items-center gap-1.5 font-semibold cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-[#38bdf8]" />
                  <span>All Articles</span>
                </button>
                <span className="text-white/30">/</span>
                <span className="text-[#38bdf8] font-semibold truncate max-w-[200px] sm:max-w-xs">
                  {activeArticle.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyArticleSummary(activeArticle)}
                  className="px-3 py-1.5 bg-[#0b1e42] hover:bg-[#1d4ed8]/30 border border-[#1d4ed8]/40 text-[#bfdbfe] hover:text-white rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366]" /> : <Share2 className="w-3.5 h-3.5 text-[#38bdf8]" />}
                  <span>{copiedLink ? 'Copied!' : 'Share'}</span>
                </button>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="p-1.5 text-[#bfdbfe] hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  aria-label="Close article"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Article Content */}
            <div className="overflow-y-auto flex-1">
              {/* Hero Cover */}
              <div className="relative h-56 sm:h-72 bg-[#040b19]">
                <img
                  src={activeArticle.coverImage}
                  alt={activeArticle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1e42] via-[#0b1e42]/40 to-transparent" />
              </div>

              <div className="px-6 sm:px-10 pb-10 -mt-12 relative z-10 space-y-6">
                {/* Article Meta & Title */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5 text-xs">
                    <span className="px-3 py-1 bg-[#2563eb] text-white font-bold uppercase tracking-wider rounded-md text-[10px]">
                      {activeArticle.category}
                    </span>
                    <span className="text-[#93c5fd] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#38bdf8]" />
                      {activeArticle.publishedAt}
                    </span>
                    <span className="text-white/30">·</span>
                    <span className="text-[#93c5fd] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#38bdf8]" />
                      {activeArticle.readTime}
                    </span>
                    <span className="text-white/30">·</span>
                    <span className="text-[#38bdf8] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {activeArticle.corridorTag}
                    </span>
                  </div>

                  <h2 className="font-display text-2xl sm:text-4xl font-bold text-white leading-tight">
                    {activeArticle.title}
                  </h2>

                  <p className="text-sm sm:text-base text-[#bfdbfe] italic border-l-2 border-[#38bdf8] pl-4 py-1">
                    {activeArticle.excerpt}
                  </p>
                </div>

                {/* Author Card */}
                <div className="p-4 bg-[#07132b] border border-[#1d4ed8]/40 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#1d4ed8]/30 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8] font-bold text-xs">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{activeArticle.author}</div>
                      <div className="text-[11px] text-[#93c5fd]">
                        {activeArticle.authorRole} · Ola Continental Properties (Est. 2006)
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#38bdf8] bg-[#0b1e42] px-2.5 py-1 rounded border border-[#1d4ed8]/40">
                    CAC BN: 3189204
                  </span>
                </div>

                {/* Body Paragraphs */}
                <div className="space-y-4 text-sm sm:text-base text-[#e0f2fe] leading-relaxed">
                  {activeArticle.content.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>

                {/* Tags */}
                {activeArticle.tags && activeArticle.tags.length > 0 && (
                  <div className="pt-4 border-t border-[#1d4ed8]/30 flex flex-wrap items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-[#38bdf8]" />
                    {activeArticle.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 bg-[#07132b] border border-[#1d4ed8]/40 text-[#93c5fd] text-[11px] rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Article Reader Action Strip */}
                <div className="p-6 bg-[#07132b] border border-[#38bdf8]/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs space-y-1 text-center sm:text-left">
                    <div className="font-bold text-white text-sm">
                      Ready to act on this insight?
                    </div>
                    <p className="text-[#bfdbfe]">
                      Consult Engineer Samuel Aleji directly on WhatsApp, browse verified listings, or ask Ola AI.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
                    <button
                      onClick={() => {
                        setActiveArticle(null);
                        onNavigateProperties();
                      }}
                      className="px-4 py-2 bg-[#1d4ed8] hover:bg-[#0284c7] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Browse Verified Properties
                    </button>
                    <button
                      onClick={() => {
                        setActiveArticle(null);
                        onOpenChat();
                      }}
                      className="px-4 py-2 bg-[#0b1e42] hover:bg-[#1d4ed8]/40 border border-[#38bdf8]/40 text-[#38bdf8] hover:text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ask Ola AI</span>
                    </button>
                    <a
                      href={`https://wa.me/2348033848107?text=${encodeURIComponent(
                        `Hello Engineer Samuel Aleji, I just read your article "${activeArticle.title}" on the Ola Continental blog and would like to make an inquiry.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#25D366] hover:bg-[#20b859] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
