import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const feedInventory = await prisma.feedInventory.findMany({
      orderBy: { purchaseDate: "desc" },
    });

    return NextResponse.json(feedInventory);
  } catch (error) {
    console.error("Get feed inventory error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const quantity = body.quantity;
    const costPerUnit = body.costPerUnit;
    const totalCost = quantity * costPerUnit;
    const purchaseDate = new Date(body.purchaseDate);

    const feed = await prisma.feedInventory.create({
      data: {
        feedType: body.feedType,
        quantity,
        unit: body.unit || "kg",
        costPerUnit,
        supplier: body.supplier || null,
        purchaseDate,
      },
    });

    // Auto-create operational expense for feed purchase
    if (totalCost > 0) {
      await prisma.operationalExpense.create({
        data: {
          category: "Pakan",
          description: `Pembelian ${body.feedType} - ${quantity} ${body.unit || "kg"} [ref:${feed.id}]`,
          amount: totalCost,
          date: purchaseDate,
          vendor: body.supplier || null,
        },
      });
    }

    return NextResponse.json(feed, { status: 201 });
  } catch (error) {
    console.error("Create feed error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
