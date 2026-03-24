import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear all data (delete children before parents)
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "attendances", "egg_sales", "feed_usages", "egg_productions", "task_assignments", "tasks", "feed_inventory", "operational_expenses", "poultry_houses", "users" CASCADE');

  // Users
  const hashedAdmin = await bcrypt.hash("admin123", 10);
  const hashedWorker = await bcrypt.hash("worker123", 10);

  await prisma.user.create({
    data: { name: "Ahmad Rafi", email: "admin@farm.com", password: hashedAdmin, role: "ADMIN", phone: "081234567890", address: "Jl. Farm Owner No. 1", salary: 0, startDate: new Date("2024-01-01"), isActive: true },
  });

  const arby = await prisma.user.create({
    data: { name: "Arby", email: "arby@farm.com", password: hashedWorker, role: "WORKER", phone: "081234567891", address: "Jl. Worker No. 1", salary: 3000000, startDate: new Date("2024-03-15"), isActive: true },
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
    { taskId: taskFeedMorningA.id, workerId: arby.id },
    { taskId: taskEggMorningA.id, workerId: arby.id },
    { taskId: taskFeedEveningA.id, workerId: arby.id },
    { taskId: taskEggEveningA.id, workerId: arby.id },
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
  console.log("Seeding complete! No dummy data — all real data will be entered by users.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
