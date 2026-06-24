import { prisma } from "./prisma";

const DEFAULT_FEE = 12;

// Síncrona — usada no client para display (fallback sem DB)
export function getDeliveryFee(neighborhood?: string | null): number {
  return DEFAULT_FEE; // client apenas exibe estimativa; servidor recalcula do banco
}

// Assíncrona — usada no servidor (checkout, admin)
export async function getDeliveryFeeAsync(neighborhood?: string | null): Promise<number> {
  const zones = await prisma.deliveryZone.findMany();
  const defaultSetting = await prisma.setting.findUnique({ where: { key: "deliveryDefaultFee" } });
  const defaultFee = defaultSetting ? Number(defaultSetting.value) : DEFAULT_FEE;

  if (!neighborhood || zones.length === 0) return defaultFee;

  const zone = zones.find(
    (z) => z.neighborhood.toLowerCase() === neighborhood.trim().toLowerCase()
  );
  return zone?.fee ?? defaultFee;
}
