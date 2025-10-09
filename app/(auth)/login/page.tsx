"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // Test account state (dev only)
  const [testEmail, setTestEmail] = useState("");
  const [testPassword, setTestPassword] = useState("");
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testError, setTestError] = useState("");
  const isDev = process.env.NODE_ENV === "development";

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Google sign-in error:", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      setIsEmailLoading(true);
      await signIn("resend", { email, callbackUrl: "/" });
      setEmailSent(true);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setEmailError("Failed to send magic link. Please try again.");
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleTestAccountSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestError("");

    try {
      setIsTestLoading(true);
      const result = await signIn("credentials", {
        email: testEmail,
        password: testPassword,
        redirect: false,
      });

      if (result?.error) {
        setTestError("Invalid credentials");
      } else if (result?.ok) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Test account sign-in error:", error);
      setTestError("Failed to sign in. Please try again.");
    } finally {
      setIsTestLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            BuddhaBot
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Spiritual wisdom through AI guidance
          </p>
        </div>

        {emailSent ? (
          /* Email sent confirmation */
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <p className="text-sm font-medium text-green-800">
                Magic link sent!
              </p>
              <p className="mt-1 text-xs text-green-700">
                Check your email for the sign-in link
              </p>
            </div>
            <Button
              onClick={() => setEmailSent(false)}
              variant="outline"
              className="w-full"
            >
              Send another link
            </Button>
          </div>
        ) : (
          <>
            {/* Google Sign-In */}
            <div className="space-y-4">
              <Button
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full"
                variant="outline"
              >
                {isGoogleLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                    Connecting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </span>
                )}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-slate-500">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Email Sign-In */}
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isEmailLoading}
                    className="w-full"
                  />
                  {emailError && (
                    <p className="mt-1 text-xs text-red-600">{emailError}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isEmailLoading || !email}
                  className="w-full"
                >
                  {isEmailLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Sending link...
                    </span>
                  ) : (
                    "Send magic link"
                  )}
                </Button>
              </form>

              {/* Test Account (Development Only) */}
              {isDev && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-2 text-slate-500">
                        Test Account (Dev Only)
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleTestAccountSignIn} className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs text-amber-800">
                      Development testing credentials:
                    </p>
                    <div className="space-y-2">
                      <Input
                        type="email"
                        placeholder="test@localhost"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        disabled={isTestLoading}
                        className="w-full bg-white"
                      />
                      <Input
                        type="password"
                        placeholder="test123"
                        value={testPassword}
                        onChange={(e) => setTestPassword(e.target.value)}
                        disabled={isTestLoading}
                        className="w-full bg-white"
                      />
                      {testError && (
                        <p className="text-xs text-red-600">{testError}</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={isTestLoading || !testEmail || !testPassword}
                      variant="secondary"
                      className="w-full"
                    >
                      {isTestLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                          Signing in...
                        </span>
                      ) : (
                        "Sign in with test account"
                      )}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-slate-500">
          By signing in, you agree to our terms of service
        </p>
      </div>
    </div>
  );
}
