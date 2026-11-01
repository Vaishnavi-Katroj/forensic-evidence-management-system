
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [victims]: any = await db.query(
      "SELECT Victim_ID, Name, Age, Address FROM victim ORDER BY Victim_ID"
    );

    return NextResponse.json({ success: true, victims });
  } catch (error) {
    console.error("Fetching victims failed:", error);
    return NextResponse.json(
      { success: false, message: "Could not fetch victims." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { Name, Age, Address } = await request.json();

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
      "INSERT INTO victim (Name, Age, Address) VALUES (?, ?, ?)",
      [Name.trim(), age, Address?.trim() || null]
    );

    return NextResponse.json({
      success: true,
      message: "Victim added successfully.",
      Victim_ID: result.insertId,
    });
  } catch (error) {
    console.error("Adding victim failed:", error);
    return NextResponse.json(
      { success: false, message: "Could not add victim." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { Victim_ID, Name, Age, Address } = await request.json();

    if (!Victim_ID || !Name?.trim() || Age === "" || Age === null || Age === undefined) {
      return NextResponse.json(
        { success: false, message: "Victim ID, name and age are required." },
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
      `UPDATE victim
       SET Name = ?, Age = ?, Address = ?
       WHERE Victim_ID = ?`,
      [Name.trim(), age, Address?.trim() || null, Victim_ID]
    );

    if (result.affectedRows === 0) {
      const [rows]: any = await db.query(
        "SELECT Victim_ID FROM victim WHERE Victim_ID = ?",
        [Victim_ID]
      );

      if (rows.length === 0) {
        return NextResponse.json(
          { success: false, message: "Victim not found." },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Victim updated successfully.",
    });
  } catch (error) {
    console.error("Updating victim failed:", error);
    return NextResponse.json(
      { success: false, message: "Could not update victim." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const id = Number(new URL(request.url).searchParams.get("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { success: false, message: "A valid victim ID is required." },
        { status: 400 }
      );
    }

    const [result]: any = await db.query(
      "DELETE FROM victim WHERE Victim_ID = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Victim not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Victim deleted successfully.",
    });
  } catch (error) {
    console.error("Deleting victim failed:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Could not delete victim. Check whether this victim is linked to a case.",
      },
      { status: 500 }
    );
  }
}
