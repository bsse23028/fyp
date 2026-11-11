// UUID - makes a random id like "3f1c7a2e-6b1d-4b8e-9d55-2f1e0c9a7b11" (version 4).
//
// Used as the clientSessionId of a reading session: the app makes it ONCE per session,
// and sends the same id again on "Retry", so the server never counts the stars twice.

export function makeUuid() {
  // Newer phones / JS engines have a built-in generator: use it when it is there.
  if (typeof globalThis.crypto === 'object' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  // Otherwise build one by hand: 32 random hex digits with the "4" and "8-b" a UUID v4 needs.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}
