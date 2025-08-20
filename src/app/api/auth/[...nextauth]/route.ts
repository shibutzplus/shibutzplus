import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { schema } from "@/db";
import { getUserByEmail } from "@/db/utils";
import { getExpireTime, getSessionMaxAge, mathFloorNow, TWENTY_FOUR_HOURS } from "@/utils/time";
import Google from "next-auth/providers/google"
import { registerNewGoogleUserAction } from "@/app/actions/POST/registerNewGoogleUserAction";

export const authOptions: NextAuthOptions = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                remember: { label: "Remember me", type: "boolean" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password required");
                }

                const user = await getUserByEmail(credentials.email);

                if (!user) {
                    throw new Error("No user found with this email");
                }
                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (user && isValid) {
                    const maxAge = getExpireTime(credentials.remember === "true")
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        gender: user.gender,
                        schoolId: user.schoolId,
                        maxAge: maxAge,
                    };
                } else {
                    throw new Error("Invalid password");
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
        updateAge: TWENTY_FOUR_HOURS,
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                const email = typeof profile?.email === "string" ? profile.email : undefined;
                const name = typeof profile?.name === "string" ? profile.name : undefined;

                if (!email || !name) return false;
                try {
                    await registerNewGoogleUserAction({ email, name });
                } catch (err) {
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.gender = (user as any).gender;
                token.schoolId = (user as any).schoolId;
                const remember = (user as any).remember === true || (user as any).remember === "true";
                token.maxAge = getSessionMaxAge(remember);
                if (token.maxAge) token.exp = mathFloorNow + Number(token.maxAge);
            }
            if (token.maxAge && (!token.exp || Number(token.exp) < mathFloorNow)) {
                token.exp = mathFloorNow + Number(token.maxAge);
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = session.user || {};
                session.user.id = token.id as string;
                session.user.role = token.role as schema.UserRole;
                session.user.gender = token.gender as schema.UserGender;
                session.user.schoolId = token.schoolId as string;
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
