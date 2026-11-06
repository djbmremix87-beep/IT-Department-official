import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const provider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, provider);
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
      console.info("Google Sign-In popup was closed or cancelled by the user.");
      return null;
    }
    if (error?.code === 'auth/popup-blocked') {
      alert("Sign-in popup was blocked by your browser. Please allow popups for this site and try again.");
      return null;
    }
    if (error?.code === 'auth/operation-not-allowed') {
      console.warn("Google Sign-In is not enabled in the Firebase Console.");
      alert("Google Sign-In is not enabled in Firebase Console. Please enable Google Auth in your Firebase Project console.");
      return null;
    }
    throw error;
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  try {
    return await signInWithEmailAndPassword(auth, email, pass);
  } catch (error: any) {
    if (error?.code === 'auth/operation-not-allowed') {
      console.warn("Email/Password Sign-In is not enabled in the Firebase Console.");
      alert("Email/Password Sign-In is not enabled in Firebase Console.");
      return null;
    }
    throw error;
  }
};

export const registerWithEmail = async (email: string, pass: string) => {
  try {
    return await createUserWithEmailAndPassword(auth, email, pass);
  } catch (error: any) {
    if (error?.code === 'auth/operation-not-allowed') {
      console.warn("Email/Password registration is not enabled in the Firebase Console.");
      alert("Email/Password registration is not enabled in Firebase Console.");
      return null;
    }
    throw error;
  }
};

export const logout = () => signOut(auth);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export const handleFirestoreError = (error: any, operation: OperationType, path: string | null) => {
  console.error(`Firebase Error [${operation}] at ${path}:`, error);
  // Log standardized error if needed
};
