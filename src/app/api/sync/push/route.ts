import { pushSyncUpdateServer } from "@/services/sync/serverSyncService";
import { SyncChannel } from "@/models/types/sync";
import { dbLog } from "@/services/loggerService";

export async function POST(req: Request) {
  let schoolId: string | null = null;
  try {
    // URL from payload
    const url = new URL(req.url)
    const type = url.searchParams.get("type") as SyncChannel
    schoolId = url.searchParams.get("schoolId")
    const date = url.searchParams.get("date")

    const ts = await pushSyncUpdateServer(type, {
      schoolId: schoolId || undefined,
      date: date || undefined
    });

    if (!ts) {
      return new Response("invalid type or error", { status: 400 });
    }

    return Response.json({ ts });

  } catch (err) {
    dbLog({ description: `sync/push failed: ${err instanceof Error ? err.message : String(err)}`, schoolId: schoolId || undefined });
    return new Response("error", { status: 500 });
  }
}
