import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/schemas/User";
import { UserRole } from "@/models/types/auth";

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
                await connectToDatabase();
                const user = await User.findOne({ email: credentials.email }).select("+password");
                if (!user) {
                    throw new Error("No user found with this email");
                }
                const isValid = await bcrypt.compare(credentials.password, user.password!);
                if (!isValid) {
                    throw new Error("Invalid password");
                }
                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    remember: credentials.remember,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // 24 hours
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                const remember = (user as any).remember;
                const maxAge = remember ? 30 * 24 * 60 * 60 : 60 * 60; // 30d vs 1h
                token.exp = Math.floor(Date.now() / 1000) + maxAge;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = session.user || {};
                session.user.id = token.id as string;
                session.user.role = token.role as UserRole;
                session.expires = new Date((token.exp as number) * 1000).toISOString();
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
        newUser: "/register",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
