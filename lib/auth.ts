import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
// import Resend from "next-auth/providers/resend"; // Commented out - requires database adapter

/**
 * Validates required environment variables at runtime.
 * Fails fast with clear error message if misconfigured.
 * Skips validation during build to allow CI/CD pipelines.
 */
function validateAuthEnv() {
  // Skip validation during build phase
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return;
  }

  // Fallback to v4 variable names if v5 not found
  const hasV5Secret = !!process.env.AUTH_SECRET;
  const hasV4Secret = !!process.env.NEXTAUTH_SECRET;

  if (!hasV5Secret && !hasV4Secret) {
    throw new Error(
      `Missing required auth environment variable: AUTH_SECRET or NEXTAUTH_SECRET\n` +
        `Please set either AUTH_SECRET (v5 preferred) or NEXTAUTH_SECRET (v4 compatible).`
    );
  }

  // Auth.js v5 auto-detects URL in production via trustHost: true
  // NEXTAUTH_URL is optional when trustHost: true is set

  // Check for Google OAuth vars only (secret handled above)
  const googleVars = ["AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"];
  const missing = googleVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required auth environment variables: ${missing.join(", ")}\n` +
        `Please check your .env.local file and ensure all variables are set.`
    );
  }
}

// Validate environment on module load (fail fast at runtime, skip during build)
validateAuthEnv();

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Fix for Edge runtime "self is not defined" error in Auth.js v5 beta
  trustHost: true,

  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    // Development-only test account for automated testing
    // ONLY enabled in development mode, disabled in production
    ...(process.env.NODE_ENV === "development"
      ? [
          Credentials({
            name: "Test Account",
            credentials: {
              email: { label: "Email", type: "email" },
              password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
              // Hardcoded test account for local development and Playwright testing
              if (
                credentials?.email === "test@localhost" &&
                credentials?.password === "test123"
              ) {
                return {
                  id: "test-user-id",
                  name: "Test User",
                  email: "test@localhost",
                };
              }
              return null;
            },
          }),
        ]
      : []),
    // Resend provider commented out - requires database adapter
    // Uncomment when adding database support in future
    // Resend({
    //   from: process.env.EMAIL_FROM || "noreply@yourdomain.com",
    // }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
      }
      return session;
    },
  },
});
