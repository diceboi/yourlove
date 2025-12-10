import { TbStarFilled } from "react-icons/tb";
import H3 from "./UI/Texts/H3";

const reviews = [
  {
    id: 1,
    name: "Anna",
    date: "2023.11.12.",
    stars: 5,
    text: "Szuper gyors szállítás, diszkrét csomagolás. A termék pontosan olyan, mint a leírásban.",
  },
  {
    id: 2,
    name: "Péter",
    date: "2023.11.05.",
    stars: 5,
    text: "Már többször rendeltem innen, mindig elégedett vagyok. Az ügyfélszolgálat nagyon segítőkész!",
  },
  {
    id: 3,
    name: "Kati",
    date: "2023.10.28.",
    stars: 4,
    text: "Jó minőségű termékek, kicsit késett a futár, de amúgy minden rendben volt.",
  },
    {
    id: 4,
    name: "Dávid",
    date: "2023.12.01.",
    stars: 5,
    text: "A legjobb webshop a témában. Korrekt árak és hatalmas választék.",
  },
];

export default function Reviews() {
  return (
    <div className="w-full py-16 px-4 xl:px-12 bg-gray-50">
      <div className="flex flex-col gap-8">
        <div className="flex flex-nowrap items-center gap-4 justify-center">
            <TbStarFilled className="text-[var(--pink)] w-8 h-8" />
            <H3>Vásárlóink mondták</H3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--secondary-text)]">{review.name}</span>
                <span className="text-xs text-gray-400">{review.date}</span>
              </div>
              <div className="flex text-yellow-400 gap-1">
                {[...Array(5)].map((_, i) => (
                  <TbStarFilled key={i} className={`w-4 h-4 ${i < review.stars ? 'text-yellow-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed italic">"{review.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
