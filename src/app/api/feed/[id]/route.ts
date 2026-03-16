import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data: Record<string, unknown> = {};
    if (body.feedType !== undefined) data.feedType = body.feedType;
    if (body.quantity !== undefined) data.quantity = body.quantity;
    if (body.unit !== undefined) data.unit = body.unit;
    if (body.costPerUnit !== undefined) data.costPerUnit = body.costPerUnit;
    if (body.supplier !== undefined) data.supplier = body.supplier;
    if (body.purchaseDate !== undefined) data.purchaseDate = new Date(body.purchaseDate);

    const feed = await prisma.feedInventory.update({ where: { id }, data });
    return NextResponse.json(feed);
  } catch (error) {
    console.error("Update feed error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.feedUsage.deleteMany({ where: { feedId: id } });
    await prisma.feedInventory.delete({ where: { id } });
    return NextResponse.json({ message: "Feed deleted" });
  } catch (error) {
    console.error("Delete feed error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
