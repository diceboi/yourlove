"use client"

import { useState } from "react";
import { TbHeart, TbHeartFilled } from "react-icons/tb";
import { toggleFavorite } from "@/app/_actions/favorites";
import { useRouter } from "next/navigation";

export default function FavouriteButton({ productId }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const router = useRouter();

  async function handleToggle(e) {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic update
    const nextState = !isFavorite;
    setIsFavorite(nextState);

    const res = await toggleFavorite(productId);
    if (res.ok) {
      setIsFavorite(res.isFavorite);
      window.dispatchEvent(new Event('favorites:changed'));
      if (res.isFavorite) {
        // Open favorites drawer when adding
        window.dispatchEvent(new Event('favorites:open'));
      }
      router.refresh(); // Refresh to update counts/lists if needed
    } else {
      // Revert on error
      setIsFavorite(!nextState);
      console.error(res.message);
    }
  }

  return (
    <button
      onClick={handleToggle}
      className="xl:w-[44px] w-[40px] xl:h-[44px] h-[40px] rounded-full hover:bg-[var(--border)] flex items-center justify-center cursor-pointer transition-colors"
    >
      {isFavorite ? (
        <TbHeartFilled className="xl:w-6 w-5 xl:h-6 h-5 text-[var(--pink)]" />
      ) : (
        <TbHeart className="xl:w-6 w-5 xl:h-6 h-5 text-[var(--pink)]" />
      )}
    </button>
  );
}
