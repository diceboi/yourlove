import Image from "next/image";
import Label from "../UI/Texts/Label";

export default function AdminTermekekPage({ products }) {
  return (
    <div className="flex flex-col gap-2">
      {products.map((product, index) => (
        <div
          key={index}
          className="flex flex-row gap-4 border border-[var(--border)] p-2 bg-white rounded-2xl"
        >
          {product.termekkep && (
          <Image
            src={product.termekkep}
            width={50}
            height={50}
            alt={`${product.seo_slug} `}
          />
          )}
          <div className="flex flex-col gap-2 justify-center">
            <Label classname="font-bold">{product.fo_cim}</Label>
            <Label>{product.cikkszam}</Label>
          </div>
        </div>
      ))}
    </div>
  );
}
