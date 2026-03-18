import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { captcha } from "better-auth/plugins";
import { PrismaClient } from "./generated/prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  socialProviders:
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : undefined,
  rateLimit: {
    enabled: true,
    storage: "memory",
    customRules: {
      "/sign-up/email": {
        window: 10 * 60,
        max: 5,
      },
      "/sign-in/email": {
        window: 5 * 60,
        max: 10,
      },
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: turnstileSecret
    ? [
        captcha({
          provider: "cloudflare-turnstile",
          secretKey: turnstileSecret,
          endpoints: ["/sign-up/email", "/sign-in/email"],
        }),
      ]
    : [],
});
