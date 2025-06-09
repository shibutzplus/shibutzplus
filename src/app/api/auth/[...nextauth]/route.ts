import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { UserRole } from "@/models/types/auth"
import connectToDatabase from "@/lib/mongodb"
import User from "@/models/schemas/User"

export const registerUser = async (userData: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}) => {
  await connectToDatabase();
  
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const newUser = await User.create({
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    role: userData.role
  });
  
  return {
    id: newUser._id.toString(),
    name: newUser.name,
    email: newUser.email,
    role: newUser.role
  };
};

// NextAuth configuration
const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || "a-development-secret-for-testing-only",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        await connectToDatabase();
        
        // Find user by email and explicitly select the password field
        const user = await User.findOne({ email: credentials.email }).select('+password');
        if (!user) return null;
        
        // Verify password
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password as string
        );

        if (!isValid) return null;
        
        // Return user without password
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole;
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  },
  debug: process.env.NODE_ENV === 'development'
});

export { handler as GET, handler as POST };
