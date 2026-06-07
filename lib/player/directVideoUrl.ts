/**
 * Определяет, можно ли отдавать URL в нативный <video> (VideoPlayer).
 * YouTube/Vimeo и т.п. сюда не подходят — иначе браузер не играет поток,
 * а часть ссылок ведёт на внешний сайт при взаимодействии.
 */
export function isUsableDirectVideoUrlForNativePlayer(url: string | null | undefined): boolean {
  const s = url?.trim();
  if (!s) return false;
  if (s.startsWith("blob:")) return true;

  let host = "";
  let path = "";
  try {
    const u = new URL(s);
    host = u.hostname.toLowerCase();
    path = `${u.pathname}${u.search}`.toLowerCase();
  } catch {
    path = s.toLowerCase();
  }

  if (host) {
    if (host === "youtu.be" || host === "www.youtu.be") return false;
    if (host === "youtube.com" || host === "www.youtube.com" || host === "m.youtube.com" || host.endsWith(".youtube.com")) {
      return false;
    }
    if (host === "vimeo.com" || host === "www.vimeo.com" || host.endsWith(".vimeo.com")) return false;
    if (host.includes("dailymotion.com")) return false;
  }

  return (
    /\.(mp4|webm|m4v|mov|ogv|ogg)(\?|#|$)/i.test(path) ||
    /\.m3u8(\?|#|$)/i.test(path) ||
    path.includes(".m3u8")
  );
}
