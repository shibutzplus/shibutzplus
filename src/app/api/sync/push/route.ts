import { redis } from "@/lib/redis"
import { DAILY_TEACHER_COL_DATA_CHANGED, DAILY_EVENT_COL_DATA_CHANGED, LISTS_DATA_CHANGED, PUBLISH_DATA_CHANGED } from "@/models/constant/sync";

export async function POST(req: Request) {
  try {

    const url = new URL(req.url)
    const type = url.searchParams.get("type")

    let channel: string
    if (type === DAILY_TEACHER_COL_DATA_CHANGED) channel = DAILY_TEACHER_COL_DATA_CHANGED                         // for dailySchedule teachers columns updates  
    else if (type === DAILY_EVENT_COL_DATA_CHANGED) channel = DAILY_EVENT_COL_DATA_CHANGED                        // for dailySchedule events column updates
    else if (type === LISTS_DATA_CHANGED) channel = LISTS_DATA_CHANGED        // for all details screen data updates
    else if (type === PUBLISH_DATA_CHANGED) channel = PUBLISH_DATA_CHANGED    // for publish status updates
    else return new Response("invalid type", { status: 400 })

    const item = {
      id: `daily-${Date.now()}`,
      channel,
      ts: Date.now(),
      payload: {},
    }

    // Save to Redis list
    await redis.lpush("sync_items", JSON.stringify(item))

    return new Response("ok", { status: 200 })

  } catch (err) {
    console.error("sync update failed", err);
    return new Response("error", { status: 500 });
  }
}
