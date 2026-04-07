import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, signInWithGoogle, signOutGoogle } from "../services/firebase";

export function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!auth) return undefined;
    return onAuthStateChanged(auth, setUser);
  }, []);

  return {
    user,
    canAuth: Boolean(auth),
    signInWithGoogle,
    signOutGoogle,
  };
}
