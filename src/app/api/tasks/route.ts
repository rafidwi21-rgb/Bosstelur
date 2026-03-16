import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const workerId = searchParams.get("workerId");

    const where: Record<string, unknown> = {};
    if (date) where.assignedDate = new Date(date);
    if (workerId) where.workerId = workerId;

    let assignments = await prisma.taskAssignment.findMany({
      where,
      include: {
        task: {
          select: { title: true, type: true, timeSlot: true, houseId: true, house: { select: { name: true } } },
        },
        worker: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Auto-generate today's tasks if none exist for this worker
    if (assignments.length === 0 && date && workerId) {
      const today = new Date(date);

      // Find all recurring tasks that have this worker assigned on any previous day
      // OR find tasks linked to houses — assign all recurring tasks to this worker
      const recurringTasks = await prisma.task.findMany({
        where: { isRecurring: true },
        include: { house: { select: { name: true } } },
      });

      if (recurringTasks.length > 0) {
        // Check which tasks this worker was previously assigned to
        const previousAssignments = await prisma.taskAssignment.findMany({
          where: { workerId },
          select: { taskId: true },
          distinct: ["taskId"],
        });
        const previousTaskIds = previousAssignments.map(a => a.taskId);

        // If worker had previous assignments, only generate those same tasks
        // Otherwise, don't auto-assign (admin needs to assign first)
        if (previousTaskIds.length > 0) {
          const tasksToAssign = recurringTasks.filter(t => previousTaskIds.includes(t.id));

          for (const task of tasksToAssign) {
            try {
              await prisma.taskAssignment.create({
                data: {
                  taskId: task.id,
                  workerId,
                  assignedDate: today,
                  status: "PENDING",
                },
              });
            } catch {
              // Unique constraint violation — already exists, skip
            }
          }

          // Re-fetch after creation
          assignments = await prisma.taskAssignment.findMany({
            where,
            include: {
              task: {
                select: { title: true, type: true, timeSlot: true, houseId: true, house: { select: { name: true } } },
              },
              worker: { select: { name: true } },
            },
            orderBy: { createdAt: "asc" },
          });
        }
      }
    }

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Get task assignments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, workerId, assignedDate } = body;

    if (!taskId || !workerId || !assignedDate) {
      return NextResponse.json({ error: "taskId, workerId, and assignedDate are required" }, { status: 400 });
    }

    const assignment = await prisma.taskAssignment.create({
      data: { taskId, workerId, assignedDate: new Date(assignedDate) },
      include: {
        task: {
          select: { title: true, type: true, timeSlot: true, houseId: true, house: { select: { name: true } } },
        },
        worker: { select: { name: true } },
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("Create task assignment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
