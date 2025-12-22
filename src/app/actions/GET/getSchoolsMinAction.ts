"use server";

import { db, schema, executeQuery } from "@/db";
import { asc } from "drizzle-orm";

// Returns [{ id, name }]
export async function getSchoolsMinAction(): Promise<Array<{ id: string; name: string }>> {
  const rows = await executeQuery(async () => {
    return await db.select().from(schema.schools).orderBy(asc(schema.schools.name));
  });

  // Normalize to {id, name}
  return (rows as any[]).map((s) => ({
    id: s.id,
    name: s.data?.name ?? s.name ?? "Unnamed",
  }));
}
