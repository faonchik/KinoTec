"use client";

import { useEffect, useState } from "react";

interface ReCaptchaProps {
  onChange: (token: string | null) => void;
  onExpired?: () => void;
  onError?: () => void;
  action?: string;
}

// Расширяем Window для типизации grecaptcha
declare global {
  interface Window {
    grecaptcha?: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

function ReCaptcha({ onChange, onExpired, onError, action = "LOGIN" }: ReCaptchaProps) {
  const [siteKey, setSiteKey] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const key = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
      console.log("🔑 ReCAPTCHA Enterprise Site Key:", key ? `${key.substring(0, 10)}...` : "НЕ НАЙДЕН");
      console.log("🔑 Полный ключ (для отладки):", key);
      setSiteKey(key);
      
      if (!key) {
        console.warn("⚠️ NEXT_PUBLIC_RECAPTCHA_SITE_KEY не настроен. reCAPTCHA не будет работать.");
        return;
      }

      // Проверяем, не загружен ли уже скрипт
      const existingScript = document.querySelector(`script[src*="recaptcha/enterprise.js"]`);
      if (existingScript) {
        console.log("✅ Скрипт reCAPTCHA Enterprise уже загружен");
        // Проверяем, доступен ли grecaptcha
        const checkGrecaptcha = () => {
          if (window.grecaptcha?.enterprise) {
            console.log("✅ grecaptcha.enterprise доступен");
            setIsLoaded(true);
          } else {
            console.warn("⚠️ grecaptcha.enterprise еще не доступен, ждем...");
            setTimeout(checkGrecaptcha, 100);
          }
        };
        checkGrecaptcha();
        return;
      }

      // Загружаем скрипт reCAPTCHA Enterprise
      const script = document.createElement("script");
      // Для Enterprise используем правильный URL
      script.src = `https://www.google.com/recaptcha/enterprise.js?render=${encodeURIComponent(key)}`;
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        console.log("✅ reCAPTCHA Enterprise скрипт загружен, проверяем grecaptcha...");
        // Ждем, пока grecaptcha станет доступным
        const checkGrecaptcha = () => {
          if (window.grecaptcha?.enterprise) {
            console.log("✅ grecaptcha.enterprise доступен");
            setIsLoaded(true);
          } else {
            console.warn("⚠️ grecaptcha.enterprise еще не доступен, ждем...");
            setTimeout(checkGrecaptcha, 100);
          }
        };
        setTimeout(checkGrecaptcha, 100);
      };
      script.onerror = (error) => {
        console.error("❌ Ошибка загрузки reCAPTCHA Enterprise скрипта:", error);
        console.error("❌ URL скрипта:", script.src);
        onError?.();
      };
      document.head.appendChild(script);
      console.log("📤 Запрос на загрузку скрипта reCAPTCHA Enterprise отправлен");
    }
  }, [onError]);

  // Выполняем reCAPTCHA при загрузке
  useEffect(() => {
    if (isMounted && isLoaded && siteKey) {
      console.log("🚀 Начинаем выполнение reCAPTCHA...");
      console.log("🔍 Проверка grecaptcha:", {
        exists: !!window.grecaptcha,
        enterprise: !!window.grecaptcha?.enterprise,
        ready: typeof window.grecaptcha?.enterprise?.ready,
        execute: typeof window.grecaptcha?.enterprise?.execute,
      });

      if (!window.grecaptcha?.enterprise) {
        console.error("❌ grecaptcha.enterprise недоступен!");
        onError?.();
        onChange(null);
        return;
      }

      const executeRecaptcha = async () => {
        try {
          console.log("⏳ Ожидание ready...");
          window.grecaptcha.enterprise.ready(async () => {
            try {
              console.log("✅ grecaptcha.enterprise.ready вызван");
              console.log("⏳ Выполнение execute с ключом:", siteKey.substring(0, 10) + "...");
              const newToken = await window.grecaptcha!.enterprise.execute(siteKey, { action });
              console.log("✅ reCAPTCHA токен получен:", newToken ? `${newToken.substring(0, 20)}...` : "null");
              setToken(newToken);
              onChange(newToken);
            } catch (error) {
              console.error("❌ Ошибка выполнения reCAPTCHA:", error);
              console.error("❌ Детали ошибки:", {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
              });
              onError?.();
              onChange(null);
            }
          });
        } catch (error) {
          console.error("❌ Ошибка инициализации reCAPTCHA:", error);
          onError?.();
          onChange(null);
        }
      };

      // Небольшая задержка перед выполнением, чтобы убедиться, что все готово
      const timeout = setTimeout(() => {
        executeRecaptcha();
      }, 500);

      // Обновляем токен каждые 2 минуты (токены истекают через 2 минуты)
      const interval = setInterval(() => {
        if (window.grecaptcha?.enterprise) {
          executeRecaptcha();
        }
      }, 110000); // 110 секунд, чтобы обновить до истечения

      return () => {
        clearTimeout(timeout);
        clearInterval(interval);
      };
    }
  }, [isMounted, isLoaded, siteKey, action, onChange, onError]);

  // Удаляем любые старые виджеты reCAPTCHA v2, если они есть
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Удаляем старые скрипты v2
      const oldScripts = document.querySelectorAll('script[src*="recaptcha/api.js"]');
      oldScripts.forEach(script => {
        console.log("🗑️ Удаляем старый скрипт reCAPTCHA v2:", script.src);
        script.remove();
      });

      // Удаляем старые виджеты
      const oldWidgets = document.querySelectorAll('.g-recaptcha, [data-sitekey]');
      oldWidgets.forEach(widget => {
        console.log("🗑️ Удаляем старый виджет reCAPTCHA v2");
        widget.remove();
      });
    }
  }, []);

  if (!isMounted || !siteKey) {
    console.log("⚠️ Компонент не готов: isMounted=", isMounted, "siteKey=", !!siteKey);
    return null;
  }

  // reCAPTCHA Enterprise работает в фоновом режиме, не требует визуального виджета
  // Но можно показать индикатор загрузки
  if (!isLoaded) {
    console.log("⏳ Ожидание загрузки reCAPTCHA Enterprise...");
    return (
      <div className="h-[40px] flex items-center justify-center text-slate-400 text-sm">
        <span className="animate-pulse">Загрузка защиты...</span>
      </div>
    );
  }

  // Для Enterprise версии не нужен визуальный виджет, но можно показать индикатор
  console.log("✅ reCAPTCHA Enterprise активна, токен:", token ? "получен" : "ожидается");
  return (
    <div className="h-[40px] flex items-center justify-center text-slate-500 text-xs">
      <span className="flex items-center gap-2">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        {token ? "Защита включена" : "Загрузка..."}
      </span>
    </div>
  );
}

export default ReCaptcha;
