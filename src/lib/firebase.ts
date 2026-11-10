import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  collection,
  doc,
  setDoc,
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
import { LeadSubmission, ViewingRequest, InspectionReview } from '../types';

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
      getDoc(doc(db, 'test', 'connection')),
      timeoutPromise
    ]);
    return true;
  } catch {
    return false;
  }
}

// Firestore operations for Leads
export async function createFirestoreLead(lead: LeadSubmission): Promise<string> {
  const path = 'leads';
  try {
    const docId = `lead-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const docRef = doc(db, path, docId);
    await setDoc(docRef, {
      ...lead,
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
      ...viewing,
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
      ...review,
      propertyId: review.propertyId || 'general',
      inspectionDate: review.inspectionDate || 'Recent Field Inspection',
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

// Real-time listener for viewing requests (Admin portal)
export function listenToViewings(callback: (viewings: ViewingRequest[]) => void): () => void {
  const path = 'viewings';
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

// Real-time listener for leads (Admin portal)
export function listenToLeads(callback: (leads: LeadSubmission[]) => void): () => void {
  const path = 'leads';
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
