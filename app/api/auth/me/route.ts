import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Not authenticated." },
      { status: 401 }
    );
  }

  const session = await verifySession(token);

  if (!session || typeof session.id !== "number") {
    return NextResponse.json(
      { message: "Invalid or expired session." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    user: {
      id: session.id,
      username: session.username,
      role: session.role,
    },
  });
}