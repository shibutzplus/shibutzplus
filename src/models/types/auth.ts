export type UserRole = "principal" | "deputy principal" | "teacher" | "substitute teacher";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Extend the next-auth types
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      role?: UserRole;
    };
  }

  interface User {
    role?: UserRole;
  }
  
  // Include JWT interface directly in next-auth module
  interface JWT {
    role?: UserRole;
  }
}
