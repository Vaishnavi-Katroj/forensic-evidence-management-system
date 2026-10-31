
import { NextRequest, NextResponse } from "next/server";
import { execa } from "execa";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  let filePath = "";

  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Please select an image." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Only JPG, PNG and WEBP images are allowed." },
        { status: 400 }
      );
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "Image must be between 1 byte and 10 MB." },
        { status: 400 }
      );
    }

    const uploadDirectory = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDirectory, { recursive: true });

    const extension =
      file.type === "image/jpeg" ? ".jpg" :
      file.type === "image/png" ? ".png" : ".webp";

    const filename = `${randomUUID()}${extension}`;

    filePath = path.join(uploadDirectory, filename);

    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(filePath, buffer, { flag: "wx" });

    // Verify that ImageMagick can identify the uploaded image.
    await execa("magick", ["identify", filePath]);

    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully.",
      imagePath: `/uploads/${filename}`,
      filename,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    if (filePath) {
      await unlink(filePath).catch(() => {});
    }

    console.error("Image upload error:", error);

    return NextResponse.json(
      { success: false, message: "Image upload or validation failed." },
      { status: 500 }
    );
  }
}
