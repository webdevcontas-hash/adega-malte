"use client";

import { useEffect } from "react";
import { Plus, Minus, X } from "lucide-react";
import type { ProductModel } from "@/app/generated/prisma/models";
import { themeFor } from "@/components/v2/theme";
import ProductIcon from "@/components/v2/icons/ProductIcon";

function formatPrice(price: number) {
  return `R$ ${price.toFixed(2).replace(".", ",")}`;
}

export default function ProductDetailV2({
  product,
  quantityInCart,
  onAdd,
  onRemoveOne,
  onClose,
}: {
  product: ProductModel;
  quantityInCart: number;
  onAdd: (product: ProductModel, quantity?: number) => void;
  onRemoveOne: (product: ProductModel) => void;
  onClose: () => void;
}) {
  const theme = themeFor(product.category);

  // Fecha com a tecla Esc e trava o scroll do fundo enquanto o modal está aberto.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/60 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-card pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:max-w-md sm:rounded-3xl sm:pb-0"
      >
        {/* Botão fechar — text-base explícito para não herdar o tamanho gigante do emoji */}
        <button
          onClick={onClose}
          aria-label="Fechar detalhes"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-foreground/20 text-base text-white shadow-md backdrop-blur transition hover:bg-foreground/30 active:scale-90"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Hero com ícone e gradiente da categoria */}
        <div className={`relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br ${theme.gradient} rounded-t-3xl`}>
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="z-10 text-white drop-shadow-lg">
            <ProductIcon name={product.name} category={product.category} className="text-[7rem]" />
          </div>
          <span
            className={`absolute left-5 top-5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider shadow-sm ${theme.badge}`}
          >
            {product.category}
          </span>
        </div>

        <div className="px-5 pt-5">
          <h2 className="font-display text-2xl font-black leading-tight tracking-tight text-foreground">
            {product.name}
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            {product.description?.trim()
              ? product.description
              : "Produto selecionado do Malte & Tabaco. Entrega rápida na sua região."}
          </p>

          <div className="mt-6 flex items-end justify-between border-t border-border pt-5">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase leading-none text-muted">Preço</span>
              <span className={`mt-1 text-2xl font-black ${theme.text}`}>{formatPrice(product.price)}</span>
            </div>

            {quantityInCart > 0 ? (
              <div className="flex items-center gap-3 rounded-full border border-border bg-background p-1.5">
                <button
                  onClick={() => onRemoveOne(product)}
                  aria-label={`Remover ${product.name}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-foreground shadow-sm transition-transform active:scale-90 hover:bg-border"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-[20px] text-center text-base font-extrabold text-foreground">
                  {quantityInCart}
                </span>
                <button
                  onClick={() => onAdd(product)}
                  aria-label={`Adicionar ${product.name}`}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-foreground shadow-sm transition-transform active:scale-90 hover:bg-border"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onAdd(product)}
                className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-extrabold text-white shadow-md shadow-orange-100 transition-all active:scale-95 ${theme.btn}`}
              >
                <Plus className="h-5 w-5" />
                Adicionar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
