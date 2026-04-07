import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const canInitFirebase = Object.values(firebaseConfig).every(Boolean);

export const firebaseApp = canInitFirebase ? initializeApp(firebaseConfig) : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;
export const auth = firebaseApp ? getAuth(firebaseApp) : null;

export async function signInWithGoogle() {
  if (!auth) {
    throw new Error("Firebase is not configured yet.");
  }

  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/calendar");
  provider.addScope("https://www.googleapis.com/auth/tasks");
  return signInWithPopup(auth, provider);
}

export async function signOutGoogle() {
  if (!auth) return;
  await signOut(auth);
}

export function getCurrentUserIdentity() {
  if (auth?.currentUser) {
    return {
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email || "",
      userName: auth.currentUser.displayName || "",
    };
  }

  const fallback = window.localStorage.getItem("casepilot_guest_user_id") || "dashboard-user";
  return {
    userId: fallback,
    userEmail: "",
    userName: "",
  };
}
