import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const feedInventory = await prisma.feedInventory.findMany({
      orderBy: { purchaseDate: "desc" },
    });

    // Self-heal: verify each feed item's quantity against actual usage
    // Only for items with a linked expense (so we know the original purchase qty)
    for (const feed of feedInventory) {
      const linkedExpense = await prisma.operationalExpense.findFirst({
        where: { description: { contains: `[ref:${feed.id}]` } },
      });
      if (!linkedExpense) continue; // skip items without known original qty

      const match = linkedExpense.description.match(/- ([\d.]+) /);
      if (!match) continue;
      const originalQty = parseFloat(match[1]);

      const totalUsage = await prisma.feedUsage.aggregate({
        where: { feedId: feed.id },
        _sum: { quantity: true },
      });
      const used = totalUsage._sum.quantity || 0;
      const correctRemaining = Math.max(0, originalQty - used);

      if (Math.abs(feed.quantity - correctRemaining) > 0.01) {
        await prisma.feedInventory.update({
          where: { id: feed.id },
          data: { quantity: correctRemaining },
        });
        feed.quantity = correctRemaining;
      }
    }

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
