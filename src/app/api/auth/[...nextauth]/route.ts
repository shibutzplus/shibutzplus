import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { schema } from "@/db";
import { getUserByEmail } from "@/db/utils";
import { getExpireTime, TWENTY_FOUR_HOURS } from "@/utils/time";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
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
                if (!isValid) {
                    throw new Error("Invalid password");
                }
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    gender: user.gender,
                    schoolId: user.schoolId,
                    remember: credentials.remember,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
        updateAge: TWENTY_FOUR_HOURS,
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.gender = (user as any).gender;
                token.schoolId = (user as any).schoolId;
                const remember = (user as any).remember;
                token.exp = getExpireTime(remember);
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
