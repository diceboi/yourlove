import H3 from "./UI/Texts/H3";
import Paragraph from "./UI/Texts/Paragraph";
import Image from "next/image";
import { TbHeartHandshake } from "react-icons/tb";

export default function WhyBuyHere() {
  return (
    <div className="w-full py-16 px-4 xl:px-12 bg-white">
      <div className="flex flex-col lg:flex-row items-center gap-12">
        <div className="w-full lg:w-1/2 space-y-6">
          <div className="flex items-center gap-4">
            <TbHeartHandshake className="text-[var(--pink)] w-10 h-10" />
            <H3>Miért a YourLove?</H3>
          </div>
          <Paragraph classname="text-lg leading-relaxed text-gray-600">
            Hiszünk abban, hogy a felfedezés és az intimitás mindenki számára elérhető kell legyen. 
            Kínálatunkat szakértő gondossággal állítottuk össze, hogy csak a legjobb minőségű, 
            testbarát anyagokból készült termékek kerüljenek virtuális polcainkra.
          </Paragraph>
          <Paragraph classname="text-lg leading-relaxed text-gray-600">
            Nálunk a diszkréció nem csak ígéret, hanem alapelv. Csomagolásunk teljesen semleges, 
            feliratmentes, így a titkod biztonságban marad a kézbesítés pillanatáig – és azon túl is.
          </Paragraph>
          <div className="grid grid-cols-2 gap-4 pt-4">
             <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-bold text-[var(--secondary-text)] mb-2">Prémium Minőség</h4>
                <p className="text-sm text-gray-500">Csak bevizsgált, biztonságos termékek.</p>
             </div>
             <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-bold text-[var(--secondary-text)] mb-2">Szakértő Ügyfélszolgálat</h4>
                <p className="text-sm text-gray-500">Segítünk megtalálni a tökéletes választást.</p>
             </div>
          </div>
        </div>
        <div className="w-full lg:w-1/2 relative h-[400px] rounded-2xl overflow-hidden shadow-lg">
           {/* Placeholder image - replace with actual lifestyle image */}
           <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400">
             <span className="text-xl">Lifestyle kép helye</span>
           </div>
        </div>
      </div>
    </div>
  );
}
