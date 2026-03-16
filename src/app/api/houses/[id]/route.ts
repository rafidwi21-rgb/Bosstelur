import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, capacity, currentCount, birdType, birdAge, status, notes } =
      body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (currentCount !== undefined) updateData.currentCount = currentCount;
    if (birdType !== undefined) updateData.birdType = birdType;
    if (birdAge !== undefined) updateData.birdAge = birdAge;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const house = await prisma.poultryHouse.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(house);
  } catch (error) {
    console.error("Update house error:", error);
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

    // Delete related records in transaction for speed
    const taskIds = (await prisma.task.findMany({ where: { houseId: id }, select: { id: true } })).map(t => t.id);
    await prisma.$transaction([
      prisma.feedUsage.deleteMany({ where: { houseId: id } }),
      prisma.eggProduction.deleteMany({ where: { houseId: id } }),
      prisma.taskAssignment.deleteMany({ where: { taskId: { in: taskIds } } }),
      prisma.task.deleteMany({ where: { houseId: id } }),
      prisma.poultryHouse.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: "House deleted successfully" });
  } catch (error) {
    console.error("Delete house error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
