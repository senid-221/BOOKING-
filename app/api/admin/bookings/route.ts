import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { cookieName, isValidAdminSession } from "@/lib/admin-auth";

const prisma = new PrismaClient();

type BookingRow = {
  id: string;
  customerName: string;
  phone: string;
  serviceId: string;
  date: string | null;
  time: string | null;
  location: string | null;
  status: string;
  createdAt: Date;
  service: {
    name: string;
  };
  provider: {
    id: string;
    fullName: string;
    phone: string;
  } | null;
};

export async function GET() {
  const cookieStore = await cookies();

  if (!isValidAdminSession(cookieStore.get(cookieName)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = (await prisma.booking.findMany({
    take: 200,
    orderBy: { createdAt: "desc" },
    include: {
      service: true,
      provider: {
        select: {
          id: true,
          fullName: true,
          phone: true,
        },
      },
    },
  })) as BookingRow[];

  return NextResponse.json(
    rows.map((booking: BookingRow) => ({
      id: booking.id,
      customerName: booking.customerName,
      phone: booking.phone,
      service: booking.service.name,
      serviceId: booking.serviceId,
      provider: booking.provider,
      date: booking.date,
      time: booking.time,
      location: booking.location,
      status: booking.status,
      createdAt: booking.createdAt,
    }))
  );
}
