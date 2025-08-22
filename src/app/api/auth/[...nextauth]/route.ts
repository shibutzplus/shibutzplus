import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { schema } from "@/db";
import { getSessionMaxAge, mathFloorNow, TWENTY_FOUR_HOURS } from "@/utils/time";
import Google from "next-auth/providers/google";
import { registerNewGoogleUserAction } from "@/app/actions/POST/registerNewGoogleUserAction";
import { getUserByEmailAction } from "@/app/actions/GET/getUserByEmailAction";
import { authUser } from "@/utils/authUtils";
import { googlePlaceholder } from "@/models/constant";

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
                const response = await getUserByEmailAction(credentials.email);

                if (!response.success || !response.data) {
                    throw new Error("No user found with this email");
                }

                return authUser(response, credentials.password, credentials.remember);
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

                let response;
                try {
                    response = await registerNewGoogleUserAction({ email, name });
                    if (!response.success) return false;
                } catch (err) {
                    const response = await getUserByEmailAction(email);
                    if (!response.success) return false;
                }
                //TODO: google auth not working good, google does not fill all the session and you alwaiys enter onboarding
                authUser(response, googlePlaceholder, "true");
                return true;
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.gender = (user as any).gender;
                token.schoolId = (user as any).schoolId;
                token.status = (user as any).status;
                const remember =
                    (user as any).remember === true || (user as any).remember === "true";
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
                session.user.token = token.id as string;
                session.user.role = token.role as schema.UserRole;
                session.user.gender = token.gender as schema.UserGender;
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
