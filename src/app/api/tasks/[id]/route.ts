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
      status,
      startedAt,
      completedAt,
      feedQuantity,
      eggsKg,
      eggsUnit,
      eggsBrokenUnit,
      waterStatus,
      notes,
    } = body;

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) updateData.status = status;
    if (startedAt !== undefined)
      updateData.startedAt = startedAt ? new Date(startedAt) : null;
    if (completedAt !== undefined)
      updateData.completedAt = completedAt ? new Date(completedAt) : null;
    if (feedQuantity !== undefined) updateData.feedQuantity = feedQuantity;
    if (eggsKg !== undefined) updateData.eggsKg = eggsKg;
    if (eggsUnit !== undefined) updateData.eggsUnit = eggsUnit;
    if (eggsBrokenUnit !== undefined) updateData.eggsBrokenUnit = eggsBrokenUnit;
    if (waterStatus !== undefined) updateData.waterStatus = waterStatus;
    if (notes !== undefined) updateData.notes = notes;

    const assignment = await prisma.taskAssignment.update({
      where: { id },
      data: updateData,
      include: {
        task: {
          select: {
            title: true,
            type: true,
            timeSlot: true,
            house: {
              select: { name: true },
            },
          },
        },
        worker: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Update task assignment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
