import { CATEGORIES } from "@/lib/types";
import { FaBeerMugEmpty, FaWineBottle, FaSmoking, FaGift } from "react-icons/fa6";
import type { IconType } from "react-icons";

type HubCard = {
  id: string;
  title: string;
  sub: string;
  badge: string;
  Icon: IconType;
  colorClass: string;
  activeRing: string;
  textColor: string;
  rotate: string;
};

const HUB_CARDS: HubCard[] = [
  {
    id: "Cervejas",
    title: "CERVEJAS GELADAS",
    sub: "Pilsen, IPA e Long Necks",
    badge: "Trinca",
    Icon: FaBeerMugEmpty,
    colorClass: "bg-amber-500 shadow-amber-200/50 hover:bg-amber-600",
    activeRing: "ring-4 ring-amber-500 ring-offset-4 ring-offset-orange-50",
    textColor: "text-amber-50",
    rotate: "rotate-12 group-hover:rotate-0",
  },
  {
    id: "Destilados",
    title: "DESTILADOS PREMIUM",
    sub: "Whisky, Gin e Vodka",
    badge: "Cheers",
    Icon: FaWineBottle,
    colorClass: "bg-purple-800 shadow-purple-200/50 hover:bg-purple-900",
    activeRing: "ring-4 ring-purple-700 ring-offset-4 ring-offset-orange-50",
    textColor: "text-purple-100",
    rotate: "-rotate-12 group-hover:rotate-0",
  },
  {
    id: "Tabacaria",
    title: "TABACARIA SELECT",
    sub: "Cigarros, Narguilé e Sedas",
    badge: "Select",
    Icon: FaSmoking,
    colorClass: "bg-slate-800 shadow-slate-300/50 hover:bg-slate-900",
    activeRing: "ring-4 ring-slate-800 ring-offset-4 ring-offset-orange-50",
    textColor: "text-slate-300",
    rotate: "rotate-3 group-hover:-rotate-3",
  },
  {
    id: "Combos/Gelo",
    title: "COMBOS & GELO",
    sub: "Kits para a galera e gelo",
    badge: "Festa",
    Icon: FaGift,
    colorClass: "bg-red-600 shadow-red-200/50 hover:bg-red-700",
    activeRing: "ring-4 ring-red-500 ring-offset-4 ring-offset-orange-50",
    textColor: "text-red-100",
    rotate: "-rotate-6 group-hover:rotate-0",
  },
];

export default function CategoryHubV2({
  selectedCategory,
  onSelectCategory,
}: {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}) {
  // Garante que só renderizamos cards de categorias que existem no catálogo.
  const cards = HUB_CARDS.filter((card) => (CATEGORIES as readonly string[]).includes(card.id));

  return (
    <div className="px-4 py-6 md:px-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Nossos Departamentos</h2>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="cursor-pointer rounded-full bg-orange-100 px-3 py-1.5 text-xs font-bold text-orange-600 transition-colors hover:bg-orange-200 hover:text-orange-700"
          >
            Ver Todos
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const isActive = selectedCategory === card.id;
          const [first, ...rest] = card.title.split(" ");
          return (
            <div
              key={card.id}
              onClick={() => onSelectCategory(isActive ? null : card.id)}
              className={`group relative h-48 transform cursor-pointer overflow-hidden rounded-3xl p-6 text-white shadow-xl transition-all duration-300 active:scale-95 ${card.colorClass} ${
                isActive ? card.activeRing : "hover:-translate-y-1"
              }`}
            >
              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                    {card.badge}
                  </span>
                  <h2 className="font-display mt-3 text-2xl font-black leading-tight tracking-tight">
                    {first}
                    <br />
                    {rest.join(" ")}
                  </h2>
                </div>
                <p className={`text-sm font-medium ${card.textColor}`}>{card.sub}</p>
              </div>

              <div className="absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-white/10 blur-2xl transition-transform duration-500 group-hover:scale-125" />

              <div className={`absolute right-5 top-5 text-white/80 transition-transform duration-300 ${card.rotate}`}>
                <card.Icon className="text-[3.5rem]" />
              </div>

              {isActive && (
                <div className="absolute bottom-6 right-6 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-900 shadow-lg">
                  <span className="h-2 w-2 animate-ping rounded-full bg-green-500" />
                  ATIVADO
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
