"use client";

import { useRouter } from "next/navigation";
import { Menu, LogOut, ChevronDown } from "lucide-react";
import { store } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AdminHeaderProps { onMenuClick: () => void; }

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const router = useRouter();
  const user = store.getCurrentUser();
  const initials = user ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#1e1e1e] bg-[#0a0a0a]/90 backdrop-blur-xl px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden text-[#6b6b6b] hover:text-white hover:bg-[#161616]" onClick={onMenuClick}>
          <Menu className="size-5" />
        </Button>
        <span className="text-[13px] text-[#4a4a4a]">Farm Management</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#161616] transition-colors">
          <Avatar className="size-7">
            <AvatarFallback className="bg-[#1a1a1a] text-[#999] text-[10px] font-semibold border border-[#1e1e1e]">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:block text-[13px] text-[#999]">{user?.name ?? "User"}</span>
          <ChevronDown className="size-3 text-[#4a4a4a]" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 bg-[#131313] border-[#1e1e1e]">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm text-[#ccc]">{user?.name}</p>
              <p className="text-xs text-[#4a4a4a]">{user?.email}</p>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-[#1e1e1e]" />
          <DropdownMenuItem onClick={() => { store.logout(); router.push("/login"); }} className="text-red-400 focus:text-red-300 focus:bg-red-500/10">
            <LogOut className="mr-2 size-3.5" />Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
