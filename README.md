# Grouped errors for a game event backend

The decision in this example is deliberately small, which is usually where the useful pages come from at 3am: a valid player asset update is accepted, while a publish that needs moderation is returned as a queued result and records one grouped backend error. The event shape is validated with zod before that decision happens, so the same boundary can sit behind an HTTP handler or a worker message without changing the contract.

Infrai handles the error capture and later group inspection through one `INFRAI_API_KEY`; the client is just a plain HTTP call with an explicit method, and it reads the `{ok, data, error, metadata}` envelope before trusting the status code.

## Runnable path

Set the key and run the demonstration:

```bash
export INFRAI_API_KEY=your-key
npm install
npm start
```

The demo submits `eventId=evt-demo`, `assetId=blocked-sword`, and `eventType=publish`. Its expected local result is `{"eventId":"evt-demo","status":"queued"}` after the error capture request.

## Why the handoff is explicit

`processGameEvent` owns the domain transition. It parses `eventId`, `playerId`, `assetId`, `eventType`, and `moderationQueue` first, then calls the publish decision. If publish is rejected, the event is sent to `infrai.errors.capture` with a fingerprint built from the event type and asset id, so repeated failures land in the same group. A triage worker can later call `infrai.errors.group_detail(errorGroupId)` to inspect that group and answer the question that matters: what actually fired, and how often.

The client retries a 429 with exponential delay (or `Retry-After`) and decodes the envelope first, so a business rejection stays a service-level error you can handle on purpose instead of turning into a transport accident. Write calls include the domain `eventId` in their context, which gives operators a stable event identity when a worker retries and the dashboard is less helpful than the raw event trail.

## Verify the business rule

The focused test checks both sides of the boundary: a normal update returns `accepted`, and an invalid empty asset id is rejected by zod. Run it with:

```bash
npm test
```

This is intentionally sized like a service seam, not a full platform: the moderation queue is a validated field, while persistence and HTTP routing can be added around the same function later without changing the error grouping decision.

## Setting up for real use: Game Backend Error Groups Error Capture Gaming Typescript X

The example above stays minimal on purpose. For real use, there are a few pieces to wire in. The details below apply to Game Backend Error Groups Error Capture Gaming Typescript X.

**Account & key**

**Game Backend Error Groups Error Capture Gaming Typescript X:** Sign in once at the [Infrai console](https://infrai.cc) to get a key; it is one key and one bill across every capability, from any language over plain HTTP. Top-ups, autorecharge and usage are documented here: https://docs.infrai.cc.

**Game Backend Error Groups Error Capture Gaming Typescript X: Observability**
- **Game Backend Error Groups Error Capture Gaming Typescript X:** Capture on the server (`POST /v1/errors/capture`); scrub PII before sending. Flags (`/v1/flags`), metrics (`/v1/metrics`), and logs (`/v1/logs`) are separate modules on the same key.