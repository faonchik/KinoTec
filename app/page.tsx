import { getStreamingPreviewPayload } from "@/lib/streaming-preview/getStreamingPreviewPayload";
import { buildPayloadFromPool } from "@/lib/streaming-preview/fallbackMovies";
import { CinematicMainExperience } from "@/components/streaming-preview/CinematicMainExperience";

export default async function HomePage() {
  let data;
  try {
    data = await getStreamingPreviewPayload();
  } catch (e) {
    console.error("home cinematic payload", e);
    data = buildPayloadFromPool([]);
  }

  return (
    <div className="min-h-full bg-[#141414]">
      <CinematicMainExperience data={data} embedded />
    </div>
  );
}
