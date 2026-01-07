"use server";

import { db, schema, executeQuery } from "@/db";
import { asc } from "drizzle-orm";

// Returns [{ id, name, city }]
export async function getSchoolsMinAction(): Promise<Array<{ id: string; name: string; city: string }>> {
  const rows = await executeQuery(async () => {
    return await db.select().from(schema.schools).orderBy(asc(schema.schools.name));
  });

  // Normalize to {id, name, city}
  return (rows as any[]).map((s) => ({
    id: s.id,
    name: s.data?.name ?? s.name ?? "Unnamed",
    city: s.data?.city ?? s.city ?? "",
  }));
}
