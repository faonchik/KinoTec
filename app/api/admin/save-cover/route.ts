import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const movieId = formData.get("movieId") as string;
    const type = formData.get("type") as string; // "poster" or "backdrop"

    if (!file || !movieId || !type) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const dir = type === "poster" ? "posters" : "backdrops";
    const dirPath = path.join(process.cwd(), "public", dir);
    
    // Ensure directory exists
    await mkdir(dirPath, { recursive: true });

    const fileName = `${movieId}.jpg`;
    const filePath = path.join(dirPath, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Update DB
    const localPath = `/${dir}/${fileName}`;
    const updateData: Record<string, string> = {};
    updateData[type] = localPath;

    await prisma.movie.update({
      where: { id: movieId },
      data: updateData,
    });

    return NextResponse.json({ success: true, path: localPath });
  } catch (error) {
    console.error("Save cover error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
