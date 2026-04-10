"use client";

import { useState, useEffect, useMemo } from "react";
import { store } from "@/lib/store";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Egg, TrendingUp, Home } from "lucide-react";

export default function ProductionPage() {
  const [production, setProduction] = useState<any[]>([]);
  const [houses, setHouses] = useState<any[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [houseFilter, setHouseFilter] = useState("ALL");

  useEffect(() => {
    const load = () => {
      api.getProduction().then(setProduction).catch(console.error);
      api.getHouses().then(setHouses).catch(console.error);
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentMonth = store.todayStr().slice(0, 7);

  const filtered = useMemo(() => {
    let data = [...production];
    if (dateFrom) data = data.filter((p) => p.date >= dateFrom);
    if (dateTo) data = data.filter((p) => p.date <= dateTo);
    if (houseFilter !== "ALL")
      data = data.filter((p) => p.houseId === houseFilter);
    data.sort((a, b) => b.date.localeCompare(a.date));
    return data;
  }, [production, dateFrom, dateTo, houseFilter]);

  const monthlyRecords = useMemo(
    () => production.filter((p) => (p.date || "").startsWith(currentMonth)),
    [production, currentMonth]
  );

  const totalMonthlyUnit = useMemo(
    () => monthlyRecords.reduce((sum, p) => sum + (p.goodUnit || 0), 0),
    [monthlyRecords]
  );

  const totalMonthlyKg = useMemo(
    () => monthlyRecords.reduce((sum, p) => sum + (p.totalKg || 0), 0),
    [monthlyRecords]
  );

  const totalBrokenMonthly = useMemo(
    () => monthlyRecords.reduce((sum, p) => sum + (p.brokenUnit || 0), 0),
    [monthlyRecords]
  );

  const avgDaily = useMemo(() => {
    if (production.length === 0) return 0;
    const dates = new Set(production.map((p) => p.date));
    const totalUnit = production.reduce((sum, p) => sum + (p.totalUnit || 0), 0);
    return Math.round(totalUnit / dates.size);
  }, [production]);

  const bestHouseMonthly = useMemo(() => {
    if (monthlyRecords.length === 0) return "-";
    const byHouse: Record<string, { name: string; total: number }> = {};
    monthlyRecords.forEach((r) => {
      const key = r.houseId;
      if (!byHouse[key]) byHouse[key] = { name: r.houseName || r.house?.name || "-", total: 0 };
      byHouse[key].total += r.totalUnit || 0;
    });
    const best = Object.values(byHouse).sort((a, b) => b.total - a.total)[0];
    return best ? `${best.name} (${best.total} butir)` : "-";
  }, [monthlyRecords]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Egg Production</h1>
        <p className="text-sm text-muted-foreground">
          Track and review egg production records
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-400">
              <Egg className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalMonthlyUnit.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">butir</span></p>
              <p className="text-xs text-muted-foreground">Total Bagus Bulan Ini</p>
              {totalMonthlyKg > 0 && <p className="text-[11px] text-muted-foreground">{totalMonthlyKg} kg</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <Egg className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalBrokenMonthly.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">butir</span></p>
              <p className="text-xs text-muted-foreground">Pecah Bulan Ini</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgDaily.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">butir</span></p>
              <p className="text-xs text-muted-foreground">Rata-rata Harian</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{bestHouseMonthly}</p>
              <p className="text-xs text-muted-foreground">Kandang Terbaik</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <Label htmlFor="dateFrom">From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-44"
              />
            </div>
            <div>
              <Label htmlFor="dateTo">To</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-44"
              />
            </div>
            <div>
              <Label htmlFor="houseFilter">House</Label>
              <Select value={houseFilter} onValueChange={(val) => setHouseFilter(val ?? "ALL")}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Houses</SelectItem>
                  {houses.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Production table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Kandang</TableHead>
              <TableHead>Pekerja</TableHead>
              <TableHead className="text-right">Total (butir)</TableHead>
              <TableHead className="text-right">Total (kg)</TableHead>
              <TableHead className="text-right">Pecah (butir)</TableHead>
              <TableHead className="text-right">Bagus (butir)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  Belum ada data produksi.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.houseName || record.house?.name || "-"}</TableCell>
                  <TableCell>{record.collectorName || record.collector?.name || "-"}</TableCell>
                  <TableCell className="text-right font-medium">
                    {record.totalUnit || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    {record.totalKg || 0}
                  </TableCell>
                  <TableCell className="text-right text-red-400">
                    {record.brokenUnit || 0}
                  </TableCell>
                  <TableCell className="text-right text-green-400">
                    {record.goodUnit || 0}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
