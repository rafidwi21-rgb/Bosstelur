"use client";

import { useMemo, useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Egg, Users, Wheat, DollarSign, TrendingUp, TrendingDown, Home, ArrowUpRight, ArrowDownRight, Activity, AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";

const EggChart = dynamic(
  () => import("recharts").then((mod) => {
    const { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } = mod;
    return {
      default: ({ data }: { data: { date: string; kg: number; pcs: number }[] }) => (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gKg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gPcs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#525252" }} stroke="transparent" />
            <YAxis yAxisId="kg" tick={{ fontSize: 10, fill: "#525252" }} stroke="transparent" />
            <YAxis yAxisId="pcs" orientation="right" tick={{ fontSize: 10, fill: "#525252" }} stroke="transparent" />
            <Tooltip contentStyle={{ backgroundColor: "#141414", border: "1px solid #262626", borderRadius: 12, color: "#e5e5e5", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#525252", paddingTop: 8 }} />
            <Area yAxisId="kg" type="monotone" dataKey="kg" name="Berat (kg)" stroke="#22c55e" strokeWidth={2} fill="url(#gKg)" />
            <Area yAxisId="pcs" type="monotone" dataKey="pcs" name="Jumlah (butir)" stroke="#3b82f6" strokeWidth={2} fill="url(#gPcs)" />
          </AreaChart>
        </ResponsiveContainer>
      ),
    };
  }),
  { ssr: false, loading: () => <div className="h-[320px] flex items-center justify-center text-neutral-700 text-sm">Memuat grafik...</div> }
);

const FeedChart = dynamic(
  () => import("recharts").then((mod) => {
    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = mod;
    return {
      default: ({ data }: { data: { date: string; usage: number }[] }) => (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={16}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#525252" }} stroke="transparent" />
            <YAxis tick={{ fontSize: 10, fill: "#525252" }} stroke="transparent" />
            <Tooltip contentStyle={{ backgroundColor: "#141414", border: "1px solid #262626", borderRadius: 12, color: "#e5e5e5", fontSize: 12 }} />
            <Bar dataKey="usage" name="Pakan (kg)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ),
    };
  }),
  { ssr: false, loading: () => <div className="h-[240px] flex items-center justify-center text-neutral-700 text-sm">Memuat grafik...</div> }
);

function formatCurrency(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function getLast14Days(): string[] {
  const dates: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.getDashboard().then(setData).catch(console.error);
    const interval = setInterval(() => {
      api.getDashboard().then(setData).catch(console.error);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div className="flex items-center justify-center h-64"><div className="size-6 animate-spin rounded-full border-2 border-[#1e1e1e] border-t-[#3ecf8e]" /></div>;

  const { totalChickens = 0, totalCapacity = 0, eggsTodayKg = 0, eggsTodayUnit = 0, eggsYesterdayKg = 0, workersPresent = 0, totalWorkers = 0, feedStock = 0, feedUsedToday = 0, avgDailyUsage = 0, feedStockDaysLeft = 0, lowStockFeeds = [], todaysRevenue = 0, monthlyRevenue = 0, monthlyExpenses = 0, expenseByCategory = {}, netProfit = 0, activeHouses = [], recentCheckIns = [], eggChartData = [], feedChartData = [] } = data;

  const eggChange = eggsYesterdayKg > 0 ? Math.round(((eggsTodayKg - eggsYesterdayKg) / eggsYesterdayKg) * 100) : 0;
  const profit = netProfit;

  // Map API chart data to chart component format
  const mappedEggChart = eggChartData.map((d: any) => ({ date: formatShortDate(d.date), kg: d.totalKg, pcs: d.totalUnit }));
  const mappedFeedChart = feedChartData.map((d: any) => ({ date: formatShortDate(d.date), usage: d.quantity }));
  const mappedCheckIns = recentCheckIns.map((a: any) => ({ ...a, userName: a.user?.name || "Unknown" }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-neutral-600 uppercase tracking-widest mb-1">Overview</p>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
        </div>
        <p className="text-xs text-neutral-600 font-mono">{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      {/* Low Stock Alert */}
      {lowStockFeeds.length > 0 && (
        <div className="rounded-xl border border-red-500/20 bg-red-950/30 px-4 py-3 flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-red-300 font-medium">Stok Pakan Menipis!</p>
            <p className="text-xs text-red-400/70 truncate">
              {lowStockFeeds.map((f: any) => `${f.feedType}: ${f.quantity} ${f.unit}`).join(" · ")}
            </p>
          </div>
        </div>
      )}

      {/* Top Row — Hero Stats: asymmetric 3-col */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Egg Production — large card */}
        <div className="md:col-span-5 rounded-2xl border border-neutral-800/50 bg-neutral-900/40 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-[#3ecf8e]/[0.04] blur-3xl rounded-full" />
          <div className="relative flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#3ecf8e] to-[#2ea872] flex items-center justify-center shadow-md shadow-[#3ecf8e]/10">
                <Egg className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs text-[#3ecf8e] uppercase tracking-widest">Produksi Telur Hari Ini</span>
            </div>
            {eggChange !== 0 && (
              <span className={`flex items-center gap-0.5 text-xs font-medium ${eggChange > 0 ? "text-green-400" : "text-red-400"}`}>
                {eggChange > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(eggChange)}%
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-white tabular-nums">{eggsTodayKg}</span>
            <span className="text-neutral-500 text-sm">kg</span>
            <span className="text-neutral-700 text-sm mx-1">/</span>
            <span className="text-2xl font-semibold text-neutral-300 tabular-nums">{eggsTodayUnit.toLocaleString()}</span>
            <span className="text-neutral-500 text-sm">butir</span>
          </div>
          <p className="text-[11px] text-neutral-600 mt-2">Kemarin: {eggsYesterdayKg} kg</p>
        </div>

        {/* Revenue + Expenses + Net Profit — stacked */}
        <div className="md:col-span-4 flex flex-col gap-3">
          {/* Net Profit - prominent */}
          <div className={`rounded-2xl border ${profit >= 0 ? "border-[#3ecf8e]/30 bg-[#3ecf8e]/[0.04]" : "border-red-500/30 bg-red-950/20"} p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className={`h-3.5 w-3.5 ${profit >= 0 ? "text-[#3ecf8e]" : "text-red-400"}`} />
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Net Profit Bulan Ini</span>
            </div>
            <p className={`text-2xl font-bold ${profit >= 0 ? "text-[#3ecf8e]" : "text-red-400"}`}>
              {profit >= 0 ? "+" : "-"}{formatCurrency(Math.abs(profit))}
            </p>
            <div className="flex items-center justify-between mt-1.5 text-[10px] text-neutral-600">
              <span>Pendapatan: {formatCurrency(monthlyRevenue)}</span>
              <span>Pengeluaran: {formatCurrency(monthlyExpenses)}</span>
            </div>
          </div>
          <div className="flex-1 rounded-2xl border border-neutral-800/60 bg-neutral-900/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-3.5 w-3.5 text-[#3ecf8e]" />
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Pendapatan Bulan Ini</span>
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(monthlyRevenue)}</p>
            <p className="text-[11px] text-neutral-600 mt-1">Hari ini: {formatCurrency(todaysRevenue)}</p>
          </div>
          <div className="flex-1 rounded-2xl border border-neutral-800/60 bg-neutral-900/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-3.5 w-3.5 text-red-400" />
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Pengeluaran Bulan Ini</span>
            </div>
            <p className="text-xl font-bold text-white">{formatCurrency(monthlyExpenses)}</p>
            {Object.keys(expenseByCategory).length > 0 && (
              <div className="mt-1.5 space-y-0.5">
                {Object.entries(expenseByCategory).sort(([,a]: any, [,b]: any) => b - a).slice(0, 3).map(([cat, amt]: any) => (
                  <div key={cat} className="flex items-center justify-between text-[10px]">
                    <span className="text-neutral-600">{cat}</span>
                    <span className="text-neutral-500 tabular-nums">{formatCurrency(amt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Workers + Feed — stacked */}
        <div className="md:col-span-3 flex flex-col gap-3">
          <div className="flex-1 rounded-2xl border border-neutral-800/60 bg-neutral-900/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Pekerja</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">{workersPresent}</span>
              <span className="text-neutral-600 text-sm">/ {totalWorkers}</span>
            </div>
            {/* Dot indicators */}
            <div className="flex gap-1 mt-2">
              {Array.from({ length: totalWorkers }).map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i < workersPresent ? "bg-blue-400" : "bg-neutral-800"}`} />
              ))}
            </div>
          </div>
          <div className={`flex-1 rounded-2xl border ${lowStockFeeds.length > 0 ? "border-red-500/30 bg-red-950/20" : "border-neutral-800/60 bg-neutral-900/50"} p-4`}>
            <div className="flex items-center gap-2 mb-3">
              {lowStockFeeds.length > 0 ? <AlertTriangle className="h-3.5 w-3.5 text-red-400" /> : <Wheat className="h-3.5 w-3.5 text-[#3ecf8e]" />}
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Stok Pakan</span>
            </div>
            <p className="text-2xl font-bold text-white">{feedStock} <span className="text-sm text-neutral-600 font-normal">kg</span></p>
            <p className="text-[11px] text-neutral-600 mt-1">Terpakai hari ini: {feedUsedToday} kg</p>
            {avgDailyUsage > 0 && (
              <p className={`text-[11px] mt-0.5 ${feedStockDaysLeft <= 7 ? "text-red-400 font-medium" : "text-neutral-600"}`}>
                Estimasi: {feedStockDaysLeft} hari lagi
              </p>
            )}
          </div>
        </div>
      </div>

      {/* House Cards — horizontal scroll on mobile */}
      <div>
        <p className="text-xs text-neutral-500 uppercase tracking-widest mb-3">Kandang Aktif</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {activeHouses.map((h: any) => {
            const pct = h.capacity > 0 ? Math.round((h.currentCount / h.capacity) * 100) : 0;
            const houseEggs = (h.eggProductions || []).reduce((s: number, p: any) => s + p.totalKg, 0);
            return (
              <div key={h.id} className="rounded-xl border border-neutral-800/40 bg-neutral-900/30 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-200">{h.name}</span>
                  <span className="text-[10px] text-neutral-600">{h.birdType}</span>
                </div>
                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs text-neutral-500">{h.currentCount} / {h.capacity}</span>
                    <span className="text-[10px] text-neutral-600">{pct}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-neutral-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#3ecf8e] to-[#2ea872] transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-600">Telur hari ini</span>
                  <span className="text-neutral-300 font-medium">{houseEggs} kg</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts — production takes more space */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-neutral-500 uppercase tracking-widest">Produksi Telur</p>
            <p className="text-[10px] text-neutral-700">14 hari terakhir</p>
          </div>
          <div className="h-[320px] w-full">
            <EggChart data={mappedEggChart} />
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-neutral-500 uppercase tracking-widest">Pemakaian Pakan</p>
            <p className="text-[10px] text-neutral-700">14 hari terakhir</p>
          </div>
          <div className="h-[320px] w-full">
            <FeedChart data={mappedFeedChart} />
          </div>
        </div>
      </div>

      {/* Bottom Row — Activity + Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Recent Activity */}
        <div className="md:col-span-7 rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-3.5 w-3.5 text-neutral-500" />
            <p className="text-xs text-neutral-500 uppercase tracking-widest">Aktivitas Terbaru</p>
          </div>
          {recentCheckIns.length === 0 ? (
            <p className="text-sm text-neutral-700 py-4 text-center">Belum ada absensi hari ini</p>
          ) : (
            <div className="space-y-2">
              {mappedCheckIns.map((a: any) => {
                const time = new Date(a.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
                const initials = (a.userName || "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2);
                return (
                  <div key={a.id} className="flex items-center gap-3 rounded-lg py-2 px-1">
                    <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center text-[11px] font-semibold text-neutral-400 border border-neutral-700/50">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-200 truncate">{a.userName}</p>
                      <p className="text-[11px] text-neutral-600">Absen masuk</p>
                    </div>
                    <span className="text-xs text-neutral-600 font-mono tabular-nums">{time}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Numbers */}
        <div className="md:col-span-5 rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-4">
          <p className="text-xs text-neutral-500 uppercase tracking-widest mb-4">Ringkasan</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full bg-[#3ecf8e]" />
                <span className="text-sm text-neutral-400">Total Ayam</span>
              </div>
              <span className="text-sm font-semibold text-white tabular-nums">{totalChickens.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <span className="text-sm text-neutral-400">Kapasitas Terisi</span>
              </div>
              <span className="text-sm font-semibold text-white tabular-nums">{totalCapacity > 0 ? Math.round((totalChickens / totalCapacity) * 100) : 0}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full bg-violet-400" />
                <span className="text-sm text-neutral-400">Kandang Aktif</span>
              </div>
              <span className="text-sm font-semibold text-white tabular-nums">{activeHouses.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full bg-blue-400" />
                <span className="text-sm text-neutral-400">Pekerja Hadir</span>
              </div>
              <span className="text-sm font-semibold text-white tabular-nums">{workersPresent} / {totalWorkers}</span>
            </div>
            <div className="h-px bg-neutral-800/60" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full bg-[#3ecf8e]" />
                <span className="text-sm text-neutral-400">Profit Bulan Ini</span>
              </div>
              <span className={`text-sm font-semibold tabular-nums ${profit >= 0 ? "text-[#3ecf8e]" : "text-red-400"}`}>
                {profit >= 0 ? "+" : ""}{formatCurrency(profit)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
