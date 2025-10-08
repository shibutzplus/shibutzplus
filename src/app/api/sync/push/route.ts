export async function POST(req: Request) {
  try {

    // Skip push in local development (For debug comment out this block)
    if (process.env.NODE_ENV === "development" || req.headers.get("host")?.includes("localhost")) {
      return new Response("dev mode - skipped", { status: 200 });
    }

    const url = new URL(req.url);
    const type = url.searchParams.get("type");

    let channel: string;
    if (type === "teacher") channel = "teacher";
    else if (type === "event") channel = "event";
    else if (type === "material") channel = "material";
    else return new Response("invalid type", { status: 400 });

    const res = await fetch("https://sync.shibutzplus.com/update", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-sync-key": process.env.SYNC_KEY || "",
      },
      body: JSON.stringify({
        id: `daily-${Date.now()}`,
        channel,
        ts: Date.now(),
        payload: {},
      }),
    });

    return new Response("ok", { status: res.ok ? 200 : 500 });
    
  } catch (err) {
    console.error("sync update failed", err);
    return new Response("error", { status: 500 });
  }
}
