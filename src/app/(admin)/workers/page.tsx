"use client";

import { useState, useEffect } from "react";
import { store } from "@/lib/store";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm-dialog";

interface WorkerForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  salary: number;
  startDate: string;
  password: string;
  isActive: boolean;
}

const emptyForm: WorkerForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  salary: 0,
  startDate: "",
  password: "",
  isActive: true,
};

function formatCurrency(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export default function WorkersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<WorkerForm>(emptyForm);
  const { confirm, confirmDialog } = useConfirm();

  useEffect(() => {
    const load = () => api.getUsers().then(setUsers).catch(console.error);
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const workers = users.filter((u) => u.role === "WORKER");

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(user: any) {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      salary: user.salary,
      startDate: user.startDate,
      password: "",
      isActive: user.isActive,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (editingId) {
      await api.updateUser(editingId, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        salary: form.salary,
        startDate: form.startDate,
        isActive: form.isActive,
        ...(form.password ? { password: form.password } : {}),
      });
    } else {
      await api.createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: "WORKER",
        phone: form.phone,
        address: form.address,
        salary: form.salary,
        startDate: form.startDate,
        isActive: form.isActive,
      });
    }
    const updated = await api.getUsers();
    setUsers(updated);
    setDialogOpen(false);
  }

  async function handleDelete(id: string) {
    const ok = await confirm("Hapus Pekerja", "Yakin ingin menghapus data pekerja ini?"); if (!ok) return;
    setUsers(prev => prev.filter(u => u.id !== id));
    try {
      await api.deleteUser(id);
    } catch {
      const updated = await api.getUsers();
      setUsers(updated);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Pekerja</h1>
          <p className="text-sm text-neutral-500">Kelola data pekerja kandang</p>
        </div>
        <Button onClick={openAdd} className="bg-white text-black hover:bg-neutral-200">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pekerja
        </Button>
      </div>

      <div className="rounded-xl border border-neutral-800/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-800/50 hover:bg-transparent">
              <TableHead className="text-neutral-400">Nama</TableHead>
              <TableHead className="text-neutral-400">Email</TableHead>
              <TableHead className="text-neutral-400">No. Telepon</TableHead>
              <TableHead className="text-neutral-400">Jabatan</TableHead>
              <TableHead className="text-neutral-400">Tanggal Masuk</TableHead>
              <TableHead className="text-neutral-400">Gaji</TableHead>
              <TableHead className="text-neutral-400">Status</TableHead>
              <TableHead className="text-neutral-400">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-neutral-600">
                  Belum ada data pekerja.
                </TableCell>
              </TableRow>
            ) : (
              workers.map((worker) => (
                <TableRow key={worker.id} className="border-neutral-800/50">
                  <TableCell className="font-medium text-neutral-200">{worker.name}</TableCell>
                  <TableCell className="text-neutral-400">{worker.email}</TableCell>
                  <TableCell className="text-neutral-400">{worker.phone}</TableCell>
                  <TableCell className="text-neutral-400">Pekerja</TableCell>
                  <TableCell className="text-neutral-400">{worker.startDate}</TableCell>
                  <TableCell className="text-neutral-400">{formatCurrency(worker.salary)}</TableCell>
                  <TableCell>
                    {worker.isActive ? (
                      <Badge className="bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/10">
                        Aktif
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/10">
                        Tidak Aktif
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-neutral-700 text-neutral-400 hover:text-white hover:bg-white/5"
                        onClick={() => openEdit(worker)}
                      >
                        <Pencil className="mr-1 h-3 w-3" />
                        Ubah
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => handleDelete(worker.id)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-neutral-900 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingId ? "Ubah Data Pekerja" : "Tambah Pekerja Baru"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-neutral-400">Nama</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-neutral-800 border-neutral-700 text-white"
                placeholder="Nama lengkap"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-neutral-400">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-neutral-800 border-neutral-700 text-white"
                  placeholder="email@contoh.com"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-neutral-400">No. Telepon</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="bg-neutral-800 border-neutral-700 text-white"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address" className="text-neutral-400">Alamat</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="bg-neutral-800 border-neutral-700 text-white"
                placeholder="Alamat lengkap"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="salary" className="text-neutral-400">Gaji (Rp)</Label>
                <Input
                  id="salary"
                  type="number"
                  value={form.salary}
                  onChange={(e) =>
                    setForm({ ...form, salary: Number(e.target.value) })
                  }
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="startDate" className="text-neutral-400">Tanggal Masuk</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm({ ...form, startDate: e.target.value })
                  }
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>
            </div>
            {!editingId && (
              <div>
                <Label htmlFor="password" className="text-neutral-400">Kata Sandi</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="bg-neutral-800 border-neutral-700 text-white"
                  placeholder="Masukkan kata sandi"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={form.isActive}
                onCheckedChange={(checked) =>
                  setForm({ ...form, isActive: checked === true })
                }
              />
              <Label htmlFor="isActive" className="text-neutral-400">Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-neutral-700 text-neutral-400 hover:bg-neutral-800">
              Batal
            </Button>
            <Button onClick={handleSave} className="bg-white text-black hover:bg-neutral-200">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {confirmDialog}
    </div>
  );
}
