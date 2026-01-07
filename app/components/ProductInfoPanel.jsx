"use client";
import { forwardRef } from "react";
import { useRouter } from "next/navigation";
import H1 from "@/app/components/UI/Texts/H1";
import H2 from "@/app/components/UI/Texts/H2";
import Breadcrumbs from "@/app/components/UI/Breadcrumbs";
import TagButton from "@/app/components/UI/Buttons/TagButton";
import Image from "next/image";
import ManufacturerText from "@/app/components/UI/Texts/ManufacturerText";
import ProductNameTextBig from "@/app/components/UI/Texts/ProductNameTextBig";
import ProductPriceText from "@/app/components/UI/Texts/ProductPriceText";
import OldPriceText from "@/app/components/UI/Texts/OldPriceText";
import Rating from "@/app/components/UI/Rating";
import Stock from "@/app/components/UI/Stock";
import ProductColors from "@/app/components/UI/ProductColors";
import ProductUpsale from "@/app/components/UI/ProductUpsale";
import AddToCartButtonMain from "@/app/components/UI/Buttons/AddToCartButtonMain";
import Paragraph from "@/app/components/UI/Texts/Paragraph";
import UpsaleProducts from "@/app/components/UpsaleProducts";
import ProductNameTextSmall from "./UI/Texts/ProductNameTextSmall";
import SKUText from "./UI/Texts/SKUText";

const ProductInfoPanel = forwardRef(function ProductInfoPanel({product}, ref) {
  const sale = true;

  return (
    <div ref={ref} className="lg:sticky relative lg:top-40 lg:left-0 flex flex-col gap-4">
      <div className="inline-flex gap-2">
        <TagButton
          title={"Akció"}
          link={"/termekek?tags=sale"}
          buttonicon={"TbPercentage"}
          iconcolor={"text-white"}
          titlecolor={"text-white"}
          hovertitlecolor={"group-hover:text-white"}
          bgcolor={"bg-[var(--green)]"}
          bordercolor={""}
          hoverbordercolor={""}
          hoverbgcolor={"hover:bg-[var(--green-hover)]"}
        />
        <TagButton
          title={"Felkapott"}
          link={"/termekek?tags=trending"}
          buttonicon={"TbFlameFilled"}
          iconcolor={"text-[var(--pink)]"}
          titlecolor={"text-[var(--black)]"}
          hovertitlecolor={""}
          bgcolor={"bg-[var(--grey-bg)]"}
          bordercolor={""}
          hoverbordercolor={"group-hover:border-[var(--green-hover)]"}
          hoverbgcolor={"hover:bg-[var(--border)]"}
        />
      </div>
      <div className="flex flex-col gap-2 py-2">
        <SKUText>{product.cikkszam}</SKUText>
        <ManufacturerText>{""}</ManufacturerText>
        <ProductNameTextBig>{product.fo_cim}</ProductNameTextBig>
        <ProductNameTextSmall>{product.alcim}</ProductNameTextSmall>
      </div>
      <div className="flex flex-row gap-2 items-baseline">
        <ProductPriceText sale={sale}>{product.eladasi_ar_brutto} Ft</ProductPriceText>
        {sale && <OldPriceText>{product.akcios_ar_brutto} Ft</OldPriceText>}
      </div>
      <div className="flex flex-col gap-4">
        <Rating ratings={{ value: 3.5, count: 10 }} />
      </div>
      <div className="flex flex-col">
        <div className="border-t border-[var(--border)] py-4">
          <ProductColors />
        </div>
        <div className="flex flex-col gap-4 py-4">
          <AddToCartButtonMain 
            productId={product.id}
            defaultQty={1}
            product={{ name: product.name, price_huf: product.price, image_url: product.image }}
          />
          <Stock stock={""} />
        </div>
        <div className="border-t border-[var(--border)] py-4">
          <ProductUpsale />
        </div>
      </div>
    </div>
  );
});

export default ProductInfoPanel;
