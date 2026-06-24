import type { IconType } from "react-icons";
import {
  FaBeerMugEmpty,
  FaWineGlass,
  FaMartiniGlass,
  FaWineBottle,
  FaSmoking,
  FaSnowflake,
  FaGift,
  FaFire,
  FaWind,
  FaBox,
  FaBolt,
} from "react-icons/fa6";

type IconProps = { className?: string };

const RULES: { keywords: string[]; Icon: IconType }[] = [
  // Carvão e isqueiro → chama (antes de narguilé para não cair em Wind)
  { keywords: ["carvão", "carvao", "isqueiro", "brasa"], Icon: FaFire },
  // Narguilé / essência
  { keywords: ["narguilé", "narguilhe", "essência", "essencia", "hookah"], Icon: FaWind },
  // Tabaco / cigarro
  { keywords: ["piteira", "cigarro", "charuto", "tabaco", "seda", "smoking"], Icon: FaSmoking },
  // Gelo e balde — antes de "combo" para não cair em Gift
  { keywords: ["gelo", "ice", "snowflake", "geleira"], Icon: FaSnowflake },
  // Combos genéricos
  { keywords: ["combo", "kit"], Icon: FaGift },
  // Cervejas
  { keywords: ["pilsen", "ipa", "weiss", "stout", "red ale", "long neck", "six pack", "lata 350", "brisa", "cerveja", "brew"], Icon: FaBeerMugEmpty },
  // Gin → taça de coquetel
  { keywords: ["gin", "tônica", "tonica", "martini"], Icon: FaMartiniGlass },
  // Energético
  { keywords: ["energético", "energetico"], Icon: FaBolt },
  // Destilados em garrafa (Vodka, Tequila, Rum)
  { keywords: ["vodka", "tequila", "rum"], Icon: FaWineBottle },
  // Destilados em copo (Whisky, Cachaça, Saquê, Licor)
  { keywords: ["whisky", "whiskey", "bourbon", "malte", "blended", "cachaça", "cachaca", "saquê", "sake", "licor"], Icon: FaWineGlass },
];

const CATEGORY_FALLBACK: Record<string, IconType> = {
  Cervejas: FaBeerMugEmpty,
  Destilados: FaWineGlass,
  Tabacaria: FaSmoking,
  "Combos/Gelo": FaGift,
};

function iconFor(name: string, category: string): IconType {
  const lower = name.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) return rule.Icon;
  }
  return CATEGORY_FALLBACK[category] ?? FaBox;
}

export default function ProductIcon({
  name,
  category,
  className = "text-[3.5rem]",
}: IconProps & { name: string; category: string }) {
  const Icon = iconFor(name, category);
  return <Icon className={className} />;
}
