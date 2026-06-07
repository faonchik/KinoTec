"use client";

import { useState } from "react";
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

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgotPassword");
  const tc = useTranslations("auth.common");

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || tc("genericError"));
      } else {
        setSuccess(true);
      }
    } catch {
      setError(t("errorOnSend"));
    } finally {
      setIsLoading(false);
    }
  };

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
      {success ? (
        <div className="flex flex-col gap-8">
          <div className={authAlertSuccessClass}>
            <p>{t("successBody")}</p>
          </div>
          <Link href="/auth/signin" className={authPrimaryButtonClass}>
            {t("backToSignIn")}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="block w-full">
          <div className="flex flex-col gap-8">
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
                disabled={isLoading}
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
                  {t("sending")}
                </>
              ) : (
                t("submit")
              )}
            </button>
          </div>
        </form>
      )}
    </AuthPageLayout>
  );
}
