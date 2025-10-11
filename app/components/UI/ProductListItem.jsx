import AddToCartButtonSmall from "./Buttons/AddToCartButtonSmall";
import Image from "next/image";
import Link from "next/link";
import ProductNameText from "./Texts/ProductNameText";
import ProductNameTextSmall from "./Texts/ProductNameTextSmall";
import ProductPriceText from "./Texts/ProductPriceText";
import Rating from "./Rating";
import CompareButton from "./Buttons/CompareButton";
import FavouriteButton from "./Buttons/FavouriteButton";
import Stock from "./Stock";
import ProductColors from "./ProductColors";

export default function ProductListItem({
  id,
  image,
  focim,
  alcim,
  price,
  slug,
  category,
  rateing,
  stock,
  colors,
}) {
  const product = {
    id,
    name: `${focim ?? ""} ${alcim ?? ""}`.trim(),
    price_huf: price,
    image_url: image,
  };

  function slugify(str) {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  const categoryPath = category
    ? category.split(">").map((cat) => slugify(cat)).join("/")
    : "";

  return (
    <div className="flex flex-col gap-4 lg:p-4 p-4 border-r border-b border-[var(--border)] hover:shadow-lg">
      <Link
        className="relative w-full 2xl:h-[40vh] h-[150px]"
        href={`/termekek/${categoryPath}/${slug}`}
      >
        {image ? (
          <Image
            src={image}
            fill
            alt={`${product.name || "termék"} kép`}
            style={{ objectFit: "contain" }}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
            Nincs kép
          </div>
        )}
      </Link>

      <div className="flex flex-col gap-4 w-full h-1/2">
        <Link className="hover:underline flex flex-col gap-1" href={`/termekek/${categoryPath}/${slug}`}>
          <ProductNameText>{focim}</ProductNameText>
          <ProductNameTextSmall>{alcim}</ProductNameTextSmall>
        </Link>

        <ProductPriceText>{(price ?? 0).toLocaleString("hu-HU")} Ft</ProductPriceText>
        <Rating ratings={{ value: rateing ?? 3.5, count: 10 }} />

        <div className="flex flex-col gap-4">
          <AddToCartButtonSmall
            productId={product.id}
            defaultQty={1}
            product={{ name: product.name, price_huf: product.price_huf, image_url: product.image_url }}
          />
          <div className="flex flex-row gap-2">
            <FavouriteButton />
            <CompareButton />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Stock stock={stock} />
          <ProductColors colors={colors} />
        </div>
      </div>
    </div>
  );
}
