/* eslint-disable @typescript-eslint/no-explicit-any */
import { Agent, fetch as undiciFetch, ProxyAgent } from "undici";

/** Прямое соединение без системного HTTP(S)_PROXY из окружения Windows/VPN. */
const directDispatcher = new Agent();

/**
 * Исходящие HTTP(S) с сервера (TMDB, прокси картинок).
 *
 * - `TMDB_OUTBOUND_PROXY` — явный прокси (например `http://127.0.0.1:7890`)
 * - `TMDB_USE_SYSTEM_PROXY=true` — дополнительно читать `HTTPS_PROXY` / `HTTP_PROXY`
 *
 * Системные прокси Windows/VPN часто указывают на несуществующий `127.0.0.1:443`
 * и ломают загрузку картинок — по умолчанию их не подхватываем.
 */
function readProxyUrl(): string | undefined {
  const explicit = process.env.TMDB_OUTBOUND_PROXY?.trim();
  if (explicit) return explicit;

  if (process.env.TMDB_USE_SYSTEM_PROXY === "true") {
    return (
      process.env.HTTPS_PROXY?.trim() ||
      process.env.HTTP_PROXY?.trim() ||
      undefined
    );
  }

  return undefined;
}

let cachedAgent: ProxyAgent | undefined | null = undefined;

function getProxyAgent(): ProxyAgent | undefined {
  if (cachedAgent === null) return undefined;
  const url = readProxyUrl();
  if (!url) {
    cachedAgent = undefined;
    return undefined;
  }
  if (cachedAgent === undefined) {
    try {
      cachedAgent = new ProxyAgent(url);
      console.info("[outbound] Proxy enabled:", url.replace(/:[^:@/]+@/, ":***@"));
    } catch (e) {
      console.error("[outbound] Invalid proxy URL, direct connection will be used:", e);
      cachedAgent = null;
      return undefined;
    }
  }
  return cachedAgent ?? undefined;
}

/** @deprecated Prefer `outboundFetch` — it retries without proxy on failure. */
export function outboundFetchInit(): RequestInit {
  const dispatcher = getProxyAgent();
  if (!dispatcher) return {};
  return { dispatcher } as RequestInit;
}

function isProxyConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  const cause = (error as Error & { cause?: Error }).cause;
  const causeMsg = cause?.message?.toLowerCase() ?? "";
  return (
    msg.includes("fetch failed") ||
    msg.includes("econnrefused") ||
    msg.includes("proxy") ||
    causeMsg.includes("econnrefused") ||
    (cause as any)?.code === "ECONNREFUSED"
  );
}

/**
 * Серверный fetch: с прокси (если задан), при ошибке соединения — повтор без прокси.
 */
export async function outboundFetch(
  url: string | URL,
  init?: RequestInit
): Promise<Response> {
  const dispatcher = getProxyAgent();
  const baseInit: RequestInit = {
    ...init,
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; KinoTec/1.0)",
      ...(init?.headers as Record<string, string> | undefined),
    },
  };

  const directInit = { ...baseInit, dispatcher: directDispatcher } as RequestInit;

  // Next.js подменяет global fetch — undici fetch + dispatcher обходит системный прокси Windows/VPN.
  if (!dispatcher) {
    return undiciFetch(url, directInit as any) as unknown as Promise<Response>;
  }

  try {
    return await undiciFetch(url, { ...baseInit, dispatcher } as any) as unknown as Response;
  } catch (error) {
    if (!isProxyConnectionError(error)) throw error;
    console.warn(
      "[outbound] Proxy fetch failed, retrying direct:",
      error instanceof Error ? error.message : error
    );
    cachedAgent = null;
    return undiciFetch(url, directInit as any) as unknown as Promise<Response>;
  }
}
