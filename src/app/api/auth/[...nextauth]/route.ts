import "server-only";
export const runtime = "nodejs";
import NextAuth, { type NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { getSessionMaxAge, TWENTY_FOUR_HOURS } from "@/utils/time";
import type { UserRole, UserGender } from "@/models/types/auth";
import { registerNewGoogleUserAction } from "@/app/actions/POST/registerNewGoogleUserAction";
import { getUserByEmailAction } from "@/app/actions/GET/getUserByEmailAction";

import CredentialsProvider from "next-auth/providers/credentials";

// Always take the current time, so each login gets a fresh session timer.
const nowInSec = () => Math.floor(Date.now() / 1000);

export const authOptions: NextAuthOptions = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID || "shibutzplus@gmail.com",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "123456",
        }),
        CredentialsProvider({
            name: "Admin Login",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const adminEmail = process.env.NEXT_PUBLIC_POWER_USER_EMAIL || "";
                const adminPassword = process.env.SYSTEM_PASSWORD || "";

                if (credentials?.email === adminEmail && credentials?.password === adminPassword) {
                    const response = await getUserByEmailAction(adminEmail);
                    if (response.success && response.data) {
                        return {
                            id: response.data.id,
                            email: response.data.email,
                            name: response.data.name,
                            image: "",
                        };
                    }
                }
                return null;
            },
        }),
    ],
    session: {
        strategy: "jwt",
        updateAge: TWENTY_FOUR_HOURS,
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "credentials") return true;

            if (account?.provider === "google") {
                const email = typeof profile?.email === "string" ? profile.email : undefined;
                const name = typeof profile?.name === "string" ? profile.name : undefined;
                if (!email || !name) return false;
                try {
                    const response = await registerNewGoogleUserAction({ email });
                    if (!response.success) return false;
                } catch (err) {
                    return false;
                }
                return true;
            }
            return false;
        },
        async jwt({ token, user, account, profile }) {
            if ((account?.provider === "google" && profile?.email) || (user && user.email)) {
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

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
