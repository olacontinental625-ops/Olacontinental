import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldCheck, RefreshCw, Phone, Database, Download, BookOpen, CheckCircle2, PlusCircle } from 'lucide-react';
import { LeadSubmission, ViewingRequest, InspectionReview, BlogPost, BlogCategory } from '../types';
import { listenToViewings, listenToLeads, listenToBlogs, createFirestoreBlog } from '../lib/firebase';

interface AdminDashboardModalProps {
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  onClose,
}) => {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<'viewings' | 'leads' | 'reviews' | 'blogs'>('viewings');

  const [viewings, setViewings] = useState<ViewingRequest[]>([]);
  const [leads, setLeads] = useState<LeadSubmission[]>([]);
  const [reviews, setReviews] = useState<InspectionReview[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);

  // Quick Blog Publisher State
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState<Exclude<BlogCategory, 'All'>>('Market Intelligence');
  const [blogCorridor, setBlogCorridor] = useState('Ogbomoso & Lagos');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [publishingBlog, setPublishingBlog] = useState(false);
  const [blogStatusMsg, setBlogStatusMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === 'ola2006' || passcode.trim() === 'admin') {
      setIsAuthenticated(true);
      setAuthError('');
      fetchData();
    } else {
      setAuthError('Incorrect passcode. Use "ola2006"');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    // Real-time Firestore sync
    const unsubViewings = listenToViewings((liveViewings) => {
      if (liveViewings && liveViewings.length > 0) {
        setViewings((prev) => {
          const ids = new Set(liveViewings.map((v) => v.id));
          const filtered = prev.filter((v) => !ids.has(v.id));
          return [...liveViewings, ...filtered];
        });
      }
    });

    const unsubLeads = listenToLeads((liveLeads) => {
      if (liveLeads && liveLeads.length > 0) {
        setLeads((prev) => {
          const ids = new Set(liveLeads.map((l) => l.id));
          const filtered = prev.filter((l) => !ids.has(l.id));
          return [...liveLeads, ...filtered];
        });
      }
    });

    const unsubBlogs = listenToBlogs((liveBlogs) => {
      if (liveBlogs && liveBlogs.length > 0) {
        setBlogs((prev) => {
          const ids = new Set(liveBlogs.map((b) => b.id));
          const filtered = prev.filter((b) => !ids.has(b.id));
          return [...liveBlogs, ...filtered];
        });
      }
    });

    return () => {
      unsubViewings();
      unsubLeads();
      unsubBlogs();
    };
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vRes, lRes, rRes, bRes] = await Promise.all([
        fetch('/api/viewings').then((r) => r.json()).catch(() => ({ viewings: [] })),
        fetch('/api/leads').then((r) => r.json()).catch(() => ({ leads: [] })),
        fetch('/api/reviews').then((r) => r.json()).catch(() => ({ reviews: [] })),
        fetch('/api/blogs').then((r) => r.json()).catch(() => ({ blogs: [] })),
      ]);

      if (vRes.viewings) setViewings(vRes.viewings);
      if (lRes.leads) setLeads(lRes.leads);
      if (rRes.reviews) setReviews(rRes.reviews);
      if (bRes.blogs) setBlogs(bRes.blogs);
    } catch (err) {
      console.error('Failed to load admin records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim() || !blogExcerpt.trim() || !blogContent.trim()) return;

    setPublishingBlog(true);
    setBlogStatusMsg('');

    const contentParagraphs = blogContent
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    const readMinutes = Math.max(2, Math.ceil(contentParagraphs.join(' ').split(/\s+/).length / 180));

    const newPost: BlogPost = {
      id: `blog-${Date.now()}`,
      title: blogTitle.trim(),
      excerpt: blogExcerpt.trim(),
      content: contentParagraphs,
      category: blogCategory,
      author: 'Engr. Samuel Aleji',
      authorRole: 'Principal Consultant & Civil Engineer',
      publishedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      readTime: `${readMinutes} min read`,
      coverImage: '/assets/aistudio/IMG-20261031-WA0089_fc7755dc.jpg',
      corridorTag: blogCorridor.trim() || 'Ogbomoso & Lagos',
      featured: false,
      tags: [blogCategory, 'Ola Continental'],
    };

    try {
      await Promise.all([
        createFirestoreBlog(newPost).catch((err) => console.warn('Firestore blog save warning:', err)),
        fetch('/api/blogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPost),
        }),
      ]);

      setBlogTitle('');
      setBlogExcerpt('');
      setBlogContent('');
      setBlogStatusMsg('Article published live to the Blogs section!');
      fetchData();
    } catch (err) {
      console.error('Publish blog error:', err);
      setBlogStatusMsg('Could not publish blog article. Please try again.');
    } finally {
      setPublishingBlog(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#071A2B] border border-[#1E486A] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1E486A]/50 bg-[#051421] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#C5A880]" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-display text-[#FAF4E8]">
                  Ola Continental Broker Administration Portal
                </h3>
                <span className="text-[10px] bg-[#25D366]/20 text-[#25D366] px-2 py-0.5 rounded border border-[#25D366]/40 flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  <span>Firestore & Storage Active</span>
                </span>
              </div>
              <p className="text-xs text-[#FAF4E8]/60">Live synced to Cloud Firestore & local persistence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/hostinger_website_backup.zip"
              download="hostinger_website_backup.zip"
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-lg transition-colors flex items-center gap-1.5 shadow"
              title="Download Hostinger Public_HTML Website Backup"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Hostinger .ZIP</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-[#FAF4E8]/60 hover:text-white rounded-lg hover:bg-[#0D2638] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#0D2638] border border-[#1E486A] flex items-center justify-center text-[#C5A880] mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold font-display text-[#FAF4E8]">Broker Authorization</h4>
            <p className="text-xs text-[#FAF4E8]/70">
              Please enter the management passcode to access client intake and Tuesday inspection logs.
            </p>

            <form onSubmit={handleLogin} className="space-y-3 pt-2">
              <input
                type="password"
                placeholder="Passcode (Default: ola2006)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full px-3 py-2 text-xs text-center bg-[#1e222b] border border-slate-700 rounded-lg text-white focus:border-[#38bdf8] focus:outline-none"
              />
              {authError && <div className="text-xs text-red-400">{authError}</div>}
              <button
                type="submit"
                className="w-full py-2 bg-[#8B6347] hover:bg-[#9E7353] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Unlock Dashboard
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Nav Tabs */}
            <div className="px-6 py-3 bg-[#051421] border-b border-[#1E486A]/40 flex items-center justify-between">
              <div className="flex gap-4 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('viewings')}
                  className={`pb-1 cursor-pointer ${
                    activeTab === 'viewings' ? 'text-[#F3E8D0] border-b-2 border-[#8B6347]' : 'text-[#FAF4E8]/60 hover:text-white'
                  }`}
                >
                  Inspection Requests ({viewings.length})
                </button>
                <button
                  onClick={() => setActiveTab('leads')}
                  className={`pb-1 cursor-pointer ${
                    activeTab === 'leads' ? 'text-[#F3E8D0] border-b-2 border-[#8B6347]' : 'text-[#FAF4E8]/60 hover:text-white'
                  }`}
                >
                  Custom Briefs / Leads ({leads.length})
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-1 cursor-pointer ${
                    activeTab === 'reviews' ? 'text-[#F3E8D0] border-b-2 border-[#8B6347]' : 'text-[#FAF4E8]/60 hover:text-white'
                  }`}
                >
                  Inspection Reviews ({reviews.length})
                </button>
                <button
                  onClick={() => setActiveTab('blogs')}
                  className={`pb-1 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'blogs' ? 'text-[#38bdf8] border-b-2 border-[#38bdf8]' : 'text-[#FAF4E8]/60 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Field Blogs ({blogs.length})</span>
                </button>
              </div>

              <button
                onClick={fetchData}
                disabled={loading}
                className="p-1.5 text-xs text-[#FAF4E8]/70 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Tabular Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {activeTab === 'viewings' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#1E486A]/50 text-[#C5A880]">
                        <th className="py-2.5 px-3">Date Requested</th>
                        <th className="py-2.5 px-3">Client Name</th>
                        <th className="py-2.5 px-3">Phone</th>
                        <th className="py-2.5 px-3">Target Property</th>
                        <th className="py-2.5 px-3">Format</th>
                        <th className="py-2.5 px-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E486A]/30">
                      {viewings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-[#FAF4E8]/50">
                            No inspection appointments logged yet.
                          </td>
                        </tr>
                      ) : (
                        viewings.map((v, i) => (
                          <tr key={v.id || i} className="hover:bg-[#051421]/60">
                            <td className="py-2.5 px-3 font-data text-[#FAF4E8]/80">{v.preferredDate}</td>
                            <td className="py-2.5 px-3 font-semibold text-white">{v.clientName}</td>
                            <td className="py-2.5 px-3 font-data text-[#25D366]">{v.phone}</td>
                            <td className="py-2.5 px-3 text-[#FAF4E8]/90 truncate max-w-xs">{v.propertyTitle}</td>
                            <td className="py-2.5 px-3 text-[#C5A880] text-[11px]">{v.inspectionType}</td>
                            <td className="py-2.5 px-3">
                              <a
                                href={`https://wa.me/${v.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-1 bg-[#051421] hover:bg-[#0D2638] text-[#25D366] rounded border border-[#25D366]/40 inline-flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'leads' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#1E486A]/50 text-[#C5A880]">
                        <th className="py-2.5 px-3">Date Logged</th>
                        <th className="py-2.5 px-3">Client Name</th>
                        <th className="py-2.5 px-3">Phone</th>
                        <th className="py-2.5 px-3">Purpose & Type</th>
                        <th className="py-2.5 px-3">Budget</th>
                        <th className="py-2.5 px-3">Corridor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E486A]/30">
                      {leads.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-[#FAF4E8]/50">
                            No custom lead briefs logged yet.
                          </td>
                        </tr>
                      ) : (
                        leads.map((l, i) => (
                          <tr key={l.id || i} className="hover:bg-[#051421]/60">
                            <td className="py-2.5 px-3 font-data text-[#FAF4E8]/80 text-[11px]">
                              {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'Recent'}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-white">{l.name}</td>
                            <td className="py-2.5 px-3 font-data text-[#25D366]">{l.phone}</td>
                            <td className="py-2.5 px-3 text-[#FAF4E8]/90">{l.purpose} · {l.propertyType}</td>
                            <td className="py-2.5 px-3 font-data text-[#F3E8D0]">{l.budget}</td>
                            <td className="py-2.5 px-3 text-[#C5A880]">{l.corridor}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-3">
                  {reviews.map((r, i) => (
                    <div key={r.id || i} className="p-3 bg-[#051421] rounded-xl border border-[#1E486A]/40 text-xs">
                      <div className="flex items-center justify-between text-[#C5A880] mb-1">
                        <span className="font-semibold text-white">{r.clientName} ({r.rating} Stars)</span>
                        <span className="text-[11px] font-data text-[#FAF4E8]/50">{r.inspectionDate}</span>
                      </div>
                      <p className="text-[#FAF4E8]/80 italic">"{r.comment}"</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'blogs' && (
                <div className="space-y-6">
                  <form onSubmit={handlePublishBlog} className="p-4 bg-[#051421] rounded-xl border border-[#1E486A]/50 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display text-sm font-bold text-[#38bdf8] flex items-center gap-1.5">
                        <PlusCircle className="w-4 h-4" />
                        <span>Publish New Blog Insight</span>
                      </h4>
                      {blogStatusMsg && (
                        <span className="text-[11px] text-[#25D366] flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{blogStatusMsg}</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Article Title *"
                        value={blogTitle}
                        onChange={(e) => setBlogTitle(e.target.value)}
                        className="sm:col-span-2 px-3 py-2 bg-[#071A2B] border border-[#1E486A] rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                      />
                      <select
                        value={blogCategory}
                        onChange={(e) => setBlogCategory(e.target.value as Exclude<BlogCategory, 'All'>)}
                        className="px-3 py-2 bg-[#071A2B] border border-[#1E486A] rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                      >
                        <option value="Market Intelligence">Market Intelligence</option>
                        <option value="Land Verification & Legal">Land Verification & Legal</option>
                        <option value="Student Hostel ROI">Student Hostel ROI</option>
                        <option value="Civil Construction">Civil Construction</option>
                        <option value="Diaspora Guide">Diaspora Guide</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Short Excerpt / Summary *"
                        value={blogExcerpt}
                        onChange={(e) => setBlogExcerpt(e.target.value)}
                        className="sm:col-span-2 px-3 py-2 bg-[#071A2B] border border-[#1E486A] rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                      />
                      <input
                        type="text"
                        placeholder="Corridor Tag (e.g. Adenike)"
                        value={blogCorridor}
                        onChange={(e) => setBlogCorridor(e.target.value)}
                        className="px-3 py-2 bg-[#071A2B] border border-[#1E486A] rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                      />
                    </div>

                    <textarea
                      rows={3}
                      required
                      placeholder="Write full article paragraphs (separate paragraphs with a blank line) *"
                      value={blogContent}
                      onChange={(e) => setBlogContent(e.target.value)}
                      className="w-full px-3 py-2 bg-[#071A2B] border border-[#1E486A] rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                    />

                    <button
                      type="submit"
                      disabled={publishingBlog}
                      className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {publishingBlog ? 'Publishing...' : 'Publish Article Live'}
                    </button>
                  </form>

                  <div className="space-y-2.5">
                    {blogs.length === 0 ? (
                      <div className="py-6 text-center text-xs text-[#FAF4E8]/50 italic">
                        No custom admin blog posts published yet. Built-in editorial guides are visible on the Blogs page, and any posts published above will appear here in real time.
                      </div>
                    ) : (
                      blogs.map((b) => (
                        <div key={b.id} className="p-3 bg-[#051421] rounded-xl border border-[#1E486A]/40 text-xs flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-white">{b.title}</div>
                            <div className="text-[11px] text-[#93c5fd] mt-0.5">
                              {b.category} · {b.corridorTag} · {b.publishedAt}
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-[#25D366] bg-[#25D366]/10 px-2 py-0.5 rounded shrink-0">
                            Published
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
