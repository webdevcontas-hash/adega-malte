import { prisma } from "./prisma";

const TIMEZONE = "America/Sao_Paulo";

export function getStoreHour(date: Date = new Date()): number {
  const hourString = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    hour: "numeric",
    hour12: false,
  }).format(date);
  return Number(hourString) % 24;
}

// Lê horários do banco (com fallback para env vars)
async function getHoursFromDB(): Promise<{ open: number; close: number }> {
  const settings = await prisma.setting.findMany({
    where: { key: { in: ["businessHoursOpen", "businessHoursClose"] } },
  });
  const map = Object.fromEntries(settings.map((s) => [s.key, Number(s.value)]));
  return {
    open: map.businessHoursOpen ?? Number(process.env.BUSINESS_HOURS_OPEN ?? 18),
    close: map.businessHoursClose ?? Number(process.env.BUSINESS_HOURS_CLOSE ?? 3),
  };
}

export async function getOpeningHourAsync(): Promise<number> {
  return (await getHoursFromDB()).open;
}

export async function getClosingHourAsync(): Promise<number> {
  return (await getHoursFromDB()).close;
}

export async function isStoreOpenAsync(date: Date = new Date()): Promise<boolean> {
  const hour = getStoreHour(date);
  const { open, close } = await getHoursFromDB();
  if (open === close) return true;
  if (open < close) return hour >= open && hour < close;
  return hour >= open || hour < close;
}

// Versões síncronas mantidas para compatibilidade (leem env vars)
export function getOpeningHour(): number {
  return Number(process.env.BUSINESS_HOURS_OPEN ?? 18);
}

export function getClosingHour(): number {
  return Number(process.env.BUSINESS_HOURS_CLOSE ?? 3);
}

export function isStoreOpen(date: Date = new Date()): boolean {
  const hour = getStoreHour(date);
  const open = getOpeningHour();
  const close = getClosingHour();
  if (open === close) return true;
  if (open < close) return hour >= open && hour < close;
  return hour >= open || hour < close;
}
