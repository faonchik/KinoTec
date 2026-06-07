"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  AuthPageLayout,
  authInputClass,
  authLabelClass,
  authLabelTextClass,
  authPrimaryButtonClass,
  authLinkClass,
  authAlertErrorClass,
  authAlertSuccessClass,
} from "@/components/auth/AuthPageLayout";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("auth.signIn");
  const tc = useTranslations("auth.common");
  const callbackUrl = searchParams?.get("callbackUrl") || "/";
  const justRegistered = searchParams?.get("registered") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("invalidCredentials"));
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError(t("errorOnSignIn"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="block w-full">
      <div className="flex flex-col gap-8">
        {justRegistered ? (
          <div className={authAlertSuccessClass}>
            <p>{t("registeredHint")}</p>
          </div>
        ) : null}
        {error ? (
          <div className={authAlertErrorClass}>
            <p>{error}</p>
          </div>
        ) : null}

        <div>
          <label htmlFor="email" className={authLabelClass}>
            {t("email")}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInputClass}
            placeholder={tc("emailPlaceholder")}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <label htmlFor="password" className={authLabelTextClass}>
              {t("password")}
            </label>
            <Link href="/auth/forgot-password" className={`${authLinkClass} text-[12px] font-medium`}>
              {t("forgotPassword")}
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInputClass}
            placeholder={tc("passwordPlaceholder")}
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" disabled={isLoading} className={authPrimaryButtonClass}>
          {isLoading ? (
            <>
              <svg className="h-5 w-5 shrink-0 animate-spin" viewBox="0 0 24 24" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {t("submitting")}
            </>
          ) : (
            t("submit")
          )}
        </button>
      </div>
    </form>
  );
}

export default function SignInPage() {
  const t = useTranslations("auth.signIn");
  const tc = useTranslations("auth.common");

  return (
    <AuthPageLayout
      title={t("title")}
      subtitle={t("subtitle")}
      footer={
        <>
          {t("noAccount")}{" "}
          <Link href="/auth/signup" className={authLinkClass}>
            {t("signUpLink")}
          </Link>
        </>
      }
    >
      <Suspense
        fallback={
          <div className="py-10 text-center font-mono text-[13px] text-white/40">{tc("loading")}</div>
        }
      >
        <SignInForm />
      </Suspense>
    </AuthPageLayout>
  );
}
