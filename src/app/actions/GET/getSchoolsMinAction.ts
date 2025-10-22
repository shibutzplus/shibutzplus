"use server";

import { db, schema, executeQuery } from "@/db";

// Returns [{ id, name }]
export async function getSchoolsMinAction(): Promise<Array<{ id: string; name: string }>> {
  const rows = await executeQuery(async () => {
    return await db.select().from(schema.schools);
  });

  // Normalize to {id, name}
  return (rows as any[]).map((s) => ({
    id: s.id,
    name: s.data?.name ?? s.name ?? "Unnamed",
  }));
}
