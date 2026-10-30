import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;

    const db = client.db("forensic_evidence_db");

    await db.command({ ping: 1 });

    return NextResponse.json({
      success: true,
      message: "MongoDB connected successfully!",
      database: db.databaseName,
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);

    return NextResponse.json(
      { success: false, message: "MongoDB connection failed" },
      { status: 500 }
    );
  }
}