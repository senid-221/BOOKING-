import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type ServiceRow = {
  id: string;
  name: string;
  monthlyFee: number;
  maxProviders: number;
};

type ProviderRow = {
  id: string;
  fullName: string;
  phone: string;
  serviceId: string;
  service: {
    name: string;
  };
};

export async function GET() {
  const services = await prisma.service.findMany({
    orderBy: { name: "asc" },
  });

  const providers = await prisma.provider.findMany({
    where: { status: "ACTIVE" },
    include: { service: true },
    orderBy: { fullName: "asc" },
  });

  const serviceRows = services as ServiceRow[];
  const providerRows = providers as ProviderRow[];

  return NextResponse.json({
    services: serviceRows.map((service: ServiceRow) => ({
      id: service.id,
      name: service.name,
      monthlyFee: service.monthlyFee,
      maxProviders: service.maxProviders,
      active: providerRows.filter(
        (provider: ProviderRow) => provider.serviceId === service.id,
      ).length,
    })),
    providers: providerRows.map((provider: ProviderRow) => ({
      id: provider.id,
      fullName: provider.fullName,
      phone: provider.phone,
      service: provider.service.name,
    })),
  });
}
