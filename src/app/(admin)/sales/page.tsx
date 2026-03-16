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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  Egg,
  TrendingUp,
  AlertCircle,
  Plus,
} from "lucide-react";

function formatCurrency(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [formDate, setFormDate] = useState(store.todayStr());
  const [formBuyerName, setFormBuyerName] = useState("");
  const [formQuantity, setFormQuantity] = useState("");
  const [formPricePerUnit, setFormPricePerUnit] = useState("");
  const [formUnit, setFormUnit] = useState("tray");
  const [formPaymentMethod, setFormPaymentMethod] = useState("CASH");
  const [formIsPaid, setFormIsPaid] = useState(true);

  useEffect(() => {
    api.getSales().then(setSales).catch(console.error);
  }, []);

  const currentMonth = store.todayStr().slice(0, 7);

  const thisMonthSales = useMemo(
    () => sales.filter((s) => s.date.startsWith(currentMonth)),
    [sales, currentMonth]
  );

  const totalRevenue = useMemo(
    () => thisMonthSales.reduce((sum, s) => sum + s.totalAmount, 0),
    [thisMonthSales]
  );

  const totalEggsSold = useMemo(
    () => thisMonthSales.reduce((sum, s) => sum + s.quantity, 0),
    [thisMonthSales]
  );

  const averagePrice = useMemo(
    () =>
      thisMonthSales.length > 0
        ? thisMonthSales.reduce((sum, s) => sum + s.pricePerUnit, 0) /
          thisMonthSales.length
        : 0,
    [thisMonthSales]
  );

  const unpaidCount = useMemo(
    () => sales.filter((s) => !s.isPaid).length,
    [sales]
  );

  const autoTotal = useMemo(() => {
    const qty = parseFloat(formQuantity) || 0;
    const price = parseFloat(formPricePerUnit) || 0;
    return qty * price;
  }, [formQuantity, formPricePerUnit]);

  async function handleAddSale() {
    const qty = parseFloat(formQuantity) || 0;
    const price = parseFloat(formPricePerUnit) || 0;
    await api.createSale({
      date: formDate,
      buyerName: formBuyerName,
      quantity: qty,
      pricePerUnit: price,
      unit: formUnit,
      totalAmount: qty * price,
      paymentMethod: formPaymentMethod,
      isPaid: formIsPaid,
      recordedBy: store.getCurrentUser()?.id || "admin-1",
    });
    const updated = await api.getSales();
    setSales(updated);
    setDialogOpen(false);
    resetForm();
  }

  function resetForm() {
    setFormDate(store.todayStr());
    setFormBuyerName("");
    setFormQuantity("");
    setFormPricePerUnit("");
    setFormUnit("tray");
    setFormPaymentMethod("CASH");
    setFormIsPaid(true);
  }

  const sortedSales = useMemo(
    () =>
      [...sales].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [sales]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Egg Sales</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage egg sales
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Add Sale
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-muted-foreground">
                Total Revenue (This Month)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Egg className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {totalEggsSold.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Total Eggs Sold (This Month)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {formatCurrency(Math.round(averagePrice))}
              </p>
              <p className="text-xs text-muted-foreground">Average Price</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{unpaidCount}</p>
              <p className="text-xs text-muted-foreground">Unpaid Sales</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Records</CardTitle>
        </CardHeader>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{sale.date}</TableCell>
                    <TableCell className="font-medium">
                      {sale.buyerName}
                    </TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell>{sale.unit}</TableCell>
                    <TableCell>{formatCurrency(sale.pricePerUnit)}</TableCell>
                    <TableCell>{formatCurrency(sale.totalAmount)}</TableCell>
                    <TableCell>{sale.paymentMethod}</TableCell>
                    <TableCell>
                      {sale.isPaid ? (
                        <Badge variant="default">Paid</Badge>
                      ) : (
                        <Badge variant="destructive">Unpaid</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {sortedSales.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground"
                    >
                      No sales records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Sale Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Sale</DialogTitle>
            <DialogDescription>Record a new egg sale.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="saleDate">Date</Label>
              <Input
                id="saleDate"
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="buyerName">Buyer Name</Label>
              <Input
                id="buyerName"
                value={formBuyerName}
                onChange={(e) => setFormBuyerName(e.target.value)}
                placeholder="Enter buyer name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="saleQuantity">Quantity</Label>
                <Input
                  id="saleQuantity"
                  type="number"
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label>Unit</Label>
                <Select
                  value={formUnit}
                  onValueChange={(val) => setFormUnit(val ?? "tray")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tray">Tray</SelectItem>
                    <SelectItem value="egg">Egg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pricePerUnit">Price per Unit (Rp)</Label>
              <Input
                id="pricePerUnit"
                type="number"
                value={formPricePerUnit}
                onChange={(e) => setFormPricePerUnit(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label>Total Amount</Label>
              <p className="text-lg font-semibold">{formatCurrency(autoTotal)}</p>
            </div>
            <div className="grid gap-2">
              <Label>Payment Method</Label>
              <Select
                value={formPaymentMethod}
                onValueChange={(val) => setFormPaymentMethod(val ?? "CASH")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                  <SelectItem value="CREDIT">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="isPaid"
                type="checkbox"
                checked={formIsPaid}
                onChange={(e) => setFormIsPaid(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="isPaid">Paid</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSale}
              disabled={!formBuyerName || !formQuantity || !formPricePerUnit}
            >
              Add Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
