"use server";

import { db, schema, executeQuery } from "@/db";
import { asc } from "drizzle-orm";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { USER_ROLES } from "@/models/constant/auth";

// Returns [{ id, name, city }]
export async function getSchoolsMinAction(): Promise<Array<{ id: string; name: string; city: string }>> {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== USER_ROLES.ADMIN) {
    throw new Error("Unauthorized: Only administrators can access school list");
  }

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
