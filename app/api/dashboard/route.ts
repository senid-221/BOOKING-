import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { cookieName, isValidAdminSession } from "@/lib/admin-auth";

const prisma = new PrismaClient();

type ServiceRow = {
  id: string;
  name: string;
  maxProviders: number;
};

type ProviderRow = {
  id: string;
  fullName: string;
  phone: string;
  status: string;
  serviceId: string;
  subscriptionEndsAt: Date | null;
  service: {
    name: string;
  };
};

type PaymentRow = {
  id: string;
  amount: number;
  status: string;
  method: string;
  createdAt: Date;
  provider: {
    fullName: string;
  };
};

export async function GET() {
  try {
    const cookieStore = await cookies();

    if (!isValidAdminSession(cookieStore.get(cookieName)?.value)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      providersCount,
      active,
      blocked,
      pendingPayments,
      revenue,
      rawServices,
      rawProviders,
      rawPayments,
    ] = await Promise.all([
      prisma.provider.count(),
      prisma.provider.count({ where: { status: "ACTIVE" } }),
      prisma.provider.count({ where: { status: "BLOCKED" } }),
      prisma.payment.count({ where: { status: "PENDING" } }),
      prisma.payment.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amount: true },
      }),
      prisma.service.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          maxProviders: true,
        },
      }),
      prisma.provider.findMany({
        take: 30,
        orderBy: { createdAt: "desc" },
        include: { service: true },
      }),
      prisma.payment.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { provider: true },
      }),
    ]);

    const services = rawServices as ServiceRow[];
    const latestProviders = rawProviders as ProviderRow[];
    const latestPayments = rawPayments as PaymentRow[];

    const serviceRows = services.map((service: ServiceRow) => ({
      name: service.name,
      active: latestProviders.filter(
        (provider: ProviderRow) =>
          provider.serviceId === service.id && provider.status === "ACTIVE"
      ).length,
      max: service.maxProviders,
    }));

    return NextResponse.json({
      stats: {
        providers: providersCount,
        active,
        blocked,
        pendingPayments,
        revenue: revenue._sum.amount ?? 0,
      },
      services: serviceRows,
      providers: latestProviders.map((provider: ProviderRow) => ({
        id: provider.id,
        fullName: provider.fullName,
        phone: provider.phone,
        status: provider.status,
        service: provider.service.name,
        subscriptionEndsAt: provider.subscriptionEndsAt,
      })),
      payments: latestPayments.map((payment: PaymentRow) => ({
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        method: payment.method,
        provider: payment.provider.fullName,
        createdAt: payment.createdAt,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Dashboard unavailable" },
      { status: 500 }
    );
  }
}
