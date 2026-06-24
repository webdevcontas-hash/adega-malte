import { Search, ShoppingCart, User } from "lucide-react";

export default function HeaderV2({
  cartCount,
  onCartClick,
  onAccountClick,
  customerName,
  searchQuery,
  setSearchQuery,
}: {
  cartCount: number;
  onCartClick: () => void;
  onAccountClick: () => void;
  customerName?: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) {
  return (
    <header className="sticky top-0 z-40 flex flex-col items-center justify-between gap-4 border-b border-border bg-card px-4 py-4 shadow-lg shadow-black/20 md:flex-row md:px-8">
      {/* Marca */}
      <div className="flex w-full items-center justify-between md:w-auto md:justify-start">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-base font-black italic text-accent shadow-md">
            &amp;
          </div>
          <h1 className="font-display text-xl font-black tracking-tight text-foreground md:text-2xl">
            MALTE <span className="text-accent">&amp; TABACO</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={onAccountClick}
            aria-label="Minha conta"
            className="cursor-pointer rounded-full bg-background p-2 text-muted transition-all hover:text-foreground"
          >
            <User className="h-6 w-6" />
          </button>
          <button
            onClick={onCartClick}
            aria-label="Abrir carrinho"
            className="relative cursor-pointer rounded-full bg-accent-light p-2 text-accent transition-all hover:bg-accent hover:text-white"
          >
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 animate-bounce rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Busca */}
      <div className="w-full max-w-md flex-1 px-0 md:px-8">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="O que você procura? (cerveja, whisky, charuto...)"
            className="w-full rounded-full border-2 border-transparent bg-background py-2.5 pl-11 pr-5 text-base text-foreground placeholder:text-muted transition-all focus:border-accent focus:outline-none md:text-sm"
          />
          <Search className="absolute left-4 top-3 h-4 w-4 text-muted" />
        </div>
      </div>

      {/* Conta + carrinho (desktop) */}
      <div className="hidden items-center gap-4 md:flex">
        <button
          onClick={onAccountClick}
          aria-label="Minha conta"
          className="group flex cursor-pointer items-center gap-2 rounded-xl p-2 text-left transition-colors hover:bg-background"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-muted transition-colors group-hover:bg-accent-light group-hover:text-accent">
            <User className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-[10px] font-bold uppercase leading-none text-muted">
              {customerName ? "Conta" : "Entrar"}
            </p>
            <p className="text-sm font-bold text-foreground transition-colors group-hover:text-accent">
              {customerName ? customerName.split(" ")[0] : "Pedir mais rápido"}
            </p>
          </div>
        </button>

        <button
          onClick={onCartClick}
          aria-label="Abrir carrinho"
          className="relative flex cursor-pointer items-center justify-center rounded-full bg-accent-light p-3.5 text-accent shadow-sm transition-all hover:scale-105 hover:bg-accent hover:text-white active:scale-95"
        >
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
