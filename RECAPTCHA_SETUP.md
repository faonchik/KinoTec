# Настройка reCAPTCHA

## Переменные окружения

Добавьте следующие переменные в ваш `.env` файл:

```env
# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LdOUissAAAAACucGwoWGYUnM8jxf2MTOvv3_5ad
RECAPTCHA_SECRET_KEY=6LdOUissAAAAAGO68wvuoOs2WvxVA-IXRgliLVag
```

## Где используется

reCAPTCHA добавлена на следующие страницы:
- `/auth/signup` - Регистрация
- `/auth/signin` - Вход

## Как это работает

1. **Клиентская часть**: Компонент `ReCaptcha` отображает виджет Google reCAPTCHA v2
2. **Серверная проверка**: При отправке формы токен reCAPTCHA отправляется на сервер
3. **Верификация**: Сервер проверяет токен через API Google reCAPTCHA
4. **Результат**: Если проверка пройдена, пользователь может продолжить регистрацию/вход

## Компоненты

- `components/auth/ReCaptcha.tsx` - Компонент reCAPTCHA для клиента
- `lib/recaptcha.ts` - Утилита для проверки reCAPTCHA на сервере
- `app/api/auth/signup/route.ts` - API регистрации с проверкой reCAPTCHA
- `app/api/auth/signin/route.ts` - API входа с проверкой reCAPTCHA

## Тестирование

В режиме разработки reCAPTCHA будет работать только если переменные окружения настроены. 
Если ключи не настроены, компонент не отобразится и проверка будет пропущена (для разработки).

## Безопасность

- Секретный ключ (`RECAPTCHA_SECRET_KEY`) никогда не должен быть доступен на клиенте
- Публичный ключ (`NEXT_PUBLIC_RECAPTCHA_SITE_KEY`) используется только на клиенте
- Все проверки reCAPTCHA выполняются на сервере

