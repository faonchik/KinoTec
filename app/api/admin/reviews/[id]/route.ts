import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createNotification } from "@/lib/notifications/createNotification";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const { id } = await params;
    const { isApproved } = await request.json();

    // Fetch review with movie details and current approval state before updating
    const oldReview = await prisma.review.findUnique({
      where: { id },
      select: { userId: true, isApproved: true, movie: { select: { title: true } } },
    });

    const review = await prisma.review.update({
      where: { id },
      data: { isApproved },
    });

    // Send notification if newly approved
    if (isApproved && oldReview && !oldReview.isApproved) {
      try {
        await createNotification({
          userId: oldReview.userId,
          type: "REVIEW_APPROVED",
          title: "Отзыв одобрен",
          message: `Ваш отзыв на фильм "${oldReview.movie.title}" был одобрен модератором!`,
          link: `/movies/${review.movieId}`,
        });
      } catch (err) {
        console.error("Error creating review approval notification:", err);
      }
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Review update error:", error);
    return NextResponse.json(
      { error: "Ошибка при обновлении отзыва" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.review.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Review delete error:", error);
    return NextResponse.json(
      { error: "Ошибка при удалении отзыва" },
      { status: 500 }
    );
  }
}

