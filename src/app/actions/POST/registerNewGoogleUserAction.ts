import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

export async function registerNewGoogleUserAction({ email, name }: { email: string; name: string }) {
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) return existing;

  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      password: "",
      role: "teacher",
      gender: "female",
      schoolId: null,
    })
    .returning();
  return user;
}
