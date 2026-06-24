export type CategoryTheme = {
  text: string;
  badge: string;
  btn: string;
  gradient: string;
};

export const CATEGORY_THEME: Record<string, CategoryTheme> = {
  Cervejas: {
    text: "text-amber-700",
    badge: "bg-amber-50 text-amber-800",
    btn: "bg-amber-700 hover:bg-amber-800",
    gradient: "from-amber-600 to-amber-900",
  },
  Destilados: {
    text: "text-stone-800",
    badge: "bg-stone-100 text-stone-800",
    btn: "bg-stone-800 hover:bg-stone-900",
    gradient: "from-stone-600 to-stone-900",
  },
  Tabacaria: {
    text: "text-[#8c3a10]",
    badge: "bg-[#f5e4d0] text-[#8c3a10]",
    btn: "bg-[#b8541d] hover:bg-[#8c3a10]",
    gradient: "from-[#b8541d] to-[#5a2008]",
  },
  "Combos/Gelo": {
    text: "text-red-800",
    badge: "bg-red-50 text-red-800",
    btn: "bg-red-800 hover:bg-red-900",
    gradient: "from-red-700 to-red-900",
  },
};

export const DEFAULT_THEME: CategoryTheme = {
  text: "text-[#b8541d]",
  badge: "bg-[#f5e4d0] text-[#b8541d]",
  btn: "bg-[#b8541d] hover:bg-[#8c3a10]",
  gradient: "from-[#b8541d] to-[#8c3a10]",
};

export function themeFor(category: string): CategoryTheme {
  return CATEGORY_THEME[category] ?? DEFAULT_THEME;
}
