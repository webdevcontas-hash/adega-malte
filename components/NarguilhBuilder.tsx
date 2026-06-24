"use client";

import { useEffect, useState } from "react";
import type { ProductModel } from "@/app/generated/prisma/models";
import type { CartItem } from "@/lib/types";

const STEPS = [
  {
    key: "essencia",
    title: "1. Escolha a Essência",
    emoji: "💨",
    description: "O sabor que vai definir a experiência.",
    match: (name: string) => name.toLowerCase().includes("essência") || name.toLowerCase().includes("narguilé"),
  },
  {
    key: "carvao",
    title: "2. Escolha o Carvão",
    emoji: "🔥",
    description: "Carvão de qualidade = fumaça mais gostosa.",
    match: (name: string) => name.toLowerCase().includes("carvão"),
  },
  {
    key: "extras",
    title: "3. Extras (opcional)",
    emoji: "✨",
    description: "Piteira, isqueiro e mais.",
    match: (name: string) =>
      name.toLowerCase().includes("piteira") || name.toLowerCase().includes("isqueiro"),
  },
];

type Selection = Record<string, { product: ProductModel; quantity: number } | null>;

export default function NarguilhBuilder({
  products,
  onAddToCart,
  onClose,
}: {
  products: ProductModel[];
  onAddToCart: (items: CartItem[]) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [selection, setSelection] = useState<Selection>({});

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const tabacaria = products.filter((p) => p.category === "Tabacaria");
  const currentStep = STEPS[step];
  const stepProducts = tabacaria.filter((p) => currentStep.match(p.name));

  function select(product: ProductModel) {
    setSelection((prev) => {
      const current = prev[currentStep.key];
      // toggle off if already selected
      if (current?.product.id === product.id) {
        return { ...prev, [currentStep.key]: null };
      }
      return { ...prev, [currentStep.key]: { product, quantity: 1 } };
    });
  }

  function handleAddToCart() {
    const items: CartItem[] = Object.values(selection)
      .filter(Boolean)
      .map((entry) => ({
        productId: entry!.product.id,
        name: entry!.product.name,
        price: entry!.product.price,
        quantity: entry!.quantity,
      }));

    if (items.length === 0) return;
    onAddToCart(items);
    onClose();
  }

  const selectedCount = Object.values(selection).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-foreground/60 p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-800 px-5 py-4">
          <div>
            <h2 className="font-bold text-white text-lg">Monta seu Narguilé 💨</h2>
            <p className="text-xs text-slate-400">Guia passo a passo</p>
          </div>
          <button onClick={onClose} className="text-base text-slate-400 hover:text-white">✕</button>
        </div>

        {/* Step tabs */}
        <div className="flex border-b border-border bg-card">
          {STEPS.map((s, index) => (
            <button
              key={s.key}
              onClick={() => setStep(index)}
              className={`flex-1 py-2.5 text-xs font-bold transition ${
                index === step
                  ? "border-b-2 border-orange-500 text-orange-600"
                  : selection[s.key]
                  ? "text-green-600"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {selection[s.key] ? "✓ " : ""}{s.emoji} {s.key === "essencia" ? "Essência" : s.key === "carvao" ? "Carvão" : "Extras"}
            </button>
          ))}
        </div>

        {/* Step content */}
        <div className="p-4 max-h-72 overflow-y-auto">
          <p className="text-xs text-muted mb-3">{currentStep.description}</p>

          {stepProducts.length === 0 ? (
            <p className="text-sm text-muted text-center py-4">Nenhum produto disponível nesta categoria.</p>
          ) : (
            <div className="space-y-2">
              {stepProducts.map((product) => {
                const isSelected = selection[currentStep.key]?.product.id === product.id;
                return (
                  <button
                    key={product.id}
                    onClick={() => select(product)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      isSelected
                        ? "border-orange-400 bg-orange-50"
                        : "border-border bg-card hover:border-accent/40 hover:bg-accent-light"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
                        {product.description && (
                          <p className="mt-0.5 truncate text-xs text-muted">{product.description}</p>
                        )}
                      </div>
                      <div className="ml-3 text-right shrink-0">
                        <p className="text-sm font-bold text-orange-600">
                          {product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                        {isSelected && <span className="text-xs text-green-600 font-bold">✓ Selecionado</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between border-t border-border p-4 bg-card">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="text-sm text-muted hover:text-foreground disabled:opacity-30"
          >
            ← Voltar
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700"
            >
              Próximo →
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={selectedCount === 0}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-40"
            >
              Adicionar ao Carrinho ({selectedCount} iten{selectedCount !== 1 ? "s" : ""})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
