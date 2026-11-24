import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  getDoc,
  getDocs,
  getDocFromServer,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  LeadSubmission,
  ViewingRequest,
  InspectionReview,
  BlogPost,
  ContactInquiry,
  CustomerProfile,
  ConstructionProject,
  Property,
} from '../types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID and robust iframe transport settings
export const db = (() => {
  try {
    return initializeFirestore(
      app,
      {
        experimentalForceLongPolling: true,
        experimentalAutoDetectLongPolling: true,
      },
      firebaseConfig.firestoreDatabaseId
    );
  } catch {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
})();

// Initialize Firebase Storage
export const storage = getStorage(app, firebaseConfig.storageBucket);

// Initialize Auth
export const auth = getAuth(app);

// Error handling types as specified in firebase-integration-rpc
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
  return errInfo;
}

// Validate connection to Firestore safely without triggering 10s streaming timeouts
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Connection check timeout')), 2500)
    );
    await Promise.race([
      getDocFromServer(doc(db, 'test', 'connection')),
      timeoutPromise
    ]);
    return true;
  } catch {
    return false;
  }
}

export const googleProvider = new GoogleAuthProvider();

export async function signInOwnerWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function signOutFirebaseOwner() {
  return signOut(auth);
}

export function subscribeOwnerAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

// Firestore operations for Registered Customers
export async function createFirestoreCustomer(customer: CustomerProfile): Promise<string> {
  const path = 'customers';
  try {
    const docId = (customer.id || `cust-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`).replace(/[^a-zA-Z0-9_-]/g, '');
    const docRef = doc(db, path, docId);
    await setDoc(docRef, {
      id: docId,
      fullName: customer.fullName.trim().slice(0, 120),
      phone: customer.phone.trim().slice(0, 40),
      email: customer.email.trim().slice(0, 150),
      whatsapp: customer.whatsapp.trim().slice(0, 40),
      createdAt: (customer.createdAt || new Date().toISOString()).slice(0, 50),
      source: (customer.source || 'Customer Sign Up').slice(0, 80),
      status: (customer.status || 'Active').slice(0, 40),
    });
    return docId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
    throw err;
  }
}

// Real-time listener for Registered Customers (Owner Admin Portal when Firebase authenticated)
export function listenToCustomers(callback: (customers: CustomerProfile[]) => void): () => void {
  const path = 'customers';
  if (!auth.currentUser) {
    return () => {};
  }
  try {
    const colRef = collection(db, path);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const loaded: CustomerProfile[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          loaded.push({
            id: d.id,
            fullName: data.fullName || '',
            phone: data.phone || '',
            email: data.email || '',
            whatsapp: data.whatsapp || '',
            createdAt: data.createdAt || '',
            source: data.source || 'Website',
          });
        });
        callback(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return () => {};
  }
}

// Firestore operations for Leads
export async function createFirestoreLead(lead: LeadSubmission): Promise<string> {
  const path = 'leads';
  try {
    const docId = `lead-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const docRef = doc(db, path, docId);
    await setDoc(docRef, {
      name: lead.name.trim().slice(0, 120),
      phone: lead.phone.trim().slice(0, 40),
      email: (lead.email || '').trim().slice(0, 150),
      purpose: (lead.purpose || 'Buy').slice(0, 50),
      propertyType: (lead.propertyType || 'Any').slice(0, 80),
      corridor: (lead.corridor || 'Ogbomoso').slice(0, 100),
      budget: (lead.budget || '').slice(0, 80),
      message: (lead.message || '').slice(0, 1000),
      createdAt: new Date().toISOString(),
      status: 'New Inquiry',
    });
    return docId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
    throw err;
  }
}

// Firestore operations for Viewing Appointments
export async function createFirestoreViewing(viewing: ViewingRequest): Promise<string> {
  const path = 'viewings';
  try {
    const docId = `view-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const docRef = doc(db, path, docId);
    await setDoc(docRef, {
      propertyId: (viewing.propertyId || 'general').slice(0, 100),
      propertyTitle: (viewing.propertyTitle || 'General Property Consultation').slice(0, 200),
      clientName: viewing.clientName.trim().slice(0, 120),
      phone: viewing.phone.trim().slice(0, 40),
      email: (viewing.email || '').trim().slice(0, 150),
      preferredDate: viewing.preferredDate.trim().slice(0, 60),
      inspectionType: (viewing.inspectionType || 'Physical On-Site').slice(0, 120),
      notes: (viewing.notes || '').slice(0, 1000),
      createdAt: new Date().toISOString(),
      status: 'Confirmed',
    });
    return docId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
    throw err;
  }
}

// Firestore operations for Reviews
export async function createFirestoreReview(review: {
  clientName: string;
  rating: number;
  comment: string;
  propertyId?: string;
  inspectionDate?: string;
}): Promise<string> {
  const path = 'reviews';
  try {
    const docId = `rev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const docRef = doc(db, path, docId);
    await setDoc(docRef, {
      clientName: review.clientName.trim().slice(0, 120),
      rating: Math.min(5, Math.max(1, Number(review.rating) || 5)),
      comment: review.comment.trim().slice(0, 1000),
      propertyId: (review.propertyId || 'general').slice(0, 100),
      inspectionDate: (review.inspectionDate || 'Recent Field Inspection').slice(0, 60),
      verified: true,
    });
    return docId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
    throw err;
  }
}

// Real-time listener for reviews
export function listenToReviews(callback: (reviews: InspectionReview[]) => void): () => void {
  const path = 'reviews';
  try {
    const colRef = collection(db, path);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const loaded: InspectionReview[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          loaded.push({
            id: d.id,
            propertyId: data.propertyId || 'general',
            clientName: data.clientName || 'Anonymous Client',
            rating: Number(data.rating) || 5,
            inspectionDate: data.inspectionDate || 'Field Inspection',
            comment: data.comment || '',
            verified: Boolean(data.verified),
          });
        });
        if (loaded.length > 0) {
          callback(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return () => {};
  }
}

// Real-time listener for viewing requests (Admin portal when Firebase authenticated)
export function listenToViewings(callback: (viewings: ViewingRequest[]) => void): () => void {
  const path = 'viewings';
  if (!auth.currentUser) {
    return () => {};
  }
  try {
    const colRef = collection(db, path);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const loaded: ViewingRequest[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          loaded.push({
            id: d.id,
            propertyId: data.propertyId || 'general',
            propertyTitle: data.propertyTitle || 'Property Inquiry',
            clientName: data.clientName || '',
            phone: data.phone || '',
            email: data.email || '',
            preferredDate: data.preferredDate || '',
            inspectionType: data.inspectionType || 'Physical On-Site',
            notes: data.notes || '',
            createdAt: data.createdAt || '',
            status: data.status || 'Active',
          });
        });
        callback(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return () => {};
  }
}

// Real-time listener for leads (Admin portal when Firebase authenticated)
export function listenToLeads(callback: (leads: LeadSubmission[]) => void): () => void {
  const path = 'leads';
  if (!auth.currentUser) {
    return () => {};
  }
  try {
    const colRef = collection(db, path);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const loaded: LeadSubmission[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          loaded.push({
            id: d.id,
            name: data.name || '',
            phone: data.phone || '',
            email: data.email || '',
            purpose: data.purpose || 'Buy',
            propertyType: data.propertyType || 'Any',
            corridor: data.corridor || '',
            budget: data.budget || '',
            message: data.message || '',
            createdAt: data.createdAt || '',
            status: data.status || 'New',
          });
        });
        callback(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return () => {};
  }
}

// Create Blog Post in Firestore
export async function createFirestoreBlog(blog: Omit<BlogPost, 'id'> & { id?: string }): Promise<string> {
  const path = 'blogs';
  try {
    const docId = (blog.id || `blog-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '');
    const docRef = doc(db, path, docId);
    await setDoc(docRef, {
      ...blog,
      id: docId,
      publishedAt: blog.publishedAt || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      timestamp: serverTimestamp(),
    });
    return docId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
    throw err;
  }
}

// Real-time listener for Published Blog Posts
export function listenToBlogs(callback: (blogs: BlogPost[]) => void): () => void {
  const path = 'blogs';
  try {
    const colRef = collection(db, path);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const loaded: BlogPost[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          loaded.push({
            id: d.id,
            title: data.title || 'Untitled Insight',
            excerpt: data.excerpt || '',
            content: Array.isArray(data.content) ? data.content : [String(data.content || '')],
            category: data.category || 'Market Intelligence',
            author: data.author || 'Engr. Samuel Aleji',
            authorRole: data.authorRole || 'Principal Consultant & Civil Engineer',
            publishedAt: data.publishedAt || 'Recent',
            readTime: data.readTime || '4 min read',
            coverImage: data.coverImage || '/assets/aistudio/IMG-20261031-WA0089_fc7755dc.jpg',
            corridorTag: data.corridorTag || 'Ogbomoso & Lagos',
            featured: Boolean(data.featured),
            tags: Array.isArray(data.tags) ? data.tags : [],
          });
        });
        callback(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return () => {};
  }
}

// Create Contact Inquiry
export async function createFirestoreContact(contact: ContactInquiry): Promise<string> {
  const path = 'contacts';
  try {
    const docId = `contact-${Date.now()}`;
    const docRef = doc(db, path, docId);
    await setDoc(docRef, {
      id: docId,
      name: contact.name.trim().slice(0, 120),
      phone: contact.phone.trim().slice(0, 40),
      email: (contact.email || '').trim().slice(0, 150),
      serviceType: (contact.serviceType || 'General Inquiry').slice(0, 100),
      corridor: (contact.corridor || 'Ogbomoso & Lagos').slice(0, 100),
      budget: (contact.budget || '').slice(0, 80),
      message: (contact.message || '').slice(0, 1500),
      createdAt: contact.createdAt || new Date().toISOString(),
      timestamp: serverTimestamp(),
      status: 'Pending Review',
    });
    return docId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
    throw err;
  }
}

// Real-time listener for Contacts (Admin portal when Firebase authenticated)
export function listenToContacts(callback: (contacts: ContactInquiry[]) => void): () => void {
  const path = 'contacts';
  if (!auth.currentUser) {
    return () => {};
  }
  try {
    const colRef = collection(db, path);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const loaded: ContactInquiry[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          loaded.push({
            id: d.id,
            name: data.name || '',
            phone: data.phone || '',
            email: data.email || '',
            serviceType: data.serviceType || 'General Inquiry',
            corridor: data.corridor || '',
            budget: data.budget || '',
            message: data.message || '',
            createdAt: data.createdAt || '',
          });
        });
        callback(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return () => {};
  }
}

// Dynamic Constructions in Firestore
export async function createFirestoreConstruction(project: ConstructionProject): Promise<string> {
  const path = 'constructions';
  try {
    const docId = (project.id || `proj-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '');
    const docRef = doc(db, path, docId);
    await setDoc(docRef, {
      id: docId,
      title: project.title.trim().slice(0, 200),
      category: project.category,
      location: project.location.trim().slice(0, 120),
      phaseOrType: project.phaseOrType.trim().slice(0, 100),
      specs: project.specs.trim().slice(0, 200),
      completionLabel: project.completionLabel.trim().slice(0, 60),
      image: project.image.trim().slice(0, 300),
      description: project.description.trim().slice(0, 1000),
      createdAt: project.createdAt || new Date().toISOString(),
    });
    return docId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
    throw err;
  }
}

export function listenToConstructions(callback: (projects: ConstructionProject[]) => void): () => void {
  const path = 'constructions';
  try {
    const colRef = collection(db, path);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const loaded: ConstructionProject[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          loaded.push({
            id: d.id,
            title: data.title || '',
            category: data.category === 'finished' ? 'finished' : 'ongoing',
            location: data.location || '',
            phaseOrType: data.phaseOrType || '',
            specs: data.specs || '',
            completionLabel: data.completionLabel || '',
            image: data.image || '/assets/aistudio/IMG-20261031-WA0089_fc7755dc.jpg',
            description: data.description || '',
            createdAt: data.createdAt || '',
          });
        });
        callback(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return () => {};
  }
}

// Dynamic Properties in Firestore
export async function createFirestoreProperty(property: Property): Promise<string> {
  const path = 'properties';
  try {
    const docId = (property.id || `prop-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '');
    const docRef = doc(db, path, docId);
    await setDoc(docRef, {
      ...property,
      id: docId,
    });
    return docId;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
    throw err;
  }
}

export function listenToProperties(callback: (props: Property[]) => void): () => void {
  const path = 'properties';
  try {
    const colRef = collection(db, path);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const loaded: Property[] = [];
        snapshot.forEach((d) => {
          loaded.push({ ...(d.data() as Property), id: d.id });
        });
        callback(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return () => {};
  }
}

export async function updateFirestoreDocStatus(collectionName: string, docId: string, status: string): Promise<void> {
  const path = `${collectionName}/${docId}`;
  try {
    await updateDoc(doc(db, collectionName, docId), { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteFirestoreRecord(collectionName: string, docId: string): Promise<void> {
  const path = `${collectionName}/${docId}`;
  try {
    await deleteDoc(doc(db, collectionName, docId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}


