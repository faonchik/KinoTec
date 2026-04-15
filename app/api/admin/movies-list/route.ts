import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const movies = await prisma.movie.findMany({
    select: {
      id: true,
      title: true,
      poster: true,
      backdrop: true,
    },
    orderBy: { popularity: "desc" },
  });

  return NextResponse.json({ movies });
}
