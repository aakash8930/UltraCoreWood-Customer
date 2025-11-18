// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDmYDNBeqM89UKaa_6fwcDTfnPmtjCXnnw",
  authDomain: "furniture-e4d4f.firebaseapp.com",
  projectId: "furniture-e4d4f",
  storageBucket: "furniture-e4d4f.firebasestorage.app",
  messagingSenderId: "23211800154",
  appId: "1:23211800154:web:7562ca769dfc4553870a63",
  measurementId: "G-8D9RH2MC5G"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ─── HACK: touch the real AuthImpl under the modular wrapper ───────────────
const impl = auth._delegate || auth;
impl.settings = impl.settings || {};
// For local testing you can disable real app-verification:
impl.settings.appVerificationDisabledForTesting = true;
// ────────────────────────────────────────────────────────────────────────────

export function setupRecaptcha(containerId = "recaptcha-container") {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
  }
  window.recaptchaVerifier = new RecaptchaVerifier(
    auth,
    containerId,
    { size: "invisible", callback: () => {} }
  );
  return window.recaptchaVerifier;
}

export { auth };
