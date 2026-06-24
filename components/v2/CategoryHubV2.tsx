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
    badge: "Artesanal",
    Icon: FaBeerMugEmpty,
    colorClass: "bg-amber-700 shadow-amber-900/30 hover:bg-amber-800",
    activeRing: "ring-4 ring-amber-600 ring-offset-4 ring-offset-[#f0eeec]",
    textColor: "text-amber-100",
    rotate: "rotate-12 group-hover:rotate-0",
  },
  {
    id: "Destilados",
    title: "DESTILADOS PREMIUM",
    sub: "Whisky, Gin e Vodka",
    badge: "Premium",
    Icon: FaWineBottle,
    colorClass: "bg-stone-800 shadow-stone-900/40 hover:bg-stone-900",
    activeRing: "ring-4 ring-stone-700 ring-offset-4 ring-offset-[#f0eeec]",
    textColor: "text-stone-200",
    rotate: "-rotate-12 group-hover:rotate-0",
  },
  {
    id: "Tabacaria",
    title: "TABACARIA SELECT",
    sub: "Charutos, Narguilé e Sedas",
    badge: "Seleção",
    Icon: FaSmoking,
    colorClass: "bg-[#b8541d] shadow-[#8c3a10]/40 hover:bg-[#8c3a10]",
    activeRing: "ring-4 ring-[#b8541d] ring-offset-4 ring-offset-[#f0eeec]",
    textColor: "text-orange-100",
    rotate: "rotate-3 group-hover:-rotate-3",
  },
  {
    id: "Combos/Gelo",
    title: "COMBOS & GELO",
    sub: "Kits para a galera e gelo",
    badge: "Festa",
    Icon: FaGift,
    colorClass: "bg-red-800 shadow-red-900/30 hover:bg-red-900",
    activeRing: "ring-4 ring-red-700 ring-offset-4 ring-offset-[#f0eeec]",
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
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted">Nossos Departamentos</h2>
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
                <div className="absolute bottom-6 right-6 flex items-center gap-1 rounded-full bg-foreground/90 px-2.5 py-1 text-xs font-bold text-background shadow-lg">
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
