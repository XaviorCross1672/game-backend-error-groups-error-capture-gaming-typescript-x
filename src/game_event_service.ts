import { z } from "zod";
import { infrai } from "./infrai_errors.js";

export const gameEventSchema = z.object({
  eventId: z.string().min(1),
  playerId: z.string().min(1),
  assetId: z.string().min(1),
  eventType: z.enum(["publish", "update"]),
  moderationQueue: z.string().min(1)
});

export type GameEvent = z.infer<typeof gameEventSchema>;

export async function processGameEvent(input: unknown): Promise<{ eventId: string; status: "accepted" | "queued" }> {
  const event = gameEventSchema.parse(input);
  try {
    await publishAsset(event);
    return { eventId: event.eventId, status: "accepted" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await infrai.errors.capture({
      message,
      level: "error",
      fingerprint: ["game-event", event.eventType, event.assetId],
      exception: message,
      context: { eventId: event.eventId, playerId: event.playerId, assetId: event.assetId, moderationQueue: event.moderationQueue }
    });
    return { eventId: event.eventId, status: "queued" };
  }
}

async function publishAsset(event: GameEvent): Promise<void> {
  if (event.eventType === "publish" && event.assetId.startsWith("blocked-")) {
    throw new Error("asset requires moderation review");
  }
}

export async function inspectErrorGroup(errorGroupId: string): Promise<Record<string, unknown>> {
  return infrai.errors.group_detail(errorGroupId);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await processGameEvent({ eventId: "evt-demo", playerId: "player-7", assetId: "blocked-sword", eventType: "publish", moderationQueue: "queue-eu" });
  console.log(JSON.stringify(result));
}
