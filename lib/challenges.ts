import { prisma } from "@/lib/prisma";

/**
 * Проверяет и обновляет прогресс челленджей пользователя
 * Начисляет монеты при завершении
 */
export async function checkAndUpdateChallenges(userId: string, movieId: string) {
  try {
    // Получаем активные челленджи пользователя
    const userChallenges = await prisma.userChallenge.findMany({
      where: {
        userId,
        completed: false,
      },
      include: {
        challenge: true,
      },
    });

    const completedChallenges: string[] = [];
    let totalCoinsEarned = 0;

    for (const userChallenge of userChallenges) {
      const challenge = userChallenge.challenge;
      
      // Подсчитываем прогресс в зависимости от типа челленджа
      let newProgress = userChallenge.progress;

      switch (challenge.type) {
        case "GENRE": {
          // Проверяем жанры фильма
          const movie = await prisma.movie.findUnique({
            where: { id: movieId },
            include: { genres: { include: { genre: true } } },
          });

          if (movie && challenge.conditions) {
            const targetGenre = (challenge.conditions as { genre?: string }).genre;
            const hasGenre = movie.genres.some((g) => g.genre.slug === targetGenre);
            if (hasGenre) {
              newProgress += 1;
            }
          }
          break;
        }
        case "DIRECTOR": {
          const movie = await prisma.movie.findUnique({
            where: { id: movieId },
            include: { director: true },
          });

          if (movie && challenge.conditions) {
            const targetDirector = (challenge.conditions as { directorId?: string }).directorId;
            if (movie.directorId === targetDirector) {
              newProgress += 1;
            }
          }
          break;
        }
        case "ACTOR": {
          const movie = await prisma.movie.findUnique({
            where: { id: movieId },
            include: { actors: { include: { actor: true } } },
          });

          if (movie && challenge.conditions) {
            const targetActor = (challenge.conditions as { actorId?: string }).actorId;
            const hasActor = movie.actors.some((a) => a.actorId === targetActor);
            if (hasActor) {
              newProgress += 1;
            }
          }
          break;
        }
        case "YEAR": {
          const movie = await prisma.movie.findUnique({
            where: { id: movieId },
            select: { releaseDate: true },
          });

          if (movie?.releaseDate && challenge.conditions) {
            const targetYear = (challenge.conditions as { year?: number }).year;
            if (movie.releaseDate.getFullYear() === targetYear) {
              newProgress += 1;
            }
          }
          break;
        }
        case "MARATHON": {
          // Марафон - просто считаем просмотренные фильмы
          newProgress += 1;
          break;
        }
        case "CUSTOM": {
          // Для кастомных челленджей просто увеличиваем прогресс
          newProgress += 1;
          break;
        }
      }

      // Обновляем прогресс
      const isCompleted = newProgress >= challenge.goal;
      
      await prisma.userChallenge.update({
        where: { id: userChallenge.id },
        data: {
          progress: Math.min(newProgress, challenge.goal),
          completed: isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
      });

      // Если челлендж завершён - начисляем монеты
      if (isCompleted && !userChallenge.completed) {
        const coins = challenge.points || 100;
        
        await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: {
              coins: { increment: coins },
              totalCoinsEarned: { increment: coins },
            },
          }),
          prisma.coinTransaction.create({
            data: {
              userId,
              amount: coins,
              type: "EARN_CHALLENGE",
              description: `Завершение челленджа: ${challenge.title}`,
            },
          }),
        ]);

        completedChallenges.push(challenge.title);
        totalCoinsEarned += coins;
      }
    }

    return {
      completedChallenges,
      totalCoinsEarned,
    };
  } catch (err) {
    console.error("Challenge check error:", err);
    return { completedChallenges: [], totalCoinsEarned: 0 };
  }
}

