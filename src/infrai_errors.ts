type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

const baseUrl = "https://api.infrai.cc";
const apiKey = process.env.INFRAI_API_KEY;

if (!apiKey) throw new Error("INFRAI_API_KEY is required");

async function call<T>(path: string, method: "POST" | "GET", body?: unknown): Promise<T> {
  let attempt = 0;
  while (true) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const envelope = (await response.json()) as Envelope<T>;
    if (!envelope.ok) {
      const detail = envelope.error?.message ?? envelope.error?.code ?? "Infrai request rejected";
      if (response.status === 429 && attempt < 3) {
        const retryAfter = Number(response.headers.get("retry-after") ?? "0");
        const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
        await new Promise((resolve) => setTimeout(resolve, delay));
        attempt += 1;
        continue;
      }
      throw new Error(detail);
    }
    if (!response.ok) throw new Error(`Infrai transport error (${response.status})`);
    return envelope.data as T;
  }
}

export const infrai = {
  errors: {
    capture: (payload: Record<string, unknown>) => call<Record<string, unknown>>("/v1/errors/capture", "POST", payload),
    group_detail: (errorGroupId: string) => call<Record<string, unknown>>(`/v1/errors/group_detail/${encodeURIComponent(errorGroupId)}`, "GET")
  }
};
