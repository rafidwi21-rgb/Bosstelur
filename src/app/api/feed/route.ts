import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const feedInventory = await prisma.feedInventory.findMany({
      orderBy: { purchaseDate: "desc" },
      include: {
        usages: {
          select: { quantity: true, timeSlot: true, date: true },
        },
      },
    });

    // Calculate totalUsed per inventory item
    const result = feedInventory.map((f) => {
      const totalUsed = f.usages.reduce((sum, u) => sum + u.quantity, 0);
      return {
        ...f,
        initialQuantity: f.initialQuantity || (f.quantity + totalUsed),
        totalUsed,
        usages: undefined,
      };
    });

    return NextResponse.json(result);
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
        initialQuantity: quantity,
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

    return NextResponse.json({ ...feed, initialQuantity: quantity, totalUsed: 0 }, { status: 201 });
  } catch (error) {
    console.error("Create feed error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
