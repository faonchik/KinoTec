"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  AuthPageLayout,
  authInputClass,
  authLabelClass,
  authPrimaryButtonClass,
  authLinkClass,
  authAlertErrorClass,
  authAlertSuccessClass,
} from "@/components/auth/AuthPageLayout";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("auth.resetPassword");
  const tc = useTranslations("auth.common");
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(t("tokenMissing"));
    }
  }, [token, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError(t("tokenMissing"));
      return;
    }

    if (password.length < 8) {
      setError(t("errorMin8"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("errorMismatch"));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || tc("genericError"));
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/signin");
        }, 2000);
      }
    } catch {
      setError(t("errorOnReset"));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col gap-8">
        <div className={authAlertErrorClass}>
          <p>{t("tokenMissingBody")}</p>
        </div>
        <Link href="/auth/forgot-password" className={authPrimaryButtonClass}>
          {t("requestNew")}
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className={authAlertSuccessClass}>
        <p>{t("successRedirect")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="block w-full">
      <div className="flex flex-col gap-8">
        {error ? (
          <div className={authAlertErrorClass}>
            <p>{error}</p>
          </div>
        ) : null}

        <div>
          <label htmlFor="password" className={authLabelClass}>
            {t("newPassword")}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInputClass}
            placeholder={t("placeholderMin8")}
            autoComplete="new-password"
            required
            disabled={isLoading}
            minLength={8}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className={authLabelClass}>
            {t("confirmPassword")}
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={authInputClass}
            placeholder={t("placeholderRepeat")}
            autoComplete="new-password"
            required
            disabled={isLoading}
            minLength={8}
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
              {t("saving")}
            </>
          ) : (
            t("submit")
          )}
        </button>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  const t = useTranslations("auth.resetPassword");
  const tc = useTranslations("auth.common");

  return (
    <AuthPageLayout
      title={t("title")}
      subtitle={t("subtitle")}
      footer={
        <>
          {t("footerRemember")}{" "}
          <Link href="/auth/signin" className={authLinkClass}>
            {t("signIn")}
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="py-10 text-center font-mono text-[13px] text-white/40">{tc("loading")}</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthPageLayout>
  );
}
