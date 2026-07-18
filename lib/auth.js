// lib/auth.js
// Central BetterAuth configuration. This replaces Firebase entirely —
// BetterAuth handles email/password sign-up/login, Google OAuth, session
// cookies, and password hashing all on its own, storing everything
// directly in our MongoDB database.

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { authDb } from "./mongoClient.js";

export const auth = betterAuth({
  database: mongodbAdapter(authDb),

  // Where BetterAuth's own API routes live, and which frontend origin
  // is allowed to talk to it with credentials.
  baseURL: process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`,
  trustedOrigins: [process.env.CLIENT_URL],
  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
  },

  // Lets the same email address sign in via Google even if it already has
  // an email/password account (or vice versa), instead of treating them
  // as separate, unlinked accounts.
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },

  // Extra fields on top of BetterAuth's default user shape (name, email,
  // image, emailVerified). These are what our role-based access control
  // and premium-subscription checks read from req.user.
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user", // applies to Google sign-ups too, per requirement
        input: false, // can't be set by the client on sign-up — prevents self-promotion to admin
      },
      subscription: {
        type: "string",
        defaultValue: "free",
        input: false,
      },
      promptCount: {
        type: "number",
        defaultValue: 0,
        input: false,
      },
    },
  },
});
