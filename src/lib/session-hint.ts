// The API sets a non-HttpOnly `logged_in` cookie (no secret in it) next to the HttpOnly auth cookies.
const COOKIE = "logged_in";
const PROBED_KEY = "laptopshop.session.probed";

const hasHintCookie = () =>
  typeof document !== "undefined" && document.cookie.split("; ").some((part) => part.startsWith(`${COOKIE}=`));

/**
 * Whether /users/me is worth asking. A session started before the cookie existed has no hint, so one probe
 * per tab is allowed; after that guests (no hint) skip the request that always ends in a 401.
 */
export function shouldCheckSession(): boolean {
  if (hasHintCookie()) return true;
  try {
    if (window.sessionStorage.getItem(PROBED_KEY)) return false;
    window.sessionStorage.setItem(PROBED_KEY, "1");
  } catch {
    // storage blocked: fall back to asking every time
  }
  return true;
}
