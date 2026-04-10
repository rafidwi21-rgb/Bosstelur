"use client";

import { useState, useEffect, useMemo } from "react";
import { store } from "@/lib/store";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Receipt, Plus, Trash2, DollarSign, TrendingUp } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

function formatCurrency(n: number) { return `Rp ${n.toLocaleString("id-ID")}`; }
function formatDate(d: string) { try { return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" }); } catch { return d; } }

const CATEGORIES = ["Pakan", "Listrik", "Air", "Gaji", "Transportasi", "Obat & Vitamin", "Peralatan", "Perawatan", "Lainnya"];

interface ExpenseForm {
  category: string;
  description: string;
  amount: string;
  date: string;
  vendor: string;
}
const emptyForm: ExpenseForm = { category: "", description: "", amount: "", date: new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" }), vendor: "" };

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ExpenseForm>(emptyForm);
  const { confirm, confirmDialog } = useConfirm();

  const reload = async () => {
    const [exp, sal] = await Promise.all([api.getExpenses(), api.getSales()]);
    setExpenses(exp);
    setSales(sal);
  };

  useEffect(() => {
    reload();
    const interval = setInterval(reload, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentMonth = store.todayStr().slice(0, 7);

  const monthlyExpenses = useMemo(() =>
    expenses.filter(e => (e.date || "").startsWith(currentMonth)),
    [expenses, currentMonth]
  );
  const monthlyExpenseTotal = useMemo(() =>
    monthlyExpenses.reduce((s: number, e: any) => s + e.amount, 0),
    [monthlyExpenses]
  );

  const monthlySalesTotal = useMemo(() =>
    sales.filter(s => (s.date || "").startsWith(currentMonth)).reduce((s: number, sale: any) => s + sale.totalAmount, 0),
    [sales, currentMonth]
  );

  const netProfit = monthlySalesTotal - monthlyExpenseTotal;

  // Group by category
  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of monthlyExpenses) {
      map[e.category] = (map[e.category] || 0) + e.amount;
    }
    return Object.entries(map).sort(([, a], [, b]) => b - a);
  }, [monthlyExpenses]);

  function openAdd() { setForm(emptyForm); setDialogOpen(true); }

  async function handleSave() {
    if (!form.category || !form.description || !form.amount || !form.date) {
      toast.error("Lengkapi semua field wajib");
      return;
    }
    await api.createExpense({
      category: form.category,
      description: form.description,
      amount: parseFloat(form.amount) || 0,
      date: form.date,
      vendor: form.vendor || null,
    });
    toast.success("Pengeluaran berhasil ditambahkan");
    await reload();
    setDialogOpen(false);
  }

  async function handleDelete(id: string) {
    const ok = await confirm("Hapus Pengeluaran", "Yakin ingin menghapus data pengeluaran ini?");
    if (!ok) return;
    setExpenses(prev => prev.filter(e => e.id !== id));
    try { await api.deleteExpense(id); } catch { await reload(); }
  }

  const sortedExpenses = useMemo(() =>
    [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [expenses]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengeluaran</h1>
          <p className="text-sm text-muted-foreground">Kelola semua pengeluaran operasional</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="mr-1 h-4 w-4" />Tambah Pengeluaran</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400"><Receipt className="h-5 w-5" /></div>
          <div>
            <p className="text-2xl font-bold">{formatCurrency(monthlyExpenseTotal)}</p>
            <p className="text-xs text-muted-foreground">Total Pengeluaran Bulan Ini</p>
          </div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-400"><DollarSign className="h-5 w-5" /></div>
          <div>
            <p className="text-2xl font-bold">{formatCurrency(monthlySalesTotal)}</p>
            <p className="text-xs text-muted-foreground">Total Pendapatan Bulan Ini</p>
          </div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${netProfit >= 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
              {netProfit >= 0 ? "+" : ""}{formatCurrency(netProfit)}
            </p>
            <p className="text-xs text-muted-foreground">Net Profit Bulan Ini</p>
          </div>
        </CardContent></Card>
      </div>

      {/* Category Breakdown */}
      {byCategory.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Pengeluaran per Kategori (Bulan Ini)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {byCategory.map(([cat, amt]) => {
                const pct = monthlyExpenseTotal > 0 ? Math.round((amt / monthlyExpenseTotal) * 100) : 0;
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-28 shrink-0">{cat}</span>
                    <div className="flex-1 h-2 rounded-full bg-neutral-800 overflow-hidden">
                      <div className="h-full rounded-full bg-red-400/70" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm font-medium w-32 text-right tabular-nums">{formatCurrency(amt)}</span>
                    <span className="text-xs text-muted-foreground w-10 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Expenses Table */}
      <Card>
        <CardHeader><CardTitle>Semua Pengeluaran</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedExpenses.map(e => (
                  <TableRow key={e.id}>
                    <TableCell>{formatDate(e.date)}</TableCell>
                    <TableCell><Badge variant="secondary">{e.category}</Badge></TableCell>
                    <TableCell>{e.description}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(e.amount)}</TableCell>
                    <TableCell>{e.vendor || "-"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#6b6b6b] hover:text-red-400" onClick={() => handleDelete(e.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedExpenses.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Belum ada data pengeluaran.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Expense Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Pengeluaran</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Kategori *</Label>
              <Select value={form.category} onValueChange={val => setForm({ ...form, category: val ?? "" })}>
                <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Deskripsi *</Label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="contoh: Bayar listrik bulan Maret" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Jumlah (Rp) *</Label>
                <Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" />
              </div>
              <div className="grid gap-2">
                <Label>Tanggal *</Label>
                <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Vendor / Penyedia</Label>
              <Input value={form.vendor} onChange={e => setForm({ ...form, vendor: e.target.value })} placeholder="opsional" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={!form.category || !form.description || !form.amount}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {confirmDialog}
    </div>
  );
}
