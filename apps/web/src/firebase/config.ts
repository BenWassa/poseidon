/**
 * Single Firebase initialization point. Everything else (auth, Firestore
 * persistence) imports `auth` / `db` from here rather than calling
 * `initializeApp` itself.
 */
import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * `ignoreUndefinedProperties` matters here: the domain's `Dive`/`Creature`
 * types carry many optional fields that are `undefined` rather than absent,
 * which Firestore's SDK otherwise rejects outright.
 *
 * `persistentLocalCache` is what lets a returning, already-approved diver
 * read their log with no network at all.
 */
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager({}),
  }),
});
