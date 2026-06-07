import { getStreamingPreviewPayload } from "@/lib/streaming-preview/getStreamingPreviewPayload";
import { buildPayloadFromPool } from "@/lib/streaming-preview/fallbackMovies";
import { StreamingPreviewClient } from "@/components/streaming-preview/StreamingPreviewClient";

export const metadata = {
  title: "Cinematic UI — превью",
  description: "Премиальный интерфейс стриминга (демо-макет)",
};

export default async function StreamingPreviewPage() {
  let data;
  try {
    data = await getStreamingPreviewPayload();
  } catch (e) {
    console.error("streaming-preview", e);
    data = buildPayloadFromPool([]);
  }
  return <StreamingPreviewClient data={data} />;
}
