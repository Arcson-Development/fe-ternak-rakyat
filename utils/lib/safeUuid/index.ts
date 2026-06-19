/**
 * `crypto.randomUUID()` is unavailable in non-secure contexts (HTTP
 * served from a LAN IP, for example — `localhost` and HTTPS are the
 * only hosts that count as secure in Chrome/Firefox). When the page
 * is opened on `http://192.168.1.42:6091` instead of
 * `http://localhost:6091` the method is undefined and the wizard
 * crashes before it can render.
 *
 * Fallback chain:
 *   1. `crypto.randomUUID()` — present in all modern browsers in
 *      secure contexts. Fast path.
 *   2. `crypto.getRandomValues()` — present in essentially every
 *      browser since IE 11, and (crucially) works in HTTP contexts
 *      too. We hand-assemble an RFC 4122 v4 UUID from 16 random bytes.
 *   3. `Math.random()` — last-resort fallback for environments where
 *      even `getRandomValues` is missing (very old WebViews, some
 *      test runners). Still collision-safe enough for our use case
 *      (PhotoRef IDs, wizard slot IDs) which never leave the
 *      browser.
 */
export function safeRandomUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);

  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  // RFC 4122 v4 markers so the string is recognisably a UUID.
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10

  const hex: string[] = new Array(16);
  for (let i = 0; i < 16; i++) {
    hex[i] = bytes[i].toString(16).padStart(2, "0");
  }
  return (
    hex.slice(0, 4).join("") +
    "-" +
    hex.slice(4, 6).join("") +
    "-" +
    hex.slice(6, 8).join("") +
    "-" +
    hex.slice(8, 10).join("") +
    "-" +
    hex.slice(10, 16).join("")
  );
}
