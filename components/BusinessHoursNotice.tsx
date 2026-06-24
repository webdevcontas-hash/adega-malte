"use client";

import { useStoreStatus } from "@/components/StoreStatusProvider";

export default function BusinessHoursNotice() {
  const { open, openingHour, closingHour } = useStoreStatus();

  if (open) return null;

  return (
    <div className="border-b border-red-900/50 bg-red-950/60 px-4 py-2 text-center text-sm font-medium text-red-300">
      Estamos fechados agora. Atendemos das {openingHour}h às {closingHour}h. Você pode navegar, mas o pedido só
      pode ser finalizado dentro do horário de funcionamento.
    </div>
  );
}
