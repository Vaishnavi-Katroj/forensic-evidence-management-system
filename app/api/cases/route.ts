
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const allowedStatuses = [
  "Under Investigation",
  "Evidence Collected",
  "Under Forensic Analysis",
  "Closed",
];

// GET: Fetch all cases
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        c.Case_ID,
        c.Case_Title,
        c.Case_Type,
        c.Date_Reported,
        c.Status,
        c.Investigator_ID,
        COUNT(e.Evidence_ID) AS Evidence_Count
      FROM \`case\` c
      LEFT JOIN evidence e ON c.Case_ID = e.Case_ID
      GROUP BY
        c.Case_ID,
        c.Case_Title,
        c.Case_Type,
        c.Date_Reported,
        c.Status,
        c.Investigator_ID
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

// POST: Add a new case
export async function POST(request: Request) {
  try {
    const {
      Case_Title,
      Case_Type,
      Date_Reported,
      Status,
      Investigator_ID,
    } = await request.json();

    if (!Case_Title?.trim() || !Case_Type?.trim() || !Date_Reported) {
      return NextResponse.json(
        { success: false, message: "Case title, type and reported date are required." },
        { status: 400 }
      );
    }

    if (!allowedStatuses.includes(Status)) {
      return NextResponse.json(
        { success: false, message: "Invalid case status." },
        { status: 400 }
      );
    }

    const investigatorId =
      Investigator_ID === "" || Investigator_ID === null ||
      Investigator_ID === undefined
        ? null
        : Number(Investigator_ID);

    if (
      investigatorId !== null &&
      (!Number.isInteger(investigatorId) || investigatorId <= 0)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid investigator ID." },
        { status: 400 }
      );
    }

    const [result]: any = await db.query(
      `INSERT INTO \`case\`
       (Case_Title, Case_Type, Date_Reported, Status, Investigator_ID)
       VALUES (?, ?, ?, ?, ?)`,
      [
        Case_Title.trim(),
        Case_Type.trim(),
        Date_Reported,
        Status,
        investigatorId,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Case added successfully.",
      Case_ID: result.insertId,
    });
  } catch (error) {
    console.error("Adding case failed:", error);
    return NextResponse.json(
      { success: false, message: "Could not add case." },
      { status: 500 }
    );
  }
}

// PUT: Edit an existing case
export async function PUT(request: Request) {
  try {
    const {
      Case_ID,
      Case_Title,
      Case_Type,
      Date_Reported,
      Status,
      Investigator_ID,
    } = await request.json();

    const caseId = Number(Case_ID);

    if (
      !Number.isInteger(caseId) ||
      caseId <= 0 ||
      !Case_Title?.trim() ||
      !Case_Type?.trim() ||
      !Date_Reported
    ) {
      return NextResponse.json(
        { success: false, message: "Valid case ID, title, type and date are required." },
        { status: 400 }
      );
    }

    if (!allowedStatuses.includes(Status)) {
      return NextResponse.json(
        { success: false, message: "Invalid case status." },
        { status: 400 }
      );
    }

    const investigatorId =
      Investigator_ID === "" || Investigator_ID === null ||
      Investigator_ID === undefined
        ? null
        : Number(Investigator_ID);

    if (
      investigatorId !== null &&
      (!Number.isInteger(investigatorId) || investigatorId <= 0)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid investigator ID." },
        { status: 400 }
      );
    }

    const [result]: any = await db.query(
      `UPDATE \`case\`
       SET Case_Title = ?, Case_Type = ?, Date_Reported = ?,
           Status = ?, Investigator_ID = ?
       WHERE Case_ID = ?`,
      [
        Case_Title.trim(),
        Case_Type.trim(),
        Date_Reported,
        Status,
        investigatorId,
        caseId,
      ]
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
      message: "Case updated successfully.",
    });
  } catch (error) {
    console.error("Updating case failed:", error);
    return NextResponse.json(
      { success: false, message: "Could not update case." },
      { status: 500 }
    );
  }
}

// PATCH: Update case status
export async function PATCH(request: Request) {
  try {
    const { caseId, status } = await request.json();

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

// DELETE: Delete a case
export async function DELETE(request: Request) {
  try {
    const id = Number(new URL(request.url).searchParams.get("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { success: false, message: "A valid case ID is required." },
        { status: 400 }
      );
    }

    const [result]: any = await db.query(
      "DELETE FROM `case` WHERE Case_ID = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Case not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Case deleted successfully.",
    });
  } catch (error) {
    console.error("Deleting case failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Could not delete case. Remove its linked records first.",
      },
      { status: 500 }
    );
  }
}
