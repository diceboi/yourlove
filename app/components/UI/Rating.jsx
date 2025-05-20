import React from "react";
import { TbStarFilled, TbStarHalfFilled, TbStar } from "react-icons/tb";

export default function Rating({ ratings }) {
  const { value, count } = ratings;

  // maximum csillag szám
  const maxStars = 5;

  // Generáljuk a csillagokat 0-tól maxStars-1-ig
  const stars = Array.from({ length: maxStars }, (_, i) => {
    const starNumber = i + 1;
    if (value >= starNumber) {
      // Teljes csillag
      return <TbStarFilled key={i} className="text-[var(--pink)]" />;
    } else if (value >= starNumber - 0.5) {
      // Fél csillag
      return <TbStarHalfFilled key={i} className="text-[var(--pink)]" />;
    } else {
      // Üres csillag
      return <TbStar key={i} className="text-[var(--cream-pink)]" />;
    }
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.1rem" }}>
      {stars}
      <span style={{ marginLeft: "0.5rem" }}>({count})</span>
    </div>
  );
}

// Dummy adatokkal való teszteléshez pl. így használhatod:
// <Rating ratings={{ value: 3.5, count: 10 }} />
