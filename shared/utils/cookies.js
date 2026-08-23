const {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  ACCESS_EXPIRES_IN,
  REFRESH_EXPIRES_IN,
  expiryToMs,
} = require("./tokens");

const isProduction = () => process.env.NODE_ENV === "production";

/**
 * Secure cookie defaults so the browser stores tokens and auto-sends them
 * on every request (frontend must use credentials: 'include').
 */
const baseCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction(),
  // Lax works for localhost:5173 → localhost:8080 (same-site). Use none+secure in prod cross-site.
  sameSite: isProduction() ? "none" : "lax",
  path: "/",
});

const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie(ACCESS_COOKIE, accessToken, {
    ...baseCookieOptions(),
    maxAge: expiryToMs(ACCESS_EXPIRES_IN),
  });

  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...baseCookieOptions(),
    maxAge: expiryToMs(REFRESH_EXPIRES_IN),
  });
};

const clearAuthCookies = (res) => {
  const opts = baseCookieOptions();
  res.clearCookie(ACCESS_COOKIE, opts);
  res.clearCookie(REFRESH_COOKIE, opts);
};

module.exports = { setAuthCookies, clearAuthCookies, baseCookieOptions };
