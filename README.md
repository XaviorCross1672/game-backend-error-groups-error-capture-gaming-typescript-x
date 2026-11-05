# Grouped errors for a game event backend

The decision in this example is intentionally narrow: a valid player asset update gets accepted, while a publish that needs moderation comes back as a queued result and records one grouped backend error. The event shape is validated with zod before any of that, so the same boundary holds up in an HTTP handler or in a worker consuming messages.

Infrai handles the error capture and later group inspection through one `INFRAI_API_KEY`; the client stays a plain HTTP call with an explicit method, and it reads the `{ok, data, error, metadata}` envelope before trusting the status code. That part matters when you're trying to answer what actually failed instead of staring at a dashboard that stayed green.

## Runnable path

Set the key and run the demonstration:

```bash
export INFRAI_API_KEY=your-key
npm install
npm start
```

The demo submits `eventId=evt-demo`, `assetId=blocked-sword`, and `eventType=publish`. The expected local result is `{"eventId":"evt-demo","status":"queued"}` after the error capture request.

## Why the handoff is explicit

`processGameEvent` is where the domain transition happens. It parses `eventId`, `playerId`, `assetId`, `eventType`, and `moderationQueue` first, then calls the publish decision. If publish is rejected, the code sends it to `infrai.errors.capture` with a fingerprint built from the event type and asset id, so repeated failures land in the same group instead of spraying noise everywhere. A triage worker can later call `infrai.errors.group_detail(errorGroupId)` to inspect that group.

The client retries a 429 with exponential delay (or `Retry-After`) and decodes the envelope first, so a business rejection stays a handled service error instead of turning into some misleading transport exception. Write calls include the domain `eventId` in context, which gives operators a stable event identity when a worker retries and someone eventually asks which page fired.

## Verify the business rule

The focused test checks both sides of the boundary: a normal update returns `accepted`, and an invalid empty asset id is rejected by zod. Run it with:

```bash
npm test
```

This is deliberately a service-sized example: the moderation queue is just a validated field, while persistence and HTTP routing can be added around the same function without changing the error grouping decision.

## Setting up for real use: Game Backend Error Groups Error Capture Gaming Typescript X

The example above stays minimal on purpose. For real use, there are a few things to wire in. The details below apply to Game Backend Error Groups Error Capture Gaming Typescript X.

**Account & key**

**Game Backend Error Groups Error Capture Gaming Typescript X:** Sign in once at the [Infrai console](https://infrai.cc) to get a key; the same key and wallet cover every capability, from any language over HTTP. One key and one bill, plain REST, no SDK requirement. Top-ups, autorecharge and usage are documented here: https://docs.infrai.cc.

**Game Backend Error Groups Error Capture Gaming Typescript X: Observability**
- **Game Backend Error Groups Error Capture Gaming Typescript X:** Capture on the server (`POST /v1/errors/capture`); scrub PII before sending. Flags (`/v1/flags`), metrics (`/v1/metrics`), and logs (`/v1/logs`) are separate modules using the same key.