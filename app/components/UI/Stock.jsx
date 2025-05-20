import Paragraph from "./Paragraph";


export default function Rating({ stock }) {

  return (
    <div className="flex flex-nowrap gap-2 items-center">
        <div className={`w-3 h-3 rounded-full ${stock && "bg-[var(--green)]"} ${!stock && "bg-[var(--warning)]"}`}></div>
        {stock && (
        <Paragraph>Raktáron: {stock} db</Paragraph>
        )}
        {!stock && (
        <Paragraph>Utánrendelhető 5-7 munkanap</Paragraph>
        )}
    </div>
  );
}

// Dummy adatokkal való teszteléshez pl. így használhatod:
// <Rating ratings={{ value: 3.5, count: 10 }} />
