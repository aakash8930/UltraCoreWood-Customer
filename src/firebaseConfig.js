// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";

const firebaseConfig = {
  apiKey:    "AIzaSyAt0WfhfPl5gd6NkwILLT73KLmhA4K7tlw",
  authDomain:"furniture-0002.firebaseapp.com",
  projectId: "furniture-0002",
  storageBucket: "furniture-0002.firebasestorage.app",
  messagingSenderId: "43611927973",
  appId:     "1:43611927973:web:6c79a0a907f27d3db6a44c",
  measurementId: "G-J4B8PCJWDP"
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
