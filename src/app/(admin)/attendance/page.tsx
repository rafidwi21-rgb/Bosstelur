"use client";

import { useState, useEffect, useMemo } from "react";
import { store } from "@/lib/store";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Clock, CheckCircle, CalendarDays } from "lucide-react";

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });
}

function formatDateShort(d: string) {
  try {
    return new Date(d).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Jakarta" });
  } catch { return d; }
}

function calculateDuration(checkIn: string, checkOut: string): string {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}j ${minutes}m`;
}

function getWIBTime(timestamp: string) {
  const utc = new Date(timestamp);
  const wibMs = utc.getTime() + 7 * 60 * 60 * 1000;
  const wib = new Date(wibMs);
  return { hour: wib.getUTCHours(), minute: wib.getUTCMinutes() };
}

function getMonthOptions() {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = d.toLocaleDateString("sv-SE").slice(0, 7);
    const label = d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    options.push({ value, label });
  }
  return options;
}

interface DayRow {
  date: string;
  userName: string;
  userId: string;
  checkIn: any | null;
  checkOut: any | null;
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(store.todayStr().slice(0, 7));
  const monthOptions = useMemo(() => getMonthOptions(), []);

  useEffect(() => {
    const from = `${selectedMonth}-01`;
    const lastDay = new Date(Number(selectedMonth.slice(0, 4)), Number(selectedMonth.slice(5, 7)), 0).getDate();
    const to = `${selectedMonth}-${String(lastDay).padStart(2, "0")}`;

    const load = () => api.getAttendanceRange(from, to).then(setAttendance).catch(console.error);
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [selectedMonth]);

  // Group by date + user
  const dailyRows = useMemo(() => {
    const map = new Map<string, DayRow>();

    attendance.forEach((a: any) => {
      const day = new Date(a.timestamp).toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" });
      const key = `${day}:${a.userId}`;
      if (!map.has(key)) {
        map.set(key, {
          date: day,
          userName: a.user?.name || "-",
          userId: a.userId,
          checkIn: null,
          checkOut: null,
        });
      }
      const row = map.get(key)!;
      if (a.type === "CHECK_IN") row.checkIn = a;
      else row.checkOut = a;
    });

    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [attendance]);

  // Summary stats for the month
  const totalDaysPresent = useMemo(() => {
    return new Set(dailyRows.map(r => r.date)).size;
  }, [dailyRows]);

  const avgCheckInTime = useMemo(() => {
    const checkIns = dailyRows.filter(r => r.checkIn).map(r => {
      const { hour, minute } = getWIBTime(r.checkIn.timestamp);
      return hour * 60 + minute;
    });
    if (checkIns.length === 0) return "-";
    const avgMinutes = Math.round(checkIns.reduce((s, m) => s + m, 0) / checkIns.length);
    const h = Math.floor(avgMinutes / 60);
    const m = avgMinutes % 60;
    return `${String(h).padStart(2, "0")}.${String(m).padStart(2, "0")}`;
  }, [dailyRows]);

  const onTimeRate = useMemo(() => {
    const checkIns = dailyRows.filter(r => r.checkIn);
    if (checkIns.length === 0) return 0;
    const onTime = checkIns.filter(r => {
      const { hour, minute } = getWIBTime(r.checkIn.timestamp);
      return hour < 7 || (hour === 7 && minute === 0);
    });
    return Math.round((onTime.length / checkIns.length) * 100);
  }, [dailyRows]);

  const avgDuration = useMemo(() => {
    const withBoth = dailyRows.filter(r => r.checkIn && r.checkOut);
    if (withBoth.length === 0) return "-";
    const totalMs = withBoth.reduce((s, r) =>
      s + new Date(r.checkOut.timestamp).getTime() - new Date(r.checkIn.timestamp).getTime(), 0
    );
    const avgMs = totalMs / withBoth.length;
    const hours = Math.floor(avgMs / (1000 * 60 * 60));
    const minutes = Math.floor((avgMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}j ${minutes}m`;
  }, [dailyRows]);

  function getStatus(row: DayRow) {
    if (!row.checkIn) return { label: "Tidak Hadir", variant: "destructive" as const };
    const { hour, minute } = getWIBTime(row.checkIn.timestamp);
    if (hour < 7 || (hour === 7 && minute === 0)) {
      return { label: "Tepat Waktu", variant: "default" as const };
    }
    return { label: "Terlambat", variant: "destructive" as const };
  }

  const monthLabel = monthOptions.find(m => m.value === selectedMonth)?.label || selectedMonth;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Absensi</h1>
          <p className="text-sm text-muted-foreground">Rekap kehadiran pekerja per bulan</p>
        </div>
      </div>

      {/* Month Selector */}
      <div className="flex items-center gap-3">
        <Label>Bulan</Label>
        <Select value={selectedMonth} onValueChange={(val) => setSelectedMonth(val ?? selectedMonth)}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            {monthOptions.map(m => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalDaysPresent} <span className="text-sm font-normal text-muted-foreground">hari</span></p>
              <p className="text-xs text-muted-foreground">Hari Hadir</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgCheckInTime}</p>
              <p className="text-xs text-muted-foreground">Rata-rata Jam Masuk</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-400">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{onTimeRate}%</p>
              <p className="text-xs text-muted-foreground">Tepat Waktu</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgDuration}</p>
              <p className="text-xs text-muted-foreground">Rata-rata Durasi Kerja</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rekap Absensi - {monthLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Pekerja</TableHead>
                  <TableHead>Jam Masuk</TableHead>
                  <TableHead>Jam Pulang</TableHead>
                  <TableHead>Durasi</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dailyRows.map((row, i) => {
                  const status = getStatus(row);
                  return (
                    <TableRow key={`${row.date}-${row.userId}-${i}`}>
                      <TableCell className="font-medium">{formatDateShort(row.date)}</TableCell>
                      <TableCell>{row.userName}</TableCell>
                      <TableCell>{row.checkIn ? formatTime(row.checkIn.timestamp) : "-"}</TableCell>
                      <TableCell>{row.checkOut ? formatTime(row.checkOut.timestamp) : "-"}</TableCell>
                      <TableCell>
                        {row.checkIn && row.checkOut
                          ? calculateDuration(row.checkIn.timestamp, row.checkOut.timestamp)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {dailyRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Tidak ada data absensi bulan ini.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
