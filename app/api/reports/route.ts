
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        fr.*,
        e.Case_ID
      FROM forensic_report fr
      JOIN evidence e ON fr.Evidence_ID = e.Evidence_ID
      ORDER BY fr.Report_ID
    `);

    return NextResponse.json({ success: true, reports: rows });
  } catch (error) {
    console.error("Fetching reports failed:", error);

    return NextResponse.json(
      { success: false, message: "Could not fetch forensic reports." },
      { status: 500 }
    );
  }
}
