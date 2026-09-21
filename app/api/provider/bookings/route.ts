import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { getProviderId, providerCookieName } from "@/lib/provider-auth";

const prisma = new PrismaClient();

type ProviderBookingRow = {
  id: string;
  customerName: string;
  phone: string;
  date: string | null;
  time: string | null;
  location: string | null;
  status: string;
  service: { name: string };
};

export async function GET() {
  const c = await cookies();
  const providerId = getProviderId(c.get(providerCookieName)?.value);

  if (!providerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.booking.findMany({
    where: { providerId },
    orderBy: { createdAt: "desc" },
    include: { service: true },
    take: 100,
  });

  const bookings = rows as ProviderBookingRow[];

  return NextResponse.json(
    bookings.map((booking: ProviderBookingRow) => ({
      id: booking.id,
      customerName: booking.customerName,
      phone: booking.phone,
      date: booking.date,
      time: booking.time,
      location: booking.location,
      status: booking.status,
      service: booking.service.name,
    })),
  );
}
