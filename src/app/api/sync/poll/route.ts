// GET /api/sync/poll?since=TIMESTAMP&channels=teacher,event,material
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const since = Number(url.searchParams.get("since") || 0);
    const allow = (url.searchParams.get("channels") || "teacher,event,material").split(",");

    const res = await fetch("https://sync.shibutzplus.com/poll", { cache: "no-store" });
    if (!res.ok) return new Response("upstream poll failed", { status: 502 });

    const data = await res.json();
    const items = Array.isArray(data?.items) ? data.items : [];

    // keep only allowed channels newer than ?since
    const filtered = items
      .map((it: any) => it?.value || {})
      .filter((v: any) => allow.includes(v?.channel) && typeof v?.ts === "number" && v.ts > since);

    const latestTs = filtered.reduce((mx: number, v: any) => (v.ts > mx ? v.ts : mx), since);

    // return minimal fields to the client
    return Response.json({
      latestTs,
      count: filtered.length,
      items: filtered.map((v: any) => ({ channel: v.channel, ts: v.ts })),
    });
  } catch (e) {
    console.error("poll proxy failed", e);
    return new Response("error", { status: 500 });
  }
}
