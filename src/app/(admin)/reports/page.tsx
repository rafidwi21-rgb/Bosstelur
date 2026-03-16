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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  FileText,
  Download,
  Egg,
  Wheat,
  DollarSign,
  Users,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";

type ReportType = "Production" | "Feed" | "Sales" | "Attendance" | "Expenses";

function formatCurrency(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function getLast30DaysStart(): string {
  const d = new Date();
  d.setDate(d.getDate() - 29);
  return d.toISOString().split("T")[0];
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("Production");
  const [dateFrom, setDateFrom] = useState(getLast30DaysStart());
  const [dateTo, setDateTo] = useState(store.todayStr());
  const [houseFilter, setHouseFilter] = useState("ALL");

  const [houses, setHouses] = useState<any[]>([]);
  const [production, setProduction] = useState<any[]>([]);
  const [feedUsage, setFeedUsage] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    api.getHouses().then(setHouses).catch(console.error);
    api.getProduction().then(setProduction).catch(console.error);
    api.getFeedUsage().then(setFeedUsage).catch(console.error);
    api.getSales().then(setSales).catch(console.error);
    api.getAttendance().then(setAttendance).catch(console.error);
    api.getExpenses().then(setExpenses).catch(console.error);
  }, []);

  function inRange(date: string) {
    return date >= dateFrom && date <= dateTo;
  }

  // Filtered data
  const filteredProduction = useMemo(
    () =>
      production.filter(
        (p: any) =>
          inRange(p.date) &&
          (houseFilter === "ALL" || p.houseId === houseFilter)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [production, dateFrom, dateTo, houseFilter]
  );

  const filteredFeedUsage = useMemo(
    () =>
      feedUsage.filter(
        (f: any) =>
          inRange(f.date) &&
          (houseFilter === "ALL" || f.houseId === houseFilter)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [feedUsage, dateFrom, dateTo, houseFilter]
  );

  const filteredSales = useMemo(
    () => sales.filter((s: any) => inRange(s.date)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sales, dateFrom, dateTo]
  );

  const filteredAttendance = useMemo(
    () =>
      attendance.filter((a: any) => {
        const date = a.timestamp.split("T")[0];
        return inRange(date);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attendance, dateFrom, dateTo]
  );

  const filteredExpenses = useMemo(
    () => expenses.filter((e: any) => inRange(e.date)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [expenses, dateFrom, dateTo]
  );

  // Summary stats per report type
  const summaryStats = useMemo(() => {
    switch (reportType) {
      case "Production": {
        const totalKg = filteredProduction.reduce(
          (s: number, p: any) => s + p.totalKg,
          0
        );
        const totalBroken = filteredProduction.reduce(
          (s: number, p: any) => s + p.brokenKg,
          0
        );
        const totalGood = filteredProduction.reduce(
          (s: number, p: any) => s + p.goodKg,
          0
        );
        return [
          { label: "Total Kg", value: totalKg.toLocaleString(), icon: Egg },
          {
            label: "Good Kg",
            value: totalGood.toLocaleString(),
            icon: Egg,
          },
          {
            label: "Broken Kg",
            value: totalBroken.toLocaleString(),
            icon: Egg,
          },
        ];
      }
      case "Feed": {
        const totalUsed = filteredFeedUsage.reduce(
          (s: number, f: any) => s + f.quantity,
          0
        );
        const avgDaily =
          filteredFeedUsage.length > 0
            ? Math.round(
                totalUsed /
                  new Set(filteredFeedUsage.map((f: any) => f.date)).size
              )
            : 0;
        return [
          {
            label: "Total Used",
            value: `${totalUsed.toLocaleString()} kg`,
            icon: Wheat,
          },
          {
            label: "Avg Daily Usage",
            value: `${avgDaily.toLocaleString()} kg`,
            icon: Wheat,
          },
          {
            label: "Records",
            value: filteredFeedUsage.length.toString(),
            icon: FileText,
          },
        ];
      }
      case "Sales": {
        const totalRevenue = filteredSales.reduce(
          (s: number, sale: any) => s + sale.totalAmount,
          0
        );
        const totalQty = filteredSales.reduce(
          (s: number, sale: any) => s + sale.quantity,
          0
        );
        const unpaid = filteredSales.filter(
          (sale: any) => !sale.isPaid
        ).length;
        return [
          {
            label: "Total Revenue",
            value: formatCurrency(totalRevenue),
            icon: DollarSign,
          },
          {
            label: "Total Sold",
            value: totalQty.toLocaleString(),
            icon: Egg,
          },
          {
            label: "Unpaid",
            value: unpaid.toString(),
            icon: Receipt,
          },
        ];
      }
      case "Attendance": {
        const checkIns = filteredAttendance.filter(
          (a: any) => a.type === "CHECK_IN"
        );
        const uniqueDays = new Set(
          checkIns.map((a: any) => a.timestamp.split("T")[0])
        ).size;
        const uniqueWorkers = new Set(
          checkIns.map((a: any) => a.userId)
        ).size;
        return [
          {
            label: "Total Check-ins",
            value: checkIns.length.toString(),
            icon: Users,
          },
          {
            label: "Days Covered",
            value: uniqueDays.toString(),
            icon: FileText,
          },
          {
            label: "Workers",
            value: uniqueWorkers.toString(),
            icon: Users,
          },
        ];
      }
      case "Expenses": {
        const totalAmount = filteredExpenses.reduce(
          (s: number, e: any) => s + e.amount,
          0
        );
        const categories = new Set(
          filteredExpenses.map((e: any) => e.category)
        ).size;
        return [
          {
            label: "Total Expenses",
            value: formatCurrency(totalAmount),
            icon: DollarSign,
          },
          {
            label: "Categories",
            value: categories.toString(),
            icon: FileText,
          },
          {
            label: "Records",
            value: filteredExpenses.length.toString(),
            icon: Receipt,
          },
        ];
      }
    }
  }, [
    reportType,
    filteredProduction,
    filteredFeedUsage,
    filteredSales,
    filteredAttendance,
    filteredExpenses,
  ]);

  function handleExport(format: string) {
    toast.info(`Export ${format} coming soon`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Generate and export farm reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport("PDF")}>
            <Download className="mr-1 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport("Excel")}>
            <Download className="mr-1 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="grid gap-2">
              <Label>Report Type</Label>
              <Select
                value={reportType}
                onValueChange={(val) =>
                  setReportType((val as ReportType) ?? "Production")
                }
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Production">Production</SelectItem>
                  <SelectItem value="Feed">Feed</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Attendance">Attendance</SelectItem>
                  <SelectItem value="Expenses">Expenses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dateFrom">Date From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dateTo">Date To</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-auto"
              />
            </div>
            {(reportType === "Production" || reportType === "Feed") && (
              <div className="grid gap-2">
                <Label>House</Label>
                <Select
                  value={houseFilter}
                  onValueChange={(val) => setHouseFilter(val ?? "ALL")}
                >
                  <SelectTrigger className="w-40">
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
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summaryStats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>{reportType} Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {reportType === "Production" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>House</TableHead>
                    <TableHead>Collector</TableHead>
                    <TableHead>Total Kg</TableHead>
                    <TableHead>Broken Kg</TableHead>
                    <TableHead>Good Kg</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProduction.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.date}</TableCell>
                      <TableCell>{p.houseName}</TableCell>
                      <TableCell>{p.collectorName}</TableCell>
                      <TableCell>{p.totalKg}</TableCell>
                      <TableCell>{p.brokenKg}</TableCell>
                      <TableCell>{p.goodKg}</TableCell>
                    </TableRow>
                  ))}
                  {filteredProduction.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        No production data for this period.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            {reportType === "Feed" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>House</TableHead>
                    <TableHead>Feed Type</TableHead>
                    <TableHead>Quantity (kg)</TableHead>
                    <TableHead>Worker</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedUsage.map((f: any) => (
                    <TableRow key={f.id}>
                      <TableCell>{f.date}</TableCell>
                      <TableCell>{f.houseName}</TableCell>
                      <TableCell>{f.feedType}</TableCell>
                      <TableCell>{f.quantity}</TableCell>
                      <TableCell>{f.workerName}</TableCell>
                    </TableRow>
                  ))}
                  {filteredFeedUsage.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        No feed usage data for this period.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            {reportType === "Sales" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Price/Unit</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.date}</TableCell>
                      <TableCell>{s.buyerName}</TableCell>
                      <TableCell>{s.quantity}</TableCell>
                      <TableCell>{s.unit}</TableCell>
                      <TableCell>{formatCurrency(s.pricePerUnit)}</TableCell>
                      <TableCell>{formatCurrency(s.totalAmount)}</TableCell>
                      <TableCell>{s.paymentMethod}</TableCell>
                      <TableCell>
                        {s.isPaid ? "Paid" : "Unpaid"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSales.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground"
                      >
                        No sales data for this period.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            {reportType === "Attendance" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendance.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.userName}</TableCell>
                      <TableCell>
                        {a.type === "CHECK_IN" ? "Check In" : "Check Out"}
                      </TableCell>
                      <TableCell>
                        {new Date(a.timestamp).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredAttendance.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground"
                      >
                        No attendance data for this period.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            {reportType === "Expenses" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Vendor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((e: any) => (
                    <TableRow key={e.id}>
                      <TableCell>{e.date}</TableCell>
                      <TableCell>{e.category}</TableCell>
                      <TableCell>{e.description}</TableCell>
                      <TableCell>{formatCurrency(e.amount)}</TableCell>
                      <TableCell>{e.vendor}</TableCell>
                    </TableRow>
                  ))}
                  {filteredExpenses.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        No expense data for this period.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
