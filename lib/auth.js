import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { authDb } from "./mongoClient.js";

export const auth = betterAuth({
  database: mongodbAdapter(authDb),

  baseURL: process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`,
  trustedOrigins: [process.env.CLIENT_URL],
  secret: process.env.BETTER_AUTH_SECRET,

  emailAndPassword: {
    enabled: true,
  },

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
      role: {
        type: "string",
        defaultValue: "user",
        input: false,
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

  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },
});