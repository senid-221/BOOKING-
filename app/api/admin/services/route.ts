import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { cookieName, isValidAdminSession } from "@/lib/admin-auth";

const prisma = new PrismaClient();

type ServiceRow = {
  id: string;
  name: string;
  monthlyFee: number;
  maxProviders: number;
};

type ProviderRow = {
  serviceId: string;
  status: string;
};

export async function GET() {
  const cookieStore = await cookies();

  if (!isValidAdminSession(cookieStore.get(cookieName)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [rawServices, rawProviders] = await Promise.all([
    prisma.service.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        monthlyFee: true,
        maxProviders: true,
      },
    }),
    prisma.provider.findMany({
      select: {
        serviceId: true,
        status: true,
      },
    }),
  ]);

  const services = rawServices as ServiceRow[];
  const providers = rawProviders as ProviderRow[];

  return NextResponse.json(
    services.map((service: ServiceRow) => {
      const serviceProviders = providers.filter(
        (provider: ProviderRow) => provider.serviceId === service.id
      );

      return {
        id: service.id,
        name: service.name,
        monthlyFee: service.monthlyFee,
        maxProviders: service.maxProviders,
        active: serviceProviders.filter(
          (provider: ProviderRow) => provider.status === "ACTIVE"
        ).length,
        blocked: serviceProviders.filter(
          (provider: ProviderRow) => provider.status === "BLOCKED"
        ).length,
        pending: serviceProviders.filter(
          (provider: ProviderRow) => provider.status === "PENDING"
        ).length,
      };
    })
  );
}
