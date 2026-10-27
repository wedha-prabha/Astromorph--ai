import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const configuredValues = Object.values(config)
const isConfigured = configuredValues.some(Boolean)

if (isConfigured && configuredValues.some((value) => !value)) {
  throw new Error('Firebase configuration is incomplete. Check the VITE_FIREBASE_* variables in frontend/.env.')
}

export const firebaseAuth = isConfigured
  ? getAuth(getApps().length ? getApp() : initializeApp(config))
  : null
