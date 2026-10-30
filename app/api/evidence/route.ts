
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        e.Evidence_ID,
        e.Evidence_Type,
        e.Description,
        e.Collection_Date,
        e.Storage_Location,
        e.Case_ID,
        e.Lab_ID
      FROM evidence e
      ORDER BY e.Evidence_ID
    `);

    return NextResponse.json({ success: true, evidence: rows });
  } catch (error) {
    console.error("Fetching evidence failed:", error);

    return NextResponse.json(
      { success: false, message: "Could not fetch evidence." },
      { status: 500 }
    );
  }
}
