import Label from "./Label";
import Paragraph from "./Paragraph";


export default function Rating({ stock }) {

  return (
    <div className="flex flex-nowrap lg:gap-2 gap-1 lg:items-center items-start">
        <div className={`w-3 h-3 lg:mt-0 mt-[2px] rounded-full ${stock && "bg-[var(--green)]"} ${!stock && "bg-[var(--warning)]"}`}></div>
        {stock && (
        <Label classname={"text-[var(--secondary-text)]"}>Raktáron: {stock} db</Label>
        )}
        {!stock && (
        <Label classname={"text-[var(--secondary-text)]"}>Utánrendelhető 5-7 munkanap</Label>
        )}
    </div>
  );
}

// Dummy adatokkal való teszteléshez pl. így használhatod:
// <Rating ratings={{ value: 3.5, count: 10 }} />
