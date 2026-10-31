
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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      Evidence_Type,
      Description,
      Collection_Date,
      Storage_Location,
      Case_ID,
      Lab_ID,
    } = body;

    if (
      !Evidence_Type ||
      !Description ||
      !Collection_Date ||
      !Storage_Location ||
      !Case_ID ||
      !Lab_ID
    ) {
      return NextResponse.json(
        { success: false, message: "All evidence fields are required." },
        { status: 400 }
      );
    }

    const [result]: any = await db.query(
      `INSERT INTO evidence
       (Evidence_Type, Description, Collection_Date, Storage_Location, Case_ID, Lab_ID)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        Evidence_Type,
        Description,
        Collection_Date,
        Storage_Location,
        Case_ID,
        Lab_ID,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Evidence added successfully.",
      evidenceId: result.insertId,
    });
  } catch (error) {
    console.error("Adding evidence failed:", error);

    return NextResponse.json(
      { success: false, message: "Could not add evidence." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const {
      Evidence_ID,
      Evidence_Type,
      Description,
      Collection_Date,
      Storage_Location,
      Case_ID,
      Lab_ID,
    } = body;

    if (
      !Evidence_ID ||
      !Evidence_Type ||
      !Description ||
      !Collection_Date ||
      !Storage_Location ||
      !Case_ID ||
      !Lab_ID
    ) {
      return NextResponse.json(
        { success: false, message: "All evidence fields are required." },
        { status: 400 }
      );
    }

    const [result]: any = await db.query(
      `UPDATE evidence
       SET Evidence_Type = ?,
           Description = ?,
           Collection_Date = ?,
           Storage_Location = ?,
           Case_ID = ?,
           Lab_ID = ?
       WHERE Evidence_ID = ?`,
      [
        Evidence_Type,
        Description,
        Collection_Date,
        Storage_Location,
        Case_ID,
        Lab_ID,
        Evidence_ID,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Evidence record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Evidence updated successfully.",
    });
  } catch (error) {
    console.error("Updating evidence failed:", error);

    return NextResponse.json(
      { success: false, message: "Could not update evidence." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { success: false, message: "A valid evidence ID is required." },
        { status: 400 }
      );
    }

    const [result]: any = await db.query(
      "DELETE FROM evidence WHERE Evidence_ID = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Evidence record not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Evidence deleted successfully.",
    });
  } catch (error) {
    console.error("Deleting evidence failed:", error);

    return NextResponse.json(
      { success: false, message: "Could not delete evidence. It may be linked to other records." },
      { status: 500 }
    );
  }
}