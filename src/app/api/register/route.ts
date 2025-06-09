import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/schemas/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { name, email, password, role } = await req.json();
        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectToDatabase();
        if (await User.findOne({ email })) {
            return NextResponse.json({ error: "Email already in use" }, { status: 400 });
        }

        const hash = await bcrypt.hash(password, 10);
        await User.create({ name, email, password: hash, role });
        return NextResponse.json({ message: "Registered" }, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
