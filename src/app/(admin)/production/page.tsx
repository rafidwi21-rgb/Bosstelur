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
    api.getProduction().then(setProduction).catch(console.error);
    api.getHouses().then(setHouses).catch(console.error);
  }, []);

  const today = store.todayStr();

  const filtered = useMemo(() => {
    let data = [...production];
    if (dateFrom) data = data.filter((p) => p.date >= dateFrom);
    if (dateTo) data = data.filter((p) => p.date <= dateTo);
    if (houseFilter !== "ALL")
      data = data.filter((p) => p.houseId === houseFilter);
    data.sort((a, b) => b.date.localeCompare(a.date));
    return data;
  }, [production, dateFrom, dateTo, houseFilter]);

  const todayRecords = useMemo(
    () => production.filter((p) => p.date === today),
    [production, today]
  );

  const totalToday = useMemo(
    () => todayRecords.reduce((sum, p) => sum + p.totalKg, 0),
    [todayRecords]
  );

  const avgDaily = useMemo(() => {
    if (production.length === 0) return 0;
    const dates = new Set(production.map((p) => p.date));
    const total = production.reduce((sum, p) => sum + p.totalKg, 0);
    return Math.round(total / dates.size);
  }, [production]);

  const bestHouseToday = useMemo(() => {
    if (todayRecords.length === 0) return "-";
    const best = todayRecords.reduce((prev, curr) =>
      curr.totalKg > prev.totalKg ? curr : prev
    );
    return `${best.houseName} (${best.totalKg})`;
  }, [todayRecords]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Egg Production</h1>
        <p className="text-sm text-muted-foreground">
          Track and review egg production records
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Egg className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalToday.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Today</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgDaily.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Average Daily</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{bestHouseToday}</p>
              <p className="text-xs text-muted-foreground">Best House Today</p>
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
              <TableHead>Date</TableHead>
              <TableHead>House</TableHead>
              <TableHead>Collector</TableHead>
              <TableHead className="text-right">Total Kg</TableHead>
              <TableHead className="text-right">Broken Kg</TableHead>
              <TableHead className="text-right">Good Kg</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No production records found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.houseName}</TableCell>
                  <TableCell>{record.collectorName}</TableCell>
                  <TableCell className="text-right">
                    {record.totalKg}
                  </TableCell>
                  <TableCell className="text-right">
                    {record.brokenKg}
                  </TableCell>
                  <TableCell className="text-right">
                    {record.goodKg}
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
