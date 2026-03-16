import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const houses = await prisma.poultryHouse.findMany({
      include: {
        _count: {
          select: { eggProductions: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(houses);
  } catch (error) {
    console.error("Get houses error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, capacity, currentCount, birdType, birdAge, status, notes } =
      body;

    if (!name || !capacity) {
      return NextResponse.json(
        { error: "Name and capacity are required" },
        { status: 400 }
      );
    }

    const house = await prisma.poultryHouse.create({
      data: {
        name,
        capacity,
        currentCount: currentCount || 0,
        birdType: birdType || "Layer",
        birdAge,
        status: status || "ACTIVE",
        notes,
      },
    });

    return NextResponse.json(house, { status: 201 });
  } catch (error) {
    console.error("Create house error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
