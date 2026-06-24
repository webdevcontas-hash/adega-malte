"use client";

import { useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";
import type { ProductModel } from "@/app/generated/prisma/models";
import AgeGate from "@/components/AgeGate";
import BusinessHoursNotice from "@/components/BusinessHoursNotice";
import { StoreStatusProvider, useStoreStatus } from "@/components/StoreStatusProvider";
import { CustomerProvider, useCustomer } from "@/components/CustomerProvider";
import CartDrawer from "@/components/CartDrawer";
import AccountDrawer from "@/components/AccountDrawer";
import PaymentScreen from "@/components/PaymentScreen";
import HeaderV2 from "@/components/v2/HeaderV2";
import CategoryHubV2 from "@/components/v2/CategoryHubV2";
import ProductCardV2 from "@/components/v2/ProductCardV2";
import ProductDetailV2 from "@/components/v2/ProductDetailV2";
import KitSection from "@/components/KitSection";
import NarguilhBuilder from "@/components/NarguilhBuilder";
import Toast, { type ToastItem } from "@/components/Toast";
import { useCart, type CheckoutResult } from "@/lib/useCart";

const CATEGORY_HEADINGS: Record<string, string> = {
  Cervejas: "Cervejas Geladas",
  Destilados: "Destilados Premium",
  Tabacaria: "Artigos de Tabacaria",
  "Combos/Gelo": "Combos e Gelo para a Galera",
};

export default function StorefrontV2({ products }: { products: ProductModel[] }) {
  return (
    <StoreStatusProvider>
      <CustomerProvider>
        <StorefrontV2Content products={products} />
      </CustomerProvider>
    </StoreStatusProvider>
  );
}

function StorefrontV2Content({ products }: { products: ProductModel[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<ProductModel | null>(null);
  const [payment, setPayment] = useState<CheckoutResult | null>(null);
  const [narguilhOpen, setNarguilhOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const { cart, itemCount, addToCart, changeQuantity, clear, reorder, addManyToCart } = useCart();

  function showToast(message: string) {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
  }

  function removeToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }
  const { open } = useStoreStatus();
  const { session, profile } = useCustomer();
  const customerName = session?.name ?? profile?.name;

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory && product.category !== selectedCategory) return false;
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const inName = product.name.toLowerCase().includes(query);
        const inDesc = (product.description ?? "").toLowerCase().includes(query);
        const inCategory = product.category.toLowerCase().includes(query);
        return inName || inDesc || inCategory;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  function quantityOf(productId: string) {
    return cart.find((item) => item.productId === productId)?.quantity ?? 0;
  }

  function removeOne(product: ProductModel) {
    changeQuantity(product.id, quantityOf(product.id) - 1);
  }

  function handleCheckoutSuccess(result: CheckoutResult) {
    setPayment(result);
    setDrawerOpen(false);
    clear();
  }

  function clearFilters() {
    setSearchQuery("");
    setSelectedCategory(null);
  }

  function handleReorder(items: Parameters<typeof reorder>[0]) {
    reorder(items);
    setDrawerOpen(true);
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-background selection:bg-orange-200">
      <AgeGate />

      <div className="flex w-full flex-1 flex-col">
        <HeaderV2
          cartCount={itemCount}
          onCartClick={() => setDrawerOpen(true)}
          onAccountClick={() => setAccountOpen(true)}
          customerName={customerName}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <BusinessHoursNotice />

        <div className="flex-1 pb-16">
          <CategoryHubV2 selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

          {/* Kits para a ocasião */}
          {!selectedCategory && !searchQuery && (
            <KitSection onAddKit={(items) => {
              addManyToCart(items);
              showToast(`Kit adicionado ao carrinho!`);
              setDrawerOpen(true);
            }} />
          )}

          {/* Botão Monta seu Narguilé */}
          {(!selectedCategory || selectedCategory === "Tabacaria") && !searchQuery && (
            <div className="mx-auto max-w-7xl px-4 pb-4 md:px-8">
              <button
                onClick={() => setNarguilhOpen(true)}
                className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card px-5 py-4 text-left transition hover:border-accent/50 hover:bg-accent-light"
              >
                <span className="text-3xl">💨</span>
                <div>
                  <p className="font-bold text-foreground">Monta seu Narguilé</p>
                  <p className="text-xs text-muted">Escolha essência, carvão e extras passo a passo.</p>
                </div>
                <span className="ml-auto text-orange-500 font-bold text-sm">→</span>
              </button>
            </div>
          )}

          <main className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-black uppercase italic tracking-tight text-foreground underline decoration-accent underline-offset-4">
                  {selectedCategory ? CATEGORY_HEADINGS[selectedCategory] ?? selectedCategory : "Todos os Favoritos da Galera"}
                </h3>
                {searchQuery && <p className="mt-1 text-xs text-muted">Resultados para &quot;{searchQuery}&quot;</p>}
              </div>
              <span className="rounded-full bg-card px-3 py-1.5 text-xs font-bold text-muted border border-border">
                {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "itens"}
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="mx-auto my-8 max-w-md rounded-3xl border border-border bg-card p-12 text-center">
                <span className="text-4xl">🔍</span>
                <h4 className="mt-4 font-bold text-foreground">Nenhum produto encontrado</h4>
                <p className="mt-2 text-xs text-muted">
                  Não encontramos correspondências. Tente outros termos ou explore os departamentos acima.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-6 cursor-pointer rounded-full bg-orange-50 px-4 py-2 text-xs font-extrabold text-orange-600 hover:bg-orange-100"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCardV2
                    key={product.id}
                    product={product}
                    quantityInCart={quantityOf(product.id)}
                    onAdd={(product, qty) => { addToCart(product, qty); showToast(`${product.name.split("—")[0].trim()} adicionado!`); }}
                    onRemoveOne={removeOne}
                    onOpenDetails={setDetailProduct}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Carrinho flutuante (mobile) */}
      {itemCount > 0 && (
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir carrinho"
          className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-6 z-30 flex animate-pulse cursor-pointer items-center justify-center rounded-full bg-orange-500 p-4 text-white shadow-xl hover:bg-orange-600 md:hidden"
        >
          <ShoppingBag className="h-6 w-6" />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-600 text-[10px] font-black text-white shadow-sm">
            {itemCount}
          </span>
        </button>
      )}

      {/* Rodapé com status das lojas */}
      <footer className="mt-auto flex flex-col items-center justify-between gap-4 border-t border-border bg-card px-4 py-5 md:flex-row md:px-8">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${open ? "animate-ping bg-emerald-400" : "bg-red-500"}`} />
          <span className="text-[11px] font-black uppercase tracking-wide text-muted">
            {open ? "Aberto agora — entregando gelado" : "Fechado no momento"}
          </span>
        </div>
        <div className="flex items-center gap-4 rounded-full border border-[#e8d4bb] bg-[#f5e4d0] px-5 py-2.5 text-center shadow-inner">
          <p className="text-xs font-extrabold text-[#8c3a10]">🚚 Entrega rápida na sua região!</p>
          <div className="flex h-6 w-6 select-none items-center justify-center rounded-full bg-[#e8d4bb] text-xs">🔥</div>
        </div>
      </footer>

      <CartDrawer
        isOpen={drawerOpen}
        items={cart}
        onClose={() => setDrawerOpen(false)}
        onChangeQuantity={changeQuantity}
        onCheckoutSuccess={handleCheckoutSuccess}
      />

      <AccountDrawer
        isOpen={accountOpen}
        onClose={() => setAccountOpen(false)}
        onReorder={handleReorder}
      />

      {narguilhOpen && (
        <NarguilhBuilder
          products={products}
          onAddToCart={(items) => {
            addManyToCart(items);
            showToast(`${items.length} iten${items.length !== 1 ? "s" : ""} do narguilé adicionado${items.length !== 1 ? "s" : ""}!`);
            setNarguilhOpen(false);
            setDrawerOpen(true);
          }}
          onClose={() => setNarguilhOpen(false)}
        />
      )}

      {detailProduct && (
        <ProductDetailV2
          product={detailProduct}
          quantityInCart={quantityOf(detailProduct.id)}
          onAdd={(product, qty) => { addToCart(product, qty); showToast(`${product.name.split("—")[0].trim()} adicionado!`); }}
          onRemoveOne={removeOne}
          onClose={() => setDetailProduct(null)}
        />
      )}

      <Toast toasts={toasts} onRemove={removeToast} />

      {payment && (
        <PaymentScreen
          orderId={payment.orderId}
          qrCode={payment.qrCode}
          qrCodeBase64={payment.qrCodeBase64}
          total={payment.total}
          onClose={() => setPayment(null)}
        />
      )}
    </div>
  );
}
