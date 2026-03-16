import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const userId = searchParams.get("userId");

    const where: Record<string, unknown> = {};

    if (date) {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);
      where.timestamp = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (userId) {
      where.userId = userId;
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json(attendances);
  } catch (error) {
    console.error("Get attendance error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type } = body;

    if (!userId || !type) {
      return NextResponse.json(
        { error: "userId and type are required" },
        { status: 400 }
      );
    }

    const attendance = await prisma.attendance.create({
      data: {
        userId,
        type,
      },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    console.error("Create attendance error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");
    const date = searchParams.get("date");

    if (!userId || !type || !date) {
      return NextResponse.json(
        { error: "userId, type, and date are required" },
        { status: 400 }
      );
    }

    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const record = await prisma.attendance.findFirst({
      where: {
        userId,
        type: type as "CHECK_IN" | "CHECK_OUT",
        timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      );
    }

    await prisma.attendance.delete({
      where: { id: record.id },
    });

    return NextResponse.json({ message: "Attendance record deleted successfully" });
  } catch (error) {
    console.error("Delete attendance error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
