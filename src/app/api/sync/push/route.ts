import { redis } from "@/lib/redis"
import { DAILY_TEACHER_COL_DATA_CHANGED, DAILY_SCHEDULE_DATA_CHANGED, ENTITIES_DATA_CHANGED, DAILY_PUBLISH_DATA_CHANGED, MATERIAL_CHANGED } from "@/models/constant/sync";

export async function POST(req: Request) {
  try {

    const url = new URL(req.url)
    const type = url.searchParams.get("type")

    let channel: string
    if (type === DAILY_TEACHER_COL_DATA_CHANGED) channel = DAILY_TEACHER_COL_DATA_CHANGED   // for dailySchedule teachers columns updates  
    else if (type === DAILY_SCHEDULE_DATA_CHANGED) channel = DAILY_SCHEDULE_DATA_CHANGED    // for dailySchedule events column updates
    else if (type === ENTITIES_DATA_CHANGED) channel = ENTITIES_DATA_CHANGED                // for all entities pages data updates
    else if (type === DAILY_PUBLISH_DATA_CHANGED) channel = DAILY_PUBLISH_DATA_CHANGED      // for publish status updates
    else if (type === MATERIAL_CHANGED) channel = MATERIAL_CHANGED                          // for material text updates
    else return new Response("invalid type", { status: 400 })

    const item = {
      id: `daily-${Date.now()}`,
      channel,
      ts: Date.now(),
      payload: {},
    }

    // Save to Redis list
    await redis.lpush("sync_items", JSON.stringify(item))

    return Response.json({ ts: item.ts });

  } catch (err) {
    console.error("sync update failed", err);
    return new Response("error", { status: 500 });
  }
}
