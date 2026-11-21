// CONFIG - small switches for the whole app.

import Constants from 'expo-constants';

// ---------------------------------------------------------------------------
// API_BASE_URL - where the KidBuddy backend runs (the `backend/` folder, `npm start`).
//
// The app runs on your REAL PHONE, so "localhost" would mean the phone itself: it needs your
// computer's address on the Wi-Fi. That address changes when you change Wi-Fi (another house ...),
// so the app now FINDS IT BY ITSELF: Expo Go already knows the computer's address, because it
// loads the app from it (the exp://192.168.1.20:8081 line that `npx expo start` prints).
// The app takes that address and uses the backend's port instead (API_PORT below).
//
// USE_FIXED_ADDRESS = true switches this off and always uses FIXED_ADDRESS (for example when the
// backend runs on ANOTHER computer). To find an address: run `ipconfig` on that computer and copy
// the "IPv4 Address" of the Wi-Fi.
//
// Check it: open  http://<computer address>:4000/health  in the PHONE's browser.
// It must say {"status":"ok"}. If it does not load:
//   - the phone and the computer must be on the SAME Wi-Fi
//   - Windows Firewall must allow Node.js (a new Wi-Fi may be "Public": set it to "Private")
//   - the backend must be running (in backend/: npm start)
// ---------------------------------------------------------------------------
const API_PORT = 4000; // the port the backend listens on (backend/.env PORT)
const USE_FIXED_ADDRESS = false; // true = always use FIXED_ADDRESS below
const FIXED_ADDRESS = 'http://192.168.1.21:4000'; // used when USE_FIXED_ADDRESS is true, or when Expo gives no address

// The computer's address as Expo Go sees it, e.g. "192.168.1.20:8081" -> "192.168.1.20".
function computerAddress() {
  const hostUri = (Constants.expoConfig && Constants.expoConfig.hostUri) || '';
  const host = hostUri.split(':')[0];
  return host || null;
}

const detected = computerAddress();
export const API_BASE_URL = USE_FIXED_ADDRESS || !detected ? FIXED_ADDRESS : `http://${detected}:${API_PORT}`;

// How long the app waits for the server before giving up (milliseconds).
export const API_TIMEOUT_MS = 15000;

// DEMO_MODE - the server does not send real emails yet: it PRINTS the 6-digit code in the
// terminal where the backend runs (EMAIL_MODE=console in backend/.env).
// While DEMO_MODE is true, the app shows a pop-up that reminds you to look there.
// When real emails are switched on in the backend: set this to false.
export const DEMO_MODE = true;
