"use client";

import { useEffect, useState, useCallback } from "react";
import { FaPlus, FaTrash, FaPen, FaCheck, FaXmark, FaToggleOn, FaToggleOff } from "react-icons/fa6";

// ─── Types ───────────────────────────────────────────────────────────────────

type Product = { id: string; name: string; price: number; category: string; description: string | null; isAvailable: boolean };
type KitItem = { productId: string; quantity: number };
type Kit = { id: number; name: string; description: string | null; items: KitItem[]; active: boolean };
type DeliveryZone = { id: number; neighborhood: string; fee: number };
type Settings = { deliveryTime: string; businessHoursOpen: string; businessHoursClose: string; whatsappNumber: string; deliveryDefaultFee: string };

const CATEGORIES = ["Cervejas", "Destilados", "Tabacaria", "Combos/Gelo"] as const;

function fmt(v: number) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }

// ─── Shared UI ───────────────────────────────────────────────────────────────

function Btn({ onClick, disabled, variant = "primary", children, className = "" }: {
  onClick?: () => void; disabled?: boolean; variant?: "primary" | "ghost" | "danger"; children: React.ReactNode; className?: string;
}) {
  const base = "rounded-lg px-3 py-2 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed";
  const v = { primary: "bg-accent text-white hover:bg-accent-dark", ghost: "border border-border text-foreground hover:bg-border", danger: "bg-red-700 text-white hover:bg-red-800" };
  return <button onClick={onClick} disabled={disabled} className={`${base} ${v[variant]} ${className}`}>{children}</button>;
}

function Input({ label, value, onChange, type = "text", placeholder, min, step, required }: {
  label: string; value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string; min?: number; step?: string; required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-bold uppercase text-muted">{label}</span>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        min={min} step={step} required={required}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
      />
    </label>
  );
}

// ─── Produtos Tab ─────────────────────────────────────────────────────────────

function ProdutosTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState<{ name: string; price: string; category: typeof CATEGORIES[number]; description: string }>({ name: "", price: "", category: CATEGORIES[0], description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    if (res.ok) setProducts(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function openEdit(p: Product) {
    setEditing(p);
    setForm({ name: p.name, price: String(p.price), category: p.category as typeof CATEGORIES[number], description: p.description ?? "" });
    setShowNew(false);
    setError("");
  }

  function openNew() {
    setShowNew(true);
    setEditing(null);
    setForm({ name: "", price: "", category: CATEGORIES[0], description: "" });
    setError("");
  }

  async function save() {
    setSaving(true); setError("");
    const body = { name: form.name, price: Number(form.price), category: form.category, description: form.description || null };
    const url = editing ? `/api/admin/products/${editing.id}` : "/api/admin/products";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { await load(); setEditing(null); setShowNew(false); }
    else { const d = await res.json(); setError(d.error ?? "Erro ao salvar."); }
    setSaving(false);
  }

  async function toggle(p: Product) {
    await fetch(`/api/admin/products/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isAvailable: !p.isAvailable }) });
    setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, isAvailable: !x.isAvailable } : x));
  }

  async function remove(p: Product) {
    if (!confirm(`Deletar "${p.name}" permanentemente?`)) return;
    await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((x) => x.id !== p.id));
  }

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = products.filter((p) => p.category === cat);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Produtos ({products.length})</h2>
        <Btn onClick={openNew}><FaPlus className="inline mr-1" />Novo Produto</Btn>
      </div>

      {(showNew || editing) && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="font-bold text-foreground">{editing ? "Editar produto" : "Novo produto"}</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><Input label="Nome" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required /></div>
            <Input label="Preço (R$)" type="number" min={0.01} step="0.01" value={form.price} onChange={(v) => setForm((f) => ({ ...f, price: v }))} required />
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase text-muted">Categoria</span>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as typeof CATEGORIES[number] }))}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <div className="sm:col-span-2"><Input label="Descrição (opcional)" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} /></div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <Btn onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Btn>
            <Btn variant="ghost" onClick={() => { setEditing(null); setShowNew(false); }}>Cancelar</Btn>
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-muted">Carregando...</p>}

      {CATEGORIES.map((cat) => grouped[cat]?.length > 0 && (
        <div key={cat}>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-muted">{cat}</h3>
          <div className="space-y-2">
            {grouped[cat].map((p) => (
              <div key={p.id} className={`flex items-center gap-3 rounded-xl border p-3 ${p.isAvailable ? "border-border bg-card" : "border-border bg-background opacity-50"}`}>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
                  <p className="text-xs text-muted">{fmt(p.price)}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${p.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {p.isAvailable ? "Ativo" : "Inativo"}
                </span>
                <button onClick={() => toggle(p)} className="shrink-0 text-muted hover:text-foreground" title={p.isAvailable ? "Desativar" : "Ativar"}>
                  {p.isAvailable ? <FaToggleOn className="text-xl text-green-600" /> : <FaToggleOff className="text-xl" />}
                </button>
                <button onClick={() => openEdit(p)} className="shrink-0 text-muted hover:text-foreground" title="Editar"><FaPen className="text-sm" /></button>
                <button onClick={() => remove(p)} className="shrink-0 text-red-400 hover:text-red-600" title="Deletar"><FaTrash className="text-sm" /></button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Kits Tab ─────────────────────────────────────────────────────────────────

function KitsTab() {
  const [kits, setKits] = useState<Kit[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Kit | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", items: [{ productId: "", quantity: 1 }] as KitItem[] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [kRes, pRes] = await Promise.all([fetch("/api/admin/kits"), fetch("/api/admin/products")]);
    if (kRes.ok) setKits(await kRes.json());
    if (pRes.ok) setProducts(await pRes.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  function openEdit(k: Kit) {
    setEditing(k); setShowNew(false); setError("");
    setForm({ name: k.name, description: k.description ?? "", items: k.items.length ? k.items : [{ productId: "", quantity: 1 }] });
  }
  function openNew() {
    setShowNew(true); setEditing(null); setError("");
    setForm({ name: "", description: "", items: [{ productId: "", quantity: 1 }] });
  }

  function setItem(idx: number, field: "productId" | "quantity", value: string | number) {
    setForm((f) => ({ ...f, items: f.items.map((item, i) => i === idx ? { ...item, [field]: field === "quantity" ? Number(value) : value } : item) }));
  }
  function addItem() { setForm((f) => ({ ...f, items: [...f.items, { productId: "", quantity: 1 }] })); }
  function removeItem(idx: number) { setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) })); }

  async function save() {
    setSaving(true); setError("");
    const validItems = form.items.filter((i) => i.productId && i.quantity > 0);
    if (!validItems.length) { setError("Adicione ao menos 1 item válido."); setSaving(false); return; }
    const body = { name: form.name, description: form.description || null, items: validItems };
    const url = editing ? `/api/admin/kits/${editing.id}` : "/api/admin/kits";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { await load(); setEditing(null); setShowNew(false); }
    else { const d = await res.json(); setError(d.error ?? "Erro ao salvar."); }
    setSaving(false);
  }

  async function toggle(k: Kit) {
    await fetch(`/api/admin/kits/${k.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !k.active }) });
    setKits((prev) => prev.map((x) => x.id === k.id ? { ...x, active: !x.active } : x));
  }

  async function remove(k: Kit) {
    if (!confirm(`Deletar kit "${k.name}"?`)) return;
    await fetch(`/api/admin/kits/${k.id}`, { method: "DELETE" });
    setKits((prev) => prev.filter((x) => x.id !== k.id));
  }

  const productName = (id: string) => products.find((p) => p.id === id)?.name ?? id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Kits ({kits.length})</h2>
        <Btn onClick={openNew}><FaPlus className="inline mr-1" />Novo Kit</Btn>
      </div>

      {(showNew || editing) && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="font-bold text-foreground">{editing ? "Editar kit" : "Novo kit"}</h3>
          <Input label="Nome" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required />
          <Input label="Descrição (opcional)" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} />

          <div>
            <p className="mb-2 text-xs font-bold uppercase text-muted">Itens do kit</p>
            <div className="space-y-2">
              {form.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select value={item.productId} onChange={(e) => setItem(idx, "productId", e.target.value)}
                    className="flex-1 rounded-lg border border-border bg-background px-2 py-2 text-sm text-foreground focus:border-accent focus:outline-none">
                    <option value="">— Selecionar produto —</option>
                    {CATEGORIES.map((cat) => (
                      <optgroup key={cat} label={cat}>
                        {products.filter((p) => p.category === cat && p.isAvailable).map((p) => (
                          <option key={p.id} value={p.id}>{p.name.split("—")[0].trim()} ({fmt(p.price)})</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <input type="number" min={1} value={item.quantity} onChange={(e) => setItem(idx, "quantity", e.target.value)}
                    className="w-16 rounded-lg border border-border bg-background px-2 py-2 text-sm text-center text-foreground focus:border-accent focus:outline-none" />
                  <button onClick={() => removeItem(idx)} disabled={form.items.length <= 1} className="text-red-400 hover:text-red-600 disabled:opacity-30"><FaXmark /></button>
                </div>
              ))}
            </div>
            <button onClick={addItem} className="mt-2 text-xs font-semibold text-accent hover:underline"><FaPlus className="inline mr-1" />Adicionar item</button>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <Btn onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Btn>
            <Btn variant="ghost" onClick={() => { setEditing(null); setShowNew(false); }}>Cancelar</Btn>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {kits.map((k) => (
          <div key={k.id} className={`rounded-xl border p-4 ${k.active ? "border-border bg-card" : "border-border bg-background opacity-50"}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground">{k.name}</p>
                {k.description && <p className="text-xs text-muted">{k.description}</p>}
                <ul className="mt-1 space-y-0.5">
                  {k.items.map((item, i) => (
                    <li key={i} className="text-xs text-muted">{item.quantity}× {productName(item.productId).split("—")[0].trim()}</li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggle(k)} title={k.active ? "Desativar" : "Ativar"}>
                  {k.active ? <FaToggleOn className="text-xl text-green-600" /> : <FaToggleOff className="text-xl text-muted" />}
                </button>
                <button onClick={() => openEdit(k)} className="text-muted hover:text-foreground"><FaPen className="text-sm" /></button>
                <button onClick={() => remove(k)} className="text-red-400 hover:text-red-600"><FaTrash className="text-sm" /></button>
              </div>
            </div>
          </div>
        ))}
        {kits.length === 0 && <p className="text-sm text-muted">Nenhum kit cadastrado.</p>}
      </div>
    </div>
  );
}

// ─── Taxas Tab ────────────────────────────────────────────────────────────────

function TaxasTab() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFee, setEditFee] = useState("");
  const [editNeighborhood, setEditNeighborhood] = useState("");
  const [newNeighborhood, setNewNeighborhood] = useState("");
  const [newFee, setNewFee] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/delivery-zones");
    if (res.ok) setZones(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  async function saveEdit(id: number) {
    setSaving(true);
    await fetch(`/api/admin/delivery-zones/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ neighborhood: editNeighborhood, fee: Number(editFee) }) });
    await load(); setEditingId(null); setSaving(false);
  }

  async function addZone() {
    setError(""); setSaving(true);
    const res = await fetch("/api/admin/delivery-zones", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ neighborhood: newNeighborhood, fee: Number(newFee) }) });
    if (res.ok) { await load(); setNewNeighborhood(""); setNewFee(""); }
    else { const d = await res.json(); setError(d.error ?? "Erro."); }
    setSaving(false);
  }

  async function remove(id: number, name: string) {
    if (!confirm(`Remover bairro "${name}"?`)) return;
    await fetch(`/api/admin/delivery-zones/${id}`, { method: "DELETE" });
    setZones((prev) => prev.filter((z) => z.id !== id));
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-lg font-bold text-foreground">Taxas de Entrega</h2>
      <p className="text-xs text-muted">Bairros não listados aqui recebem a taxa padrão (configurável em ⚙️ Configurações).</p>

      <div className="space-y-2">
        {zones.map((z) => (
          <div key={z.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            {editingId === z.id ? (
              <>
                <input value={editNeighborhood} onChange={(e) => setEditNeighborhood(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground focus:border-accent focus:outline-none" />
                <input type="number" min={0} step="0.50" value={editFee} onChange={(e) => setEditFee(e.target.value)}
                  className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-sm text-center text-foreground focus:border-accent focus:outline-none" />
                <button onClick={() => saveEdit(z.id)} disabled={saving} className="text-green-600 hover:text-green-700"><FaCheck /></button>
                <button onClick={() => setEditingId(null)} className="text-muted hover:text-foreground"><FaXmark /></button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm font-medium text-foreground">{z.neighborhood}</span>
                <span className="text-sm font-bold text-accent">{fmt(z.fee)}</span>
                <button onClick={() => { setEditingId(z.id); setEditNeighborhood(z.neighborhood); setEditFee(String(z.fee)); }} className="text-muted hover:text-foreground"><FaPen className="text-sm" /></button>
                <button onClick={() => remove(z.id, z.neighborhood)} className="text-red-400 hover:text-red-600"><FaTrash className="text-sm" /></button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-bold text-foreground">Novo bairro</p>
        <div className="flex gap-2">
          <input placeholder="Nome do bairro" value={newNeighborhood} onChange={(e) => setNewNeighborhood(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none" />
          <input type="number" min={0} step="0.50" placeholder="R$" value={newFee} onChange={(e) => setNewFee(e.target.value)}
            className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm text-center text-foreground placeholder:text-muted focus:border-accent focus:outline-none" />
          <Btn onClick={addZone} disabled={saving || !newNeighborhood || !newFee}><FaPlus /></Btn>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}

// ─── Configurações Tab ────────────────────────────────────────────────────────

function ConfigTab() {
  const [settings, setSettings] = useState<Settings>({ deliveryTime: "", businessHoursOpen: "18", businessHoursClose: "3", whatsappNumber: "", deliveryDefaultFee: "12" });
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((data) => {
      setSettings((prev) => ({ ...prev, ...data }));
    });
  }, []);

  async function saveSetting(key: keyof Settings) {
    setSaving(key); setSaved(null);
    await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, value: settings[key] }) });
    setSaving(null); setSaved(key);
    setTimeout(() => setSaved(null), 2000);
  }

  function SettingRow({ label, hint, settingKey, type = "text", placeholder }: { label: string; hint?: string; settingKey: keyof Settings; type?: string; placeholder?: string }) {
    return (
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:gap-3">
        <div className="flex-1">
          <label className="text-xs font-bold uppercase text-muted">{label}</label>
          {hint && <p className="text-xs text-muted/70">{hint}</p>}
          <input type={type} value={settings[settingKey]} placeholder={placeholder}
            onChange={(e) => setSettings((s) => ({ ...s, [settingKey]: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none" />
        </div>
        <button onClick={() => saveSetting(settingKey)} disabled={saving === settingKey}
          className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50">
          {saved === settingKey ? <FaCheck /> : saving === settingKey ? "..." : "Salvar"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-lg font-bold text-foreground">Configurações da Loja</h2>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-bold text-foreground">⏰ Horário de Funcionamento</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase text-muted">Abre às (hora)</label>
            <input type="number" min={0} max={23} value={settings.businessHoursOpen}
              onChange={(e) => setSettings((s) => ({ ...s, businessHoursOpen: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-muted">Fecha às (hora)</label>
            <input type="number" min={0} max={23} value={settings.businessHoursClose}
              onChange={(e) => setSettings((s) => ({ ...s, businessHoursClose: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none" />
          </div>
        </div>
        <p className="text-xs text-muted">Funciona após meia-noite? Ex: abre 18h fecha 3h → pedidos aceitos das 18h às 3h do dia seguinte.</p>
        <Btn onClick={() => { saveSetting("businessHoursOpen"); saveSetting("businessHoursClose"); }} disabled={saving !== null}>
          {saved === "businessHoursOpen" ? "✓ Salvo" : "Salvar horário"}
        </Btn>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-bold text-foreground">🚚 Entrega</h3>
        <SettingRow label="Tempo estimado de entrega" hint='Exibido no carrinho. Ex: "30-45 min"' settingKey="deliveryTime" placeholder="30-45 min" />
        <SettingRow label="Taxa padrão (bairros não cadastrados)" hint="Em reais" settingKey="deliveryDefaultFee" type="number" placeholder="12" />
      </section>

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-bold text-foreground">💬 WhatsApp</h3>
        <SettingRow label="Número da loja" hint='Formato: 55DDD+número, sem espaços. Ex: "5511999999999"' settingKey="whatsappNumber" placeholder="5511999999999" />
      </section>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

type Tab = "produtos" | "kits" | "taxas" | "configuracoes";
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "produtos", label: "Produtos", icon: "📦" },
  { id: "kits", label: "Kits", icon: "🎁" },
  { id: "taxas", label: "Taxas de Entrega", icon: "🚚" },
  { id: "configuracoes", label: "Configurações", icon: "⚙️" },
];

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>("produtos");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3 shadow-sm">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-foreground">Admin — Malte &amp; Tabaco</h1>
              <p className="text-xs text-muted">Painel de administração</p>
            </div>
            <a href="/dashboard" className="text-xs font-semibold text-muted hover:text-foreground underline">→ Painel de Pedidos</a>
          </div>
          <div className="mt-3 flex gap-1 overflow-x-auto pb-1">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition ${tab === t.id ? "bg-accent text-white" : "text-muted hover:bg-accent-light hover:text-foreground"}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6">
        {tab === "produtos" && <ProdutosTab />}
        {tab === "kits" && <KitsTab />}
        {tab === "taxas" && <TaxasTab />}
        {tab === "configuracoes" && <ConfigTab />}
      </div>
    </div>
  );
}
