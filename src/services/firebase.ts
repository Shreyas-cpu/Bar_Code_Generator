import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

/**
 * List of email addresses that are allowed to access the app.
 * Pulled from VITE_ALLOWED_EMAILS env var (comma-separated).
 * Example: VITE_ALLOWED_EMAILS=owner@gmail.com,staff@gmail.com
 */
export const ALLOWED_EMAILS: string[] = (import.meta.env.VITE_ALLOWED_EMAILS || '')
  .split(',')
  .map((e: string) => e.trim().toLowerCase())
  .filter(Boolean);

export const isEmailAllowed = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ALLOWED_EMAILS.includes(email.toLowerCase());
};
