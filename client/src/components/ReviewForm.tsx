import { useState } from "react";
import { StarIcon } from "@heroicons/react/20/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { useCreateReview, useUpdateReview } from "@/hooks/useReviews";
import type { Review } from "@/types";

interface ReviewFormProps {
  productId: string;
  existingReview?: Review;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function ReviewForm({
  productId,
  existingReview,
  onCancel,
  onSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState(existingReview?.title ?? "");
  const [body, setBody] = useState(existingReview?.body ?? "");
  const [error, setError] = useState("");

  const createReview = useCreateReview();
  const updateReview = useUpdateReview();

  const isEditing = !!existingReview;
  const isPending = createReview.isPending || updateReview.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    try {
      if (isEditing && existingReview) {
        await updateReview.mutateAsync({
          reviewId: existingReview.id,
          data: { rating, title: title.trim() || undefined, body: body.trim() || undefined },
        });
      } else {
        await createReview.mutateAsync({
          productId,
          rating,
          title: title.trim() || undefined,
          body: body.trim() || undefined,
        });
      }
      if (!isEditing) {
        setRating(0);
        setTitle("");
        setBody("");
      }
      onSuccess?.();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Something went wrong";
      setError(message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Star rating */}
      <div>
        <label className="block font-display text-xs font-bold uppercase tracking-widest text-ink mb-1">
          Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= (hoverRating || rating);
            return (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5 transition-transform hover:scale-110"
              >
                {filled ? (
                  <StarIcon className="h-7 w-7 text-primary-500" />
                ) : (
                  <StarOutlineIcon className="h-7 w-7 text-ink/20" />
                )}
              </button>
            );
          })}
          {rating > 0 && (
            <span className="ml-2 self-center font-mono text-sm text-ink/50">
              {rating} of 5
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <label
          htmlFor="review-title"
          className="block font-display text-xs font-bold uppercase tracking-widest text-ink mb-1"
        >
          Title <span className="text-ink/30">(optional)</span>
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={120}
          className="brutal-input w-full px-3 py-2 text-sm"
        />
      </div>

      {/* Body */}
      <div>
        <label
          htmlFor="review-body"
          className="block font-display text-xs font-bold uppercase tracking-widest text-ink mb-1"
        >
          Review <span className="text-ink/30">(optional)</span>
        </label>
        <textarea
          id="review-body"
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What did you like or dislike about this product?"
          maxLength={2000}
          className="brutal-input w-full px-3 py-2 text-sm resize-none"
        />
      </div>

      {error && (
        <p className="font-mono text-sm text-primary-500">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="brutal-btn bg-primary-500 text-cream px-5 py-2.5 text-sm"
        >
          {isPending
            ? "Saving..."
            : isEditing
              ? "Update Review"
              : "Submit Review"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="brutal-btn bg-white text-ink px-5 py-2.5 text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
