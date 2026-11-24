import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock,
  ShieldCheck,
  RefreshCw,
  Phone,
  MessageCircle,
  Mail,
  Database,
  Download,
  BookOpen,
  CheckCircle2,
  PlusCircle,
  Users,
  Search,
  KeyRound,
  LogOut,
  Loader2,
  ArrowLeft,
  Trash2,
  Building2,
  HardHat,
  Settings2,
} from 'lucide-react';
import {
  LeadSubmission,
  ViewingRequest,
  InspectionReview,
  BlogPost,
  BlogCategory,
  CustomerProfile,
  ContactInquiry,
  ConstructionProject,
  Property,
  PageType,
} from '../types';
import { PROPERTIES } from '../data/properties';
import {
  auth,
  listenToViewings,
  listenToLeads,
  listenToBlogs,
  listenToCustomers,
  listenToContacts,
  listenToConstructions,
  listenToProperties,
  createFirestoreBlog,
  createFirestoreConstruction,
  createFirestoreProperty,
  updateFirestoreDocStatus,
  deleteFirestoreRecord,
  signInOwnerWithGoogle,
  signOutFirebaseOwner,
  subscribeOwnerAuthState,
} from '../lib/firebase';
import { OlaLogoMark } from './OlaLogoMark';

const ASSET_IMAGE_PRESETS = [
  { label: 'Olukoko Executive Duplex', url: '/assets/aistudio/IMG-20261031-WA0095_6a943e17.jpg' },
  { label: 'Crown View Modern Bungalow', url: '/assets/aistudio/IMG-20261031-WA0097_f6d3f6dd.jpg' },
  { label: 'LAUTECH Student Hostel Block', url: '/assets/aistudio/IMG-20261021-WA0038_61f97529.jpg' },
  { label: 'Reinforced Foundation Site', url: '/assets/aistudio/IMG-20261031-WA0099_65c15e31.jpg' },
  { label: 'Earthwork & Excavation Site', url: '/assets/aistudio/IMG-20261031-WA0100_49619ebf.jpg' },
  { label: 'Ola Continental HQ Building', url: '/assets/aistudio/910713664_1455940486721545_188622865862031933_n_c003821d.jpg' },
  { label: 'Luxury POP Ceiling Finish', url: '/assets/aistudio/IMG-20261031-WA0088_97524763.jpg' },
];

interface AdminPortalContentProps {
  onClose?: () => void;
  onNavigate?: (page: PageType) => void;
  isModal?: boolean;
}

export const AdminPortalContent: React.FC<AdminPortalContentProps> = ({
  onClose,
  onNavigate,
  isModal = false,
}) => {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [setupRequired, setSetupRequired] = useState<boolean>(false);
  const [statusLoading, setStatusLoading] = useState<boolean>(true);
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'customers' | 'viewings' | 'leads' | 'contacts' | 'listings' | 'reviews' | 'blogs'
  >('customers');
  const [customerSearch, setCustomerSearch] = useState('');

  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [viewings, setViewings] = useState<ViewingRequest[]>([]);
  const [leads, setLeads] = useState<LeadSubmission[]>([]);
  const [contacts, setContacts] = useState<ContactInquiry[]>([]);
  const [reviews, setReviews] = useState<InspectionReview[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [customConstructions, setCustomConstructions] = useState<ConstructionProject[]>([]);
  const [propertyRecords, setPropertyRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [firebaseOwnerEmail, setFirebaseOwnerEmail] = useState<string | null>(auth.currentUser?.email || null);

  // Change Passcode Inline Panel
  const [showPasscodePanel, setShowPasscodePanel] = useState(false);
  const [newOwnerPasscode, setNewOwnerPasscode] = useState('');
  const [passcodeMsg, setPasscodeMsg] = useState('');

  // Quick Blog Publisher State
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState<Exclude<BlogCategory, 'All'>>('Market Intelligence');
  const [blogCorridor, setBlogCorridor] = useState('Ogbomoso & Lagos');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [publishingBlog, setPublishingBlog] = useState(false);
  const [blogStatusMsg, setBlogStatusMsg] = useState('');

  // Dynamic Construction Project Form State
  const [projTitle, setProjTitle] = useState('');
  const [projCategory, setProjCategory] = useState<'ongoing' | 'finished'>('ongoing');
  const [projLocation, setProjLocation] = useState('Behind LAUTECH Teaching Hospital, Ogbomoso');
  const [projPhase, setProjPhase] = useState('Superstructure Blockwork & Slab');
  const [projSpecs, setProjSpecs] = useState('BS 8110 Structural Standard');
  const [projCompletion, setProjCompletion] = useState('60%');
  const [projImage, setProjImage] = useState(ASSET_IMAGE_PRESETS[3].url);
  const [projDesc, setProjDesc] = useState('');
  const [savingProj, setSavingProj] = useState(false);
  const [listingMsg, setListingMsg] = useState('');

  // Dynamic Property Form State
  const [propTitle, setPropTitle] = useState('');
  const [propPurpose, setPropPurpose] = useState<'Buy' | 'Rent' | 'Lease' | 'Invest'>('Buy');
  const [propType, setPropType] = useState<'House' | 'Student Hostel' | 'Apartment' | 'Land' | 'Commercial Property'>('House');
  const [propCorridor, setPropCorridor] = useState<Property['corridor']>('Behind LAUTECH Teaching Hospital');
  const [propPrice, setPropPrice] = useState('₦45,000,000');
  const [propLandSize, setPropLandSize] = useState('650 sqm');
  const [propTitleType, setPropTitleType] = useState('Registered Survey & Deed of Assignment');
  const [propImage, setPropImage] = useState(ASSET_IMAGE_PRESETS[0].url);
  const [propSummary, setPropSummary] = useState('');
  const [savingProp, setSavingProp] = useState(false);

  // Listen to Firebase Owner Auth state
  useEffect(() => {
    const unsubAuth = subscribeOwnerAuthState((user) => {
      setFirebaseOwnerEmail(user?.email || null);
    });
    return () => unsubAuth();
  }, []);

  // Check admin configuration & restore httpOnly session cookie if valid
  useEffect(() => {
    let active = true;
    Promise.all([
      fetch('/api/admin/status').then((r) => r.json()).catch(() => ({ setupRequired: false })),
      fetch('/api/admin/me').then((r) => r.json()).catch(() => ({ authenticated: false })),
    ])
      .then(([statusData, meData]) => {
        if (!active) return;
        setSetupRequired(Boolean(statusData.setupRequired));
        if (meData.authenticated && meData.token) {
          setAdminToken(meData.token);
        }
      })
      .finally(() => {
        if (active) setStatusLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const fetchData = useCallback(async (tokenOverride?: string) => {
    const tokenToUse = tokenOverride || adminToken;
    if (!tokenToUse) return;

    const authHeaders = { Authorization: `Bearer ${tokenToUse}` };

    try {
      setLoading(true);
      const [cRes, vRes, lRes, ctRes, rRes, bRes, conRes, pRes] = await Promise.all([
        fetch('/api/customers', { headers: authHeaders }).then((r) => r.json()).catch(() => ({ customers: [] })),
        fetch('/api/viewings', { headers: authHeaders }).then((r) => r.json()).catch(() => ({ viewings: [] })),
        fetch('/api/leads', { headers: authHeaders }).then((r) => r.json()).catch(() => ({ leads: [] })),
        fetch('/api/contacts', { headers: authHeaders }).then((r) => r.json()).catch(() => ({ contacts: [] })),
        fetch('/api/reviews').then((r) => r.json()).catch(() => ({ reviews: [] })),
        fetch('/api/blogs').then((r) => r.json()).catch(() => ({ blogs: [] })),
        fetch('/api/constructions').then((r) => r.json()).catch(() => ({ constructions: [] })),
        fetch('/api/properties').then((r) => r.json()).catch(() => ({ properties: [] })),
      ]);

      if (Array.isArray(cRes.customers)) setCustomers(cRes.customers);
      if (Array.isArray(vRes.viewings)) setViewings(vRes.viewings);
      if (Array.isArray(lRes.leads)) setLeads(lRes.leads);
      if (Array.isArray(ctRes.contacts)) setContacts(ctRes.contacts);
      if (Array.isArray(rRes.reviews)) setReviews(rRes.reviews);
      if (Array.isArray(bRes.blogs)) setBlogs(bRes.blogs);
      if (Array.isArray(conRes.constructions)) setCustomConstructions(conRes.constructions);
      if (Array.isArray(pRes.properties)) setPropertyRecords(pRes.properties);
    } catch (err) {
      console.error('Failed to load admin records:', err);
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    if (!adminToken) return;
    fetchData(adminToken);

    const unsubCustomers = listenToCustomers((liveCustomers) => {
      if (liveCustomers.length > 0) {
        setCustomers((prev) => {
          const seen = new Set(liveCustomers.map((c) => c.id));
          return [...liveCustomers, ...prev.filter((c) => !seen.has(c.id))];
        });
      }
    });

    const unsubViewings = listenToViewings((liveViewings) => {
      if (liveViewings.length > 0) {
        setViewings((prev) => {
          const ids = new Set(liveViewings.map((v) => v.id));
          return [...liveViewings, ...prev.filter((v) => !ids.has(v.id))];
        });
      }
    });

    const unsubLeads = listenToLeads((liveLeads) => {
      if (liveLeads.length > 0) {
        setLeads((prev) => {
          const ids = new Set(liveLeads.map((l) => l.id));
          return [...liveLeads, ...prev.filter((l) => !ids.has(l.id))];
        });
      }
    });

    const unsubContacts = listenToContacts((liveContacts) => {
      if (liveContacts.length > 0) {
        setContacts((prev) => {
          const ids = new Set(liveContacts.map((ct) => ct.id));
          return [...liveContacts, ...prev.filter((ct) => !ids.has(ct.id))];
        });
      }
    });

    const unsubBlogs = listenToBlogs((liveBlogs) => {
      if (liveBlogs.length > 0) {
        setBlogs((prev) => {
          const ids = new Set(liveBlogs.map((b) => b.id));
          return [...liveBlogs, ...prev.filter((b) => !ids.has(b.id))];
        });
      }
    });

    const unsubConstructions = listenToConstructions((liveConstructions) => {
      if (liveConstructions.length > 0) {
        setCustomConstructions((prev) => {
          const ids = new Set(liveConstructions.map((c) => c.id));
          return [...liveConstructions, ...prev.filter((c) => !ids.has(c.id))];
        });
      }
    });

    const unsubProperties = listenToProperties((liveProps) => {
      if (liveProps.length > 0) {
        setPropertyRecords((prev) => {
          const ids = new Set(liveProps.map((p) => p.id));
          return [...liveProps, ...prev.filter((p) => !ids.has(p.id))];
        });
      }
    });

    return () => {
      unsubCustomers();
      unsubViewings();
      unsubLeads();
      unsubContacts();
      unsubBlogs();
      unsubConstructions();
      unsubProperties();
    };
  }, [adminToken, firebaseOwnerEmail, fetchData]);

  const handleSetupOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (passcode.trim().length < 6) {
      setAuthError('Owner passcode must be at least 6 characters.');
      return;
    }
    if (passcode.trim() !== confirmPasscode.trim()) {
      setAuthError('Passcodes do not match.');
      return;
    }

    setAuthSubmitting(true);
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) {
        throw new Error(data.error || 'Could not configure owner passcode.');
      }
      setSetupRequired(false);
      setAdminToken(data.token);
      setPasscode('');
      setConfirmPasscode('');
    } catch (err: any) {
      setAuthError(err?.message || 'Setup failed.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!passcode.trim()) {
      setAuthError('Please enter your owner admin passcode.');
      return;
    }

    setAuthSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) {
        throw new Error(data.error || 'Invalid owner admin passcode.');
      }
      setAdminToken(data.token);
      setPasscode('');
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleGoogleOwnerLogin = async () => {
    setAuthError('');
    setAuthSubmitting(true);
    try {
      const result = await signInOwnerWithGoogle();
      const email = result.user.email || null;
      setFirebaseOwnerEmail(email);

      const idToken = await result.user.getIdToken();
      const res = await fetch('/api/admin/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) {
        throw new Error(data.error || 'Google owner verification failed.');
      }
      setAdminToken(data.token);
    } catch (err: any) {
      setAuthError(err?.message || 'Google sign-in popup closed or restricted to owner email.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLockAdmin = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    if (firebaseOwnerEmail) {
      await signOutFirebaseOwner().catch(() => {});
    }
    setAdminToken(null);
    setCustomers([]);
    setViewings([]);
    setLeads([]);
    setContacts([]);
  };

  const handleChangePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken || newOwnerPasscode.trim().length < 6) {
      setPasscodeMsg('New passcode must be at least 6 characters.');
      return;
    }
    try {
      const res = await fetch('/api/admin/change-passcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ newPasscode: newOwnerPasscode.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.token) {
        throw new Error(data.error || 'Failed to update passcode.');
      }
      setAdminToken(data.token);
      setNewOwnerPasscode('');
      setPasscodeMsg('Owner passcode updated!');
      setTimeout(() => {
        setPasscodeMsg('');
        setShowPasscodePanel(false);
      }, 2000);
    } catch (err: any) {
      setPasscodeMsg(err?.message || 'Could not update passcode.');
    }
  };

  const handleUpdateRecordStatus = async (
    endpoint: 'customers' | 'viewings' | 'leads' | 'contacts',
    id: string | undefined,
    status: string
  ) => {
    if (!adminToken || !id) return;
    try {
      await fetch(`/api/${endpoint}/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status }),
      });
      if (firebaseOwnerEmail) {
        await updateFirestoreDocStatus(endpoint, id, status).catch(() => {});
      }
      fetchData();
    } catch (err) {
      console.error(`Failed updating ${endpoint} status:`, err);
    }
  };

  const handleDeleteRecord = async (
    endpoint: 'customers' | 'viewings' | 'leads' | 'contacts' | 'reviews' | 'blogs' | 'constructions' | 'properties',
    id: string | undefined
  ) => {
    if (!adminToken || !id) return;
    try {
      await fetch(`/api/${endpoint}/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (firebaseOwnerEmail) {
        await deleteFirestoreRecord(endpoint, id).catch(() => {});
      }
      fetchData();
    } catch (err) {
      console.error(`Failed deleting ${endpoint}:`, err);
    }
  };

  const handleDownloadCustomersCsv = async () => {
    if (!adminToken) return;
    try {
      const res = await fetch('/api/customers/export', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ola-continental-customers.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('CSV export error:', err);
    }
  };

  const handlePublishBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim() || !blogExcerpt.trim() || !blogContent.trim() || !adminToken) return;

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
      const serverPromise = fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(newPost),
      });

      const firestorePromise = firebaseOwnerEmail
        ? createFirestoreBlog(newPost).catch((err) => console.warn('Firestore blog warning:', err))
        : Promise.resolve();

      await Promise.all([serverPromise, firestorePromise]);

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

  const handleAddConstruction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken || !projTitle.trim() || !projLocation.trim()) return;
    setSavingProj(true);
    setListingMsg('');

    const newProj: ConstructionProject = {
      id: `proj-${Date.now()}`,
      title: projTitle.trim(),
      category: projCategory,
      location: projLocation.trim(),
      phaseOrType: projPhase.trim() || (projCategory === 'finished' ? 'Completed Turnkey Delivery' : 'Active Construction'),
      specs: projSpecs.trim() || 'BS 8110 Structural Engineering Standard',
      completionLabel: projCategory === 'finished' ? '100%' : projCompletion.trim() || '50%',
      image: projImage,
      description: projDesc.trim() || `${projTitle.trim()} in ${projLocation.trim()} supervised by Engineer Samuel Aleji.`,
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch('/api/constructions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(newProj),
      });
      if (firebaseOwnerEmail) {
        await createFirestoreConstruction(newProj).catch(() => {});
      }
      setProjTitle('');
      setProjDesc('');
      setListingMsg('Construction project published live to the Constructions page!');
      fetchData();
    } catch (err) {
      console.error('Failed to add construction:', err);
      setListingMsg('Could not save construction project.');
    } finally {
      setSavingProj(false);
    }
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken || !propTitle.trim() || !propPrice.trim()) return;
    setSavingProp(true);
    setListingMsg('');

    const numericPrice = Number(propPrice.replace(/[^0-9]/g, '')) || 0;
    const newProperty: Property = {
      id: `prop-${Date.now()}`,
      title: propTitle.trim(),
      shortDescription: propSummary.trim() || `${propTitle.trim()} verified by Engineer Samuel Aleji in ${propCorridor}.`,
      fullDescription: propSummary.trim() || `${propTitle.trim()} located in ${propCorridor}, verified free of government acquisition with registered cadastral charting.`,
      purpose: propPurpose,
      type: propType,
      corridor: propCorridor,
      address: `${propCorridor}, Nigeria`,
      price: numericPrice,
      priceDisplay: propPrice.trim(),
      landSize: propLandSize.trim() || '650 sqm',
      titleType: propTitleType.trim() || 'Registered Survey & Deed of Assignment',
      beaconCoordinates: 'Verified On-Site Beacon',
      images: [propImage],
      featuredImage: propImage,
      amenities: ['Cadastral Survey Charted', 'Root-of-Title Verified', 'Tuesday Physical & Video Tour'],
      dueDiligenceNotes: ['Verified clear of government acquisition by Engineer Samuel Aleji.'],
      legalFeeEstimated: Math.round(numericPrice * 0.05),
      agencyFee: Math.round(numericPrice * 0.05),
      cadastralChartingEstimated: 250000,
      status: 'Available',
      inspectionSchedule: 'Tuesdays (Dedicated Field Day) & By Appointment',
      suitableFor: ['Buyers in Nigeria', 'Diaspora Investors Outside Nigeria'],
    };

    try {
      await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(newProperty),
      });
      if (firebaseOwnerEmail) {
        await createFirestoreProperty(newProperty).catch(() => {});
      }
      setPropTitle('');
      setPropSummary('');
      setListingMsg('New verified property published live to the Properties Repository!');
      fetchData();
    } catch (err) {
      console.error('Failed to add property:', err);
      setListingMsg('Could not publish property.');
    } finally {
      setSavingProp(false);
    }
  };

  const handleTogglePropertyStatus = async (propertyId: string, nextStatus: Property['status']) => {
    if (!adminToken) return;
    try {
      await fetch(`/api/properties/${encodeURIComponent(propertyId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (firebaseOwnerEmail) {
        await updateFirestoreDocStatus('properties', propertyId, nextStatus).catch(() => {});
      }
      setListingMsg(`Updated status for listing to "${nextStatus}" across live website!`);
      fetchData();
    } catch (err) {
      console.error('Failed to update property status:', err);
    }
  };

  // Merge built-in + custom/override properties for live admin status control
  const mergedAdminProperties = React.useMemo(() => {
    const overrideMap = new Map<string, any>();
    const customFullProps: any[] = [];
    for (const rec of propertyRecords) {
      overrideMap.set(rec.id, rec);
      if (!rec.isOverride && !PROPERTIES.some((bp) => bp.id === rec.id)) {
        customFullProps.push(rec);
      }
    }
    const updatedBuiltIns = PROPERTIES.map((bp) => {
      const ov = overrideMap.get(bp.id);
      return ov ? { ...bp, ...ov } : bp;
    });
    return [...customFullProps, ...updatedBuiltIns];
  }, [propertyRecords]);

  const filteredCustomers = customerSearch.trim()
    ? customers.filter((c) => {
        const q = customerSearch.trim().toLowerCase();
        return [c.fullName, c.phone, c.email, c.whatsapp, c.source, c.status]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(q));
      })
    : customers;

  return (
    <div className="bg-[#0b1e42] border border-[#1d4ed8]/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      {/* Top Crimson & Navy Brand Accent Bar */}
      <div className="h-2 w-full flex">
        <div className="w-1/2 bg-[#b91c1c]" />
        <div className="w-1/2 bg-[#172554]" />
      </div>

      {/* Header */}
      <div className="px-6 py-4 border-b border-[#1d4ed8]/40 bg-[#051421] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <OlaLogoMark variant="navbar" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold font-display text-white">
                Owner Administration &amp; Live Website CMS
              </h2>
              <span className="text-[10px] bg-[#25D366]/15 text-[#4ade80] px-2 py-0.5 rounded border border-[#4ade80]/30 flex items-center gap-1">
                <Database className="w-3 h-3" />
                <span>{firebaseOwnerEmail ? 'Cloud Firestore + Server Synced' : 'Live Website Database'}</span>
              </span>
            </div>
            <p className="text-xs text-[#93c5fd]">
              Engineer Samuel Aleji Portal · Customers, Inspections, Leads, Properties &amp; Constructions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {adminToken && (
            <>
              <button
                type="button"
                onClick={() => setShowPasscodePanel((p) => !p)}
                className="px-3 py-1.5 text-xs font-semibold text-[#F5C451] hover:text-white bg-[#0b1e42] border border-[#F5C451]/40 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Passcode</span>
              </button>
              <button
                type="button"
                onClick={handleLockAdmin}
                className="px-3 py-1.5 text-xs font-semibold text-[#bfdbfe] hover:text-white bg-[#0b1e42] border border-[#1d4ed8]/40 rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Lock Admin</span>
              </button>
            </>
          )}
          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-[#bfdbfe] hover:text-white bg-[#0b1e42] border border-[#1d4ed8]/40 rounded-lg cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Inline Change Passcode Panel */}
      {adminToken && showPasscodePanel && (
        <form
          onSubmit={handleChangePasscode}
          className="px-6 py-3 bg-[#07132b] border-b border-[#1d4ed8]/40 flex flex-wrap items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2 text-[#F5C451] font-semibold">
            <KeyRound className="w-4 h-4" />
            <span>Update Owner Admin Passcode:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="password"
              required
              minLength={6}
              placeholder="New Passcode (min 6 chars)"
              value={newOwnerPasscode}
              onChange={(e) => setNewOwnerPasscode(e.target.value)}
              className="px-3 py-1.5 bg-[#051421] border border-[#1d4ed8]/50 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg cursor-pointer"
            >
              Save New Passcode
            </button>
            {passcodeMsg && <span className="text-[#4ade80] font-semibold">{passcodeMsg}</span>}
          </div>
        </form>
      )}

      {statusLoading ? (
        <div className="p-12 flex items-center justify-center gap-3 text-sm text-[#bfdbfe]">
          <Loader2 className="w-5 h-5 animate-spin text-[#38bdf8]" />
          <span>Checking owner admin configuration...</span>
        </div>
      ) : !adminToken ? (
        <div className="p-8 sm:p-12 max-w-md mx-auto w-full text-center space-y-5">
          <div className="flex justify-center">
            <OlaLogoMark variant="section" />
          </div>

          <div className="w-12 h-12 rounded-full bg-[#07132b] border border-[#38bdf8]/40 flex items-center justify-center text-[#F5C451] mx-auto">
            {setupRequired ? <KeyRound className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-bold font-display text-white">
              {setupRequired ? 'Set Up Owner Admin Passcode' : 'Real Estate Owner Sign-In'}
            </h3>
            <p className="text-xs text-[#bfdbfe] leading-relaxed">
              {setupRequired
                ? 'First-time setup: create a private owner passcode (minimum 6 characters) to protect customer phone, email, and WhatsApp records.'
                : 'Sign in with your owner passcode or your verified owner Google account (olacontinental625@gmail.com) to manage registered customers, live listings, bookings, and leads.'}
            </p>
          </div>

          {setupRequired ? (
            <form onSubmit={handleSetupOwner} className="space-y-3 text-left">
              <div>
                <label className="block text-[11px] font-semibold text-[#bfdbfe] mb-1">
                  Create Owner Passcode *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#07132b] border border-[#1d4ed8]/50 rounded-xl text-white focus:border-[#38bdf8] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#bfdbfe] mb-1">
                  Confirm Owner Passcode *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Re-enter passcode"
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#07132b] border border-[#1d4ed8]/50 rounded-xl text-white focus:border-[#38bdf8] focus:outline-none"
                />
              </div>
              {authError && <div className="text-xs text-red-400 text-center">{authError}</div>}
              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-3 bg-[#b91c1c] hover:bg-[#991b1b] disabled:opacity-60 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {authSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Save Owner Passcode &amp; Enter Portal</span>
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-3 text-left">
                <div>
                  <label className="block text-[11px] font-semibold text-[#bfdbfe] mb-1">
                    Owner Admin Passcode *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter your owner passcode"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#07132b] border border-[#1d4ed8]/50 rounded-xl text-white focus:border-[#38bdf8] focus:outline-none"
                  />
                </div>
                {authError && <div className="text-xs text-red-400 text-center">{authError}</div>}
                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full py-3 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {authSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  <span>Unlock Owner Admin Dashboard</span>
                </button>
              </form>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-[#1d4ed8]/30" />
                <span className="shrink mx-3 text-[10px] uppercase tracking-wider text-[#93c5fd]">
                  Or Verify via Cloud Owner Account
                </span>
                <div className="flex-grow border-t border-[#1d4ed8]/30" />
              </div>

              <button
                type="button"
                onClick={handleGoogleOwnerLogin}
                disabled={authSubmitting}
                className="w-full py-2.5 px-4 bg-[#07132b] hover:bg-[#172554] border border-[#38bdf8]/40 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-[#4ade80]" />
                <span>Sign In with Google (olacontinental625@gmail.com)</span>
              </button>
            </div>
          )}

          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('customer-login')}
              className="text-xs text-[#93c5fd] hover:text-white underline cursor-pointer"
            >
              Are you a client? Go to Customer Sign-Up Form →
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Tabs Bar */}
          <div className="px-6 py-3 bg-[#051421] border-b border-[#1d4ed8]/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('customers')}
                className={`pb-1.5 cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'customers' ? 'text-[#F5C451] border-b-2 border-[#F5C451]' : 'text-[#bfdbfe]/70 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Customers ({customers.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('viewings')}
                className={`pb-1.5 cursor-pointer ${
                  activeTab === 'viewings' ? 'text-[#38bdf8] border-b-2 border-[#38bdf8]' : 'text-[#bfdbfe]/70 hover:text-white'
                }`}
              >
                Inspections ({viewings.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('leads')}
                className={`pb-1.5 cursor-pointer ${
                  activeTab === 'leads' ? 'text-[#38bdf8] border-b-2 border-[#38bdf8]' : 'text-[#bfdbfe]/70 hover:text-white'
                }`}
              >
                AI Leads ({leads.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('contacts')}
                className={`pb-1.5 cursor-pointer ${
                  activeTab === 'contacts' ? 'text-[#38bdf8] border-b-2 border-[#38bdf8]' : 'text-[#bfdbfe]/70 hover:text-white'
                }`}
              >
                Inquiries ({contacts.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('listings')}
                className={`pb-1.5 cursor-pointer flex items-center gap-1 ${
                  activeTab === 'listings' ? 'text-[#4ade80] border-b-2 border-[#4ade80]' : 'text-[#bfdbfe]/70 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Properties &amp; Constructions</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`pb-1.5 cursor-pointer ${
                  activeTab === 'reviews' ? 'text-[#38bdf8] border-b-2 border-[#38bdf8]' : 'text-[#bfdbfe]/70 hover:text-white'
                }`}
              >
                Reviews ({reviews.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('blogs')}
                className={`pb-1.5 cursor-pointer flex items-center gap-1 ${
                  activeTab === 'blogs' ? 'text-[#38bdf8] border-b-2 border-[#38bdf8]' : 'text-[#bfdbfe]/70 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Blogs ({blogs.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {!firebaseOwnerEmail ? (
                <button
                  type="button"
                  onClick={handleGoogleOwnerLogin}
                  className="px-2.5 py-1 text-[11px] font-semibold text-[#bfdbfe] hover:text-white bg-[#0b1e42] border border-[#1d4ed8]/40 rounded-lg cursor-pointer"
                  title="Connect olacontinental625@gmail.com to stream Cloud Firestore live"
                >
                  Sync Cloud Firestore
                </button>
              ) : (
                <span className="text-[11px] text-[#4ade80] bg-[#4ade80]/10 border border-[#4ade80]/30 px-2 py-0.5 rounded">
                  Cloud: {firebaseOwnerEmail}
                </span>
              )}
              <button
                type="button"
                onClick={() => fetchData()}
                disabled={loading}
                className="px-2.5 py-1 text-xs text-[#bfdbfe] hover:text-white bg-[#0b1e42] border border-[#1d4ed8]/40 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Tab Body */}
          <div className="p-6 overflow-y-auto flex-1">
            {activeTab === 'customers' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="relative flex-1 min-w-[220px] max-w-md">
                    <Search className="w-4 h-4 text-[#93c5fd] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search customers by name, phone, email, or WhatsApp..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-[#07132b] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadCustomersCsv}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-[#172554] hover:bg-[#1e3a8a] border border-[#38bdf8]/40 rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>Export Customers CSV</span>
                  </button>
                </div>

                <div className="overflow-x-auto bg-[#07132b] border border-[#1d4ed8]/30 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#1d4ed8]/40 text-[#F5C451] bg-[#051421]">
                        <th className="py-3 px-4">Full Name</th>
                        <th className="py-3 px-4">Phone Number</th>
                        <th className="py-3 px-4">Email Address</th>
                        <th className="py-3 px-4">WhatsApp Number</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1d4ed8]/20">
                      {filteredCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-[#bfdbfe]/60">
                            {customerSearch
                              ? 'No registered customers match your search.'
                              : 'No customers have signed up yet. Once clients complete the Customer Sign-Up or Ask Ola AI registration form, their Full Name, Phone Number, Email, and WhatsApp Number will appear here.'}
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map((c) => (
                          <tr key={c.id} className="hover:bg-[#0b1e42]/70 transition-colors">
                            <td className="py-3 px-4 font-semibold text-white">
                              <div>{c.fullName}</div>
                              <div className="text-[10px] text-[#93c5fd] font-normal">
                                {c.source} · {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recent'}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-data text-[#38bdf8]">{c.phone}</td>
                            <td className="py-3 px-4 text-[#e0f2fe] break-all">{c.email}</td>
                            <td className="py-3 px-4 font-data text-[#4ade80]">{c.whatsapp}</td>
                            <td className="py-3 px-4">
                              <select
                                value={c.status || 'Active'}
                                onChange={(e) => handleUpdateRecordStatus('customers', c.id, e.target.value)}
                                className="px-2 py-1 text-[11px] bg-[#051421] border border-[#1d4ed8]/40 rounded text-white focus:outline-none"
                              >
                                <option value="Active">Active</option>
                                <option value="Contacted">Contacted</option>
                                <option value="VIP Client">VIP Client</option>
                                <option value="Closed">Closed</option>
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={`https://wa.me/${c.whatsapp.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1 bg-[#051421] hover:bg-[#16a34a]/20 text-[#4ade80] rounded border border-[#4ade80]/40 inline-flex items-center gap-1"
                                  title="WhatsApp Customer"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  <span>WA</span>
                                </a>
                                <a
                                  href={`tel:${c.phone.replace(/[^0-9+]/g, '')}`}
                                  className="px-2 py-1 bg-[#051421] hover:bg-[#1d4ed8]/30 text-[#38bdf8] rounded border border-[#38bdf8]/40 inline-flex items-center gap-1"
                                  title="Call Customer"
                                >
                                  <Phone className="w-3 h-3" />
                                </a>
                                <a
                                  href={`mailto:${c.email}`}
                                  className="px-2 py-1 bg-[#051421] hover:bg-white/10 text-[#bfdbfe] rounded border border-white/20 inline-flex items-center gap-1"
                                  title="Email Customer"
                                >
                                  <Mail className="w-3 h-3" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRecord('customers', c.id)}
                                  className="px-2 py-1 bg-[#051421] hover:bg-red-900/40 text-red-400 rounded border border-red-500/30 cursor-pointer"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'viewings' && (
              <div className="overflow-x-auto bg-[#07132b] border border-[#1d4ed8]/30 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1d4ed8]/40 text-[#F5C451] bg-[#051421]">
                      <th className="py-3 px-4">Date Requested</th>
                      <th className="py-3 px-4">Client Name</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Target Property</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1d4ed8]/20">
                    {viewings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-[#bfdbfe]/60">
                          No inspection appointments logged yet.
                        </td>
                      </tr>
                    ) : (
                      viewings.map((v, i) => (
                        <tr key={v.id || i} className="hover:bg-[#0b1e42]/70">
                          <td className="py-3 px-4 font-data text-[#bfdbfe]">{v.preferredDate}</td>
                          <td className="py-3 px-4 font-semibold text-white">
                            <div>{v.clientName}</div>
                            <div className="text-[10px] text-[#93c5fd] font-normal">{v.inspectionType}</div>
                          </td>
                          <td className="py-3 px-4 font-data text-[#4ade80]">{v.phone}</td>
                          <td className="py-3 px-4 text-[#e0f2fe] truncate max-w-xs">{v.propertyTitle}</td>
                          <td className="py-3 px-4">
                            <select
                              value={v.status || 'Confirmed'}
                              onChange={(e) => handleUpdateRecordStatus('viewings', v.id, e.target.value)}
                              className="px-2 py-1 text-[11px] bg-[#051421] border border-[#1d4ed8]/40 rounded text-white focus:outline-none"
                            >
                              <option value="Confirmed">Confirmed</option>
                              <option value="Completed">Completed</option>
                              <option value="Rescheduled">Rescheduled</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <a
                                href={`https://wa.me/${v.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 bg-[#051421] hover:bg-[#16a34a]/20 text-[#4ade80] rounded border border-[#4ade80]/40 inline-flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3" />
                                <span>WA</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDeleteRecord('viewings', v.id)}
                                className="px-2 py-1 bg-[#051421] hover:bg-red-900/40 text-red-400 rounded border border-red-500/30 cursor-pointer"
                                title="Delete Booking"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'leads' && (
              <div className="overflow-x-auto bg-[#07132b] border border-[#1d4ed8]/30 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1d4ed8]/40 text-[#F5C451] bg-[#051421]">
                      <th className="py-3 px-4">Date Logged</th>
                      <th className="py-3 px-4">Client Name</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Purpose &amp; Type</th>
                      <th className="py-3 px-4">Corridor / Budget</th>
                      <th className="py-3 px-4">Status &amp; Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1d4ed8]/20">
                    {leads.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-[#bfdbfe]/60">
                          No custom lead briefs logged yet.
                        </td>
                      </tr>
                    ) : (
                      leads.map((l, i) => (
                        <tr key={l.id || i} className="hover:bg-[#0b1e42]/70">
                          <td className="py-3 px-4 font-data text-[#bfdbfe] text-[11px]">
                            {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'Recent'}
                          </td>
                          <td className="py-3 px-4 font-semibold text-white">{l.name}</td>
                          <td className="py-3 px-4 font-data text-[#4ade80]">{l.phone}</td>
                          <td className="py-3 px-4 text-[#e0f2fe]">{l.purpose} · {l.propertyType}</td>
                          <td className="py-3 px-4">
                            <div className="text-[#93c5fd]">{l.corridor}</div>
                            <div className="font-data text-[#F5C451]">{l.budget}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <select
                                value={l.status || 'New Inquiry'}
                                onChange={(e) => handleUpdateRecordStatus('leads', l.id, e.target.value)}
                                className="px-2 py-1 text-[11px] bg-[#051421] border border-[#1d4ed8]/40 rounded text-white focus:outline-none"
                              >
                                <option value="New Inquiry">New Inquiry</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Inspection Booked">Inspection Booked</option>
                                <option value="Closed">Closed</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => handleDeleteRecord('leads', l.id)}
                                className="px-2 py-1 bg-[#051421] hover:bg-red-900/40 text-red-400 rounded border border-red-500/30 cursor-pointer"
                                title="Delete Lead"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'contacts' && (
              <div className="overflow-x-auto bg-[#07132b] border border-[#1d4ed8]/30 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1d4ed8]/40 text-[#F5C451] bg-[#051421]">
                      <th className="py-3 px-4">Client Name</th>
                      <th className="py-3 px-4">Phone / Email</th>
                      <th className="py-3 px-4">Service / Corridor</th>
                      <th className="py-3 px-4">Message</th>
                      <th className="py-3 px-4">Status &amp; Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1d4ed8]/20">
                    {contacts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-[#bfdbfe]/60">
                          No construction or project inquiries logged yet.
                        </td>
                      </tr>
                    ) : (
                      contacts.map((ct: any, i) => (
                        <tr key={ct.id || i} className="hover:bg-[#0b1e42]/70">
                          <td className="py-3 px-4 font-semibold text-white">{ct.name}</td>
                          <td className="py-3 px-4">
                            <div className="font-data text-[#4ade80]">{ct.phone}</div>
                            <div className="text-[11px] text-[#e0f2fe]">{ct.email || '—'}</div>
                          </td>
                          <td className="py-3 px-4 text-[#93c5fd]">
                            {ct.serviceType} · {ct.corridor}
                            <div className="font-data text-[#F5C451]">{ct.budget}</div>
                          </td>
                          <td className="py-3 px-4 text-[#bfdbfe]/80 max-w-xs truncate">{ct.message}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <select
                                value={ct.status || 'Pending Review'}
                                onChange={(e) => handleUpdateRecordStatus('contacts', ct.id, e.target.value)}
                                className="px-2 py-1 text-[11px] bg-[#051421] border border-[#1d4ed8]/40 rounded text-white focus:outline-none"
                              >
                                <option value="Pending Review">Pending Review</option>
                                <option value="Quoted">Quoted</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Closed">Closed</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => handleDeleteRecord('contacts', ct.id)}
                                className="px-2 py-1 bg-[#051421] hover:bg-red-900/40 text-red-400 rounded border border-red-500/30 cursor-pointer"
                                title="Delete Inquiry"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'listings' && (
              <div className="space-y-8 text-xs">
                {listingMsg && (
                  <div className="p-3 rounded-xl bg-emerald-950/70 border border-[#4ade80]/50 text-[#4ade80] font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{listingMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Add Live Construction Project */}
                  <form onSubmit={handleAddConstruction} className="p-5 bg-[#07132b] border border-[#1d4ed8]/40 rounded-xl space-y-3">
                    <h4 className="font-display text-sm font-bold text-[#F5C451] flex items-center gap-2">
                      <HardHat className="w-4 h-4" />
                      <span>Publish Construction Project (Live on Constructions Page)</span>
                    </h4>

                    <input
                      type="text"
                      required
                      placeholder="Project Title (e.g. Under G 6-Flat Concrete Frame)"
                      value={projTitle}
                      onChange={(e) => setProjTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-[#051421] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={projCategory}
                        onChange={(e) => setProjCategory(e.target.value as 'ongoing' | 'finished')}
                        className="px-3 py-2 bg-[#051421] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none"
                      >
                        <option value="ongoing">Ongoing Construction</option>
                        <option value="finished">Finished Property</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Progress % (e.g. 65%)"
                        value={projCategory === 'finished' ? '100%' : projCompletion}
                        onChange={(e) => setProjCompletion(e.target.value)}
                        disabled={projCategory === 'finished'}
                        className="px-3 py-2 bg-[#051421] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none disabled:opacity-60"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Location *"
                        value={projLocation}
                        onChange={(e) => setProjLocation(e.target.value)}
                        className="px-3 py-2 bg-[#051421] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Stage / Phase"
                        value={projPhase}
                        onChange={(e) => setProjPhase(e.target.value)}
                        className="px-3 py-2 bg-[#051421] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Engineering Specs"
                        value={projSpecs}
                        onChange={(e) => setProjSpecs(e.target.value)}
                        className="px-3 py-2 bg-[#051421] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none"
                      />
                      <select
                        value={projImage}
                        onChange={(e) => setProjImage(e.target.value)}
                        className="px-3 py-2 bg-[#051421] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none"
                      >
                        {ASSET_IMAGE_PRESETS.map((img) => (
                          <option key={img.url} value={img.url}>
                            {img.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Short site progress / building summary..."
                      value={projDesc}
                      onChange={(e) => setProjDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-[#051421] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none"
                    />

                    <button
                      type="submit"
                      disabled={savingProj}
                      className="w-full py-2.5 bg-[#b91c1c] hover:bg-[#991b1b] text-white font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      {savingProj ? 'Publishing...' : 'Add Live Construction Project'}
                    </button>
                  </form>

                  {/* Add New Verified Property Listing */}
                  <form onSubmit={handleAddProperty} className="p-5 bg-[#07132b] border border-[#1d4ed8]/40 rounded-xl space-y-3">
                    <h4 className="font-display text-sm font-bold text-[#38bdf8] flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>Publish Verified Property (Live on Properties Page)</span>
                    </h4>

                    <input
                      type="text"
                      required
                      placeholder="Property Title *"
                      value={propTitle}
                      onChange={(e) => setPropTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-[#051421] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                    />

                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={propPurpose}
                        onChange={(e) => setPropPurpose(e.target.value as any)}
                        className="px-2.5 py-2 bg-[#051421] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none"
                      >
                        <option value="Buy">Buy</option>
                        <option value="Rent">Rent</option>
                        <option value="Lease">Lease</option>
                        <option value="Invest">Invest</option>
                      </select>
                      <select
                        value={propType}
                        onChange={(e) => setPropType(e.target.value as any)}
                        className="px-2.5 py-2 bg-[#051421] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none"
                      >
                        <option value="House">House</option>
                        <option value="Student Hostel">Student Hostel</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Land">Land</option>
                        <option value="Commercial Property">Commercial Property</option>
                      </select>
                      <input
                        type="text"
                        required
                        placeholder="Price e.g. ₦45,000,000"
                        value={propPrice}
                        onChange={(e) => setPropPrice(e.target.value)}
                        className="px-2.5 py-2 bg-[#051421] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={propCorridor}
                        onChange={(e) => setPropCorridor(e.target.value as Property['corridor'])}
                        className="px-3 py-2 bg-[#051421] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none"
                      >
                        <option value="Behind LAUTECH Teaching Hospital">Behind LAUTECH Hospital</option>
                        <option value="Under G">Under G</option>
                        <option value="Adenike">Adenike</option>
                        <option value="Mushin Commercial Corridor">Mushin Commercial Corridor</option>
                        <option value="Aroje">Aroje</option>
                        <option value="Takie">Takie</option>
                        <option value="Odo-Oba">Odo-Oba</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Land Size (e.g. 650 sqm)"
                        value={propLandSize}
                        onChange={(e) => setPropLandSize(e.target.value)}
                        className="px-3 py-2 bg-[#051421] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Title Document Type"
                        value={propTitleType}
                        onChange={(e) => setPropTitleType(e.target.value)}
                        className="px-3 py-2 bg-[#051421] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none"
                      />
                      <select
                        value={propImage}
                        onChange={(e) => setPropImage(e.target.value)}
                        className="px-3 py-2 bg-[#051421] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none"
                      >
                        {ASSET_IMAGE_PRESETS.map((img) => (
                          <option key={img.url} value={img.url}>
                            {img.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Property description & verification notes..."
                      value={propSummary}
                      onChange={(e) => setPropSummary(e.target.value)}
                      className="w-full px-3 py-2 bg-[#051421] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none"
                    />

                    <button
                      type="submit"
                      disabled={savingProp}
                      className="w-full py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      {savingProp ? 'Publishing...' : 'Publish Live Property Listing'}
                    </button>
                  </form>
                </div>

                {/* Live Construction Additions */}
                {customConstructions.length > 0 && (
                  <div className="bg-[#07132b] border border-[#1d4ed8]/30 rounded-xl p-4 space-y-3">
                    <h4 className="font-display text-sm font-bold text-white">
                      Owner-Added Construction Projects ({customConstructions.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {customConstructions.map((proj) => (
                        <div key={proj.id} className="p-3 bg-[#051421] border border-[#1d4ed8]/30 rounded-lg flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold text-white truncate">{proj.title}</div>
                            <div className="text-[11px] text-[#93c5fd] truncate">
                              {proj.category.toUpperCase()} · {proj.location} · {proj.completionLabel}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord('constructions', proj.id)}
                            className="px-2 py-1 text-red-400 hover:bg-red-950/60 border border-red-500/30 rounded cursor-pointer shrink-0"
                            title="Delete Construction Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Property Availability / Benchmark Manager */}
                <div className="bg-[#07132b] border border-[#1d4ed8]/30 rounded-xl p-4 space-y-3">
                  <h4 className="font-display text-sm font-bold text-white">
                    Live Property Status Controls ({mergedAdminProperties.length} Listings)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#1d4ed8]/40 text-[#F5C451] bg-[#051421]">
                          <th className="py-2.5 px-3">Property Title</th>
                          <th className="py-2.5 px-3">Corridor</th>
                          <th className="py-2.5 px-3">Price</th>
                          <th className="py-2.5 px-3">Live Status</th>
                          <th className="py-2.5 px-3">Remove Custom</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1d4ed8]/20">
                        {mergedAdminProperties.map((p) => {
                          const isCustom = !PROPERTIES.some((bp) => bp.id === p.id);
                          return (
                            <tr key={p.id} className="hover:bg-[#0b1e42]/70">
                              <td className="py-2.5 px-3 font-semibold text-white">{p.title}</td>
                              <td className="py-2.5 px-3 text-[#93c5fd]">{p.corridor}</td>
                              <td className="py-2.5 px-3 font-data text-[#4ade80]">{p.priceDisplay}</td>
                              <td className="py-2.5 px-3">
                                <select
                                  value={p.status}
                                  onChange={(e) => handleTogglePropertyStatus(p.id, e.target.value as Property['status'])}
                                  className="px-2 py-1 text-[11px] bg-[#051421] border border-[#1d4ed8]/40 rounded text-white focus:outline-none"
                                >
                                  <option value="Available">Available</option>
                                  <option value="Sold Benchmark">Sold Benchmark</option>
                                  <option value="Rented Benchmark">Rented Benchmark</option>
                                </select>
                              </td>
                              <td className="py-2.5 px-3">
                                {isCustom ? (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRecord('properties', p.id)}
                                    className="px-2 py-1 text-red-400 hover:bg-red-950/60 border border-red-500/30 rounded cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-[#93c5fd]/60">Core Catalog</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-3">
                {reviews.map((r, i) => (
                  <div key={r.id || i} className="p-4 bg-[#07132b] rounded-xl border border-[#1d4ed8]/40 text-xs flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 text-[#F5C451] mb-1">
                        <span className="font-semibold text-white">{r.clientName} ({r.rating} Stars)</span>
                        <span className="text-[11px] font-data text-[#93c5fd]">{r.inspectionDate}</span>
                      </div>
                      <p className="text-[#bfdbfe] italic">&ldquo;{r.comment}&rdquo;</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteRecord('reviews', r.id)}
                      className="px-2 py-1 bg-[#051421] hover:bg-red-900/40 text-red-400 rounded border border-red-500/30 cursor-pointer shrink-0"
                      title="Delete Review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'blogs' && (
              <div className="space-y-6">
                <form onSubmit={handlePublishBlog} className="p-4 bg-[#07132b] rounded-xl border border-[#1d4ed8]/50 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-sm font-bold text-[#38bdf8] flex items-center gap-1.5">
                      <PlusCircle className="w-4 h-4" />
                      <span>Publish New Blog Insight</span>
                    </h4>
                    {blogStatusMsg && (
                      <span className="text-[11px] text-[#4ade80] flex items-center gap-1 font-semibold">
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
                      className="sm:col-span-2 px-3 py-2 bg-[#051421] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                    />
                    <select
                      value={blogCategory}
                      onChange={(e) => setBlogCategory(e.target.value as Exclude<BlogCategory, 'All'>)}
                      className="px-3 py-2 bg-[#051421] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                    >
                      <option value="Market Intelligence">Market Intelligence</option>
                      <option value="Land Verification & Legal">Land Verification &amp; Legal</option>
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
                      className="sm:col-span-2 px-3 py-2 bg-[#051421] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                    />
                    <input
                      type="text"
                      placeholder="Corridor Tag (e.g. Lagos & Ogbomoso)"
                      value={blogCorridor}
                      onChange={(e) => setBlogCorridor(e.target.value)}
                      className="px-3 py-2 bg-[#051421] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
                    />
                  </div>

                  <textarea
                    rows={3}
                    required
                    placeholder="Write full article paragraphs (separate paragraphs with a blank line) *"
                    value={blogContent}
                    onChange={(e) => setBlogContent(e.target.value)}
                    className="w-full px-3 py-2 bg-[#051421] border border-[#1d4ed8]/40 rounded-lg text-white focus:outline-none focus:border-[#38bdf8]"
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
                    <div className="py-6 text-center text-xs text-[#bfdbfe]/60 italic">
                      No custom admin blog posts published yet. Built-in editorial guides are visible on the Blogs page.
                    </div>
                  ) : (
                    blogs.map((b) => (
                      <div key={b.id} className="p-3 bg-[#07132b] rounded-xl border border-[#1d4ed8]/40 text-xs flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-white">{b.title}</div>
                          <div className="text-[11px] text-[#93c5fd] mt-0.5">
                            {b.category} · {b.corridorTag} · {b.publishedAt}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono text-[#4ade80] bg-[#4ade80]/10 px-2 py-0.5 rounded">
                            Published
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord('blogs', b.id)}
                            className="px-2 py-1 bg-[#051421] hover:bg-red-900/40 text-red-400 rounded border border-red-500/30 cursor-pointer"
                            title="Delete Article"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
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
  );
};

interface AdminSectionProps {
  onNavigate: (page: PageType) => void;
}

export const AdminSection: React.FC<AdminSectionProps> = ({ onNavigate }) => {
  return (
    <section className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Portal Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0b1e42] border border-[#1d4ed8]/40 rounded-2xl p-3 sm:px-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('customer-login')}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-[#bfdbfe] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            Customer Sign Up / Login
          </button>
          <button
            type="button"
            onClick={() => onNavigate('admin-login')}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#2563eb] text-white shadow flex items-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Owner Admin Login</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="text-xs font-medium text-[#93c5fd] hover:text-white flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Homepage</span>
        </button>
      </div>

      <AdminPortalContent onNavigate={onNavigate} />
    </section>
  );
};
