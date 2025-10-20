// GET /api/sync/poll?since=TIMESTAMP&channels=teacher,event,material
import { redis } from "@/lib/redis"

export async function GET(req: Request) {
  try {

    // Skip poll in local development (For debug comment out this block)
    if (process.env.NODE_ENV === "development" || req.headers.get("host")?.includes("localhost")) {
      return Response.json({ latestTs: 0, count: 0, items: [] })
    }

    const url = new URL(req.url)
    const since = Number(url.searchParams.get("since") || 0)
    const allow = (url.searchParams.get("channels") || "teacher,event,material").split(",")

    // Fetch latest items from Upstash Redis (newest first due to LPUSH)

    const raw = await redis.lrange<string>("sync_items", 0, 499)

    // Parse to match previous shape: { value: {...} }
    const items = raw
      .map((s) => {
        try {
          return typeof s === "string" ? JSON.parse(s) : s
        } catch {
          return null
        }
      })

    // keep only allowed channels newer than ?since
    const filtered = (items as any[])
      .filter((v: any) => allow.includes(v?.channel) && typeof v?.ts === "number" && v.ts > since)

    const latestTs = filtered.reduce((mx: number, v: any) => (v.ts > mx ? v.ts : mx), since)

    // return minimal fields to the client
    return Response.json({
      latestTs,
      count: filtered.length,
      items: filtered.map((v: any) => ({ channel: v.channel, ts: v.ts })),
    })
  } catch (e) {
    console.error("poll proxy failed", e)
    return new Response("error", { status: 500 })
  }
}
