import { useEffect } from "react";
import { collection, onSnapshot, query as buildQuery } from "firebase/firestore";
import { db } from "../services/firebase";

export function useFirestoreListener(collectionName, constraints = [], onData) {
  useEffect(() => {
    if (!db || !collectionName || typeof onData !== "function") {
      return undefined;
    }

    const q = constraints.length
      ? buildQuery(collection(db, collectionName), ...constraints)
      : collection(db, collectionName);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      onData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return unsubscribe;
  }, [collectionName, constraints, onData]);
}
