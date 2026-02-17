import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { useAuthStore } from "@/stores/authStore";
import { useIsWishlisted, useToggleWishlist } from "@/hooks/useWishlist";
import { useNavigate } from "react-router-dom";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "md";
}

export default function WishlistButton({
  productId,
  className = "",
  size = "md",
}: WishlistButtonProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const { data: isWishlisted, isLoading } = useIsWishlisted(productId);
  const toggle = useToggleWishlist();

  const iconClass = size === "sm" ? "h-5 w-5" : "h-6 w-6";

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    toggle.mutate({ productId, isWishlisted: !!isWishlisted });
  }

  if (isLoading && isAuthenticated) {
    return (
      <button
        disabled
        className={`p-1.5 text-ink/20 ${className}`}
      >
        <HeartIcon className={iconClass} />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={toggle.isPending}
      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className={`p-1.5 transition-colors ${isWishlisted
          ? "text-primary-500 hover:text-primary-700"
          : "text-ink/40 hover:text-primary-500"
        } ${toggle.isPending ? "opacity-50" : ""} ${className}`}
    >
      {isWishlisted ? (
        <HeartSolidIcon className={iconClass} />
      ) : (
        <HeartIcon className={iconClass} />
      )}
    </button>
  );
}
