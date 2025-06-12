import Image from "next/image";
import ProductNameText from "./Texts/ProductNameText";
import ProductPriceText from "./Texts/ProductPriceText";
import Rating from "./Rating";
import AddToCartButtonSmall from "./Buttons/AddToCartButtonSmall";
import CompareButton from "./Buttons/CompareButton";
import FavouriteButton from "./Buttons/FavouriteButton";
import Stock from "./Stock";
import ProductColors from "./ProductColors";
import Link from "next/link";

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
    <div className="flex flex-col gap-4 lg:p-4 p-4 border-r border-b border-[var(--border)] hover:shadow-lg">
      <Link
        className="relative w-full 2xl:h-[40vh] h-[150px]"
        href="/termekek/ferfiaknak/1"
      >
        <Image
          src={"/termekkepek/1.jpg"}
          fill
          alt="termek"
          style={{ objectFit: "contain" }}
        />
      </Link>
      <div className="flex flex-col gap-4 w-full h-1/2">
        <Link href="/termekek/ferfiaknak/1">
          <ProductNameText>Forbidden zone intim masszírozó</ProductNameText>
        </Link>
        <ProductPriceText>12 900 Ft</ProductPriceText>
        <Rating ratings={{ value: 3.5, count: 10 }} />
        <div className="flex flex-col gap-4">
          <AddToCartButtonSmall />
          <div className="flex flex-row gap-2">
            <FavouriteButton />
            <CompareButton />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Stock stock={""} />
          <ProductColors />
        </div>
      </div>
    </div>
  );
}
