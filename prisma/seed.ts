import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.eggSale.deleteMany();
  await prisma.feedUsage.deleteMany();
  await prisma.eggProduction.deleteMany();
  await prisma.taskAssignment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.feedInventory.deleteMany();
  await prisma.operationalExpense.deleteMany();
  await prisma.poultryHouse.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const hashedAdmin = await bcrypt.hash("admin123", 10);
  const hashedWorker = await bcrypt.hash("worker123", 10);

  const admin = await prisma.user.create({
    data: { name: "Ahmad Rafi", email: "admin@farm.com", password: hashedAdmin, role: "ADMIN", phone: "081234567890", address: "Jl. Farm Owner No. 1", salary: 0, startDate: new Date("2024-01-01"), isActive: true },
  });

  const budi = await prisma.user.create({
    data: { name: "Budi Santoso", email: "budi@farm.com", password: hashedWorker, role: "WORKER", phone: "081234567891", address: "Jl. Worker No. 1", salary: 3000000, startDate: new Date("2024-03-15"), isActive: true },
  });

  const siti = await prisma.user.create({
    data: { name: "Siti Nurhaliza", email: "siti@farm.com", password: hashedWorker, role: "WORKER", phone: "081234567892", address: "Jl. Worker No. 2", salary: 3000000, startDate: new Date("2024-06-01"), isActive: true },
  });

  const dedi = await prisma.user.create({
    data: { name: "Dedi Kurniawan", email: "dedi@farm.com", password: hashedWorker, role: "WORKER", phone: "081234567893", address: "Jl. Worker No. 3", salary: 2800000, startDate: new Date("2025-01-10"), isActive: true },
  });

  console.log("Users created");

  // Poultry Houses
  const houseA = await prisma.poultryHouse.create({ data: { name: "House A", capacity: 500, currentCount: 480, birdType: "Layer", birdAge: "8 months", status: "ACTIVE", notes: "Main production house" } });
  const houseB = await prisma.poultryHouse.create({ data: { name: "House B", capacity: 500, currentCount: 450, birdType: "Layer", birdAge: "12 months", status: "ACTIVE", notes: "Second production house" } });
  const houseC = await prisma.poultryHouse.create({ data: { name: "House C", capacity: 300, currentCount: 280, birdType: "Layer", birdAge: "6 months", status: "ACTIVE", notes: "New house" } });
  await prisma.poultryHouse.create({ data: { name: "House D", capacity: 400, currentCount: 0, birdType: "Layer", birdAge: "-", status: "MAINTENANCE", notes: "Under renovation" } });

  console.log("Houses created");

  // Tasks (templates)
  const taskFeedMorningA = await prisma.task.create({ data: { title: "Beri Pakan Ayam (Pagi)", type: "FEEDING", timeSlot: "MORNING", houseId: houseA.id } });
  const taskEggMorningA = await prisma.task.create({ data: { title: "Kumpulkan Telur (Pagi)", type: "EGG_COLLECTION", timeSlot: "MORNING", houseId: houseA.id } });
  const taskFeedEveningA = await prisma.task.create({ data: { title: "Beri Pakan Ayam (Sore)", type: "FEEDING", timeSlot: "EVENING", houseId: houseA.id } });
  const taskEggEveningA = await prisma.task.create({ data: { title: "Kumpulkan Telur (Sore)", type: "EGG_COLLECTION", timeSlot: "EVENING", houseId: houseA.id } });

  const taskFeedMorningB = await prisma.task.create({ data: { title: "Beri Pakan Ayam (Pagi)", type: "FEEDING", timeSlot: "MORNING", houseId: houseB.id } });
  const taskEggMorningB = await prisma.task.create({ data: { title: "Kumpulkan Telur (Pagi)", type: "EGG_COLLECTION", timeSlot: "MORNING", houseId: houseB.id } });
  const taskFeedEveningB = await prisma.task.create({ data: { title: "Beri Pakan Ayam (Sore)", type: "FEEDING", timeSlot: "EVENING", houseId: houseB.id } });
  const taskEggEveningB = await prisma.task.create({ data: { title: "Kumpulkan Telur (Sore)", type: "EGG_COLLECTION", timeSlot: "EVENING", houseId: houseB.id } });

  const taskFeedMorningC = await prisma.task.create({ data: { title: "Beri Pakan Ayam (Pagi)", type: "FEEDING", timeSlot: "MORNING", houseId: houseC.id } });
  const taskEggMorningC = await prisma.task.create({ data: { title: "Kumpulkan Telur (Pagi)", type: "EGG_COLLECTION", timeSlot: "MORNING", houseId: houseC.id } });
  const taskFeedEveningC = await prisma.task.create({ data: { title: "Beri Pakan Ayam (Sore)", type: "FEEDING", timeSlot: "EVENING", houseId: houseC.id } });
  const taskEggEveningC = await prisma.task.create({ data: { title: "Kumpulkan Telur (Sore)", type: "EGG_COLLECTION", timeSlot: "EVENING", houseId: houseC.id } });

  console.log("Tasks created");

  // Today's task assignments
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const assignments = [
    { taskId: taskFeedMorningA.id, workerId: budi.id },
    { taskId: taskEggMorningA.id, workerId: budi.id },
    { taskId: taskFeedEveningA.id, workerId: budi.id },
    { taskId: taskEggEveningA.id, workerId: budi.id },
    { taskId: taskFeedMorningB.id, workerId: siti.id },
    { taskId: taskEggMorningB.id, workerId: siti.id },
    { taskId: taskFeedEveningB.id, workerId: siti.id },
    { taskId: taskEggEveningB.id, workerId: siti.id },
    { taskId: taskFeedMorningC.id, workerId: dedi.id },
    { taskId: taskEggMorningC.id, workerId: dedi.id },
    { taskId: taskFeedEveningC.id, workerId: dedi.id },
    { taskId: taskEggEveningC.id, workerId: dedi.id },
  ];

  for (const a of assignments) {
    await prisma.taskAssignment.create({ data: { ...a, assignedDate: today, status: "PENDING" } });
  }

  console.log("Task assignments created");

  // Feed Inventory
  const feed1 = await prisma.feedInventory.create({ data: { feedType: "Layer Mash", quantity: 500, unit: "kg", costPerUnit: 8500, supplier: "PT Pakan Jaya", purchaseDate: new Date("2026-03-01") } });
  await prisma.feedInventory.create({ data: { feedType: "Grower Feed", quantity: 200, unit: "kg", costPerUnit: 7500, supplier: "PT Pakan Jaya", purchaseDate: new Date("2026-03-05") } });
  await prisma.feedInventory.create({ data: { feedType: "Calcium Supplement", quantity: 50, unit: "kg", costPerUnit: 15000, supplier: "CV Mineral Farm", purchaseDate: new Date("2026-03-10") } });

  console.log("Feed inventory created");

  // Generate 7 days of production + feed usage data (less to avoid connection limits)
  for (let i = 7; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);

    const workers = [
      { id: budi.id, house: houseA },
      { id: siti.id, house: houseB },
      { id: dedi.id, house: houseC },
    ];

    for (const w of workers) {
      const baseKg = w.house.id === houseA.id ? 22 : w.house.id === houseB.id ? 20 : 14;
      const kg = baseKg + Math.floor(Math.random() * 6);
      const unit = Math.round(kg * 16);
      const brokenUnit = Math.floor(Math.random() * 5);

      await prisma.eggProduction.create({
        data: { houseId: w.house.id, collectedBy: w.id, date: d, totalKg: kg, totalUnit: unit, brokenKg: 0, brokenUnit, goodKg: kg, goodUnit: unit - brokenUnit },
      });

      await prisma.feedUsage.create({
        data: { feedId: feed1.id, houseId: w.house.id, usedBy: w.id, date: d, quantity: 40 + Math.floor(Math.random() * 15) },
      });

      // Attendance
      const checkInTime = new Date(d);
      checkInTime.setHours(7, Math.floor(Math.random() * 30), 0);
      const checkOutTime = new Date(d);
      checkOutTime.setHours(16, Math.floor(Math.random() * 30), 0);

      await prisma.attendance.create({ data: { userId: w.id, type: "CHECK_IN", timestamp: checkInTime } });
      await prisma.attendance.create({ data: { userId: w.id, type: "CHECK_OUT", timestamp: checkOutTime } });
    }
  }

  console.log("Historical data created");

  // Sales
  for (let i = 6; i >= 1; i += 2) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const qty = 10 + Math.floor(Math.random() * 20);
    await prisma.eggSale.create({
      data: { date: d, buyerName: ["Toko Telur Makmur", "Bu Warni", "Pasar Induk", "Restoran Sedap"][i % 4], quantity: qty, pricePerUnit: 45000, unit: "tray", totalAmount: qty * 45000, paymentMethod: "TUNAI", isPaid: true, recordedBy: admin.id },
    });
  }

  console.log("Sales created");

  // Expenses
  await prisma.operationalExpense.create({ data: { category: "FEED", description: "Pembelian pakan bulanan", amount: 5500000, date: new Date("2026-03-01"), vendor: "PT Pakan Jaya" } });
  await prisma.operationalExpense.create({ data: { category: "UTILITIES", description: "Tagihan listrik", amount: 850000, date: new Date("2026-03-05"), vendor: "PLN" } });
  await prisma.operationalExpense.create({ data: { category: "MEDICATION", description: "Vitamin dan vaksin", amount: 1200000, date: new Date("2026-03-08"), vendor: "Toko Obat Ternak" } });
  await prisma.operationalExpense.create({ data: { category: "LABOR", description: "Gaji pekerja", amount: 8800000, date: new Date("2026-03-01"), vendor: "-" } });

  console.log("Expenses created");
  console.log("Seeding complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
