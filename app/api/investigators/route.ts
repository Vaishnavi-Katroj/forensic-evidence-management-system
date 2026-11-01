import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Fetch all investigators
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT Investigator_ID, Name, Badge_No, Investigator_Rank, Contact_No
      FROM investigator
      ORDER BY Investigator_ID
    `);

    return NextResponse.json({ success: true, investigators: rows });
  } catch (error) {
    console.error("Fetching investigators failed:", error);
    return NextResponse.json(
      { success: false, message: "Could not fetch investigators." },
      { status: 500 }
    );
  }
}

// POST: Add investigator
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { Name, Badge_No, Investigator_Rank, Contact_No } = body;

    if (![Name, Badge_No, Investigator_Rank, Contact_No].every(
      (value) => typeof value === "string" && value.trim()
    )) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    const [result]: any = await db.query(
      `INSERT INTO investigator
       (Name, Badge_No, Investigator_Rank, Contact_No)
       VALUES (?, ?, ?, ?)`,
      [Name.trim(), Badge_No.trim(), Investigator_Rank.trim(), Contact_No.trim()]
    );

    return NextResponse.json({
      success: true,
      message: "Investigator added successfully.",
      investigatorId: result.insertId,
    });
  } catch (error) {
    console.error("Adding investigator failed:", error);
    return NextResponse.json(
      { success: false, message: "Could not add investigator." },
      { status: 500 }
    );
  }
}

// PUT: Update investigator
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { Investigator_ID, Name, Badge_No, Investigator_Rank, Contact_No } = body;

    if (!Number.isInteger(Number(Investigator_ID)) || Number(Investigator_ID) <= 0 ||
        ![Name, Badge_No, Investigator_Rank, Contact_No].every(
          (value) => typeof value === "string" && value.trim()
        )) {
      return NextResponse.json(
        { success: false, message: "Valid investigator details are required." },
        { status: 400 }
      );
    }

    const [result]: any = await db.query(
      `UPDATE investigator
       SET Name = ?, Badge_No = ?, Investigator_Rank = ?, Contact_No = ?
       WHERE Investigator_ID = ?`,
      [Name.trim(), Badge_No.trim(), Investigator_Rank.trim(),
       Contact_No.trim(), Number(Investigator_ID)]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Investigator not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Investigator updated successfully.",
    });
  } catch (error) {
    console.error("Updating investigator failed:", error);
    return NextResponse.json(
      { success: false, message: "Could not update investigator." },
      { status: 500 }
    );
  }
}

// DELETE: Remove investigator
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid investigator ID is required." },
        { status: 400 }
      );
    }

    const [result]: any = await db.query(
      "DELETE FROM investigator WHERE Investigator_ID = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Investigator not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Investigator deleted successfully.",
    });
  } catch (error) {
    console.error("Deleting investigator failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Could not delete investigator. They may be linked to existing cases.",
      },
      { status: 500 }
    );
  }
}