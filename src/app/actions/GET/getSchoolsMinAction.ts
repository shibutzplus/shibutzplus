"use server";

import { db, schema, executeQuery } from "@/db";
import { asc, eq, and } from "drizzle-orm";

import { auth } from "@/auth";
import { USER_ROLES } from "@/models/constant/auth";

// Returns [{ id, name, city, deputyName }]
export async function getSchoolsMinAction(): Promise<Array<{ id: string; name: string; city: string; deputyName: string | null }>> {

  const session = await auth();

  if (!session || (session.user as any)?.role !== USER_ROLES.ADMIN) {
    throw new Error("Unauthorized: Only administrators can access school list");
  }

  let rows: any[] = [];
  try {
    rows = await executeQuery(async () => {
      return await db
        .select({
          id: schema.schools.id,
          name: schema.schools.name,
          city: schema.schools.city,
          deputyName: schema.users.name,
        })
        .from(schema.schools)
        .leftJoin(
          schema.users,
          and(
            eq(schema.users.schoolId, schema.schools.id),
            eq(schema.users.role, USER_ROLES.DEPUTY_PRINCIPAL)
          )
        )
        .orderBy(asc(schema.schools.name));
    });
  } catch (err) {
    throw err;
  }

  const schoolMap = new Map<string, { id: string; name: string; city: string; deputyName: string | null }>();

  rows.forEach((s) => {
    if (!schoolMap.has(s.id)) {
      schoolMap.set(s.id, {
        id: s.id,
        name: s.name ?? "Unnamed",
        city: s.city ?? "",
        deputyName: s.deputyName,
      });
    }
  });

  return Array.from(schoolMap.values());
}
