import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// One-time fix: recalculate all feed inventory quantities from original purchase - total usage
export async function POST() {
  try {
    const feedInventory = await prisma.feedInventory.findMany();
    const fixes: { id: string; feedType: string; oldQty: number; newQty: number }[] = [];

    for (const feed of feedInventory) {
      // Find original purchase quantity from linked expense
      const linkedExpense = await prisma.operationalExpense.findFirst({
        where: { description: { contains: `[ref:${feed.id}]` } },
      });

      let originalQty: number | null = null;
      if (linkedExpense) {
        const match = linkedExpense.description.match(/- ([\d.]+) /);
        if (match) originalQty = parseFloat(match[1]);
      }

      if (originalQty === null) continue; // skip items without known original

      // Get total usage for this feed item
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
        fixes.push({
          id: feed.id,
          feedType: feed.feedType,
          oldQty: feed.quantity,
          newQty: correctRemaining,
        });
      }
    }

    return NextResponse.json({
      message: `Fixed ${fixes.length} feed items`,
      fixes,
    });
  } catch (error) {
    console.error("Feed fix error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
