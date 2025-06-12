import { useState } from "react";
import ButtonText from "../Texts/ButtonText";
import { TbShoppingCart, TbHeart } from "react-icons/tb";
import FavouriteButton from "./FavouriteButton";

export default function AddToCartButtonMain() {
  const [quantity, setQuantity] = useState(1);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  return (
    <div className="flex flex-row items-start gap-4">
      <button
        className="flex flex-nowrap group items-center justify-center gap-2 md:px-7 px-3 h-[44px] rounded-full bg-[var(--pink)] hover:bg-[var(--pink-hover)] transition-all cursor-pointer z-10 w-full"
      >
        <TbShoppingCart className="w-6 h-6 text-white" />
        <ButtonText classname="text-white group-hover:text-white">Kosárba</ButtonText>
      </button>
      <div className="flex items-center border border-gray-300 rounded-full overflow-hidden h-[44px]">
        <button
          onClick={handleDecrease}
          className="px-3 text-lg font-bold text-gray-700 hover:bg-gray-100"
        >
          -
        </button>
        <div className="w-8 text-center font-medium">{quantity}</div>
        <button
          onClick={handleIncrease}
          className="px-3 text-lg font-bold text-gray-700 hover:bg-gray-100"
        >
          +
        </button>
      </div>
    </div>
  );
}
