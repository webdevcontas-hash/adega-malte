import { Plus, Minus } from "lucide-react";
import type { ProductModel } from "@/app/generated/prisma/models";
import { themeFor } from "@/components/v2/theme";
import ProductIcon from "@/components/v2/icons/ProductIcon";

function formatPrice(price: number) {
  return `R$ ${price.toFixed(2).replace(".", ",")}`;
}

export default function ProductCardV2({
  product,
  quantityInCart,
  onAdd,
  onRemoveOne,
  onOpenDetails,
}: {
  product: ProductModel;
  quantityInCart: number;
  onAdd: (product: ProductModel, quantity?: number) => void;
  onRemoveOne: (product: ProductModel) => void;
  onOpenDetails: (product: ProductModel) => void;
}) {
  const theme = themeFor(product.category);

  return (
    <div
      onClick={() => onOpenDetails(product)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetails(product);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalhes de ${product.name}`}
      className="group flex h-full cursor-pointer flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-sm shadow-black/20 transition-all duration-300 hover:border-accent/50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div>
        <div className={`relative mb-3.5 flex h-36 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${theme.gradient} transition-transform duration-300 group-hover:scale-[1.02]`}>
          {/* reflexo de brilho no canto */}
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-xl" />
          <div className="z-10 text-white drop-shadow-md transition-transform duration-300 group-hover:scale-110">
            <ProductIcon name={product.name} category={product.category} className="text-[3.5rem]" />
          </div>
          <span className="absolute left-2.5 top-2.5 rounded-full bg-black/20 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white backdrop-blur-sm">
            {product.category}
          </span>
        </div>

        <h3 className="line-clamp-1 font-bold leading-snug text-foreground transition-colors group-hover:text-accent">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-1 line-clamp-2 min-h-[2rem] text-xs text-muted">{product.description}</p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase leading-none text-muted">Preço</span>
          <span className={`mt-0.5 text-lg font-black ${theme.text}`}>{formatPrice(product.price)}</span>
        </div>

        {quantityInCart > 0 ? (
          <div className="flex items-center gap-2.5 rounded-full border border-border bg-background p-1">
            <button
              onClick={(event) => {
                event.stopPropagation();
                onRemoveOne(product);
              }}
              aria-label={`Remover ${product.name}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-foreground shadow-sm transition-transform active:scale-90 hover:bg-border md:h-7 md:w-7"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[12px] px-1 text-center text-sm font-extrabold text-foreground">{quantityInCart}</span>
            <button
              onClick={(event) => {
                event.stopPropagation();
                onAdd(product);
              }}
              aria-label={`Adicionar ${product.name}`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-foreground shadow-sm transition-transform active:scale-90 hover:bg-border md:h-7 md:w-7"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onAdd(product);
            }}
            aria-label={`Adicionar ${product.name}`}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-white shadow-md shadow-orange-100 transition-all duration-300 hover:scale-105 active:scale-90 ${theme.btn}`}
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
