import { NextAuthOptions } from "next-auth";
import { USER_ROLES, AUTH_TYPE, USER_GENDER } from "@/models/constant/auth";
import { SCHOOL_STATUS } from "@/models/constant/school";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { getSessionMaxAge, TWENTY_FOUR_HOURS } from "@/utils/time";
import type { UserRole, UserGender } from "@/models/types/auth";
import { db, schema, executeQuery } from "@/db";
import { eq } from "drizzle-orm";
import { compare, hash } from "bcrypt-ts";

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
                isDemo: { label: "Is Demo", type: "text" },
            },
            async authorize(credentials) {
                console.log("[AUTH_DEBUG] Authorize triggered with credentials:", credentials?.email);
                try {
                    if (credentials?.isDemo === "true") {
                        const user = await executeQuery(async () => {
                            return await db.query.users.findFirst({
                                where: eq(schema.users.email, "shibutzplus@gmail.com"),
                            });
                        });

                        if (!user) {
                            return null;
                        }

                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            role: USER_ROLES.GUEST,
                            gender: user.gender,
                            schoolId: user.schoolId,
                            isDemo: true,
                        };
                    }

                    if (!credentials?.email || !credentials?.password) {
                        return null;
                    }

                    const user = await executeQuery(async () => {
                        return await db.query.users.findFirst({
                            where: eq(schema.users.email, credentials.email),
                        });
                    });

                    if (!user || user.role !== USER_ROLES.ADMIN) {
                        return null;
                    }

                    let isValid = false;
                    try {
                        isValid = await compare(credentials.password, user.password);
                        console.log("[AUTH_DEBUG] bcrypt compare succeeded. isValid:", isValid);
                    } catch (compareErr) {
                        console.error("[AUTH_DEBUG] bcrypt compare FAILED (Edge incompatibility?):", compareErr);
                        throw compareErr;
                    }

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
                } catch (err) {
                    console.error("[AUTH_DEBUG] Authorize failed:", err);
                    throw err;
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
        updateAge: TWENTY_FOUR_HOURS,
    },
    callbacks: {
        async signIn({ account, profile, user: _user }) {
            console.log("[AUTH_DEBUG] SignIn callback triggered for provider:", account?.provider);
            try {
                if (account?.provider === AUTH_TYPE.CREDENTIALS) {
                    return true;
                }
                if (account?.provider === AUTH_TYPE.GOOGLE) {
                    const email = typeof profile?.email === "string" ? profile.email : undefined;
                    const name = typeof profile?.name === "string" ? profile.name : undefined;
                    if (!email || !name) return false;
                    try {
                        // Check if user exists directly in DB
                        const existing = await executeQuery(async () => {
                            return await db.query.users.findFirst({
                                where: eq(schema.users.email, email)
                            });
                        });

                        if (!existing) {
                            // User does not exist, create new user
                            const hashedPassword = await hash("123456", 10);
                            const schoolId = "ebrb8pj1ofvug78ratnbyd4o"; // Hardcoded school ID for "הדגמה"
                            await executeQuery(async () => {
                                await db.insert(schema.users).values({
                                    name: name,
                                    email: email,
                                    password: hashedPassword,
                                    role: USER_ROLES.GUEST,
                                    gender: USER_GENDER.FEMALE,
                                    authType: AUTH_TYPE.GOOGLE,
                                    schoolId: schoolId,
                                });
                            });
                        }
                    } catch (err) {
                        console.error("[AUTH_DEBUG] Google registration failed inside signIn:", err);
                        return false;
                    }
                    return true;
                }
                return false;
            } catch (err) {
                console.error("[AUTH_DEBUG] SignIn callback failed:", err);
                return false;
            }
        },
        async jwt({ token, user, account, profile }) {
            console.log("[AUTH_DEBUG] JWT callback triggered. Token email:", token?.email);
            try {
                if (account?.provider === AUTH_TYPE.CREDENTIALS && user) {
                    token.id = user.id;
                    token.email = user.email;
                    token.name = user.name;
                    token.role = (user as any).role;
                    token.gender = (user as any).gender;
                    token.schoolId = (user as any).schoolId;
                    token.status = SCHOOL_STATUS.ANNUAL;
                    token.maxAge = getSessionMaxAge(true);
                    token.exp = nowInSec() + Number(token.maxAge);
                    token.isDemo = (user as any).isDemo;
                } else if ((account?.provider === AUTH_TYPE.GOOGLE && profile?.email) || (user && user.email)) {
                    const email = (user?.email || profile?.email) as string;
                    try {
                        // Fetch user from DB directly
                        const [row] = await executeQuery(async () => {
                            return await db
                                .select({
                                    id: schema.users.id,
                                    role: schema.users.role,
                                    gender: schema.users.gender,
                                    schoolId: schema.users.schoolId,
                                    status: schema.schools.status,
                                    createdAt: schema.users.createdAt,
                                })
                                .from(schema.users)
                                .leftJoin(schema.schools, eq(schema.schools.id, schema.users.schoolId))
                                .where(eq(schema.users.email, email))
                                .limit(1);
                        });

                        if (row) {
                            token.id = row.id;
                            token.role = row.role;
                            token.gender = row.gender;
                            token.schoolId = row.schoolId;
                            token.status = row.status ?? SCHOOL_STATUS.ONBOARDING;
                            token.createdAt = row.createdAt;
                        }
                    } catch (err) {
                        console.error("[AUTH_DEBUG] JWT callback failed during DB call:", err);
                        throw err;
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
            } catch (err) {
                console.error("[AUTH_DEBUG] JWT callback failed:", err);
                return token;
            }
        },
        async session({ session, token }) {
            if (token) {
                session.user = session.user || ({} as any);
                session.user.token = token.id as string;
                session.user.role = token.role as UserRole;
                session.user.gender = token.gender as UserGender;
                session.user.schoolId = token.schoolId as string;
                session.user.status = token.status as string;
                session.user.createdAt = token.createdAt as Date;
                session.user.maxAge = token.maxAge as number;
                session.user.email = token.email as string;
                session.user.isDemo = token.isDemo as boolean;
                session.expires = new Date((token.exp as number) * 1000).toISOString();
            }
            return session;
        },
    },
    pages: {
        signIn: "/",
        error: "/",
        newUser: "/sign-up",
    },
    debug: true,
    secret: process.env.NEXTAUTH_SECRET,
    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === "production" ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
            },
        },
    },
};
