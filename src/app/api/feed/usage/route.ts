import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Record<string, unknown> = {};

    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.gte = new Date(from);
      if (to) dateFilter.lte = new Date(to);
      where.date = dateFilter;
    }

    const usages = await prisma.feedUsage.findMany({
      where,
      include: {
        feed: {
          select: { feedType: true },
        },
        house: {
          select: { name: true },
        },
        worker: {
          select: { name: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(usages);
  } catch (error) {
    console.error("Get feed usage error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { feedId, houseId, usedBy, date, quantity } = body;

    if (!feedId || !houseId || !usedBy || !date || quantity === undefined) {
      return NextResponse.json(
        { error: "feedId, houseId, usedBy, date, and quantity are required" },
        { status: 400 }
      );
    }

    // Create usage record and decrease inventory quantity
    const [usage] = await prisma.$transaction([
      prisma.feedUsage.create({
        data: {
          feedId,
          houseId,
          usedBy,
          date: new Date(date),
          quantity,
        },
        include: {
          feed: {
            select: { feedType: true },
          },
          house: {
            select: { name: true },
          },
          worker: {
            select: { name: true },
          },
        },
      }),
      prisma.feedInventory.update({
        where: { id: feedId },
        data: { quantity: { decrement: quantity } },
      }),
    ]);

    return NextResponse.json(usage, { status: 201 });
  } catch (error) {
    console.error("Create feed usage error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
