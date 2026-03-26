"use client";

import { useEffect, useState, useCallback } from "react";
import { store } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChickenBossIcon } from "@/components/logo/chicken-boss";
import { api } from "@/lib/api";
import { Camera, CheckCircle2, Clock, Wheat, Egg, Sparkles, Droplets, LogOut as LogOutIcon, PartyPopper, Pencil, Sunrise, Sunset, ChevronRight, ShoppingBag, Plus, Trash2, X, Check } from "lucide-react";

const TASK_ICONS: Record<string, React.ElementType> = { FEEDING: Wheat, EGG_COLLECTION: Egg, CLEANING: Sparkles, WATER_CHECK: Droplets };
const TASK_COLORS: Record<string, string> = {
  FEEDING: "text-amber-400 bg-amber-400/10 border-amber-500/10",
  EGG_COLLECTION: "text-[#3ecf8e] bg-[#3ecf8e]/10 border-[#3ecf8e]/10",
  CLEANING: "text-blue-400 bg-blue-400/10 border-blue-500/10",
  WATER_CHECK: "text-cyan-400 bg-cyan-400/10 border-cyan-500/10",
};

function formatTime(ts: string) { return new Date(ts).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }); }
function toBahasa(t: string) {
  return t.replace("Feed Chickens (Morning)", "Beri Pakan Ayam (Pagi)").replace("Feed Chickens (Evening)", "Beri Pakan Ayam (Sore)")
    .replace("Collect Eggs (Morning)", "Kumpulkan Telur (Pagi)").replace("Collect Eggs (Evening)", "Kumpulkan Telur (Sore)")
    .replace("Clean Poultry House", "Bersihkan Kandang").replace("Check Drinking Water", "Cek Air Minum");
}
function houseNameBahasa(n: string) { return n.replace("House", "Kandang"); }

export default function WorkerPage() {
  const [user, setUser] = useState<any>(null);
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  const [checkIn, setCheckIn] = useState<any>(null);
  const [checkOut, setCheckOut] = useState<any>(null);
  const [taskInputs, setTaskInputs] = useState<Record<string, Record<string, string | number>>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [todaySales, setTodaySales] = useState<any[]>([]);
  const [saleForm, setSaleForm] = useState({ quantity: "", pricePerUnit: "", unit: "kg", paymentMethod: "TUNAI" });
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [editSaleForm, setEditSaleForm] = useState({ quantity: "", pricePerUnit: "", unit: "kg", paymentMethod: "TUNAI" });
  const today = store.todayStr();

  const load = useCallback(async () => {
    const u = store.getCurrentUser(); if (!u) return; setUser(u);
    try {
      const [att, tasks, sales] = await Promise.all([
        api.getAttendance(today, u.id),
        api.getTasks(today, u.id),
        api.getSales(today, today, u.id),
      ]);
      setCheckIn(att.find((a: any) => a.type === "CHECK_IN") || null);
      setCheckOut(att.find((a: any) => a.type === "CHECK_OUT") || null);
      setTodayTasks(tasks.map((ta: any) => ({ ...ta, taskTitle: ta.task?.title, taskType: ta.task?.type, timeSlot: ta.task?.timeSlot, houseName: ta.task?.house?.name || "", houseId: ta.task?.houseId || ta.houseId })));
      setTodaySales(sales);
    } catch (e) { console.error("Load error:", e); }
  }, [today]);

  useEffect(() => { load(); }, [load]);

  const doCheckIn = async () => { if (!user) return; await api.checkIn(user.id); load(); };
  const doCheckOut = async () => { if (!user) return; await api.checkOut(user.id); load(); };
  const undoCheckOut = async () => { if (!user) return; await api.undoCheckOut(user.id, today); load(); };

  const addSale = async () => {
    if (!user) return;
    const qty = Number(saleForm.quantity) || 0;
    const price = Number(saleForm.pricePerUnit) || 0;
    if (qty <= 0 || price <= 0) return;
    await api.createSale({
      date: today, buyerName: "-", quantity: qty, pricePerUnit: price, unit: saleForm.unit,
      totalAmount: qty * price, paymentMethod: saleForm.paymentMethod,
      isPaid: saleForm.paymentMethod !== "HUTANG", recordedBy: user.id,
    });
    setSaleForm({ quantity: "", pricePerUnit: "", unit: "kg", paymentMethod: "TUNAI" });
    load();
  };

  const startEditSale = (sale: any) => {
    setEditingSaleId(sale.id);
    setEditSaleForm({ quantity: String(sale.quantity), pricePerUnit: String(sale.pricePerUnit), unit: sale.unit, paymentMethod: sale.paymentMethod });
  };

  const saveEditSale = async (id: string) => {
    const qty = Number(editSaleForm.quantity) || 0;
    const price = Number(editSaleForm.pricePerUnit) || 0;
    await api.updateSale(id, { quantity: qty, pricePerUnit: price, unit: editSaleForm.unit, paymentMethod: editSaleForm.paymentMethod, totalAmount: qty * price, isPaid: editSaleForm.paymentMethod !== "HUTANG" });
    setEditingSaleId(null);
    load();
  };

  const deleteSale = async (id: string) => { await api.deleteSale(id); load(); };

  const startTask = async (id: string) => { await api.updateTask(id, { status: "IN_PROGRESS", startedAt: new Date().toISOString() }); load(); };
  const editTask = (task: any) => {
    setEditingId(task.id);
    const p: Record<string, string | number> = {};
    if (task.feedQuantity) p.feedQuantity = task.feedQuantity;
    if (task.eggsKg) p.eggsKg = task.eggsKg; if (task.eggsUnit) p.eggsUnit = task.eggsUnit;
    if (task.eggsBrokenUnit) p.eggsBrokenUnit = task.eggsBrokenUnit;
    if (task.notes) p.notes = task.notes; if (task.waterStatus) p.waterStatus = task.waterStatus;
    setTaskInputs(prev => ({ ...prev, [task.id]: p }));
  };
  const setInput = (id: string, k: string, v: string | number) => setTaskInputs(prev => ({ ...prev, [id]: { ...prev[id], [k]: v } }));

  const isTaskInputValid = (task: any) => {
    const inp = taskInputs[task.id] || {};
    if (task.taskType === "FEEDING") return Number(inp.feedQuantity) > 0;
    if (task.taskType === "EGG_COLLECTION") return Number(inp.eggsKg) > 0 || Number(inp.eggsUnit) > 0;
    if (task.taskType === "CLEANING") return ((inp.notes as string) || "").trim().length > 0;
    if (task.taskType === "WATER_CHECK") return true; // always has default "Normal"
    return true;
  };

  const completeTask = async (task: any) => {
    if (!user) return;
    if (!isTaskInputValid(task)) return;
    const inp = taskInputs[task.id] || {};
    const isEdit = editingId === task.id;
    const upd: any = { status: "COMPLETED", completedAt: new Date().toISOString() };

    const houseId = task.houseId || task.task?.houseId || "";

    if (task.taskType === "FEEDING") {
      upd.feedQuantity = Number(inp.feedQuantity) || 0;
      if (!isEdit && upd.feedQuantity > 0) {
        try {
          let feeds = await api.getFeedInventory();
          if (feeds.length === 0) {
            await api.createFeedInventory({ feedType: "Pakan Ayam", quantity: 1000, unit: "kg", costPerUnit: 8500, supplier: "-", purchaseDate: today });
            feeds = await api.getFeedInventory();
          }
          const f = feeds[0];
          if (f && houseId) await api.createFeedUsage({ feedId: f.id, houseId, usedBy: user.id, date: today, quantity: upd.feedQuantity });
        } catch (e) { console.error("Feed usage error:", e); }
      }
    }
    if (task.taskType === "EGG_COLLECTION") {
      const kg = Number(inp.eggsKg) || 0, unit = Number(inp.eggsUnit) || 0, bu = Number(inp.eggsBrokenUnit) || 0;
      upd.eggsKg = kg; upd.eggsUnit = unit; upd.eggsBrokenUnit = bu;
      if (!isEdit && (kg > 0 || unit > 0)) {
        try {
          if (houseId) await api.createProduction({ houseId, collectedBy: user.id, date: today, totalKg: kg, totalUnit: unit, brokenKg: 0, brokenUnit: bu, goodKg: kg, goodUnit: unit - bu });
        } catch (e) { console.error("Production error:", e); }
      }
    }
    if (task.taskType === "CLEANING") upd.notes = (inp.notes as string) || "";
    if (task.taskType === "WATER_CHECK") upd.waterStatus = (inp.waterStatus as string) || "Normal";
    await api.updateTask(task.id, upd);
    setEditingId(null); load();
  };

  if (!user) return null;
  const allDone = todayTasks.length > 0 && todayTasks.every(t => t.status === "COMPLETED");
  const morningTasks = todayTasks.filter(t => t.timeSlot === "MORNING");
  const eveningTasks = todayTasks.filter(t => t.timeSlot === "EVENING");
  const doneCount = todayTasks.filter(t => t.status === "COMPLETED").length;

  // === SHARED SALES SECTION (plain JSX, not a component to avoid remount) ===
  const salesSection = (
    <div className="space-y-3 pt-2">
      <div className="flex items-center gap-2">
        <ShoppingBag className="size-3.5 text-[#4a4a4a]" />
        <h3 className="text-[10px] font-semibold text-[#4a4a4a] uppercase tracking-[0.15em]">Penjualan Telur Hari Ini</h3>
      </div>

      {/* Inline add form — always visible */}
      <div className="rounded-xl border border-[#1e1e1e] bg-[#111] p-3 space-y-2.5">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="mb-1 block text-[9px] font-semibold text-[#4a4a4a] uppercase">Jumlah</label>
            <Input type="number" placeholder="0" min={0} step="0.1" className="h-10 text-sm bg-[#0a0a0a] border-[#1e1e1e] text-white focus:border-[#3ecf8e]/40" value={saleForm.quantity} onChange={e => setSaleForm({ ...saleForm, quantity: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-[9px] font-semibold text-[#4a4a4a] uppercase">Satuan</label>
            <select className="h-10 w-full rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-2 text-sm text-white outline-none focus:border-[#3ecf8e]/40" value={saleForm.unit} onChange={e => setSaleForm({ ...saleForm, unit: e.target.value })}>
              <option value="kg">Kg</option>
              <option value="tray">Tray</option>
              <option value="butir">Butir</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[9px] font-semibold text-[#4a4a4a] uppercase">Harga/Satuan</label>
            <Input type="number" placeholder="Rp" min={0} className="h-10 text-sm bg-[#0a0a0a] border-[#1e1e1e] text-white focus:border-[#3ecf8e]/40" value={saleForm.pricePerUnit} onChange={e => setSaleForm({ ...saleForm, pricePerUnit: e.target.value })} />
          </div>
        </div>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="mb-1 block text-[9px] font-semibold text-[#4a4a4a] uppercase">Bayar</label>
            <select className="h-10 w-full rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-2 text-sm text-white outline-none focus:border-[#3ecf8e]/40" value={saleForm.paymentMethod} onChange={e => setSaleForm({ ...saleForm, paymentMethod: e.target.value })}>
              <option value="TUNAI">Tunai</option>
              <option value="TRANSFER">Transfer</option>
              <option value="HUTANG">Hutang</option>
            </select>
          </div>
          <Button className="h-10 px-4 font-semibold rounded-lg bg-[#3ecf8e] text-black hover:bg-[#4ae39e] text-sm" onClick={addSale}>
            <Plus className="size-4 mr-1" />Simpan
          </Button>
        </div>
        {(Number(saleForm.quantity) > 0 && Number(saleForm.pricePerUnit) > 0) && (
          <p className="text-xs text-[#6b6b6b] text-right">Total: <span className="text-white font-semibold">Rp {(Number(saleForm.quantity) * Number(saleForm.pricePerUnit)).toLocaleString("id-ID")}</span></p>
        )}
      </div>

      {/* Saved sales list */}
      {todaySales.length > 0 && (
        <div className="space-y-1.5">
          {todaySales.map(sale => (
            <div key={sale.id} className="rounded-lg border border-[#1e1e1e] bg-[#111] px-3 py-2.5">
              {editingSaleId === sale.id ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <Input type="number" min={0} step="0.1" className="h-9 text-sm bg-[#0a0a0a] border-[#1e1e1e] text-white" value={editSaleForm.quantity} onChange={e => setEditSaleForm({ ...editSaleForm, quantity: e.target.value })} />
                    <select className="h-9 rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-2 text-sm text-white" value={editSaleForm.unit} onChange={e => setEditSaleForm({ ...editSaleForm, unit: e.target.value })}>
                      <option value="kg">Kg</option><option value="tray">Tray</option><option value="butir">Butir</option>
                    </select>
                    <Input type="number" min={0} className="h-9 text-sm bg-[#0a0a0a] border-[#1e1e1e] text-white" value={editSaleForm.pricePerUnit} onChange={e => setEditSaleForm({ ...editSaleForm, pricePerUnit: e.target.value })} />
                  </div>
                  <div className="flex gap-2">
                    <select className="h-9 flex-1 rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-2 text-sm text-white" value={editSaleForm.paymentMethod} onChange={e => setEditSaleForm({ ...editSaleForm, paymentMethod: e.target.value })}>
                      <option value="TUNAI">Tunai</option><option value="TRANSFER">Transfer</option><option value="HUTANG">Hutang</option>
                    </select>
                    <button onClick={() => saveEditSale(sale.id)} className="h-9 px-3 rounded-lg bg-[#3ecf8e] text-black text-xs font-semibold hover:bg-[#4ae39e]"><Check className="size-3.5" /></button>
                    <button onClick={() => setEditingSaleId(null)} className="h-9 px-3 rounded-lg bg-[#1e1e1e] text-[#6b6b6b] text-xs hover:bg-[#222]"><X className="size-3.5" /></button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">{sale.quantity} {sale.unit} <span className="text-[#4a4a4a]">×</span> Rp {sale.pricePerUnit.toLocaleString("id-ID")} <span className="text-[#4a4a4a]">= </span><span className="font-semibold">Rp {sale.totalAmount.toLocaleString("id-ID")}</span></p>
                    <p className="text-[10px] text-[#4a4a4a]">{sale.paymentMethod === "HUTANG" ? "Hutang" : sale.paymentMethod === "TRANSFER" ? "Transfer" : "Tunai"}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEditSale(sale)} className="p-1.5 text-[#3a3a3a] hover:text-[#999] transition"><Pencil className="size-3" /></button>
                    <button onClick={() => deleteSale(sale.id)} className="p-1.5 text-[#3a3a3a] hover:text-red-400 transition"><Trash2 className="size-3" /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="flex items-center justify-between px-1 pt-1">
            <span className="text-[10px] text-[#4a4a4a] uppercase tracking-widest">Total Penjualan</span>
            <span className="text-sm font-bold text-[#3ecf8e]">Rp {todaySales.reduce((s, sale) => s + sale.totalAmount, 0).toLocaleString("id-ID")}</span>
          </div>
        </div>
      )}
    </div>
  );

  // === RENDER TASK GROUP ===
  const renderGroup = (tasks: any[], label: string, SlotIcon: React.ElementType) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 pt-1">
        <SlotIcon className="size-3.5 text-[#4a4a4a]" />
        <h3 className="text-[10px] font-semibold text-[#4a4a4a] uppercase tracking-[0.15em]">{label}</h3>
      </div>
      {tasks.map(task => {
        const Icon = TASK_ICONS[task.taskType] || Wheat;
        const color = TASK_COLORS[task.taskType];
        const editing = editingId === task.id;
        return (
          <div key={task.id} className="rounded-xl border border-[#1e1e1e] bg-[#111] overflow-hidden">
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg border ${color}`}><Icon className="size-4" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white text-sm">{toBahasa(task.taskTitle)}</h3>
                  <p className="text-xs text-[#4a4a4a]">{houseNameBahasa(task.houseName)}</p>
                </div>
                <StatusBadge status={task.status} />
              </div>
              {task.status === "PENDING" && (
                <Button className="w-full h-11 text-sm font-semibold rounded-lg bg-[#3ecf8e] text-black hover:bg-[#4ae39e]" onClick={() => startTask(task.id)}>
                  Mulai Tugas <ChevronRight className="ml-1 size-4" />
                </Button>
              )}
              {(task.status === "IN_PROGRESS" || editing) && (
                <div className="space-y-3 rounded-lg bg-[#0e0e0e] border border-[#1a1a1a] p-3">
                  {task.taskType === "FEEDING" && (
                    <div><label className="mb-1.5 block text-[10px] font-semibold text-[#6b6b6b] uppercase tracking-wider">Jumlah Pakan (kg)</label>
                      <Input type="number" placeholder="Masukkan kg" min={0} step="0.1" className="h-11 bg-[#0a0a0a] border-[#1e1e1e] text-white focus:border-[#3ecf8e]/40" value={taskInputs[task.id]?.feedQuantity ?? ""} onChange={e => setInput(task.id, "feedQuantity", e.target.value)} /></div>
                  )}
                  {task.taskType === "EGG_COLLECTION" && (<>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label className="mb-1.5 block text-[10px] font-semibold text-[#6b6b6b] uppercase tracking-wider">Berat (kg)</label>
                        <Input type="number" placeholder="0.0" min={0} step="0.1" className="h-11 bg-[#0a0a0a] border-[#1e1e1e] text-white focus:border-[#3ecf8e]/40" value={taskInputs[task.id]?.eggsKg ?? ""} onChange={e => setInput(task.id, "eggsKg", e.target.value)} /></div>
                      <div><label className="mb-1.5 block text-[10px] font-semibold text-[#6b6b6b] uppercase tracking-wider">Jumlah (butir)</label>
                        <Input type="number" placeholder="0" min={0} className="h-11 bg-[#0a0a0a] border-[#1e1e1e] text-white focus:border-[#3ecf8e]/40" value={taskInputs[task.id]?.eggsUnit ?? ""} onChange={e => setInput(task.id, "eggsUnit", e.target.value)} /></div>
                    </div>
                    <div><label className="mb-1.5 block text-[10px] font-semibold text-[#6b6b6b] uppercase tracking-wider">Telur Pecah (butir)</label>
                      <Input type="number" placeholder="0" min={0} className="h-11 bg-[#0a0a0a] border-[#1e1e1e] text-white focus:border-[#3ecf8e]/40" value={taskInputs[task.id]?.eggsBrokenUnit ?? ""} onChange={e => setInput(task.id, "eggsBrokenUnit", e.target.value)} /></div>
                  </>)}
                  {task.taskType === "CLEANING" && (
                    <div><label className="mb-1.5 block text-[10px] font-semibold text-[#6b6b6b] uppercase tracking-wider">Catatan</label>
                      <Textarea placeholder="Tambahkan catatan..." className="bg-[#0a0a0a] border-[#1e1e1e] text-white focus:border-[#3ecf8e]/40" value={(taskInputs[task.id]?.notes as string) ?? ""} onChange={e => setInput(task.id, "notes", e.target.value)} /></div>
                  )}
                  {task.taskType === "WATER_CHECK" && (
                    <div><label className="mb-1.5 block text-[10px] font-semibold text-[#6b6b6b] uppercase tracking-wider">Status Air</label>
                      <select className="h-11 w-full rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-3 text-sm text-white outline-none focus:border-[#3ecf8e]/40" value={(taskInputs[task.id]?.waterStatus as string) ?? "Normal"} onChange={e => setInput(task.id, "waterStatus", e.target.value)}>
                        <option value="Normal">Normal</option><option value="Kurang">Kurang</option><option value="Rusak">Rusak</option>
                      </select></div>
                  )}
                  <div className="flex gap-2">
                    {editing && <Button variant="outline" className="flex-1 h-11 rounded-lg border-[#1e1e1e] text-[#6b6b6b] hover:bg-[#161616]" onClick={() => setEditingId(null)}>Batal</Button>}
                    <Button className={`${editing ? "flex-1" : "w-full"} h-11 font-semibold rounded-lg bg-[#3ecf8e] text-black hover:bg-[#4ae39e] disabled:opacity-40 disabled:cursor-not-allowed`} onClick={() => completeTask(task)} disabled={!isTaskInputValid(task)}>
                      <CheckCircle2 className="mr-2 size-4" />{editing ? "Simpan" : "Selesai"}
                    </Button>
                  </div>
                </div>
              )}
              {task.status === "COMPLETED" && !editing && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between rounded-lg bg-[#3ecf8e]/5 border border-[#3ecf8e]/10 px-3 py-2.5">
                    <div className="flex items-center gap-2 text-[#3ecf8e]">
                      <CheckCircle2 className="size-4" /><span className="text-sm font-medium">Selesai</span>
                      {task.completedAt && <span className="text-[#3ecf8e]/50 text-xs">· {formatTime(task.completedAt)}</span>}
                    </div>
                    <button className="text-[11px] text-[#4a4a4a] hover:text-[#999] transition" onClick={() => editTask(task)}><Pencil className="size-3 inline mr-0.5" />Ubah</button>
                  </div>
                  <div className="text-[11px] text-[#4a4a4a] px-1">
                    {task.taskType === "FEEDING" && task.feedQuantity && <span>Pakan: {task.feedQuantity} kg</span>}
                    {task.taskType === "EGG_COLLECTION" && task.eggsKg !== undefined && <span>{task.eggsKg} kg · {task.eggsUnit || 0} butir · {task.eggsBrokenUnit || 0} pecah</span>}
                    {task.taskType === "WATER_CHECK" && task.waterStatus && <span>Status: {task.waterStatus}</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // =====================
  // SUDAH PULANG
  // =====================
  if (checkIn && checkOut) return (
    <div className="space-y-5 pt-6">
      <div className="text-center space-y-3">
        <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-[#3ecf8e] shadow-md shadow-[#3ecf8e]/15 overflow-hidden">
          <ChickenBossIcon size={56} />
        </div>
        <h1 className="text-2xl font-bold text-white">Sampai jumpa besok, {user.name.split(" ")[0]}!</h1>
        <p className="text-[#6b6b6b]">Kerja bagus hari ini</p>
      </div>

      {salesSection}

      <div className="rounded-xl border border-[#1e1e1e] bg-[#111] p-5 space-y-4">
        <p className="text-[10px] text-[#4a4a4a] uppercase tracking-widest font-semibold">Ringkasan Hari Ini</p>
        {[["Tugas Selesai", `${doneCount} / ${todayTasks.length}`], ["Masuk", formatTime(checkIn.timestamp)], ["Pulang", formatTime(checkOut.timestamp)]].map(([l, v]) => (
          <div key={l} className="flex items-center justify-between border-b border-[#1a1a1a] pb-3 last:border-0 last:pb-0">
            <span className="text-sm text-[#6b6b6b]">{l}</span>
            <span className="font-semibold text-white font-mono text-sm">{v}</span>
          </div>
        ))}
      </div>
      <Button variant="outline" className="w-full h-11 rounded-lg text-[#6b6b6b] border-[#1e1e1e] hover:bg-[#161616] hover:text-white" onClick={undoCheckOut}>
        Batalkan Pulang
      </Button>
      <p className="text-center text-[10px] text-[#3a3a3a]">Tekan jika tidak sengaja check out</p>
    </div>
  );

  // =====================
  // SUDAH MASUK
  // =====================
  if (checkIn && !checkOut) {
    const pct = todayTasks.length > 0 ? Math.round((doneCount / todayTasks.length) * 100) : 0;

    return (
      <div className="space-y-4 pt-2">
        <div className="rounded-xl border border-[#1e1e1e] bg-[#111] p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white">Selamat datang, {user.name.split(" ")[0]}</h1>
              <p className="flex items-center gap-1 text-xs text-[#6b6b6b]"><Clock className="size-3" />Masuk pukul {formatTime(checkIn.timestamp)}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{doneCount}<span className="text-[#4a4a4a]">/{todayTasks.length}</span></p>
              <p className="text-[10px] text-[#4a4a4a] uppercase tracking-widest">Selesai</p>
            </div>
          </div>
          <div className="mt-3 h-1 rounded-full bg-[#1a1a1a] overflow-hidden">
            <div className="h-full rounded-full bg-[#3ecf8e] transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {todayTasks.length === 0 && <div className="rounded-xl border border-[#1e1e1e] bg-[#111] py-10 text-center text-[#4a4a4a]">Tidak ada tugas hari ini.</div>}
        {morningTasks.length > 0 && renderGroup(morningTasks, "Tugas Pagi", Sunrise)}
        {eveningTasks.length > 0 && renderGroup(eveningTasks, "Tugas Sore", Sunset)}

        {salesSection}

        {allDone && (
          <div className="rounded-xl border border-[#3ecf8e]/10 bg-[#3ecf8e]/5 p-6 text-center space-y-3">
            <PartyPopper className="mx-auto size-10 text-[#3ecf8e]" />
            <div><h3 className="text-lg font-semibold text-white">Semua tugas selesai!</h3><p className="text-sm text-[#6b6b6b]">Kerja bagus. Siap pulang?</p></div>
            <Button className="w-full h-11 font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white" onClick={doCheckOut}><LogOutIcon className="mr-2 size-4" />Pulang</Button>
          </div>
        )}
        {!allDone && todayTasks.length > 0 && (
          <Button variant="outline" className="w-full h-11 rounded-lg text-red-400 border-[#1e1e1e] hover:bg-red-500/5" onClick={doCheckOut}><LogOutIcon className="mr-2 size-4" />Pulang Lebih Awal</Button>
        )}
      </div>
    );
  }

  // =====================
  // BELUM MASUK
  // =====================
  return (
    <div className="space-y-6 pt-8">
      <div className="text-center space-y-3">
        <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-[#3ecf8e] shadow-md shadow-[#3ecf8e]/15 overflow-hidden">
          <ChickenBossIcon size={56} />
        </div>
        <h1 className="text-2xl font-bold text-white">Selamat Pagi, {user.name.split(" ")[0]}</h1>
        <p className="text-[#6b6b6b]">Siap memulai hari kerja?</p>
      </div>
      <div className="rounded-xl border border-[#1e1e1e] bg-[#111] p-6 text-center space-y-5">
        <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-[#3ecf8e]/10 border border-[#3ecf8e]/10">
          <Camera className="size-7 text-[#3ecf8e]" />
        </div>
        <div><h3 className="text-lg font-semibold text-white">Absen Masuk</h3><p className="text-sm text-[#6b6b6b]">Mulai shift dengan absen masuk</p></div>
        <Button className="w-full h-11 font-semibold rounded-lg bg-[#3ecf8e] text-black hover:bg-[#4ae39e]" onClick={doCheckIn}>
          Masuk Sekarang <ChevronRight className="ml-1 size-4" />
        </Button>
      </div>

      {salesSection}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, string> = {
    PENDING: "bg-[#161616] text-[#6b6b6b] border-[#1e1e1e]",
    IN_PROGRESS: "bg-blue-500/10 text-blue-400 border-blue-500/10",
    COMPLETED: "bg-[#3ecf8e]/10 text-[#3ecf8e] border-[#3ecf8e]/10",
  };
  const l: Record<string, string> = { PENDING: "Menunggu", IN_PROGRESS: "Dikerjakan", COMPLETED: "Selesai" };
  return <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${s[status]}`}>{l[status]}</span>;
}
