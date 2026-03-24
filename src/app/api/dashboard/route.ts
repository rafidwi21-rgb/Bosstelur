import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const todayDate = new Date(today);

    const yesterday = new Date(todayDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    const yesterdayDate = new Date(yesterdayStr);

    const monthStart = new Date(
      todayDate.getFullYear(),
      todayDate.getMonth(),
      1
    );
    const monthEnd = new Date(
      todayDate.getFullYear(),
      todayDate.getMonth() + 1,
      0
    );

    // Total chickens
    const houses = await prisma.poultryHouse.findMany({
      where: { status: "ACTIVE" },
    });
    const totalChickens = houses.reduce(
      (sum, h) => sum + h.currentCount,
      0
    );

    // Today's egg production
    const eggsToday = await prisma.eggProduction.findMany({
      where: { date: todayDate },
    });
    const eggsTodayKg = eggsToday.reduce((sum, e) => sum + e.totalKg, 0);
    const eggsTodayUnit = eggsToday.reduce((sum, e) => sum + e.totalUnit, 0);

    // Yesterday's egg production
    const eggsYesterday = await prisma.eggProduction.findMany({
      where: { date: yesterdayDate },
    });
    const eggsYesterdayKg = eggsYesterday.reduce(
      (sum, e) => sum + e.totalKg,
      0
    );

    // Workers present today (checked in)
    const todayStart = new Date(`${today}T00:00:00.000Z`);
    const todayEnd = new Date(`${today}T23:59:59.999Z`);

    const checkInsToday = await prisma.attendance.findMany({
      where: {
        type: "CHECK_IN",
        timestamp: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      distinct: ["userId"],
    });
    const workersPresent = checkInsToday.length;

    // Total workers
    const totalWorkers = await prisma.user.count({
      where: { role: "WORKER", isActive: true },
    });

    // Feed stock
    const feedInventory = await prisma.feedInventory.findMany();
    const feedStock = feedInventory.reduce((sum, f) => sum + f.quantity, 0);

    // Feed used today
    const feedUsedToday = await prisma.feedUsage.findMany({
      where: { date: todayDate },
    });
    const feedUsedTodayTotal = feedUsedToday.reduce(
      (sum, f) => sum + f.quantity,
      0
    );

    // Today's revenue
    const salesToday = await prisma.eggSale.findMany({
      where: { date: todayDate },
    });
    const todaysRevenue = salesToday.reduce(
      (sum, s) => sum + s.totalAmount,
      0
    );

    // Monthly revenue
    const monthlySales = await prisma.eggSale.findMany({
      where: {
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });
    const monthlyRevenue = monthlySales.reduce(
      (sum, s) => sum + s.totalAmount,
      0
    );

    // Monthly expenses = operational expenses + feed usage cost
    const monthlyExpenseRecords = await prisma.operationalExpense.findMany({
      where: {
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    });
    const monthlyOperationalExpenses = monthlyExpenseRecords.reduce(
      (sum, e) => sum + e.amount,
      0
    );

    // Feed usage cost for the month
    const monthlyFeedUsages = await prisma.feedUsage.findMany({
      where: {
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      include: {
        feed: {
          select: { costPerUnit: true },
        },
      },
    });
    const monthlyFeedCost = monthlyFeedUsages.reduce(
      (sum, u) => sum + u.quantity * (u.feed?.costPerUnit || 0),
      0
    );

    const monthlyExpenses = monthlyOperationalExpenses + monthlyFeedCost;

    // Active houses with today's production
    const activeHouses = await prisma.poultryHouse.findMany({
      where: { status: "ACTIVE" },
      include: {
        eggProductions: {
          where: { date: todayDate },
        },
      },
    });

    // Recent check-ins
    const recentCheckIns = await prisma.attendance.findMany({
      where: {
        type: "CHECK_IN",
        timestamp: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { timestamp: "desc" },
    });

    // Egg chart data (last 14 days)
    const fourteenDaysAgo = new Date(todayDate);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);

    const eggProductions14 = await prisma.eggProduction.findMany({
      where: {
        date: {
          gte: fourteenDaysAgo,
          lte: todayDate,
        },
      },
    });

    const eggChartData: { date: string; totalKg: number; totalUnit: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(fourteenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const dayProductions = eggProductions14.filter(
        (e) => e.date.toISOString().split("T")[0] === dateStr
      );
      eggChartData.push({
        date: dateStr,
        totalKg: dayProductions.reduce((sum, e) => sum + e.totalKg, 0),
        totalUnit: dayProductions.reduce((sum, e) => sum + e.totalUnit, 0),
      });
    }

    // Feed chart data (last 14 days)
    const feedUsages14 = await prisma.feedUsage.findMany({
      where: {
        date: {
          gte: fourteenDaysAgo,
          lte: todayDate,
        },
      },
    });

    const feedChartData: { date: string; quantity: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(fourteenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const dayUsages = feedUsages14.filter(
        (f) => f.date.toISOString().split("T")[0] === dateStr
      );
      feedChartData.push({
        date: dateStr,
        quantity: dayUsages.reduce((sum, f) => sum + f.quantity, 0),
      });
    }

    const totalCapacity = houses.reduce((sum, h) => sum + h.capacity, 0);

    return NextResponse.json({
      totalChickens,
      totalCapacity,
      eggsTodayKg,
      eggsTodayUnit,
      eggsYesterdayKg,
      workersPresent,
      totalWorkers,
      feedStock,
      feedUsedToday: feedUsedTodayTotal,
      todaysRevenue,
      monthlyRevenue,
      monthlyExpenses,
      activeHouses,
      recentCheckIns,
      eggChartData,
      feedChartData,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
