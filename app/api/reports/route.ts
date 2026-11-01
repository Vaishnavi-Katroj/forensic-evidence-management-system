
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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      Evidence_ID,
      Analyst_ID,
      Report_Date,
      Findings,
      Conclusion,
    } = body;

    if (
      !Evidence_ID ||
      !Analyst_ID ||
      !Report_Date ||
      !Findings?.trim() ||
      !Conclusion?.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "All report fields are required." },
        { status: 400 }
      );
    }

    const [result]: any = await db.query(
      `INSERT INTO forensic_report
       (Evidence_ID, Analyst_ID, Report_Date, Findings, Conclusion)
       VALUES (?, ?, ?, ?, ?)`,
      [Evidence_ID, Analyst_ID, Report_Date, Findings, Conclusion]
    );

    return NextResponse.json({
      success: true,
      message: "Forensic report added successfully.",
      reportId: result.insertId,
    });
  } catch (error) {
    console.error("Adding report failed:", error);

    return NextResponse.json(
      { success: false, message: "Could not add forensic report." },
      { status: 500 }
    );
  }
}



export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const {
      Report_ID,
      Evidence_ID,
      Analyst_ID,
      Report_Date,
      Findings,
      Conclusion,
    } = body;

    if (
      !Report_ID ||
      !Evidence_ID ||
      !Analyst_ID ||
      !Report_Date ||
      !Findings?.trim() ||
      !Conclusion?.trim()
    ) {
      return NextResponse.json(
        { success: false, message: "All report fields are required." },
        { status: 400 }
      );
    }

    const [result]: any = await db.query(
      `UPDATE forensic_report
       SET Evidence_ID = ?,
           Analyst_ID = ?,
           Report_Date = ?,
           Findings = ?,
           Conclusion = ?
       WHERE Report_ID = ?`,
      [
        Evidence_ID,
        Analyst_ID,
        Report_Date,
        Findings,
        Conclusion,
        Report_ID,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Report not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Forensic report updated successfully.",
    });
  } catch (error) {
    console.error("Updating report failed:", error);

    return NextResponse.json(
      { success: false, message: "Could not update forensic report." },
      { status: 500 }
    );
  }
}


export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("id");

    if (!reportId) {
      return NextResponse.json(
        { success: false, message: "Report ID is required." },
        { status: 400 }
      );
    }

    const [result]: any = await db.query(
      "DELETE FROM forensic_report WHERE Report_ID = ?",
      [reportId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Report not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Forensic report deleted successfully.",
    });
  } catch (error) {
    console.error("Deleting report failed:", error);
    return NextResponse.json(
      { success: false, message: "Could not delete forensic report." },
      { status: 500 }
    );
  }
}