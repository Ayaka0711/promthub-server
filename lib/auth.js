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
      user: {
          additionalFields: {
            role: { ... },
            subscription: { ... },
            promptCount: { ... },
          },
        },

        advanced: {
          defaultCookieAttributes: {
            sameSite: "none",
            secure: true,
          },
        },
      });
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
