import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { cookieName, isValidAdminSession } from "@/lib/admin-auth";

const prisma = new PrismaClient();

type ProviderIdRow = {
  id: string;
};

type Audience = "ALL_PROVIDERS" | "ACTIVE_PROVIDERS" | "BLOCKED_PROVIDERS";

export async function GET() {
  const cookieStore = await cookies();

  if (!isValidAdminSession(cookieStore.get(cookieName)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.notification.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const cookieStore = await cookies();

  if (!isValidAdminSession(cookieStore.get(cookieName)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const audience = body.audience as Audience;

  if (!title || !message || !audience) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  const providerWhere =
    audience === "ALL_PROVIDERS"
      ? {}
      : audience === "ACTIVE_PROVIDERS"
        ? { status: "ACTIVE" as const }
        : { status: "BLOCKED" as const };

  const providerRows = (await prisma.provider.findMany({
    where: providerWhere,
    select: { id: true },
  })) as ProviderIdRow[];

  const row = await prisma.notification.create({
    data: {
      title,
      message,
      audience,
      recipients: {
        create: providerRows.map((provider: ProviderIdRow) => ({
          providerId: provider.id,
        })),
      },
    },
  });

  return NextResponse.json(row);
}
