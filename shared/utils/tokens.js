const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "ecommerce-access-dev-secret";
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "ecommerce-refresh-dev-secret";

const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

const ACCESS_COOKIE = "accessToken";
const REFRESH_COOKIE = "refreshToken";

const signAccessToken = (payload) =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });

const signRefreshToken = (payload) =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });

const verifyAccessToken = (token) => jwt.verify(token, ACCESS_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET);

/** Hash refresh token before storing in MongoDB (never store raw JWT) */
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

/** Parse expiry strings like 15m / 7d into maxAge milliseconds for cookies */
const expiryToMs = (value) => {
  const match = String(value).match(/^(\d+)([smhd])$/i);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const map = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return amount * map[unit];
};

module.exports = {
  ACCESS_SECRET,
  REFRESH_SECRET,
  ACCESS_EXPIRES_IN,
  REFRESH_EXPIRES_IN,
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  expiryToMs,
};
