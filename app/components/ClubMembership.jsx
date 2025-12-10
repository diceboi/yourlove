import Link from "next/link";
import H3 from "./UI/Texts/H3";
import Paragraph from "./UI/Texts/Paragraph";
import { TbCrown } from "react-icons/tb";

export default function ClubMembership() {
  return (
    <div className="w-full py-16 px-4 xl:px-12 bg-black text-white rounded-3xl my-8 mx-auto max-w-[1440px]">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="space-y-4 lg:w-2/3">
          <div className="flex items-center gap-4 mb-2">
            <TbCrown className="text-[var(--pink)] w-10 h-10" />
            <h3 className="text-3xl font-bold">YourLove Klub</h3>
          </div>
          <p className="text-xl text-gray-300">
            Lépj be exkluzív klubunkba és élvezd a kiváltságokat!
          </p>
          <ul className="space-y-2 mt-4 text-gray-300">
            <li className="flex items-center gap-2">✓ Állandó 5% kedvezmény minden teljes árú termékből</li>
            <li className="flex items-center gap-2">✓ Elsőbbségi kiszállítás</li>
            <li className="flex items-center gap-2">✓ Titkos akciók csak tagoknak</li>
          </ul>
        </div>
        <div className="lg:w-1/3 flex justify-end">
          <Link 
            href="/regisztracio" 
            className="px-8 py-4 bg-[var(--pink)] text-white font-bold rounded-xl hover:bg-[var(--pink-hover)] transition-all transform hover:scale-105 shadow-lg shadow-pink-900/20"
          >
            Csatlakozom a klubhoz
          </Link>
        </div>
      </div>
    </div>
  );
}
