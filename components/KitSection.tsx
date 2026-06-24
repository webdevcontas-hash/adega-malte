"use client";

import { useEffect, useState } from "react";
import type { Kit, CartItem } from "@/lib/types";

function formatPrice(price: number) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function KitSection({ onAddKit }: { onAddKit: (items: CartItem[]) => void }) {
  const [kits, setKits] = useState<Kit[]>([]);
  const [added, setAdded] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/kits")
      .then((r) => r.json())
      .then(setKits)
      .catch(() => {});
  }, []);

  if (kits.length === 0) return null;

  function handleAdd(kit: Kit) {
    onAddKit(
      kit.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }))
    );
    setAdded(kit.id);
    setTimeout(() => setAdded(null), 2000);
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pb-4 md:px-8">
      <h3 className="font-display text-xl font-black uppercase italic tracking-tight text-foreground underline decoration-accent underline-offset-4">
        Kits para a Ocasião
      </h3>
      <p className="mt-1 text-xs text-muted">Tudo de uma vez, sem esquecer nada.</p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kits.map((kit) => (
          <div
            key={kit.id}
            className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-sm shadow-black/20"
          >
            <div>
              <div className="text-4xl">{kit.emoji}</div>
              <h4 className="mt-2 font-bold text-foreground">{kit.name}</h4>
              {kit.description && <p className="mt-1 text-xs text-muted">{kit.description}</p>}
              <ul className="mt-2 space-y-0.5">
                {kit.items.map((item) => (
                  <li key={item.productId} className="flex items-center gap-1 text-xs text-muted">
                    <span className="font-semibold text-foreground">{item.quantity}×</span>
                    <span className="truncate">{item.name.split("—")[0].trim()}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-base font-black text-accent">{formatPrice(kit.total)}</span>
              <button
                onClick={() => handleAdd(kit)}
                className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                  added === kit.id
                    ? "bg-green-500 text-white"
                    : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
              >
                {added === kit.id ? "✓ Adicionado!" : "+ Adicionar kit"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
