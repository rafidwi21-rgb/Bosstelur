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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Clock, CheckCircle } from "lucide-react";

interface AttendanceRow {
  userId: string;
  userName: string;
  checkIn: any | null;
  checkOut: any | null;
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calculateDuration(checkIn: string, checkOut: string): string {
  const diff =
    new Date(checkOut).getTime() - new Date(checkIn).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [filterDate, setFilterDate] = useState(store.todayStr());

  useEffect(() => {
    api.getAttendance(filterDate).then(setAttendance).catch(console.error);
  }, [filterDate]);

  // Group attendance by user
  const attendanceRows = useMemo(() => {
    const userMap = new Map<string, AttendanceRow>();

    attendance.forEach((a: any) => {
      if (!userMap.has(a.userId)) {
        userMap.set(a.userId, {
          userId: a.userId,
          userName: a.user?.name || a.userName || "-",
          checkIn: null,
          checkOut: null,
        });
      }
      const row = userMap.get(a.userId)!;
      if (a.type === "CHECK_IN") {
        row.checkIn = a;
      } else {
        row.checkOut = a;
      }
    });

    return Array.from(userMap.values());
  }, [attendance]);

  // Summary stats
  const workersPresent = attendanceRows.length;

  const averageCheckIn = useMemo(() => {
    const checkIns = attendanceRows
      .filter((r) => r.checkIn)
      .map((r) => new Date(r.checkIn!.timestamp).getTime());
    if (checkIns.length === 0) return "-";
    const avg = checkIns.reduce((sum, t) => sum + t, 0) / checkIns.length;
    return new Date(avg).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [attendanceRows]);

  // Convert UTC timestamp to WIB (UTC+7) hours and minutes
  function getWIBTime(timestamp: string) {
    const utc = new Date(timestamp);
    const wibMs = utc.getTime() + 7 * 60 * 60 * 1000;
    const wib = new Date(wibMs);
    return { hour: wib.getUTCHours(), minute: wib.getUTCMinutes() };
  }

  const onTimePercentage = useMemo(() => {
    const checkIns = attendanceRows.filter((r) => r.checkIn);
    if (checkIns.length === 0) return 0;
    // On time if check-in before 07:00 WIB
    const onTime = checkIns.filter((r) => {
      const { hour, minute } = getWIBTime(r.checkIn!.timestamp);
      return hour < 7 || (hour === 7 && minute === 0);
    });
    return Math.round((onTime.length / checkIns.length) * 100);
  }, [attendanceRows]);

  function getStatus(row: AttendanceRow): {
    label: string;
    variant: "default" | "secondary" | "destructive";
  } {
    if (!row.checkIn) return { label: "Tidak Hadir", variant: "destructive" };
    const { hour } = getWIBTime(row.checkIn.timestamp);
    // Late if check-in after 07:00 WIB
    if (hour < 7 || (hour === 7 && new Date(row.checkIn.timestamp).getMinutes() === 0)) {
      return { label: "Tepat Waktu", variant: "default" };
    }
    return { label: "Terlambat", variant: "destructive" };
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
          <p className="text-sm text-muted-foreground">
            Track worker attendance and check-in times
          </p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-3">
        <Label htmlFor="dateFilter">Date</Label>
        <Input
          id="dateFilter"
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="w-auto"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{workersPresent}</p>
              <p className="text-xs text-muted-foreground">Workers Present</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{averageCheckIn}</p>
              <p className="text-xs text-muted-foreground">
                Avg Check-in Time
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{onTimePercentage}%</p>
              <p className="text-xs text-muted-foreground">On-Time Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records - {filterDate}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker Name</TableHead>
                  <TableHead>Check-In Time</TableHead>
                  <TableHead>Check-Out Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRows.map((row) => {
                  const status = getStatus(row);
                  return (
                    <TableRow key={row.userId}>
                      <TableCell className="font-medium">
                        {row.userName}
                      </TableCell>
                      <TableCell>
                        {row.checkIn ? formatTime(row.checkIn.timestamp) : "-"}
                      </TableCell>
                      <TableCell>
                        {row.checkOut
                          ? formatTime(row.checkOut.timestamp)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {row.checkIn && row.checkOut
                          ? calculateDuration(
                              row.checkIn.timestamp,
                              row.checkOut.timestamp
                            )
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {attendanceRows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      No attendance records for this date.
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
