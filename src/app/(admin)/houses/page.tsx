"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";

const emptyHouse = {
  name: "",
  capacity: 0,
  currentCount: 0,
  birdType: "",
  birdAge: "",
  status: "ACTIVE",
  notes: "",
};

function statusColor(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "MAINTENANCE":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "INACTIVE":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "";
  }
}

export default function HousesPage() {
  const [houses, setHouses] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyHouse);

  useEffect(() => {
    api.getHouses().then(setHouses).catch(console.error);
  }, []);

  function openAdd() {
    setEditingId(null);
    setForm(emptyHouse);
    setDialogOpen(true);
  }

  function openEdit(house: any) {
    setEditingId(house.id);
    setForm({
      name: house.name,
      capacity: house.capacity,
      currentCount: house.currentCount,
      birdType: house.birdType,
      birdAge: house.birdAge,
      status: house.status,
      notes: house.notes,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (editingId) {
      await api.updateHouse(editingId, form);
    } else {
      await api.createHouse(form);
    }
    const updated = await api.getHouses();
    setHouses(updated);
    setDialogOpen(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this house?")) return;
    // Optimistic: remove immediately from UI
    setHouses(prev => prev.filter(h => h.id !== id));
    try {
      await api.deleteHouse(id);
    } catch {
      // Revert on error
      const updated = await api.getHouses();
      setHouses(updated);
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Poultry Houses</h1>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add House
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {houses.map((house) => {
          const pct =
            house.capacity > 0
              ? Math.round((house.currentCount / house.capacity) * 100)
              : 0;
          return (
            <Card key={house.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">{house.name}</CardTitle>
                <Badge className={statusColor(house.status)}>
                  {house.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Birds: {house.currentCount} / {house.capacity}
                  </p>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>{" "}
                    {house.birdType}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Age:</span>{" "}
                    {house.birdAge}
                  </div>
                </div>
                {house.notes && (
                  <p className="text-sm text-muted-foreground">
                    {house.notes}
                  </p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(house)}
                  >
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(house.id)}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit House" : "Add House"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={form.capacity}
                  onChange={(e) =>
                    setForm({ ...form, capacity: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label htmlFor="currentCount">Current Count</Label>
                <Input
                  id="currentCount"
                  type="number"
                  value={form.currentCount}
                  onChange={(e) =>
                    setForm({ ...form, currentCount: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="birdType">Bird Type</Label>
                <Input
                  id="birdType"
                  value={form.birdType}
                  onChange={(e) =>
                    setForm({ ...form, birdType: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="birdAge">Bird Age</Label>
                <Input
                  id="birdAge"
                  value={form.birdAge}
                  onChange={(e) =>
                    setForm({ ...form, birdAge: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(val) =>
                  setForm({
                    ...form,
                    status: val as string,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
