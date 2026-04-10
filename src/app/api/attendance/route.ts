import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const userId = searchParams.get("userId");

    const where: Record<string, unknown> = {};

    if (date) {
      // WIB is UTC+7, so WIB midnight = UTC 17:00 previous day
      const startOfDay = new Date(`${date}T00:00:00+07:00`);
      const endOfDay = new Date(`${date}T23:59:59.999+07:00`);
      where.timestamp = { gte: startOfDay, lte: endOfDay };
    } else if (from || to) {
      const tsFilter: Record<string, Date> = {};
      if (from) tsFilter.gte = new Date(`${from}T00:00:00+07:00`);
      if (to) tsFilter.lte = new Date(`${to}T23:59:59.999+07:00`);
      where.timestamp = tsFilter;
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

    // Prevent duplicate: check if same type already exists for this user today
    const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" });
    const startOfDay = new Date(`${today}T00:00:00+07:00`);
    const endOfDay = new Date(`${today}T23:59:59.999+07:00`);

    const existing = await prisma.attendance.findFirst({
      where: {
        userId,
        type: type as "CHECK_IN" | "CHECK_OUT",
        timestamp: { gte: startOfDay, lte: endOfDay },
      },
      include: { user: { select: { name: true } } },
    });

    if (existing) {
      // Already exists, update timestamp instead of creating duplicate
      const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: { timestamp: new Date() },
        include: { user: { select: { name: true } } },
      });
      return NextResponse.json(updated);
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

    const startOfDay = new Date(`${date}T00:00:00+07:00`);
    const endOfDay = new Date(`${date}T23:59:59.999+07:00`);

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
