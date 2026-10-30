
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        Audit_ID,
        Case_ID,
        Old_Status,
        New_Status,
        Changed_At
      FROM case_status_audit
      ORDER BY Changed_At DESC
    `);

    return NextResponse.json({
      success: true,
      history: rows,
    });
  } catch (error) {
    console.error("Fetching audit history failed:", error);

    return NextResponse.json(
      { success: false, message: "Could not fetch audit history." },
      { status: 500 }
    );
  }
}
