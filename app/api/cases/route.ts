
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        c.Case_ID,
        c.Case_Title,
        c.Case_Type,
        c.Status,
        COUNT(e.Evidence_ID) AS Evidence_Count
      FROM \`case\` c
      LEFT JOIN evidence e ON c.Case_ID = e.Case_ID
      GROUP BY
        c.Case_ID,
        c.Case_Title,
        c.Case_Type,
        c.Status
      ORDER BY c.Case_ID
    `);

    const [[counts]]: any = await db.query(`
      SELECT
         (SELECT COUNT(*) FROM investigator) AS investigatorCount,
         (SELECT COUNT(*) FROM forensic_report) AS reportCount
   `);

      return NextResponse.json({
         success: true,
         cases: rows,
         counts,
      });
  } catch (error) {
    console.error("Fetching cases failed:", error);
    return NextResponse.json(
      { success: false, message: "Could not fetch cases." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { caseId, status } = body;

    const allowedStatuses = [
      "Under Investigation",
      "Evidence Collected",
      "Under Forensic Analysis",
      "Closed",
    ];

    if (!Number.isInteger(caseId) || caseId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid case ID." },
        { status: 400 }
      );
    }

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid case status." },
        { status: 400 }
      );
    }

    const [result]: any = await db.query(
      "UPDATE `case` SET Status = ? WHERE Case_ID = ?",
      [status, caseId]
    );

    if (result.affectedRows === 0) {
      const [rows]: any = await db.query(
        "SELECT Case_ID FROM `case` WHERE Case_ID = ?",
        [caseId]
      );

      if (rows.length === 0) {
        return NextResponse.json(
          { success: false, message: "Case not found." },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Case status updated successfully.",
    });
  } catch (error) {
    console.error("Updating case status failed:", error);

    return NextResponse.json(
      { success: false, message: "Could not update case status." },
      { status: 500 }
    );
  }
}
