"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { store } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { ChickenBossIcon } from "@/components/logo/chicken-boss";

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setChecked(false);
    const user = store.getCurrentUser();
    if (!user || user.role !== "WORKER") { router.replace("/login"); return; }
    setUserName(user.name);
    setChecked(true);
  }, [router, pathname]);

  if (!checked) return (
    <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
      <div className="size-6 animate-spin rounded-full border-2 border-[#1e1e1e] border-t-[#3ecf8e]" />
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Subtle corner patterns */}
      <div className="fixed top-0 left-0 w-1/3 h-1/3 dot-pattern text-[#3ecf8e] opacity-[0.015] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-1/3 h-1/3 dot-pattern text-[#b4783c] opacity-[0.012] pointer-events-none" />

      <header className="sticky top-0 z-50 border-b border-[#1e1e1e] bg-[#0a0a0a]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3ecf8e] overflow-hidden">
              <ChickenBossIcon size={26} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[15px] font-bold text-white tracking-tight">Boss Telur</span>
              <span className="text-[8px] text-[#3ecf8e] font-bold uppercase tracking-widest">Fresh</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-[#6b6b6b]">{userName}</span>
            <Button variant="ghost" size="icon" onClick={() => { store.logout(); router.replace("/login"); }} className="h-8 w-8 text-[#6b6b6b] hover:text-white hover:bg-[#161616]">
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-lg px-4 py-4 pb-24">{children}</main>
    </div>
  );
}
