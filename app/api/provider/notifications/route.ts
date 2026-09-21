import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { getProviderId, providerCookieName } from "@/lib/provider-auth";

const prisma = new PrismaClient();

type ProviderNotificationRow = {
  id: string;
  read: boolean;
  createdAt: Date;
  notification: {
    title: string;
    message: string;
  };
};

export async function GET() {
  const c = await cookies();
  const providerId = getProviderId(c.get(providerCookieName)?.value);

  if (!providerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.notificationRecipient.findMany({
    where: { providerId },
    include: { notification: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const notifications = rows as ProviderNotificationRow[];

  return NextResponse.json(
    notifications.map((notification: ProviderNotificationRow) => ({
      id: notification.id,
      title: notification.notification.title,
      message: notification.notification.message,
      read: notification.read,
      createdAt: notification.createdAt,
    })),
  );
}
