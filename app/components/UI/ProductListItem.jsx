import Image from "next/image";
import ProductNameText from "./ProductNameText";
import ProductPriceText from "./ProductPriceText";
import Rating from "./Rating";
import AddToCartButton from "./AddToCartButton";
import CompareButton from "./CompareButton";
import FavouriteButton from "./FavouriteButton";
import Stock from "./Stock";
import ProductColors from "./ProductColors";

export default function ProductListItem(
  image,
  name,
  price,
  saleprice,
  rateing,
  stock,
  colors
) {
  return (
    <div className="flex flex-col gap-4 lg:p-4 p-2 h-[80vh]">
      <div className="relative w-full h-1/2">
        <Image
          src={"/termekkepek/1.jpg"}
          fill
          alt="termek"
          style={{ objectFit: "contain" }}
        />
      </div>
      <div className="flex flex-col gap-4 w-full h-1/2">
        <ProductNameText>Forbidden zone intim masszírozó</ProductNameText>
        <ProductPriceText>12 900 Ft</ProductPriceText>
        <Rating ratings={{ value: 3.5, count: 10 }} />
        <div className="flex flex-col gap-4">
          <AddToCartButton />
          <div className="flex flex-row gap-2">
            <FavouriteButton />
            <CompareButton />
          </div>
        </div>
        <Stock stock={""} />
        <ProductColors />
      </div>
    </div>
  );
}
