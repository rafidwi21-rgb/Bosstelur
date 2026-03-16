import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const recordedBy = searchParams.get("recordedBy");

    const where: Record<string, unknown> = {};

    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.gte = new Date(from);
      if (to) dateFilter.lte = new Date(to);
      where.date = dateFilter;
    }

    if (recordedBy) {
      where.recordedBy = recordedBy;
    }

    const sales = await prisma.eggSale.findMany({
      where,
      include: {
        recorder: {
          select: { name: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error("Get sales error:", error);
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
      date,
      quantity,
      pricePerUnit,
      unit,
      totalAmount,
      paymentMethod,
      isPaid,
      recordedBy,
      buyerName,
    } = body;

    if (!date || !quantity || !pricePerUnit || !totalAmount || !recordedBy) {
      return NextResponse.json(
        { error: "date, quantity, pricePerUnit, totalAmount, and recordedBy are required" },
        { status: 400 }
      );
    }

    const sale = await prisma.eggSale.create({
      data: {
        date: new Date(date),
        quantity,
        pricePerUnit,
        unit: unit || "kg",
        totalAmount,
        paymentMethod: paymentMethod || "TUNAI",
        isPaid: isPaid ?? true,
        recordedBy,
        buyerName: buyerName || "-",
      },
      include: {
        recorder: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error("Create sale error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
