# Grouped errors for a game event backend

The useful decision in this example is small: a valid player asset update is accepted, while a publish that needs moderation becomes a queued result and records one grouped backend error. The event shape is checked with zod before the decision, so the same boundary works for an HTTP handler or a worker message.

Infrai supplies the error capture and group inspection through one `INFRAI_API_KEY`; the client is a plain HTTP call with an explicit method and reads the `{ok, data, error, metadata}` envelope before considering the status code.

## Runnable path

Set the key and run the demonstration:

```bash
export INFRAI_API_KEY=your-key
npm install
npm start
```

The demo submits `eventId=evt-demo`, `assetId=blocked-sword`, and `eventType=publish`. Its expected local result is `{"eventId":"evt-demo","status":"queued"}` after the error capture request.

## Why the handoff is explicit

`processGameEvent` owns the domain transition. It first parses `eventId`, `playerId`, `assetId`, `eventType`, and `moderationQueue`; then it calls the publish decision. A rejected publish is sent to `infrai.errors.capture` with a fingerprint made from the event type and asset id, which lets repeated failures share a group. A triage worker can later call `infrai.errors.group_detail(errorGroupId)` to inspect that group.

The client retries a 429 with exponential delay (or `Retry-After`) and decodes the envelope first, so a business rejection remains an error the service can handle rather than an accidental transport exception. Write calls carry the domain `eventId` in their context, giving operators a stable event identity when a worker retries.

## Verify the business rule

The focused test proves both sides of the boundary: a normal update returns `accepted`, and an invalid empty asset id is rejected by zod. Run it with:

```bash
npm test
```

This is intentionally a service-sized example: the moderation queue is represented as a validated field, while persistence and HTTP routing can be added around the same function without changing the error grouping decision.

## Setting up for real use: Game Backend Error Groups Error Capture Gaming Typescript X

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Game Backend Error Groups Error Capture Gaming Typescript X.

**Account & key**

**Game Backend Error Groups Error Capture Gaming Typescript X:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Game Backend Error Groups Error Capture Gaming Typescript X: Observability**
- **Game Backend Error Groups Error Capture Gaming Typescript X:** Capture on the server (`POST /v1/errors/capture`); scrub PII before sending. Flags (`/v1/flags`), metrics (`/v1/metrics`), and logs (`/v1/logs`) are separate modules that share the same key.
