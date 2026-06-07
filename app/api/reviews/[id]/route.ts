import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sanitizeText, validateContentLength } from "@/lib/security/sanitize";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { content: rawContent, rating } = await request.json();

  if (!rawContent || !rawContent.trim()) {
    return NextResponse.json({ error: "Отзыв не может быть пустым" }, { status: 400 });
  }

  const content = sanitizeText(rawContent.trim());

  if (content.length < 10) {
    return NextResponse.json({ error: "Отзыв должен содержать минимум 10 символов" }, { status: 400 });
  }

  if (!validateContentLength(content, 10000)) {
    return NextResponse.json({ error: "Отзыв слишком длинный (максимум 10000 символов)" }, { status: 400 });
  }

  try {
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json({ error: "Отзыв не найден" }, { status: 404 });
    }

    if (review.userId !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "MODERATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: { content },
    });

    if (rating && rating >= 1 && rating <= 10) {
      await prisma.rating.upsert({
        where: {
          userId_movieId: {
            userId: review.userId,
            movieId: review.movieId,
          },
        },
        update: { value: rating },
        create: {
          userId: review.userId,
          movieId: review.movieId,
          value: rating,
        },
      });
    }

    try {
      revalidatePath("/profile");
      revalidatePath(`/movies/${review.movieId}`);
    } catch (e) {
      console.error("Revalidation error:", e);
    }

    return NextResponse.json({ review: updatedReview });
  } catch (error) {
    console.error("Edit review error:", error);
    return NextResponse.json({ error: "Ошибка при обновлении отзыва" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json({ error: "Отзыв не найден" }, { status: 404 });
    }

    if (review.userId !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "MODERATOR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.review.delete({
      where: { id },
    });

    try {
      revalidatePath("/profile");
      revalidatePath(`/movies/${review.movieId}`);
    } catch (e) {
      console.error("Revalidation error:", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json({ error: "Ошибка при удалении отзыва" }, { status: 500 });
  }
}
