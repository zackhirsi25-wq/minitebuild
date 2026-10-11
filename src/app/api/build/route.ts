import { getDraft } from "@/lib/build/draft";
import { allow, ipKey, LIMITS } from "@/lib/build/rate-limit";
import { runBuild, type BuildEvent } from "@/lib/build/run";
import { parsePhone } from "@/lib/content/phone";

// Builds the site for the current browser's draft and streams progress as
// newline-delimited JSON, one BuildEvent per line, so the build page can show
// each step as it happens.

export const maxDuration = 180;

function line(event: BuildEvent): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(event)}\n`);
}

function single(event: BuildEvent, status = 200): Response {
  return new Response(`${JSON.stringify(event)}\n`, { status, headers: { "Content-Type": "application/x-ndjson" } });
}

export async function POST() {
  const current = await getDraft();
  if (!current?.data.confirmed || !current.data.designChosen) {
    return single({ type: "error", message: "Your progress was lost. Start again from the first step." }, 400);
  }
  if (current.data.slug) return single({ type: "done", slug: current.data.slug });

  const ip = await ipKey();
  const phone = parsePhone(current.data.phone)?.e164 ?? current.data.phone;
  const allowed =
    (await allow(`build:ip-hour:${ip}`, 3600, LIMITS.buildsPerIpHour)) &&
    (await allow(`build:ip-day:${ip}`, 86400, LIMITS.buildsPerIpDay)) &&
    (await allow(`build:phone-day:${phone}`, 86400, LIMITS.buildsPerPhoneDay));
  if (!allowed) {
    return single(
      { type: "error", message: "You've built several sites already today. Please try again tomorrow, or call us." },
      429,
    );
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        await runBuild(current.id, current.data, current.tokenHash, (event) => controller.enqueue(line(event)));
      } catch (error) {
        console.error("Build failed", error);
        controller.enqueue(
          line({ type: "error", message: "Something went wrong while building your site. Please try again." }),
        );
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-store", "X-Accel-Buffering": "no" },
  });
}
