import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return NextResponse.json(
        { message: "Username and password are required." },
        { status: 400 }
      );
    }

    const [rows] = await db.execute(
      "SELECT User_ID, Username, Password_Hash, Role FROM users WHERE Username = ? LIMIT 1",
      [username.trim()]
    );

    const users = rows as {
      User_ID: number;
      Username: string;
      Password_Hash: string;
      Role: string;
    }[];

    const user = users[0];

    if (!user || !(await verifyPassword(password, user.Password_Hash))) {
      return NextResponse.json(
        { message: "Invalid username or password." },
        { status: 401 }
      );
    }

    const token = await createSession({
      id: user.User_ID,
      username: user.Username,
      role: user.Role,
    });

    const cookieStore = await cookies();

    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    return NextResponse.json({
      message: "Login successful.",
      user: {
        id: user.User_ID,
        username: user.Username,
        role: user.Role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { message: "Something went wrong during login." },
      { status: 500 }
    );
  }
}