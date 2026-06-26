"use client";

import { useEffect, useRef, useState } from "react";
import type { DeliveryStatus } from "@/lib/types";
import type { IconType } from "react-icons";
import { FaBox, FaGear, FaTicket, FaCheck } from "react-icons/fa6";

type OrderItem = { id: string; quantity: number; price: number; product: { name: string } };
type Order = {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  total: number;
  couponCode: string | null;
  couponDiscount: number | null;
  paymentMethod: "pix" | "card" | "cash";
  changeFor: number | null;
  status: "PENDING" | "PAID" | "DELIVERED";
  deliveryStatus: DeliveryStatus;
  accepted: boolean;
  items: OrderItem[];
};

const PAYMENT_LABEL: Record<Order["paymentMethod"], string> = {
  pix: "⚡ Pix (pago)",
  card: "💳 Cartão na entrega",
  cash: "💵 Dinheiro na entrega",
};

/** Pedido novo aguardando o atendente: Pix já pago, ou pagamento na entrega recém-confirmado. */
function needsAttention(order: Order): boolean {
  if (order.accepted) return false;
  if (order.paymentMethod === "pix") return order.status === "PAID";
  return order.status === "PENDING";
}
type Coupon = {
  id: number;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
};

const DASHBOARD_TABS: { id: "orders" | "settings" | "coupons"; label: string; Icon: IconType }[] = [
  { id: "orders", label: "Pedidos", Icon: FaBox },
  { id: "settings", label: "Configurações", Icon: FaGear },
  { id: "coupons", label: "Cupons", Icon: FaTicket },
];

const DELIVERY_STEPS: { key: DeliveryStatus; label: string }[] = [
  { key: "WAITING", label: "Aguardando" },
  { key: "PREPARING", label: "Preparando" },
  { key: "OUT_FOR_DELIVERY", label: "Saiu" },
  { key: "DELIVERED", label: "Entregue" },
];

function formatPrice(price: number) {
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function playBeep(audioContext: AudioContext) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "square";
  oscillator.frequency.value = 880;
  gain.gain.value = 0.15;
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.15);
}

export default function DashboardPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "settings" | "coupons">("orders");

  // Delivery time
  const [deliveryTime, setDeliveryTime] = useState("");
  const [savingTime, setSavingTime] = useState(false);
  const [timeSaved, setTimeSaved] = useState(false);

  // Coupons
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState<"percent" | "fixed">("percent");
  const [couponValue, setCouponValue] = useState("");
  const [couponMinOrder, setCouponMinOrder] = useState("0");
  const [couponMaxUses, setCouponMaxUses] = useState("");
  const [couponError, setCouponError] = useState("");
  const [savingCoupon, setSavingCoupon] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      if (document.hidden) return;
      try {
        const response = await fetch("/api/orders");
        if (response.ok && active) setOrders(await response.json());
      } catch {
        // mantém lista atual em falha de rede
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 4000);
    const onVisible = () => { if (!document.hidden) load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { active = false; clearInterval(interval); document.removeEventListener("visibilitychange", onVisible); };
  }, []);

  // Load delivery time and coupons when switching tabs
  useEffect(() => {
    if (activeTab === "settings") {
      fetch("/api/settings").then((r) => r.json()).then((data) => setDeliveryTime(data.deliveryTime ?? ""));
    }
    if (activeTab === "coupons") {
      fetch("/api/coupons").then((r) => r.json()).then(setCoupons);
    }
  }, [activeTab]);

  const pendingAlarm = orders.some(needsAttention);

  useEffect(() => {
    if (pendingAlarm && !alarmIntervalRef.current) {
      audioContextRef.current ??= new AudioContext();
      const ctx = audioContextRef.current;
      playBeep(ctx);
      alarmIntervalRef.current = setInterval(() => playBeep(ctx), 900);
    } else if (!pendingAlarm && alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  }, [pendingAlarm]);

  useEffect(() => {
    return () => { if (alarmIntervalRef.current) clearInterval(alarmIntervalRef.current); };
  }, []);

  async function acceptOrder(id: string) {
    await fetch(`/api/orders/${id}/accept`, { method: "POST" });
    setOrders((current) => current.map((o) => (o.id === id ? { ...o, accepted: true } : o)));
  }

  async function updateDeliveryStatus(id: string, deliveryStatus: DeliveryStatus) {
    const response = await fetch(`/api/orders/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliveryStatus }),
    });
    if (response.ok) {
      setOrders((current) => current.map((o) => (o.id === id ? { ...o, deliveryStatus } : o)));
    }
  }

  async function saveDeliveryTime() {
    setSavingTime(true);
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "deliveryTime", value: deliveryTime }),
    });
    setSavingTime(false);
    setTimeSaved(true);
    setTimeout(() => setTimeSaved(false), 2000);
  }

  async function createCoupon(event: React.FormEvent) {
    event.preventDefault();
    setCouponError("");
    setSavingCoupon(true);
    try {
      const response = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          type: couponType,
          value: Number(couponValue),
          minOrder: Number(couponMinOrder) || 0,
          maxUses: couponMaxUses ? Number(couponMaxUses) : null,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        setCouponError(data.error ?? "Erro ao criar cupom.");
        return;
      }
      const newCoupon = await response.json();
      setCoupons((current) => [newCoupon, ...current]);
      setCouponCode("");
      setCouponValue("");
      setCouponMinOrder("0");
      setCouponMaxUses("");
    } finally {
      setSavingCoupon(false);
    }
  }

  async function toggleCoupon(id: number, active: boolean) {
    const response = await fetch("/api/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    if (response.ok) {
      setCoupons((current) => current.map((c) => (c.id === id ? { ...c, active } : c)));
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3 shadow-sm">
        <h1 className="text-xl font-extrabold tracking-tight">Painel de Pedidos</h1>
        <div className="mt-2 flex gap-1">
          {DASHBOARD_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === t.id ? "bg-accent text-white" : "text-muted hover:bg-accent-light"
              }`}
            >
              <t.Icon /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {/* ── Pedidos ─────────────────────────────── */}
        {activeTab === "orders" && (
          <ul className="flex flex-col gap-3">
            {orders.map((order) => {
              const attention = needsAttention(order);
              const currentStepIndex = DELIVERY_STEPS.findIndex((s) => s.key === order.deliveryStatus);
              const showStepper = order.accepted && (order.status === "PAID" || order.status === "DELIVERED" || order.paymentMethod !== "pix");
              return (
                <li
                  key={order.id}
                  className={`rounded-xl border p-4 shadow-sm ${
                    attention ? "animate-pulse border-accent bg-accent-light" : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">#{order.id.slice(-6).toUpperCase()}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        order.status === "PAID"
                          ? "bg-green-100 text-green-700"
                          : order.status === "DELIVERED"
                          ? "bg-slate-100 text-slate-500"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-foreground">
                    {order.customerName} — {order.phone}
                  </p>
                  <p className="text-sm text-muted">{order.address}</p>
                  <ul className="mt-2 text-sm text-muted">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.quantity}× {item.product.name}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 font-bold text-accent-dark">
                    {formatPrice(order.total)}
                    {order.couponCode && (
                      <span className="ml-2 text-xs font-normal text-green-600">
                        (cupom {order.couponCode} −{formatPrice(order.couponDiscount ?? 0)})
                      </span>
                    )}
                  </p>

                  {/* Forma de pagamento */}
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        order.paymentMethod === "pix" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {PAYMENT_LABEL[order.paymentMethod]}
                    </span>
                    {order.paymentMethod === "cash" && order.changeFor && order.changeFor > order.total && (
                      <span className="text-xs font-semibold text-amber-800">
                        Troco p/ {formatPrice(order.changeFor)} → levar {formatPrice(order.changeFor - order.total)}
                      </span>
                    )}
                  </div>

                  {attention && (
                    <button
                      onClick={() => acceptOrder(order.id)}
                      className="mt-3 w-full rounded-lg bg-accent py-2 font-semibold text-white transition hover:bg-accent-dark"
                    >
                      Aceitar Pedido
                    </button>
                  )}

                  {showStepper && (
                    <div className="mt-3">
                      <p className="mb-2 text-xs font-bold uppercase text-muted tracking-wide">Status de entrega</p>
                      <div className="flex gap-1 flex-wrap">
                        {DELIVERY_STEPS.map((step, index) => (
                          <button
                            key={step.key}
                            onClick={() => updateDeliveryStatus(order.id, step.key)}
                            disabled={index === currentStepIndex}
                            className={`rounded-lg px-2 py-1 text-xs font-semibold transition ${
                              index <= currentStepIndex
                                ? "bg-accent text-white"
                                : "border border-border text-muted hover:bg-accent-light"
                            } disabled:cursor-default`}
                          >
                            {step.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
            {loading && orders.length === 0 && (
              <>
                <li className="h-24 animate-pulse rounded-xl border border-border bg-card" />
                <li className="h-24 animate-pulse rounded-xl border border-border bg-card" />
              </>
            )}
            {!loading && orders.length === 0 && <p className="text-muted">Nenhum pedido ainda.</p>}
          </ul>
        )}

        {/* ── Configurações ───────────────────────── */}
        {activeTab === "settings" && (
          <div className="max-w-md space-y-6">
            <div>
              <label className="block text-sm font-bold text-foreground">
                Tempo estimado de entrega
              </label>
              <p className="mt-0.5 text-xs text-muted">Ex: "30-45 min". Aparece no topo do carrinho.</p>
              <div className="mt-2 flex gap-2">
                <input
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  placeholder="30-45 min"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted"
                />
                <button
                  onClick={saveDeliveryTime}
                  disabled={savingTime}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
                >
                  {timeSaved ? <FaCheck className="inline" /> : savingTime ? "..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Cupons ──────────────────────────────── */}
        {activeTab === "coupons" && (
          <div className="max-w-lg space-y-6">
            <form onSubmit={createCoupon} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h2 className="font-bold text-foreground">Novo cupom</h2>
              <div className="flex gap-2">
                <input
                  required
                  placeholder="Código (ex: JAPA10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm uppercase placeholder:normal-case placeholder:text-muted"
                />
                <select
                  value={couponType}
                  onChange={(e) => setCouponType(e.target.value as "percent" | "fixed")}
                  className="rounded-lg border border-border bg-background px-2 py-2 text-sm text-foreground"
                >
                  <option value="percent">%</option>
                  <option value="fixed">R$</option>
                </select>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder={couponType === "percent" ? "10" : "15"}
                  value={couponValue}
                  onChange={(e) => setCouponValue(e.target.value)}
                  className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-muted">Pedido mínimo (R$)</label>
                  <input
                    type="number"
                    min="0"
                    value={couponMinOrder}
                    onChange={(e) => setCouponMinOrder(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted">Limite de usos (vazio = ilimitado)</label>
                  <input
                    type="number"
                    min="1"
                    value={couponMaxUses}
                    onChange={(e) => setCouponMaxUses(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>
              </div>
              {couponError && <p className="text-xs text-red-600">{couponError}</p>}
              <button
                type="submit"
                disabled={savingCoupon}
                className="w-full rounded-lg bg-accent py-2 font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
              >
                {savingCoupon ? "Criando..." : "Criar cupom"}
              </button>
            </form>

            <ul className="space-y-2">
              {coupons.map((coupon) => (
                <li
                  key={coupon.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                >
                  <div>
                    <span className="font-bold text-foreground">{coupon.code}</span>
                    <span className="ml-2 text-sm text-muted">
                      {coupon.type === "percent" ? `${coupon.value}%` : formatPrice(coupon.value)} off
                      {coupon.minOrder > 0 && ` · mín ${formatPrice(coupon.minOrder)}`}
                    </span>
                    <p className="text-xs text-muted">
                      {coupon.usedCount} uso{coupon.usedCount !== 1 ? "s" : ""}
                      {coupon.maxUses !== null ? ` / ${coupon.maxUses}` : " · ilimitado"}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleCoupon(coupon.id, !coupon.active)}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                      coupon.active
                        ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700"
                        : "bg-slate-100 text-slate-400 hover:bg-green-100 hover:text-green-700"
                    }`}
                  >
                    {coupon.active ? "Ativo" : "Inativo"}
                  </button>
                </li>
              ))}
              {coupons.length === 0 && <p className="text-sm text-muted">Nenhum cupom criado ainda.</p>}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
