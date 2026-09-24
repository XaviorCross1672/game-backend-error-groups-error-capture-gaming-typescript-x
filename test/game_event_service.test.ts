import assert from "node:assert/strict";

process.env.INFRAI_API_KEY = process.env.INFRAI_API_KEY ?? "test-key";
const { processGameEvent } = await import("../src/game_event_service.js");

const accepted = await processGameEvent({ eventId: "evt-1", playerId: "p-1", assetId: "sword-1", eventType: "update", moderationQueue: "queue-main" });
assert.deepEqual(accepted, { eventId: "evt-1", status: "accepted" });

await assert.rejects(() => processGameEvent({ eventId: "evt-2", playerId: "p-1", assetId: "", eventType: "publish", moderationQueue: "queue-main" }));
console.log("game event validation and acceptance decisions passed");
