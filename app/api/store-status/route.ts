import { NextResponse } from "next/server";
import { getClosingHourAsync, getOpeningHourAsync, isStoreOpenAsync } from "@/lib/business-hours";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [open, openingHour, closingHour, setting] = await Promise.all([
    isStoreOpenAsync(),
    getOpeningHourAsync(),
    getClosingHourAsync(),
    prisma.setting.findUnique({ where: { key: "deliveryTime" } }),
  ]);
  return NextResponse.json({ open, openingHour, closingHour, deliveryTime: setting?.value ?? "" });
}
