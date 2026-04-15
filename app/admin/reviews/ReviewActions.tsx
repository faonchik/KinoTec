"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface ReviewActionsProps {
  reviewId: string;
  isApproved: boolean;
}

export function ReviewActions({ reviewId, isApproved }: ReviewActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true }),
      });
      router.refresh();
    } catch (error) {
      console.error("Error approving review:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Вы уверены, что хотите отклонить этот отзыв?")) return;
    
    setIsLoading(true);
    try {
      await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: false }),
      });
      router.refresh();
    } catch (error) {
      console.error("Error rejecting review:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить этот отзыв?")) return;
    
    setIsLoading(true);
    try {
      await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch (error) {
      console.error("Error deleting review:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      {!isApproved && (
        <Button
          size="sm"
          onClick={handleApprove}
          disabled={isLoading}
        >
          Одобрить
        </Button>
      )}
      {isApproved && (
        <Button
          size="sm"
          variant="secondary"
          onClick={handleReject}
          disabled={isLoading}
        >
          Отклонить
        </Button>
      )}
      <Button
        size="sm"
        variant="danger"
        onClick={handleDelete}
        disabled={isLoading}
      >
        Удалить
      </Button>
    </div>
  );
}

