import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      notes,
    } = body;

    const updateData: Record<string, unknown> = {};
    if (date !== undefined) updateData.date = new Date(date);
    if (quantity !== undefined) updateData.quantity = quantity;
    if (pricePerUnit !== undefined) updateData.pricePerUnit = pricePerUnit;
    if (unit !== undefined) updateData.unit = unit;
    if (totalAmount !== undefined) updateData.totalAmount = totalAmount;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (isPaid !== undefined) updateData.isPaid = isPaid;
    if (recordedBy !== undefined) updateData.recordedBy = recordedBy;
    if (buyerName !== undefined) updateData.buyerName = buyerName;
    if (notes !== undefined) updateData.notes = notes;

    const sale = await prisma.eggSale.update({
      where: { id },
      data: updateData,
      include: {
        recorder: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(sale);
  } catch (error) {
    console.error("Update sale error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.eggSale.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Sale deleted successfully" });
  } catch (error) {
    console.error("Delete sale error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
