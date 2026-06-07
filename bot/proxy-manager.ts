import https from 'https';
import HttpsProxyAgent = require('https-proxy-agent');

interface ProxyEntry {
  ip: string;
  port: number;
  curl: string;
}

const PROXY_SOURCE =
  'https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/protocols/http/data.json';

const TEST_TIMEOUT_MS = 7000;
const MAX_WORKING = 20;
const BATCH_SIZE = 20;

async function testProxy(proxyUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const agent = HttpsProxyAgent(proxyUrl) as any;
      const req = https.get(
        { hostname: 'api.telegram.org', path: '/', port: 443, agent },
        (res) => {
          resolve(true);
          res.resume();
        }
      );
      req.setTimeout(TEST_TIMEOUT_MS, () => {
        req.destroy();
        resolve(false);
      });
      req.on('error', () => resolve(false));
    } catch {
      resolve(false);
    }
  });
}

export class ProxyManager {
  private proxies: string[] = [];
  private index = 0;
  private cooldownUntil = 0;

  async load(): Promise<void> {
    console.log('🔍 Загружаю список прокси...');

    let all: string[] = [];
    try {
      const res = await fetch(PROXY_SOURCE);
      if (res.ok) {
        const data = (await res.json()) as ProxyEntry[];
        all = data.map((p) => p.curl).filter(Boolean);
        console.log(`📋 Получено ${all.length} прокси. Тестирую...`);
      }
    } catch (e) {
      console.warn('Не удалось загрузить список прокси:', e);
    }

    if (all.length === 0) {
      console.warn('⚠️  Список прокси пуст. Бот будет работать напрямую.');
      return;
    }

    const working: string[] = [];

    for (let i = 0; i < all.length && working.length < MAX_WORKING; i += BATCH_SIZE) {
      const batch = all.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(batch.map(async (p) => ({ p, ok: await testProxy(p) })));
      results.filter((r) => r.ok).forEach((r) => working.push(r.p));
      process.stdout.write(
        `\r   Проверено: ${Math.min(i + BATCH_SIZE, all.length)}/${all.length} | Рабочих: ${working.length}`
      );
    }

    console.log('');
    this.proxies = working;
    this.index = 0;

    if (this.proxies.length === 0) {
      console.warn('⚠️  Рабочих прокси не найдено. Бот попробует прямое соединение.');
    } else {
      console.log(`✅ Готово: ${this.proxies.length} рабочих прокси.`);
    }
  }

  current(): string | null {
    return this.proxies[this.index] ?? null;
  }

  next(): string | null {
    if (this.proxies.length === 0) return null;
    this.index = (this.index + 1) % this.proxies.length;
    return this.current();
  }

  getAgent(): unknown {
    const proxy = this.current();
    return proxy ? HttpsProxyAgent(proxy) : undefined;
  }

  /** Returns true if enough time has passed since last rotation (debounce). */
  canRotate(): boolean {
    const now = Date.now();
    if (now < this.cooldownUntil) return false;
    this.cooldownUntil = now + 8000;
    return true;
  }
}
