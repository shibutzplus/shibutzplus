// GET /api/sync/poll?since=TIMESTAMP&channels=teacher,event,lists,publish
import { redis } from "@/lib/redis"
import { DAILY_TEACHER_COL_DATA_CHANGED, DAILY_EVENT_COL_DATA_CHANGED, ENTITIES_DATA_CHANGED, DAILY_PUBLISH_DATA_CHANGED, MATERIAL_CHANGED } from "@/models/constant/sync";
import { dbLog } from "@/services/loggerService";

export async function GET(req: Request) {
  try {

    const url = new URL(req.url)
    const since = Number(url.searchParams.get("since") || 0)
    const allow = (url.searchParams.get("channels") || [DAILY_TEACHER_COL_DATA_CHANGED, DAILY_EVENT_COL_DATA_CHANGED, ENTITIES_DATA_CHANGED, DAILY_PUBLISH_DATA_CHANGED, MATERIAL_CHANGED].join(",")).split(",")

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
      items: filtered.map((v: any) => ({ channel: v.channel, ts: v.ts, payload: v.payload })),
    })
  } catch (e) {
    await dbLog({ description: `sync/poll failed: ${e instanceof Error ? e.message : String(e)}` });
    return new Response("error", { status: 500 })
  }
}
