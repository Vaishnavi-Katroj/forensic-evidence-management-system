import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT Analyst_ID, Name, Specialization, Lab_ID
      FROM analyst
      ORDER BY Analyst_ID
    `);

    return NextResponse.json({
      success: true,
      analysts: rows,
    });
  } catch (error) {
    console.error("Fetching analysts failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not fetch analysts.",
      },
      { status: 500 }
    );
  }
}