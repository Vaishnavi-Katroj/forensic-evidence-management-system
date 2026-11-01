
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [suspects]: any = await db.query(
      "SELECT Suspect_ID, Name, Age, Criminal_Record FROM suspect ORDER BY Suspect_ID"
    );

    return NextResponse.json({ success: true, suspects });
  } catch (error) {
    console.error("Fetching suspects failed:", error);
    return NextResponse.json(
      { success: false, message: "Could not fetch suspects." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { Name, Age, Criminal_Record } = await request.json();

    if (!Name?.trim() || Age === "" || Age === null || Age === undefined) {
      return NextResponse.json(
        { success: false, message: "Name and age are required." },
        { status: 400 }
      );
    }

    const age = Number(Age);

    if (!Number.isInteger(age) || age < 0 || age > 150) {
      return NextResponse.json(
        { success: false, message: "Enter a valid age." },
        { status: 400 }
      );
    }

    const [result]: any = await db.query(
      `INSERT INTO suspect (Name, Age, Criminal_Record)
       VALUES (?, ?, ?)`,
      [Name.trim(), age, Criminal_Record?.trim() || null]
    );

    return NextResponse.json({
      success: true,
      message: "Suspect added successfully.",
      Suspect_ID: result.insertId,
    });
  } catch (error) {
    console.error("Adding suspect failed:", error);
    return NextResponse.json(
      { success: false, message: "Could not add suspect." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { Suspect_ID, Name, Age, Criminal_Record } = await request.json();

    if (!Suspect_ID || !Name?.trim() || Age === "" || Age === null || Age === undefined) {
      return NextResponse.json(
        { success: false, message: "Suspect ID, name and age are required." },
        { status: 400 }
      );
    }

    const age = Number(Age);

    if (!Number.isInteger(age) || age < 0 || age > 150) {
      return NextResponse.json(
        { success: false, message: "Enter a valid age." },
        { status: 400 }
      );
    }

    const [result]: any = await db.query(
      `UPDATE suspect
       SET Name = ?, Age = ?, Criminal_Record = ?
       WHERE Suspect_ID = ?`,
      [Name.trim(), age, Criminal_Record?.trim() || null, Suspect_ID]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Suspect not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Suspect updated successfully.",
    });
  } catch (error) {
    console.error("Updating suspect failed:", error);
    return NextResponse.json(
      { success: false, message: "Could not update suspect." },
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
        { success: false, message: "A valid suspect ID is required." },
        { status: 400 }
      );
    }

    const [result]: any = await db.query(
      "DELETE FROM suspect WHERE Suspect_ID = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Suspect not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Suspect deleted successfully.",
    });
  } catch (error) {
    console.error("Deleting suspect failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Could not delete suspect. Check whether this suspect is linked to a case.",
      },
      { status: 500 }
    );
  }
}
