import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const houseId = searchParams.get("houseId");

    const where: Record<string, unknown> = {};

    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.gte = new Date(from);
      if (to) dateFilter.lte = new Date(to);
      where.date = dateFilter;
    }

    if (houseId) {
      where.houseId = houseId;
    }

    const productions = await prisma.eggProduction.findMany({
      where,
      include: {
        house: {
          select: { name: true },
        },
        collector: {
          select: { name: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(productions);
  } catch (error) {
    console.error("Get production error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      houseId,
      collectedBy,
      date,
      totalKg,
      totalUnit,
      brokenKg,
      brokenUnit,
      goodKg,
      goodUnit,
    } = body;

    if (!houseId || !collectedBy || !date) {
      return NextResponse.json(
        { error: "houseId, collectedBy, and date are required" },
        { status: 400 }
      );
    }

    const production = await prisma.eggProduction.create({
      data: {
        houseId,
        collectedBy,
        date: new Date(date),
        totalKg: totalKg || 0,
        totalUnit: totalUnit || 0,
        brokenKg: brokenKg || 0,
        brokenUnit: brokenUnit || 0,
        goodKg: goodKg || 0,
        goodUnit: goodUnit || 0,
      },
      include: {
        house: {
          select: { name: true },
        },
        collector: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(production, { status: 201 });
  } catch (error) {
    console.error("Create production error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
