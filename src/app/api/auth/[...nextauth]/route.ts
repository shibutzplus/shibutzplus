import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { UserRole } from "@/models/types/auth"

// This would typically connect to your database
// For now, we'll use a simple in-memory store
interface User {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
}

// Global users array to simulate a database
const users: User[] = [
  {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: bcrypt.hashSync('password123', 10),
    role: 'teacher'
  }
]

// Create a registration function that can be used by the API route
export const registerUser = (userData: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}) => {
  // Check if user already exists
  const existingUser = users.find(user => user.email === userData.email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Create new user
  const newUser: User = {
    id: (users.length + 1).toString(),
    name: userData.name,
    email: userData.email,
    password: bcrypt.hashSync(userData.password, 10),
    role: userData.role
  };

  // Add to our "database"
  users.push(newUser);
  
  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role
  };
};

// NextAuth configuration with explicit secret
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

        const user = users.find(u => u.email === credentials.email)
        if (!user) return null
        
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) return null
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole
      }
      return session
    }
  },
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  },
  debug: process.env.NODE_ENV === 'development'
})

export { handler as GET, handler as POST }
