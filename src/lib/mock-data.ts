export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "WORKER";
  phone: string;
  address: string;
  salary: number;
  startDate: string;
  isActive: boolean;
}

export interface PoultryHouse {
  id: string;
  name: string;
  capacity: number;
  currentCount: number;
  birdType: string;
  birdAge: string;
  status: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
  notes: string;
}

export interface TaskAssignment {
  id: string;
  taskTitle: string;
  taskType: "FEEDING" | "EGG_COLLECTION" | "CLEANING" | "WATER_CHECK";
  timeSlot: "MORNING" | "EVENING";
  houseName: string;
  houseId: string;
  workerId: string;
  workerName: string;
  assignedDate: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  startedAt?: string;
  completedAt?: string;
  feedQuantity?: number;
  eggsKg?: number;
  eggsUnit?: number;
  eggsBrokenKg?: number;
  eggsBrokenUnit?: number;
  waterStatus?: string;
  photoUrl?: string;
  notes?: string;
}

export interface EggProduction {
  id: string;
  houseId: string;
  houseName: string;
  collectedBy: string;
  collectorName: string;
  date: string;
  totalKg: number;
  totalUnit: number;
  brokenKg: number;
  brokenUnit: number;
  goodKg: number;
  goodUnit: number;
}

export interface FeedInventory {
  id: string;
  feedType: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  supplier: string;
  purchaseDate: string;
}

export interface FeedUsage {
  id: string;
  feedId: string;
  feedType: string;
  houseId: string;
  houseName: string;
  usedBy: string;
  workerName: string;
  date: string;
  quantity: number;
}

export interface Attendance {
  id: string;
  userId: string;
  userName: string;
  type: "CHECK_IN" | "CHECK_OUT";
  timestamp: string;
  photoUrl: string;
}

export interface EggSale {
  id: string;
  date: string;
  buyerName: string;
  quantity: number;
  pricePerUnit: number;
  unit: string;
  totalAmount: number;
  paymentMethod: string;
  isPaid: boolean;
  recordedBy: string;
  notes?: string;
}

export interface OperationalExpense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  vendor: string;
}

// Default mock data
export const defaultUsers: User[] = [
  {
    id: "admin-1",
    name: "Ahmad Rafi",
    email: "admin@farm.com",
    password: "admin123",
    role: "ADMIN",
    phone: "081234567890",
    address: "Jl. Farm Owner No. 1",
    salary: 0,
    startDate: "2024-01-01",
    isActive: true,
  },
  {
    id: "worker-1",
    name: "Arby",
    email: "arby@farm.com",
    password: "worker123",
    role: "WORKER",
    phone: "081234567891",
    address: "Jl. Worker No. 1",
    salary: 3000000,
    startDate: "2024-03-15",
    isActive: true,
  },
  {
    id: "worker-2",
    name: "Siti Nurhaliza",
    email: "siti@farm.com",
    password: "worker123",
    role: "WORKER",
    phone: "081234567892",
    address: "Jl. Worker No. 2",
    salary: 3000000,
    startDate: "2024-06-01",
    isActive: true,
  },
  {
    id: "worker-3",
    name: "Dedi Kurniawan",
    email: "dedi@farm.com",
    password: "worker123",
    role: "WORKER",
    phone: "081234567893",
    address: "Jl. Worker No. 3",
    salary: 2800000,
    startDate: "2025-01-10",
    isActive: true,
  },
];

export const defaultHouses: PoultryHouse[] = [
  { id: "house-a", name: "House A", capacity: 500, currentCount: 480, birdType: "Layer", birdAge: "8 months", status: "ACTIVE", notes: "Main production house" },
  { id: "house-b", name: "House B", capacity: 500, currentCount: 450, birdType: "Layer", birdAge: "12 months", status: "ACTIVE", notes: "Second production house" },
  { id: "house-c", name: "House C", capacity: 300, currentCount: 280, birdType: "Layer", birdAge: "6 months", status: "ACTIVE", notes: "New house" },
  { id: "house-d", name: "House D", capacity: 400, currentCount: 0, birdType: "Layer", birdAge: "-", status: "MAINTENANCE", notes: "Under renovation" },
];

const today = new Date().toISOString().split("T")[0];

export const defaultTasks: TaskAssignment[] = [
  // Worker 1 - Arby (House A)
  { id: "ta-1", taskTitle: "Beri Pakan Ayam (Pagi)", taskType: "FEEDING", timeSlot: "MORNING", houseName: "House A", houseId: "house-a", workerId: "worker-1", workerName: "Arby", assignedDate: today, status: "PENDING" },
  { id: "ta-2", taskTitle: "Kumpulkan Telur (Pagi)", taskType: "EGG_COLLECTION", timeSlot: "MORNING", houseName: "House A", houseId: "house-a", workerId: "worker-1", workerName: "Arby", assignedDate: today, status: "PENDING" },
  { id: "ta-3", taskTitle: "Beri Pakan Ayam (Sore)", taskType: "FEEDING", timeSlot: "EVENING", houseName: "House A", houseId: "house-a", workerId: "worker-1", workerName: "Arby", assignedDate: today, status: "PENDING" },
  { id: "ta-4", taskTitle: "Kumpulkan Telur (Sore)", taskType: "EGG_COLLECTION", timeSlot: "EVENING", houseName: "House A", houseId: "house-a", workerId: "worker-1", workerName: "Arby", assignedDate: today, status: "PENDING" },
  // Worker 2 - Siti (House B)
  { id: "ta-5", taskTitle: "Beri Pakan Ayam (Pagi)", taskType: "FEEDING", timeSlot: "MORNING", houseName: "House B", houseId: "house-b", workerId: "worker-2", workerName: "Siti Nurhaliza", assignedDate: today, status: "PENDING" },
  { id: "ta-6", taskTitle: "Kumpulkan Telur (Pagi)", taskType: "EGG_COLLECTION", timeSlot: "MORNING", houseName: "House B", houseId: "house-b", workerId: "worker-2", workerName: "Siti Nurhaliza", assignedDate: today, status: "PENDING" },
  { id: "ta-7", taskTitle: "Beri Pakan Ayam (Sore)", taskType: "FEEDING", timeSlot: "EVENING", houseName: "House B", houseId: "house-b", workerId: "worker-2", workerName: "Siti Nurhaliza", assignedDate: today, status: "PENDING" },
  { id: "ta-8", taskTitle: "Kumpulkan Telur (Sore)", taskType: "EGG_COLLECTION", timeSlot: "EVENING", houseName: "House B", houseId: "house-b", workerId: "worker-2", workerName: "Siti Nurhaliza", assignedDate: today, status: "PENDING" },
  // Worker 3 - Dedi (House C)
  { id: "ta-9", taskTitle: "Beri Pakan Ayam (Pagi)", taskType: "FEEDING", timeSlot: "MORNING", houseName: "House C", houseId: "house-c", workerId: "worker-3", workerName: "Dedi Kurniawan", assignedDate: today, status: "PENDING" },
  { id: "ta-10", taskTitle: "Kumpulkan Telur (Pagi)", taskType: "EGG_COLLECTION", timeSlot: "MORNING", houseName: "House C", houseId: "house-c", workerId: "worker-3", workerName: "Dedi Kurniawan", assignedDate: today, status: "PENDING" },
  { id: "ta-11", taskTitle: "Beri Pakan Ayam (Sore)", taskType: "FEEDING", timeSlot: "EVENING", houseName: "House C", houseId: "house-c", workerId: "worker-3", workerName: "Dedi Kurniawan", assignedDate: today, status: "PENDING" },
  { id: "ta-12", taskTitle: "Kumpulkan Telur (Sore)", taskType: "EGG_COLLECTION", timeSlot: "EVENING", houseName: "House C", houseId: "house-c", workerId: "worker-3", workerName: "Dedi Kurniawan", assignedDate: today, status: "PENDING" },
];

function generateDates(days: number): string[] {
  const dates: string[] = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

// Simple seeded pseudo-random to avoid hydration mismatches
function seeded(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const last30Days = generateDates(29);

export const defaultProduction: EggProduction[] = last30Days.flatMap((date, i) => {
  const aKg = 22 + Math.floor(seeded(i * 3 + 1) * 6);
  const bKg = 20 + Math.floor(seeded(i * 3 + 3) * 5);
  const cKg = 14 + Math.floor(seeded(i * 3 + 5) * 4);
  const aBr = Math.floor(seeded(i * 3 + 2) * 2);
  const bBr = Math.floor(seeded(i * 3 + 4) * 2);
  const cBr = Math.floor(seeded(i * 3 + 6) * 1);
  // ~16 eggs per kg estimate
  const toUnit = (kg: number) => Math.round(kg * 16);
  return [
    { id: `ep-a-${i}`, houseId: "house-a", houseName: "House A", collectedBy: "worker-1", collectorName: "Arby", date, totalKg: aKg, totalUnit: toUnit(aKg), brokenKg: aBr, brokenUnit: toUnit(aBr), goodKg: aKg - aBr, goodUnit: toUnit(aKg - aBr) },
    { id: `ep-b-${i}`, houseId: "house-b", houseName: "House B", collectedBy: "worker-2", collectorName: "Siti Nurhaliza", date, totalKg: bKg, totalUnit: toUnit(bKg), brokenKg: bBr, brokenUnit: toUnit(bBr), goodKg: bKg - bBr, goodUnit: toUnit(bKg - bBr) },
    { id: `ep-c-${i}`, houseId: "house-c", houseName: "House C", collectedBy: "worker-3", collectorName: "Dedi Kurniawan", date, totalKg: cKg, totalUnit: toUnit(cKg), brokenKg: cBr, brokenUnit: toUnit(cBr), goodKg: cKg - cBr, goodUnit: toUnit(cKg - cBr) },
  ];
});

export const defaultFeedInventory: FeedInventory[] = [
  { id: "feed-1", feedType: "Layer Mash", quantity: 500, unit: "kg", costPerUnit: 8500, supplier: "PT Pakan Jaya", purchaseDate: "2026-03-01" },
  { id: "feed-2", feedType: "Grower Feed", quantity: 200, unit: "kg", costPerUnit: 7500, supplier: "PT Pakan Jaya", purchaseDate: "2026-03-05" },
  { id: "feed-3", feedType: "Calcium Supplement", quantity: 50, unit: "kg", costPerUnit: 15000, supplier: "CV Mineral Farm", purchaseDate: "2026-03-10" },
];

export const defaultFeedUsage: FeedUsage[] = last30Days.flatMap((date, i) => [
  { id: `fu-a-${i}`, feedId: "feed-1", feedType: "Layer Mash", houseId: "house-a", houseName: "House A", usedBy: "worker-1", workerName: "Arby", date, quantity: 45 + Math.floor(seeded(i * 100 + 1) * 10) },
  { id: `fu-b-${i}`, feedId: "feed-1", feedType: "Layer Mash", houseId: "house-b", houseName: "House B", usedBy: "worker-2", workerName: "Siti Nurhaliza", date, quantity: 40 + Math.floor(seeded(i * 100 + 2) * 10) },
  { id: `fu-c-${i}`, feedId: "feed-1", feedType: "Layer Mash", houseId: "house-c", houseName: "House C", usedBy: "worker-3", workerName: "Dedi Kurniawan", date, quantity: 25 + Math.floor(seeded(i * 100 + 3) * 8) },
]);

export const defaultSales: EggSale[] = last30Days.filter((_, i) => i % 3 === 0).map((date, i) => ({
  id: `sale-${i}`,
  date,
  buyerName: ["Toko Telur Makmur", "Bu Warni", "Pasar Induk", "Restoran Sedap"][i % 4],
  quantity: 10 + Math.floor(seeded(i * 200 + 1) * 20),
  pricePerUnit: 45000,
  unit: "tray",
  totalAmount: 0,
  paymentMethod: ["CASH", "TRANSFER", "CASH", "CREDIT"][i % 4],
  isPaid: i % 4 !== 3,
  recordedBy: "admin-1",
  notes: "",
})).map(s => ({ ...s, totalAmount: s.quantity * s.pricePerUnit }));

export const defaultExpenses: OperationalExpense[] = [
  { id: "exp-1", category: "FEED", description: "Monthly feed purchase", amount: 5500000, date: "2026-03-01", vendor: "PT Pakan Jaya" },
  { id: "exp-2", category: "UTILITIES", description: "Electricity bill", amount: 850000, date: "2026-03-05", vendor: "PLN" },
  { id: "exp-3", category: "MEDICATION", description: "Vitamins and vaccines", amount: 1200000, date: "2026-03-08", vendor: "Toko Obat Ternak" },
  { id: "exp-4", category: "LABOR", description: "Worker salaries", amount: 8800000, date: "2026-03-01", vendor: "-" },
  { id: "exp-5", category: "EQUIPMENT", description: "Replacement water nipples", amount: 350000, date: "2026-03-12", vendor: "CV Farm Equipment" },
];

// Exclude today so workers start fresh each day
export const defaultAttendance: Attendance[] = last30Days.slice(-8, -1).flatMap((date, idx) =>
  defaultUsers.filter(u => u.role === "WORKER").flatMap(u => [
    { id: `att-in-${u.id}-${date}`, userId: u.id, userName: u.name, type: "CHECK_IN" as const, timestamp: `${date}T07:${String(5 + (idx * 7) % 25).padStart(2, "0")}:00`, photoUrl: "" },
    { id: `att-out-${u.id}-${date}`, userId: u.id, userName: u.name, type: "CHECK_OUT" as const, timestamp: `${date}T16:${String(3 + (idx * 11) % 27).padStart(2, "0")}:00`, photoUrl: "" },
  ])
);
