import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" });
    const todayDate = new Date(today);

    const yesterday = new Date(todayDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    const yesterdayDate = new Date(yesterdayStr);

    // Use WIB-aware dates for month range (dates stored as @db.Date are UTC midnight)
    const monthStart = new Date(`${today.slice(0, 7)}-01`);
    const lastDay = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0).getDate();
    const monthEnd = new Date(`${today.slice(0, 7)}-${String(lastDay).padStart(2, "0")}`);

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
    const todayStart = new Date(`${today}T00:00:00+07:00`);
    const todayEnd = new Date(`${today}T23:59:59.999+07:00`);

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

    // Feed stock — quantity is kept accurate by $transaction decrement in feed usage API
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
      where: { date: { gte: monthStart, lte: monthEnd } },
    });
    const monthlyRevenue = monthlySales.reduce((sum, s) => sum + s.totalAmount, 0);

    // Auto-generate salary expenses on the 25th (or after) if not already created this month
    const todayDay = todayDate.getDate();
    if (todayDay >= 25) {
      const salaryTag = `[salary-auto:${today.slice(0, 7)}]`;
      const existingSalaryExpense = await prisma.operationalExpense.findFirst({
        where: { description: { contains: salaryTag } },
      });
      if (!existingSalaryExpense) {
        const activeWorkers = await prisma.user.findMany({
          where: { role: "WORKER", isActive: true },
          select: { id: true, name: true, salary: true },
        });
        const salaryDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), 25);
        const monthLabel = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(salaryDate);
        for (const w of activeWorkers) {
          if (w.salary && w.salary > 0) {
            await prisma.operationalExpense.create({
              data: {
                category: "Gaji",
                description: `Gaji ${w.name} - ${monthLabel} ${salaryTag}`,
                amount: w.salary,
                date: salaryDate,
                vendor: null,
              },
            });
          }
        }
      }
    }

    // Monthly expenses: OperationalExpense + unlinked feed purchases
    const monthlyExpenseRecords = await prisma.operationalExpense.findMany({
      where: { date: { gte: monthStart, lte: monthEnd } },
    });
    const operationalTotal = monthlyExpenseRecords.reduce((sum, e) => sum + e.amount, 0);

    const monthlyFeedPurchases = await prisma.feedInventory.findMany({
      where: { purchaseDate: { gte: monthStart, lte: monthEnd } },
    });
    const linkedFeedIds = new Set(
      monthlyExpenseRecords
        .map(e => { const m = e.description.match(/\[ref:([^\]]+)\]/); return m ? m[1] : null; })
        .filter(Boolean)
    );
    const unlinkedFeedCost = monthlyFeedPurchases
      .filter(f => !linkedFeedIds.has(f.id))
      .reduce((sum, f) => sum + (f.initialQuantity || f.quantity) * f.costPerUnit, 0);

    const monthlyExpenses = operationalTotal + unlinkedFeedCost;

    // Expense breakdown by category
    const expenseByCategory: Record<string, number> = {};
    for (const e of monthlyExpenseRecords) {
      expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount;
    }
    if (unlinkedFeedCost > 0) {
      expenseByCategory["Pakan"] = (expenseByCategory["Pakan"] || 0) + unlinkedFeedCost;
    }

    // Net profit
    const netProfit = monthlyRevenue - monthlyExpenses;

    // Feed stock estimation: days left based on avg daily usage (last 14 days)
    const last14Days = new Date(todayDate);
    last14Days.setDate(last14Days.getDate() - 13);
    const recentFeedUsages = await prisma.feedUsage.findMany({
      where: { date: { gte: last14Days, lte: todayDate } },
    });
    const totalRecentUsage = recentFeedUsages.reduce((s, f) => s + f.quantity, 0);
    const daysWithUsage = new Set(recentFeedUsages.map(f => f.date.toISOString().split("T")[0])).size;
    const avgDailyUsage = daysWithUsage > 0 ? totalRecentUsage / daysWithUsage : 0;
    const feedStockDaysLeft = avgDailyUsage > 0 ? Math.floor(feedStock / avgDailyUsage) : feedStock > 0 ? 999 : 0;

    // Low stock feeds (< 50kg remaining)
    const lowStockFeeds = feedInventory
      .filter(f => f.quantity < 50)
      .map(f => ({ id: f.id, feedType: f.feedType, quantity: f.quantity, unit: f.unit }));

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

    // Monthly egg totals
    const monthlyEggs = await prisma.eggProduction.findMany({
      where: { date: { gte: monthStart, lte: monthEnd } },
    });
    const eggsMonthlyGoodUnit = monthlyEggs.reduce((sum, e) => sum + e.goodUnit, 0);
    const eggsMonthlyKg = monthlyEggs.reduce((sum, e) => sum + e.goodKg, 0);
    const eggsBrokenMonthly = monthlyEggs.reduce((sum, e) => sum + e.brokenUnit, 0);

    // Feed stock in karung (1 karung = 50 kg)
    const feedStockKarung = Math.floor(feedStock / 50);
    const feedStockSisa = Math.round(feedStock % 50);

    // Feed initial purchase total
    const feedInitialTotal = feedInventory.reduce((sum, f) => sum + (f.initialQuantity || f.quantity), 0);
    const feedTotalUsed = feedInitialTotal - feedStock;

    return NextResponse.json({
      totalChickens,
      totalCapacity,
      eggsTodayKg,
      eggsTodayUnit,
      eggsYesterdayKg,
      eggsMonthlyUnit: eggsMonthlyGoodUnit,
      eggsMonthlyKg,
      eggsBrokenMonthly,
      workersPresent,
      totalWorkers,
      feedStock,
      feedStockKarung,
      feedStockSisa,
      feedInitialTotal,
      feedTotalUsed,
      feedUsedToday: feedUsedTodayTotal,
      avgDailyUsage: Math.round(avgDailyUsage),
      feedStockDaysLeft,
      lowStockFeeds,
      todaysRevenue,
      monthlyRevenue,
      monthlyExpenses,
      expenseByCategory,
      netProfit,
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
