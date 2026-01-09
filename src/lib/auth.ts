import { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { getSessionMaxAge, TWENTY_FOUR_HOURS } from "@/utils/time";
import type { UserRole, UserGender } from "@/models/types/auth";
import { registerNewGoogleUserAction } from "@/app/actions/POST/registerNewGoogleUserAction";
import { getUserByEmailAction } from "@/app/actions/GET/getUserByEmailAction";
import { db, schema, executeQuery } from "@/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Always take the current time, so each login gets a fresh session timer.
const nowInSec = () => Math.floor(Date.now() / 1000);

export const authOptions: NextAuthOptions = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        Credentials({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await executeQuery(async () => {
                    return await db.query.users.findFirst({
                        where: eq(schema.users.email, credentials.email),
                    });
                });

                if (!user || user.role !== "admin") {
                    return null;
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    gender: user.gender,
                    schoolId: user.schoolId,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
        updateAge: TWENTY_FOUR_HOURS,
    },
    callbacks: {
        async signIn({ account, profile, user: _user }) {
            if (account?.provider === "credentials") {
                return true;
            }
            if (account?.provider === "google") {
                const email = typeof profile?.email === "string" ? profile.email : undefined;
                const name = typeof profile?.name === "string" ? profile.name : undefined;
                if (!email || !name) return false;
                try {
                    const response = await registerNewGoogleUserAction({ email });
                    if (!response.success) return false;
                } catch {
                    return false;
                }
                return true;
            }
            return false;
        },
        async jwt({ token, user, account, profile }) {
            if (account?.provider === "credentials" && user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.role = (user as any).role;
                token.gender = (user as any).gender;
                token.schoolId = (user as any).schoolId;
                token.status = "annual";
                token.maxAge = getSessionMaxAge(true);
                token.exp = nowInSec() + Number(token.maxAge);
            } else if ((account?.provider === "google" && profile?.email) || (user && user.email)) {
                const email = (user?.email || profile?.email) as string;
                const response = await getUserByEmailAction(email);
                if (response.success && response.data) {
                    token.id = response.data.id;
                    token.role = response.data.role;
                    token.gender = response.data.gender;
                    token.schoolId = response.data.schoolId;
                    token.status = response.data.status;
                }
                token.email = email;
                token.name = user?.name || profile?.name;
                token.image = user?.image || profile?.image;
                token.maxAge = getSessionMaxAge(true);
                token.exp = nowInSec() + Number(token.maxAge);
            }
            if (token.maxAge && (!token.exp || Number(token.exp) < nowInSec())) {
                token.exp = nowInSec() + Number(token.maxAge);
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = session.user || ({} as any);
                session.user.token = token.id as string;
                session.user.role = token.role as UserRole;
                session.user.gender = token.gender as UserGender;
                session.user.schoolId = token.schoolId as string;
                session.user.status = token.status as string;
                session.user.maxAge = token.maxAge as number;
                session.expires = new Date((token.exp as number) * 1000).toISOString();
            }
            return session;
        },
    },
    pages: {
        signIn: "/sign-in",
        error: "/sign-in",
        newUser: "/sign-up",
    },
    secret: process.env.NEXTAUTH_SECRET,
};
