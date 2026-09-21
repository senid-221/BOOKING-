import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { getProviderId, providerCookieName } from "@/lib/provider-auth";
import { getPaymentStatus } from "@/lib/momo";

const prisma = new PrismaClient();

type ProviderWithService = {
  id: string;
  serviceId: string;
  status: string;
  subscriptionEndsAt: Date | null;
  service: {
    maxProviders: number;
  };
};

type PaymentWithProvider = {
  id: string;
  providerId: string;
  reference: string | null;
  provider: ProviderWithService;
};

type MoMoStatusResponse = {
  status?: string;
};

export async function POST(req: Request) {
  const c = await cookies();
  const id = getProviderId(c.get(providerCookieName)?.value);

  if (!id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { paymentId } = await req.json();

    const rawPayment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { provider: { include: { service: true } } },
    });

    if (!rawPayment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const payment = rawPayment as PaymentWithProvider;

    if (payment.providerId !== id) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (!payment.reference) {
      return NextResponse.json(
        { error: "Payment reference missing" },
        { status: 409 },
      );
    }

    const m = (await getPaymentStatus(payment.reference)) as MoMoStatusResponse;
    const s = String(m.status ?? "").toUpperCase();

    if (s === "SUCCESSFUL" || s === "SUCCESS") {
      const p = payment.provider;
      const now = new Date();
      const base =
        p.subscriptionEndsAt && p.subscriptionEndsAt > now
          ? p.subscriptionEndsAt
          : now;

      const end = new Date(base);
      end.setMonth(end.getMonth() + 1);

      const activeCount = await prisma.provider.count({
        where: {
          serviceId: p.serviceId,
          status: "ACTIVE",
          id: { not: p.id },
        },
      });

      if (p.status !== "ACTIVE" && activeCount >= p.service.maxProviders) {
        return NextResponse.json(
          {
            error:
              "Service already has 5 active providers. Payment succeeded but provider remains blocked until a slot opens.",
          },
          { status: 409 },
        );
      }

      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCESS",
            paidAt: new Date(),
          },
        }),
        prisma.provider.update({
          where: { id: p.id },
          data: {
            status: "ACTIVE",
            subscriptionEndsAt: end,
          },
        }),
      ]);

      return NextResponse.json({
        status: "SUCCESS",
        subscriptionEndsAt: end,
      });
    }

    if (["FAILED", "REJECTED", "CANCELLED"].includes(s)) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });

      return NextResponse.json({ status: "FAILED" });
    }

    return NextResponse.json({ status: "PENDING" });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Unable to verify renewal" },
      { status: 500 },
    );
  }
}
