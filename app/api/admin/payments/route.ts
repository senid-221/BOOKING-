import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { cookieName, isValidAdminSession } from "@/lib/admin-auth";

const prisma = new PrismaClient();

type PaymentRow = {
  id: string;
  amount: number;
  status: string;
  method: string;
  reference: string | null;
  createdAt: Date;
  paidAt: Date | null;
  provider: {
    fullName: string;
    phone: string;
    service: {
      name: string;
    };
  };
};

export async function GET() {
  const cookieStore = await cookies();

  if (!isValidAdminSession(cookieStore.get(cookieName)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = (await prisma.payment.findMany({
    take: 200,
    orderBy: { createdAt: "desc" },
    include: {
      provider: {
        include: {
          service: true,
        },
      },
    },
  })) as PaymentRow[];

  return NextResponse.json(
    rows.map((payment: PaymentRow) => ({
      id: payment.id,
      amount: payment.amount,
      status: payment.status,
      method: payment.method,
      reference: payment.reference,
      provider: payment.provider.fullName,
      phone: payment.provider.phone,
      service: payment.provider.service.name,
      createdAt: payment.createdAt,
      paidAt: payment.paidAt,
    }))
  );
}
