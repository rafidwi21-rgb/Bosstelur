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
    const feed = await prisma.feedInventory.create({
      data: {
        feedType: body.feedType,
        quantity: body.quantity,
        unit: body.unit || "kg",
        costPerUnit: body.costPerUnit,
        supplier: body.supplier || null,
        purchaseDate: new Date(body.purchaseDate),
      },
    });
    return NextResponse.json(feed, { status: 201 });
  } catch (error) {
    console.error("Create feed error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
