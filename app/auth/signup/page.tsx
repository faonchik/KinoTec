"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  AuthPageLayout,
  authInputClass,
  authLabelClass,
  authPrimaryButtonClass,
  authLinkClass,
  authAlertErrorClass,
} from "@/components/auth/AuthPageLayout";

export default function SignUpPage() {
  const router = useRouter();
  const t = useTranslations("auth.signUp");
  const tc = useTranslations("auth.common");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("errorMismatch"));
      return;
    }

    if (password.length < 6) {
      setError(t("errorMinLength"));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("errorGeneric"));
        return;
      }

      router.push("/auth/signin?registered=true");
    } catch {
      setError(t("errorOnSignUp"));
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
          {t("hasAccount")}{" "}
          <Link href="/auth/signin" className={authLinkClass}>
            {t("signIn")}
          </Link>
        </>
      }
    >
      {error ? (
        <div className={`mb-8 ${authAlertErrorClass}`}>
          <p>{error}</p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="block w-full">
        <div className="flex flex-col gap-8">
          <div>
            <label htmlFor="name" className={authLabelClass}>
              {t("name")}
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={authInputClass}
              placeholder={t("namePlaceholder")}
              autoComplete="name"
              required
            />
          </div>

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
            <label htmlFor="password" className={authLabelClass}>
              {t("password")}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={authInputClass}
              placeholder={tc("passwordPlaceholder")}
              autoComplete="new-password"
              required
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
              placeholder={tc("passwordPlaceholder")}
              autoComplete="new-password"
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
    </AuthPageLayout>
  );
}
