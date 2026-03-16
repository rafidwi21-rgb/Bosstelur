"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChickenBossIcon } from "@/components/logo/chicken-boss";
import { LayoutDashboard, Home, Users, Egg, Wheat, DollarSign, Clock, FileText } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Poultry Houses", href: "/houses", icon: Home },
  { label: "Workers", href: "/workers", icon: Users },
  { label: "Production", href: "/production", icon: Egg },
  { label: "Feed", href: "/feed", icon: Wheat },
  { label: "Sales", href: "/sales", icon: DollarSign },
  { label: "Attendance", href: "/attendance", icon: Clock },
  { label: "Reports", href: "/reports", icon: FileText },
];

interface AdminSidebarProps { onClose?: () => void; }

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#0c0c0c] border-r border-[#1e1e1e]">
      {/* Ornamental gradient blobs */}
      <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-[#3ecf8e]/[0.06] blur-[80px]" />
      <div className="absolute top-1/3 -right-20 w-48 h-48 rounded-full bg-[#2ea872]/[0.04] blur-[60px]" />
      <div className="absolute -bottom-10 left-1/4 w-44 h-44 rounded-full bg-[#b4783c]/[0.04] blur-[70px]" />

      {/* Dot halftone patterns */}
      <div className="absolute top-0 left-0 w-full h-2/5 dot-pattern text-[#3ecf8e] opacity-[0.025]" />
      <div className="absolute bottom-0 right-0 w-3/4 h-1/4 dot-pattern text-[#b4783c] opacity-[0.02]" />

      {/* Top gradient bar accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#3ecf8e]/40 to-transparent" />

      <div className="relative z-10 flex h-full flex-col">
        {/* Logo */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3ecf8e] to-[#2ea872] shadow-md shadow-[#3ecf8e]/15 overflow-hidden">
              <ChickenBossIcon size={32} />
            </div>
            <div>
              <span className="text-[15px] font-bold tracking-tight text-white block leading-tight">Boss Telur</span>
              <span className="text-[10px] text-[#3ecf8e] font-medium uppercase tracking-[0.15em]">Fresh</span>
            </div>
          </div>
          {/* Gradient divider */}
          <div className="mt-4 h-px bg-gradient-to-r from-[#3ecf8e]/20 via-[#1e1e1e] to-[#b4783c]/10" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-1 space-y-px">
          <p className="px-3 pt-1 pb-2 text-[9px] text-[#4a4a4a] uppercase tracking-[0.2em] font-semibold">Menu</p>
          {navItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-[#3ecf8e]/10 to-transparent text-[#3ecf8e] border-l-2 border-[#3ecf8e]"
                    : "text-[#6b6b6b] hover:text-[#999] hover:bg-[#161616]"
                }`}>
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}

          <p className="px-3 pt-4 pb-2 text-[9px] text-[#4a4a4a] uppercase tracking-[0.2em] font-semibold">Kelola</p>
          {navItems.slice(4).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-[#3ecf8e]/10 to-transparent text-[#3ecf8e] border-l-2 border-[#3ecf8e]"
                    : "text-[#6b6b6b] hover:text-[#999] hover:bg-[#161616]"
                }`}>
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer card with gradient border */}
        <div className="px-3 pb-4">
          <div className="relative rounded-lg overflow-hidden">
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#3ecf8e]/20 via-[#1e1e1e] to-[#b4783c]/15 p-px">
              <div className="h-full w-full rounded-lg bg-[#0e0e0e]" />
            </div>
            <div className="relative z-10 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#3ecf8e] animate-pulse" />
                <p className="text-[10px] text-[#6b6b6b]">Sistem Aktif</p>
              </div>
              <p className="text-[9px] text-[#3a3a3a]">v1.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
