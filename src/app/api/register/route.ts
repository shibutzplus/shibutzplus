import { NextRequest, NextResponse } from "next/server";
import { RegisterRequest, RegisterResponse } from "../../../models/types/auth";
import { registerUser } from "../auth/[...nextauth]/route";

export async function POST(
  request: NextRequest
): Promise<NextResponse<RegisterResponse>> {
  try {
    const body: RegisterRequest = await request.json();
    const { name, email, password, role } = body;

    try {
      // Use the centralized registration function from NextAuth
      registerUser({ name, email, password, role });
      
      return NextResponse.json(
        { success: true, message: "User registered successfully" },
        { status: 201 }
      );
    } catch (err: any) {
      return NextResponse.json(
        { success: false, message: err.message || "Registration failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Registration failed" },
      { status: 500 }
    );
  }
}
