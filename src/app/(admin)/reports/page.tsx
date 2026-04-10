"use client";

import { useState, useEffect, useMemo } from "react";
import { store } from "@/lib/store";
import { api } from "@/lib/api";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  FileText, Download, Egg, Wheat, DollarSign, Users, Receipt, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

type ReportType = "Profit" | "Production" | "Feed" | "Sales" | "Attendance" | "Expenses";

function fmtCurrency(n: number) { return `Rp ${n.toLocaleString("id-ID")}`; }
function fmtDate(d: string) {
  try { return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" }); }
  catch { return d; }
}
// Normalize any date string/ISO to YYYY-MM-DD for comparison
function toDateStr(d: string) { return (d || "").split("T")[0]; }

function getLast30DaysStart(): string {
  const d = new Date(); d.setDate(d.getDate() - 29);
  return d.toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" });
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("Profit");
  const [dateFrom, setDateFrom] = useState(getLast30DaysStart());
  const [dateTo, setDateTo] = useState(store.todayStr());
  const [houseFilter, setHouseFilter] = useState("ALL");

  const [houses, setHouses] = useState<any[]>([]);
  const [production, setProduction] = useState<any[]>([]);
  const [feedUsage, setFeedUsage] = useState<any[]>([]);
  const [feedInventory, setFeedInventory] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    // Only fetch data needed for the current report type
    const fetches: Promise<void>[] = [api.getHouses().then(setHouses)];

    if (reportType === "Production" || reportType === "Profit") {
      fetches.push(api.getProduction(dateFrom, dateTo).then(setProduction));
    }
    if (reportType === "Feed" || reportType === "Profit") {
      fetches.push(api.getFeedUsage(dateFrom, dateTo).then(setFeedUsage));
      fetches.push(api.getFeedInventory().then(setFeedInventory));
    }
    if (reportType === "Sales" || reportType === "Profit") {
      fetches.push(api.getSales(dateFrom, dateTo).then(setSales));
    }
    if (reportType === "Attendance") {
      fetches.push(api.getAttendanceRange(dateFrom, dateTo).then(setAttendance));
    }
    if (reportType === "Expenses" || reportType === "Profit") {
      fetches.push(api.getExpenses(dateFrom, dateTo).then(setExpenses));
    }

    Promise.all(fetches).catch(console.error);
  }, [reportType, dateFrom, dateTo]);

  function inRange(date: string) {
    const d = toDateStr(date);
    return d >= dateFrom && d <= dateTo;
  }

  // Filtered data
  const filteredProduction = useMemo(() =>
    production.filter((p: any) => inRange(p.date) && (houseFilter === "ALL" || p.houseId === houseFilter)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [production, dateFrom, dateTo, houseFilter]
  );
  const filteredFeedUsage = useMemo(() =>
    feedUsage.filter((f: any) => inRange(f.date) && (houseFilter === "ALL" || f.houseId === houseFilter)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [feedUsage, dateFrom, dateTo, houseFilter]
  );
  const filteredSales = useMemo(() =>
    sales.filter((s: any) => inRange(s.date)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sales, dateFrom, dateTo]
  );
  const filteredAttendance = useMemo(() =>
    attendance.filter((a: any) => inRange(a.timestamp)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attendance, dateFrom, dateTo]
  );
  const filteredExpenses = useMemo(() =>
    expenses.filter((e: any) => inRange(e.date)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [expenses, dateFrom, dateTo]
  );

  // === Helper: get table headers + rows for current report ===
  function getTableData(): { headers: string[]; rows: string[][] } {
    switch (reportType) {
      case "Production":
        return {
          headers: ["Tanggal", "Kandang", "Pekerja", "Total (butir)", "Pecah (butir)", "Bagus (butir)", "Total (kg)"],
          rows: filteredProduction.map((p: any) => [
            fmtDate(p.date), p.house?.name || p.houseName || "-", p.collector?.name || p.collectorName || "-",
            String(p.totalUnit || 0), String(p.brokenUnit || 0), String(p.goodUnit || 0), String(p.totalKg || 0),
          ]),
        };
      case "Feed":
        return {
          headers: ["Tanggal", "Waktu", "Kandang", "Jenis Pakan", "Jumlah (kg)", "Pekerja"],
          rows: filteredFeedUsage.map((f: any) => [
            fmtDate(f.date), f.timeSlot === "MORNING" ? "Pagi" : f.timeSlot === "EVENING" ? "Sore" : "-",
            f.house?.name || "-", f.feed?.feedType || "-",
            String(f.quantity), f.worker?.name || "-",
          ]),
        };
      case "Sales":
        return {
          headers: ["Tanggal", "Pembeli", "Jumlah", "Satuan", "Harga/Unit", "Total", "Pembayaran", "Status"],
          rows: filteredSales.map((s: any) => [
            fmtDate(s.date), s.buyerName || "-", String(s.quantity), s.unit,
            fmtCurrency(s.pricePerUnit), fmtCurrency(s.totalAmount),
            s.paymentMethod, s.isPaid ? "Lunas" : "Belum",
          ]),
        };
      case "Attendance":
        return {
          headers: ["Pekerja", "Tipe", "Waktu"],
          rows: filteredAttendance.map((a: any) => [
            a.user?.name || a.userName || "-",
            a.type === "CHECK_IN" ? "Masuk" : "Keluar",
            new Date(a.timestamp).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }),
          ]),
        };
      case "Expenses":
        return {
          headers: ["Tanggal", "Kategori", "Deskripsi", "Jumlah", "Vendor"],
          rows: filteredExpenses.map((e: any) => [
            fmtDate(e.date), e.category, e.description, fmtCurrency(e.amount), e.vendor || "-",
          ]),
        };
      case "Profit": {
        const totalRevenue = filteredSales.reduce((s: number, sale: any) => s + sale.totalAmount, 0);
        const linkedFeedIds = new Set(
          filteredExpenses.map((e: any) => { const m = (e.description || "").match(/\[ref:([^\]]+)\]/); return m ? m[1] : null; }).filter(Boolean)
        );
        const unlinkedFeedCost = feedInventory
          .filter((f: any) => !linkedFeedIds.has(f.id) && inRange(f.purchaseDate))
          .reduce((s: number, f: any) => s + (f.initialQuantity || f.quantity) * f.costPerUnit, 0);
        const totalExpense = filteredExpenses.reduce((s: number, e: any) => s + e.amount, 0) + unlinkedFeedCost;
        const byCategory: Record<string, number> = {};
        for (const e of filteredExpenses) { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; }
        if (unlinkedFeedCost > 0) { byCategory["Pakan"] = (byCategory["Pakan"] || 0) + unlinkedFeedCost; }
        const rows: string[][] = [["Pendapatan (Penjualan Telur)", fmtCurrency(totalRevenue)]];
        for (const [cat, amt] of Object.entries(byCategory).sort(([, a], [, b]) => (b as number) - (a as number))) {
          rows.push([`  Pengeluaran: ${cat}`, `- ${fmtCurrency(amt as number)}`]);
        }
        rows.push(["Total Pengeluaran", `- ${fmtCurrency(totalExpense)}`]);
        const net = totalRevenue - totalExpense;
        rows.push([net >= 0 ? "NET PROFIT" : "NET RUGI", `${net >= 0 ? "+" : "-"} ${fmtCurrency(Math.abs(net))}`]);
        return { headers: ["Keterangan", "Jumlah"], rows };
      }
    }
  }

  // === Summary stats ===
  const summaryStats = useMemo(() => {
    switch (reportType) {
      case "Production": {
        const totalGood = filteredProduction.reduce((s: number, p: any) => s + (p.goodUnit || 0), 0);
        const totalBroken = filteredProduction.reduce((s: number, p: any) => s + (p.brokenUnit || 0), 0);
        const totalKg = filteredProduction.reduce((s: number, p: any) => s + (p.totalKg || 0), 0);
        return [
          { label: "Telur Bagus", value: `${totalGood.toLocaleString()} butir`, icon: Egg },
          { label: "Telur Pecah", value: `${totalBroken.toLocaleString()} butir`, icon: Egg },
          { label: "Total Berat", value: `${totalKg.toLocaleString()} kg`, icon: Egg },
        ];
      }
      case "Feed": {
        const totalUsed = filteredFeedUsage.reduce((s: number, f: any) => s + f.quantity, 0);
        const days = new Set(filteredFeedUsage.map((f: any) => toDateStr(f.date))).size;
        const avg = days > 0 ? Math.round(totalUsed / days) : 0;
        const totalStock = feedInventory.reduce((s: number, f: any) => s + f.quantity, 0);
        const karung = Math.floor(totalStock / 50);
        const sisaKg = Math.round(totalStock % 50);
        return [
          { label: "Total Terpakai", value: `${totalUsed.toLocaleString()} kg`, icon: Wheat },
          { label: "Rata-rata/Hari", value: `${avg.toLocaleString()} kg`, icon: Wheat },
          { label: "Sisa Stok", value: `${totalStock.toLocaleString()} kg (${karung} karung${sisaKg > 0 ? ` + ${sisaKg} kg` : ""})`, icon: Wheat },
        ];
      }
      case "Sales": {
        const totalRevenue = filteredSales.reduce((s: number, sale: any) => s + sale.totalAmount, 0);
        const totalQty = filteredSales.reduce((s: number, sale: any) => s + sale.quantity, 0);
        const unpaid = filteredSales.filter((sale: any) => !sale.isPaid).length;
        return [
          { label: "Total Pendapatan", value: fmtCurrency(totalRevenue), icon: DollarSign },
          { label: "Total Terjual", value: totalQty.toLocaleString(), icon: Egg },
          { label: "Belum Lunas", value: unpaid.toString(), icon: Receipt },
        ];
      }
      case "Attendance": {
        const checkIns = filteredAttendance.filter((a: any) => a.type === "CHECK_IN");
        const days = new Set(checkIns.map((a: any) => toDateStr(a.timestamp))).size;
        const workers = new Set(checkIns.map((a: any) => a.userId)).size;
        return [
          { label: "Total Check-in", value: checkIns.length.toString(), icon: Users },
          { label: "Hari", value: days.toString(), icon: FileText },
          { label: "Pekerja", value: workers.toString(), icon: Users },
        ];
      }
      case "Expenses": {
        const total = filteredExpenses.reduce((s: number, e: any) => s + e.amount, 0);
        const cats = new Set(filteredExpenses.map((e: any) => e.category)).size;
        return [
          { label: "Total Pengeluaran", value: fmtCurrency(total), icon: DollarSign },
          { label: "Kategori", value: cats.toString(), icon: FileText },
          { label: "Catatan", value: filteredExpenses.length.toString(), icon: Receipt },
        ];
      }
      case "Profit": {
        const totalRev = filteredSales.reduce((s: number, sale: any) => s + sale.totalAmount, 0);
        const linkedIds = new Set(filteredExpenses.map((e: any) => { const m = (e.description || "").match(/\[ref:([^\]]+)\]/); return m ? m[1] : null; }).filter(Boolean));
        const ufc = feedInventory.filter((f: any) => !linkedIds.has(f.id) && inRange(f.purchaseDate)).reduce((s: number, f: any) => s + (f.initialQuantity || f.quantity) * f.costPerUnit, 0);
        const totalExp = filteredExpenses.reduce((s: number, e: any) => s + e.amount, 0) + ufc;
        const net = totalRev - totalExp;
        return [
          { label: "Total Pendapatan", value: fmtCurrency(totalRev), icon: DollarSign },
          { label: "Total Pengeluaran", value: fmtCurrency(totalExp), icon: Receipt },
          { label: net >= 0 ? "Net Profit" : "Net Rugi", value: `${net >= 0 ? "+" : "-"}${fmtCurrency(Math.abs(net))}`, icon: TrendingUp },
        ];
      }
    }
  }, [reportType, filteredProduction, filteredFeedUsage, filteredSales, filteredAttendance, filteredExpenses, feedInventory]);

  // === EXPORT PDF ===
  async function exportPDF() {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF("p", "mm", "a4");
    const w = doc.internal.pageSize.getWidth();
    const now = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
    let y = 15;

    // Header
    doc.setFontSize(16); doc.setFont("helvetica", "bold");
    doc.text(`Boss Telur - Laporan ${reportType}`, 14, y); y += 7;
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(100);
    doc.text(`Periode: ${fmtDate(dateFrom)} - ${fmtDate(dateTo)}  |  Dicetak: ${now}`, 14, y); y += 3;
    doc.setDrawColor(62, 207, 142); doc.setLineWidth(0.8); doc.line(14, y, w - 14, y); y += 8;
    doc.setTextColor(0);

    // Summary
    doc.setFontSize(11); doc.setFont("helvetica", "bold");
    doc.text("Ringkasan", 14, y); y += 6;
    autoTable(doc, {
      startY: y,
      head: [["Keterangan", "Nilai"]],
      body: summaryStats.map(s => [s.label, s.value]),
      theme: "striped",
      headStyles: { fillColor: [62, 207, 142], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // Data table
    const { headers, rows } = getTableData();
    if (rows.length > 0) {
      if (y > 230) { doc.addPage(); y = 15; }
      doc.setFontSize(11); doc.setFont("helvetica", "bold");
      doc.text(`Detail ${reportType}`, 14, y); y += 6;

      const isProfit = reportType === "Profit";
      autoTable(doc, {
        startY: y,
        head: [headers],
        body: rows,
        theme: "striped",
        headStyles: { fillColor: isProfit ? [62, 207, 142] : [62, 207, 142], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 8, cellPadding: 2.5 },
        columnStyles: headers.length === 2 ? { 1: { halign: "right", fontStyle: "bold" } } : {},
        didParseCell: isProfit ? (data: any) => {
          if (data.section === "body" && data.row.index === rows.length - 1) {
            const net = rows[rows.length - 1][0];
            data.cell.styles.fillColor = net.includes("PROFIT") ? [230, 255, 240] : [255, 230, 230];
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fontSize = 10;
          }
          if (data.section === "body" && data.row.index === rows.length - 2) {
            data.cell.styles.fontStyle = "bold";
          }
        } : undefined,
      });
    }

    // Footer
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i); doc.setFontSize(8); doc.setTextColor(150);
      doc.text(`Boss Telur - Halaman ${i}/${pages}`, 14, doc.internal.pageSize.getHeight() - 8);
      doc.text("Generated by Boss Telur Farm Management", w - 14, doc.internal.pageSize.getHeight() - 8, { align: "right" });
    }

    doc.save(`Laporan_${reportType}_${dateFrom}_${dateTo}.pdf`);
    toast.success("PDF berhasil diunduh");
  }

  // === EXPORT EXCEL ===
  async function exportExcel() {
    const XLSX = await import("xlsx");
    const { headers, rows } = getTableData();
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Auto column width
    ws["!cols"] = headers.map((_, i) => ({
      wch: Math.max(headers[i].length, ...rows.map(r => (r[i] || "").length)) + 2,
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, reportType);

    // Add summary sheet
    const summaryData = [["Keterangan", "Nilai"], ...summaryStats.map(s => [s.label, s.value])];
    summaryData.push([], ["Periode", `${fmtDate(dateFrom)} - ${fmtDate(dateTo)}`]);
    summaryData.push(["Dicetak", new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" })]);
    const ws2 = XLSX.utils.aoa_to_sheet(summaryData);
    ws2["!cols"] = [{ wch: 25 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Ringkasan");

    XLSX.writeFile(wb, `Laporan_${reportType}_${dateFrom}_${dateTo}.xlsx`);
    toast.success("Excel berhasil diunduh");
  }

  const { headers, rows } = getTableData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Laporan</h1>
          <p className="text-sm text-muted-foreground">Buat dan ekspor laporan peternakan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportPDF} className="border-[#3ecf8e]/30 text-[#3ecf8e] hover:bg-[#3ecf8e]/10">
            <Download className="mr-1 h-4 w-4" />Export PDF
          </Button>
          <Button variant="outline" onClick={exportExcel} className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
            <Download className="mr-1 h-4 w-4" />Export Excel
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="grid gap-2">
              <Label>Tipe Laporan</Label>
              <Select value={reportType} onValueChange={(val) => setReportType((val as ReportType) ?? "Profit")}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Profit">Profit / Loss</SelectItem>
                  <SelectItem value="Production">Produksi Telur</SelectItem>
                  <SelectItem value="Feed">Pemakaian Pakan</SelectItem>
                  <SelectItem value="Sales">Penjualan</SelectItem>
                  <SelectItem value="Attendance">Absensi</SelectItem>
                  <SelectItem value="Expenses">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Dari Tanggal</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-auto" />
            </div>
            <div className="grid gap-2">
              <Label>Sampai Tanggal</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-auto" />
            </div>
            {(reportType === "Production" || reportType === "Feed") && (
              <div className="grid gap-2">
                <Label>Kandang</Label>
                <Select value={houseFilter} onValueChange={(val) => setHouseFilter(val ?? "ALL")}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua</SelectItem>
                    {houses.map((h) => (<SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>))}
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Laporan {reportType}</CardTitle>
          <span className="text-xs text-muted-foreground">{rows.length} data</span>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {headers.map((h, i) => (
                    <TableHead key={i} className={i > 0 && headers.length === 2 ? "text-right" : ""}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, ri) => {
                  // Profit report special styling
                  const isProfit = reportType === "Profit";
                  const isLastRow = isProfit && ri === rows.length - 1;
                  const isSecondLast = isProfit && ri === rows.length - 2;
                  const isFirstRow = isProfit && ri === 0;
                  return (
                    <TableRow
                      key={ri}
                      className={
                        isLastRow ? (row[0].includes("PROFIT") ? "bg-green-500/10" : "bg-red-500/10")
                          : isFirstRow ? "bg-green-500/5"
                          : isSecondLast ? "border-t-2 border-neutral-700"
                          : ""
                      }
                    >
                      {row.map((cell, ci) => (
                        <TableCell
                          key={ci}
                          className={[
                            ci > 0 && headers.length === 2 ? "text-right" : "",
                            isLastRow ? "font-bold text-lg" : "",
                            isSecondLast ? "font-semibold" : "",
                            isFirstRow && ci === 0 ? "font-semibold text-green-400" : "",
                            isFirstRow && ci === 1 ? "font-semibold text-green-400" : "",
                            isProfit && !isFirstRow && !isLastRow && !isSecondLast && ci === 1 && cell.startsWith("-") ? "text-red-400" : "",
                            isLastRow && row[0].includes("PROFIT") ? "text-green-400" : "",
                            isLastRow && row[0].includes("RUGI") ? "text-red-400" : "",
                            isSecondLast ? "text-red-400" : "",
                          ].join(" ")}
                        >
                          {cell}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={headers.length} className="text-center text-muted-foreground py-8">
                      Tidak ada data untuk periode ini.
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
