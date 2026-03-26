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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, TrendingUp, AlertTriangle, Plus, Pencil, Trash2 } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm-dialog";

function formatCurrency(n: number) { return `Rp ${n.toLocaleString("id-ID")}`; }
function formatDate(d: string) { try { return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }); } catch { return d; } }

interface FeedForm { feedType: string; quantity: string; unit: string; costPerUnit: string; supplier: string; purchaseDate: string; }
const emptyForm: FeedForm = { feedType: "", quantity: "", unit: "kg", costPerUnit: "", supplier: "", purchaseDate: new Date().toISOString().split("T")[0] };

export default function FeedPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [feedUsage, setFeedUsage] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FeedForm>(emptyForm);
  const { confirm, confirmDialog } = useConfirm();

  const reload = async () => {
    const [inv, usage] = await Promise.all([api.getFeedInventory(), api.getFeedUsage()]);
    setInventory(inv);
    setFeedUsage(usage);
  };

  // Auto-refresh every 30 seconds to reflect worker feed usage in real-time
  useEffect(() => {
    reload();
    const interval = setInterval(reload, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalStock = useMemo(() => inventory.reduce((s, f) => s + f.quantity, 0), [inventory]);
  const currentMonth = store.todayStr().slice(0, 7);
  const monthlyUsage = useMemo(() => feedUsage.filter((u: any) => (u.date || "").startsWith(currentMonth)).reduce((s: number, u: any) => s + u.quantity, 0), [feedUsage, currentMonth]);
  const lowStockItems = useMemo(() => inventory.filter(f => f.quantity < 100), [inventory]);
  const sortedUsage = useMemo(() => [...feedUsage].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()), [feedUsage]);

  // Estimasi hari stok habis berdasarkan rata-rata pemakaian harian
  const avgDailyUsage = useMemo(() => {
    const uniqueDays = new Set(feedUsage.map((u: any) => u.date)).size;
    if (uniqueDays === 0) return 0;
    const total = feedUsage.reduce((s: number, u: any) => s + u.quantity, 0);
    return total / uniqueDays;
  }, [feedUsage]);
  const daysLeft = avgDailyUsage > 0 ? Math.floor(totalStock / avgDailyUsage) : totalStock > 0 ? 999 : 0;
  const totalValue = useMemo(() => inventory.reduce((s, f) => s + f.quantity * f.costPerUnit, 0), [inventory]);

  function openAdd() { setEditingId(null); setForm(emptyForm); setDialogOpen(true); }

  function openEdit(feed: any) {
    setEditingId(feed.id);
    setForm({
      feedType: feed.feedType, quantity: String(feed.quantity), unit: feed.unit,
      costPerUnit: String(feed.costPerUnit), supplier: feed.supplier || "",
      purchaseDate: feed.purchaseDate ? feed.purchaseDate.split("T")[0] : "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    const data = {
      feedType: form.feedType,
      quantity: parseFloat(form.quantity) || 0,
      unit: form.unit,
      costPerUnit: parseFloat(form.costPerUnit) || 0,
      supplier: form.supplier,
      purchaseDate: form.purchaseDate,
    };
    if (editingId) {
      await api.updateFeedInventory(editingId, data);
    } else {
      await api.createFeedInventory(data);
    }
    await reload();
    setDialogOpen(false);
  }

  async function handleDelete(id: string) {
    const ok = await confirm("Hapus Pakan", "Yakin ingin menghapus data pakan ini?"); if (!ok) return;
    setInventory(prev => prev.filter(f => f.id !== id));
    try { await api.deleteFeedInventory(id); } catch { await reload(); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Feed Management</h1>
        <p className="text-sm text-muted-foreground">Manage feed inventory and track usage</p>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="rounded-xl border border-red-500/20 bg-red-950/30 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-300 font-medium">Stok Pakan Menipis — Segera Beli!</p>
            <p className="text-xs text-red-400/70 mt-0.5">
              {lowStockItems.map(f => `${f.feedType}: ${f.quantity} ${f.unit}`).join(" · ")}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card><CardContent className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400"><Package className="h-5 w-5" /></div>
          <div>
            <p className="text-2xl font-bold">{totalStock.toLocaleString()} kg</p>
            <p className="text-xs text-muted-foreground">Total Stok</p>
            <p className="text-[11px] text-muted-foreground">Nilai: Rp {totalValue.toLocaleString("id-ID")}</p>
          </div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-400"><TrendingUp className="h-5 w-5" /></div>
          <div>
            <p className="text-2xl font-bold">{monthlyUsage.toLocaleString()} kg</p>
            <p className="text-xs text-muted-foreground">Pemakaian Bulan Ini</p>
            <p className="text-[11px] text-muted-foreground">Rata-rata: {Math.round(avgDailyUsage)} kg/hari</p>
          </div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${daysLeft <= 7 ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"}`}>
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className={`text-2xl font-bold ${daysLeft <= 7 ? "text-red-400" : ""}`}>{daysLeft > 999 ? "∞" : daysLeft} hari</p>
            <p className="text-xs text-muted-foreground">Estimasi Stok Habis</p>
          </div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-400"><AlertTriangle className="h-5 w-5" /></div>
          <div><p className="text-2xl font-bold">{lowStockItems.length}</p><p className="text-xs text-muted-foreground">Low Stock (&lt;100kg)</p></div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="inventory">
        <TabsList><TabsTrigger value="inventory">Inventory</TabsTrigger><TabsTrigger value="usage">Usage Log</TabsTrigger></TabsList>

        <TabsContent value="inventory">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Feed Inventory</CardTitle>
              <Button size="sm" onClick={openAdd}><Plus className="mr-1 h-4 w-4" />Add Feed</Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feed Type</TableHead>
                      <TableHead>Sisa Stok</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Cost/Unit</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Purchase Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map(feed => (
                      <TableRow key={feed.id}>
                        <TableCell className="font-medium">{feed.feedType}</TableCell>
                        <TableCell>{feed.quantity.toLocaleString()}</TableCell>
                        <TableCell>{feed.unit}</TableCell>
                        <TableCell>{formatCurrency(feed.costPerUnit)}</TableCell>
                        <TableCell>{feed.supplier || "-"}</TableCell>
                        <TableCell>{formatDate(feed.purchaseDate)}</TableCell>
                        <TableCell>
                          {feed.quantity < 100
                            ? <Badge variant="destructive">Low Stock</Badge>
                            : <Badge variant="secondary">In Stock</Badge>}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#6b6b6b] hover:text-white" onClick={() => openEdit(feed)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#6b6b6b] hover:text-red-400" onClick={() => handleDelete(feed.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {inventory.length === 0 && (
                      <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground">No feed inventory found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <Card>
            <CardHeader><CardTitle>Feed Usage Log</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
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
                    {sortedUsage.map((usage: any) => (
                      <TableRow key={usage.id}>
                        <TableCell>{formatDate(usage.date)}</TableCell>
                        <TableCell>{usage.house?.name || usage.houseName || "-"}</TableCell>
                        <TableCell>{usage.feed?.feedType || usage.feedType || "-"}</TableCell>
                        <TableCell>{usage.quantity}</TableCell>
                        <TableCell>{usage.worker?.name || usage.workerName || "-"}</TableCell>
                      </TableRow>
                    ))}
                    {sortedUsage.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No usage records found.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Feed" : "Add Feed"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Feed Type</Label>
              <Input value={form.feedType} onChange={e => setForm({ ...form, feedType: e.target.value })} placeholder="e.g. Layer Mash" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Quantity</Label>
                <Input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
              </div>
              <div className="grid gap-2">
                <Label>Unit</Label>
                <Input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="kg" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Cost per Unit (Rp)</Label>
              <Input type="number" value={form.costPerUnit} onChange={e => setForm({ ...form, costPerUnit: e.target.value })} placeholder="0" />
            </div>
            <div className="grid gap-2">
              <Label>Supplier</Label>
              <Input value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier name" />
            </div>
            <div className="grid gap-2">
              <Label>Purchase Date</Label>
              <Input type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.feedType || !form.quantity}>
              {editingId ? "Save Changes" : "Add Feed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {confirmDialog}
    </div>
  );
}
