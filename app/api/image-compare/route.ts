
import { NextRequest, NextResponse } from "next/server";
import { execa } from "execa";
import { mkdir, access } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import clientPromise from "@/lib/mongodb";

export const runtime = "nodejs";

const MAGICK = "C:\\Program Files\\ImageMagick-7.1.2-Q16-HDRI\\magick.exe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { image1, image2, evidenceId } = body;

    if (
      typeof image1 !== "string" ||
      typeof image2 !== "string" ||
      !image1.startsWith("/uploads/") ||
      !image2.startsWith("/uploads/") ||
      image1 === image2
    ) {
      return NextResponse.json(
        { success: false, message: "Provide two different uploaded image paths." },
        { status: 400 }
      );
    }

    if (
      typeof evidenceId !== "number" ||
      !Number.isInteger(evidenceId) ||
      evidenceId < 1
    ) {
      return NextResponse.json(
        { success: false, message: "A valid evidence ID is required." },
        { status: 400 }
      );
    }

    const uploadDirectory = path.resolve(process.cwd(), "public", "uploads");
    const resolveUploadedImage = (image: string) => {
      const filename = image.slice("/uploads/".length);

      if (!/^[a-zA-Z0-9-]+\.(jpg|png|webp)$/i.test(filename)) {
        throw new Error("Invalid uploaded image filename.");
      }

      return path.join(uploadDirectory, filename);
    };

    const firstImage = resolveUploadedImage(image1);
    const secondImage = resolveUploadedImage(image2);

    await Promise.all([access(firstImage), access(secondImage)]);

    const comparisonDirectory = path.join(uploadDirectory, "comparisons");
    await mkdir(comparisonDirectory, { recursive: true });

    const comparisonId = randomUUID();
    const differenceFilename = `${comparisonId}-difference.png`;
    const differencePath = path.join(comparisonDirectory, differenceFilename);

    // ImageMagick calculates the normalized root-mean-square error.
    // The metric is written to stderr by ImageMagick.
    const comparison = await execa(
      MAGICK,
      [
        "compare",
        "-metric",
        "RMSE",
        firstImage,
        secondImage,
        differencePath,
      ],
      { reject: false }
    );

    
const metricOutput = comparison.stderr.trim();

// ImageMagick returns RMSE in this format:
// 49670.6 (0.757919)
// The value inside parentheses is the normalized RMSE.

const metricMatch = metricOutput.match(
  /\(([0-9]+(?:\.[0-9]+)?(?:e[+-]?[0-9]+)?)\)/i
);

if (!metricMatch) {
  throw new Error(
    `Could not read normalized RMSE: ${metricOutput}`
  );
}

const normalizedError = Number(metricMatch[1]);

if (
  !Number.isFinite(normalizedError) ||
  normalizedError < 0 ||
  normalizedError > 1
) {
  throw new Error("Invalid normalized RMSE value.");
}

// Convert normalized RMSE into a pixel similarity estimate.
const similarity = Math.max(
  0,
  Math.min(100, (1 - normalizedError) * 100)
);


    const mongoClient = await clientPromise;
    const db = mongoClient.db("forensic_evidence_db");

    const record = {
      evidenceId,
      image1,
      image2,
      analysisType: "Image Comparison",
      normalizedError,
      similarity: Number(similarity.toFixed(2)),
      result:
        similarity >= 99.99
          ? "Images are visually identical under this comparison."
          : "Visual differences were detected between the images.",
      differenceImage: `/uploads/comparisons/${differenceFilename}`,
      processedAt: new Date(),
      tool: "ImageMagick 7.1.2-34",
      metric: "Normalized RMSE",
    };

    const insertResult = await db
      .collection("image_analysis")
      .insertOne(record);

    return NextResponse.json({
      success: true,
      message: "Image comparison completed successfully.",
      comparison: {
        ...record,
        _id: insertResult.insertedId.toString(),
      },
    });
  } catch (error) {
    console.error("Image comparison error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Image comparison failed. Check the server terminal.",
      },
      { status: 500 }
    );
  }
}
