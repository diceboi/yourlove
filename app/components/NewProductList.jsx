import { TbSpeakerphone } from "react-icons/tb";
import H3 from "./UI/H3";
import ProductList from "./UI/ProductList";

export default function NewProducts() {
  return (
    <div className="flex flex-col gap-4 w-full py-16 px-4 xl:px-12">
      <div className="flex flex-nowrap gap-4">
        <TbSpeakerphone className="text-[var(--pink)] w-10 h-10" />
        <H3>Újdonságok</H3>
      </div>
      <ProductList />
    </div>
  );
}
