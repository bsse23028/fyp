// CONFIG - small switches for the whole app.

// ---------------------------------------------------------------------------
// API_BASE_URL - where the KidBuddy backend runs (the `backend/` folder, `npm start`).
//
// The app runs on your REAL PHONE, so "localhost" would mean the phone itself.
// Use your computer's address on the Wi-Fi instead:
//
//   1. On the computer (Windows) open "Command Prompt" and type:   ipconfig
//   2. Find the "Wireless LAN adapter Wi-Fi" part and copy the "IPv4 Address",
//      for example 192.168.1.20   (on a Mac: System Settings -> Wi-Fi -> Details)
//      Tip: Expo shows the same address when you run `npx expo start` (exp://192.168.1.20:8081).
//   3. Put it below with the backend port 4000:   'http://192.168.1.20:4000'
//
// Check it: open  http://<that address>:4000/health  in the PHONE's browser.
// It must say {"status":"ok"}. If it does not load:
//   - the phone and the computer must be on the SAME Wi-Fi
//   - Windows Firewall must allow Node.js on "Private networks"
//   - the backend must be running (in backend/: npm start)
// The address can change when you reconnect to the Wi-Fi: run ipconfig again if the app
// suddenly says it cannot reach the server.
// ---------------------------------------------------------------------------
export const API_BASE_URL = 'http://10.54.198.119:4000';

// How long the app waits for the server before giving up (milliseconds).
export const API_TIMEOUT_MS = 15000;

// DEMO_MODE - the server does not send real emails yet: it PRINTS the 6-digit code in the
// terminal where the backend runs (EMAIL_MODE=console in backend/.env).
// While DEMO_MODE is true, the app shows a pop-up that reminds you to look there.
// When real emails are switched on in the backend: set this to false.
export const DEMO_MODE = true;
