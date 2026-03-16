import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const workerId = searchParams.get("workerId");

    const where: Record<string, unknown> = {};

    if (date) {
      where.assignedDate = new Date(date);
    }

    if (workerId) {
      where.workerId = workerId;
    }

    const assignments = await prisma.taskAssignment.findMany({
      where,
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Get task assignments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, workerId, assignedDate } = body;

    if (!taskId || !workerId || !assignedDate) {
      return NextResponse.json(
        { error: "taskId, workerId, and assignedDate are required" },
        { status: 400 }
      );
    }

    const assignment = await prisma.taskAssignment.create({
      data: {
        taskId,
        workerId,
        assignedDate: new Date(assignedDate),
      },
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

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("Create task assignment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
