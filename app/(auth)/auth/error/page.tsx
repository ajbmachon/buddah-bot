"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case "Configuration":
        return {
          title: "Configuration Error",
          message:
            "There is a problem with the server configuration. Please contact support.",
        };
      case "AccessDenied":
        return {
          title: "Access Denied",
          message: "You do not have permission to sign in.",
        };
      case "Verification":
        return {
          title: "Verification Failed",
          message:
            "The sign-in link is no longer valid. It may have been used already or expired.",
        };
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
      case "EmailCreateAccount":
      case "Callback":
        return {
          title: "Sign-In Error",
          message:
            "An error occurred during sign-in. Please try again or use a different method.",
        };
      case "EmailSignin":
        return {
          title: "Email Error",
          message: "Failed to send the sign-in email. Please try again.",
        };
      case "CredentialsSignin":
        return {
          title: "Sign-In Failed",
          message: "Sign-in failed. Check your credentials and try again.",
        };
      case "SessionRequired":
        return {
          title: "Session Required",
          message: "Please sign in to access this page.",
        };
      default:
        return {
          title: "Authentication Error",
          message:
            "An unexpected error occurred. Please try signing in again.",
        };
    }
  };

  const errorDetails = getErrorMessage(error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-3">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            {errorDetails.title}
          </h1>
          <p className="text-sm text-slate-600">{errorDetails.message}</p>
        </div>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === "development" && error && (
          <div className="rounded-lg bg-slate-100 p-3">
            <p className="text-xs font-mono text-slate-600">
              Error code: {error}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Link href="/login" className="block">
            <Button className="w-full">Try Again</Button>
          </Link>
          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              Go to Home
            </Button>
          </Link>
        </div>

        {/* Support Link */}
        <p className="text-center text-xs text-slate-500">
          If this problem persists, please contact support
        </p>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-600" />
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
