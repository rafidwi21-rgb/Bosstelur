"use client";

import { useState, useEffect, useMemo } from "react";
import { store } from "@/lib/store";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Egg, TrendingUp, AlertCircle, Plus, Pencil, Trash2 } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm-dialog";

function formatCurrency(n: number) { return `Rp ${n.toLocaleString("id-ID")}`; }
function formatDate(d: string) { try { return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); } catch { return d; } }

interface SaleForm { date: string; buyerName: string; quantity: string; pricePerUnit: string; unit: string; paymentMethod: string; isPaid: boolean; }
const emptyForm: SaleForm = { date: new Date().toISOString().split("T")[0], buyerName: "", quantity: "", pricePerUnit: "", unit: "kg", paymentMethod: "TUNAI", isPaid: true };

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SaleForm>(emptyForm);
  const { confirm, confirmDialog } = useConfirm();

  const reload = async () => { const data = await api.getSales(); setSales(data); };
  useEffect(() => { reload(); }, []);

  const currentMonth = store.todayStr().slice(0, 7);
  const thisMonthSales = useMemo(() => sales.filter(s => (s.date || "").startsWith(currentMonth)), [sales, currentMonth]);
  const totalRevenue = useMemo(() => thisMonthSales.reduce((s, e) => s + e.totalAmount, 0), [thisMonthSales]);
  const totalEggsSold = useMemo(() => thisMonthSales.reduce((s, e) => s + e.quantity, 0), [thisMonthSales]);
  const averagePrice = useMemo(() => thisMonthSales.length > 0 ? thisMonthSales.reduce((s, e) => s + e.pricePerUnit, 0) / thisMonthSales.length : 0, [thisMonthSales]);
  const unpaidCount = useMemo(() => sales.filter(s => !s.isPaid).length, [sales]);
  const autoTotal = useMemo(() => (parseFloat(form.quantity) || 0) * (parseFloat(form.pricePerUnit) || 0), [form.quantity, form.pricePerUnit]);
  const sortedSales = useMemo(() => [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [sales]);

  function openAdd() { setEditingId(null); setForm(emptyForm); setDialogOpen(true); }

  function openEdit(sale: any) {
    setEditingId(sale.id);
    setForm({
      date: sale.date ? sale.date.split("T")[0] : "",
      buyerName: sale.buyerName || "",
      quantity: String(sale.quantity),
      pricePerUnit: String(sale.pricePerUnit),
      unit: sale.unit,
      paymentMethod: sale.paymentMethod,
      isPaid: sale.isPaid,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    const qty = parseFloat(form.quantity) || 0;
    const price = parseFloat(form.pricePerUnit) || 0;
    const data = {
      date: form.date, buyerName: form.buyerName || "-", quantity: qty, pricePerUnit: price,
      unit: form.unit, totalAmount: qty * price, paymentMethod: form.paymentMethod, isPaid: form.isPaid,
      recordedBy: store.getCurrentUser()?.id || "",
    };
    if (editingId) {
      await api.updateSale(editingId, data);
    } else {
      await api.createSale(data);
    }
    await reload();
    setDialogOpen(false);
  }

  async function handleDelete(id: string) {
    const ok = await confirm("Hapus Penjualan", "Yakin ingin menghapus data penjualan ini?"); if (!ok) return;
    setSales(prev => prev.filter(s => s.id !== id));
    try { await api.deleteSale(id); } catch { await reload(); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Egg Sales</h1>
          <p className="text-sm text-muted-foreground">Track and manage egg sales</p>
        </div>
        <Button onClick={openAdd}><Plus className="mr-1 h-4 w-4" />Add Sale</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400"><DollarSign className="h-5 w-5" /></div>
          <div><p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p><p className="text-xs text-muted-foreground">Total Revenue (This Month)</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-400"><Egg className="h-5 w-5" /></div>
          <div><p className="text-2xl font-bold">{totalEggsSold.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Eggs Sold (This Month)</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400"><TrendingUp className="h-5 w-5" /></div>
          <div><p className="text-2xl font-bold">{formatCurrency(Math.round(averagePrice))}</p><p className="text-xs text-muted-foreground">Average Price</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400"><AlertCircle className="h-5 w-5" /></div>
          <div><p className="text-2xl font-bold">{unpaidCount}</p><p className="text-xs text-muted-foreground">Unpaid Sales</p></div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Sales Records</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSales.map(sale => (
                  <TableRow key={sale.id}>
                    <TableCell>{formatDate(sale.date)}</TableCell>
                    <TableCell className="font-medium">{sale.buyerName}</TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell>{sale.unit}</TableCell>
                    <TableCell>{formatCurrency(sale.pricePerUnit)}</TableCell>
                    <TableCell>{formatCurrency(sale.totalAmount)}</TableCell>
                    <TableCell>{sale.paymentMethod}</TableCell>
                    <TableCell>
                      {sale.isPaid ? <Badge variant="default">Paid</Badge> : <Badge variant="destructive">Unpaid</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#6b6b6b] hover:text-white" onClick={() => openEdit(sale)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#6b6b6b] hover:text-red-400" onClick={() => handleDelete(sale.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedSales.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground">No sales records found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Sale" : "Add Sale"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Buyer Name</Label>
              <Input value={form.buyerName} onChange={e => setForm({ ...form, buyerName: e.target.value })} placeholder="Enter buyer name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Quantity</Label>
                <Input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
              </div>
              <div className="grid gap-2">
                <Label>Unit</Label>
                <select className="h-10 w-full rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-3 text-sm text-white" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                  <option value="kg">Kg</option>
                  <option value="tray">Tray</option>
                  <option value="butir">Butir</option>
                </select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Price per Unit (Rp)</Label>
              <Input type="number" value={form.pricePerUnit} onChange={e => setForm({ ...form, pricePerUnit: e.target.value })} placeholder="0" />
            </div>
            {autoTotal > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-[#161616] border border-[#1e1e1e] px-3 py-2">
                <span className="text-xs text-[#6b6b6b]">Total</span>
                <span className="text-sm font-bold text-white">{formatCurrency(autoTotal)}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Payment</Label>
                <select className="h-10 w-full rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-3 text-sm text-white" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
                  <option value="TUNAI">Tunai</option>
                  <option value="TRANSFER">Transfer</option>
                  <option value="HUTANG">Hutang</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <select className="h-10 w-full rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-3 text-sm text-white" value={form.isPaid ? "true" : "false"} onChange={e => setForm({ ...form, isPaid: e.target.value === "true" })}>
                  <option value="true">Lunas</option>
                  <option value="false">Belum Lunas</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.quantity || !form.pricePerUnit}>
              {editingId ? "Save Changes" : "Add Sale"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {confirmDialog}
    </div>
  );
}
