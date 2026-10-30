import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("forensic_evidence_db");

    const records = await db
      .collection("image_analysis")
      .find({})
      .sort({ processedAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    console.error("Error fetching image analysis:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch records" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { evidenceId, imagePath, analysisType, result, confidence } = body;

    if (!evidenceId || !imagePath || !analysisType || !result) {
      return NextResponse.json(
        { success: false, message: "Please provide all required fields" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("forensic_evidence_db");

    const record = {
      evidenceId,
      imagePath,
      analysisType,
      result,
      confidence: confidence ?? null,
      processedAt: new Date(),
    };

    const response = await db
      .collection("image_analysis")
      .insertOne(record);

    return NextResponse.json({
      success: true,
      message: "Image analysis record saved successfully!",
      insertedId: response.insertedId,
    });
  } catch (error) {
    console.error("Error saving image analysis:", error);

    return NextResponse.json(
      { success: false, message: "Failed to save record" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid record ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("forensic_evidence_db");

    const response = await db.collection("image_analysis").deleteOne({
      _id: new ObjectId(id),
    });

    if (response.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Image analysis record deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting image analysis:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete record" },
      { status: 500 }
    );
  }
}


// PATCH: Update an existing image analysis record
export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const { id, analysisType, result, confidence } = body;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid record ID" },
        { status: 400 }
      );
    }

    if (!analysisType || !result) {
      return NextResponse.json(
        { success: false, message: "Analysis type and result are required" },
        { status: 400 }
      );
    }

    if (
      confidence !== null &&
      confidence !== undefined &&
      (typeof confidence !== "number" ||
        confidence < 0 ||
        confidence > 1)
    ) {
      return NextResponse.json(
        { success: false, message: "Confidence must be between 0 and 1" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("forensic_evidence_db");

    const response = await db.collection("image_analysis").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          analysisType,
          result,
          confidence: confidence ?? null,
          updatedAt: new Date(),
        },
      }
    );

    if (response.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Image analysis record updated successfully!",
    });
  } catch (error) {
    console.error("Error updating image analysis:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update record" },
      { status: 500 }
    );
  }
}
