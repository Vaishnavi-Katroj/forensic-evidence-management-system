
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT DATABASE() AS dbName, VERSION() AS dbVersion");

    return NextResponse.json({
      success: true,
      message: "MySQL connected successfully!",
      result: rows,
    });
  } catch (error) {
    console.error("MySQL connection failed:", error);

    return NextResponse.json(
      { success: false, message: "MySQL connection failed. Check server logs." },
      { status: 500 }
    );
  }
}
