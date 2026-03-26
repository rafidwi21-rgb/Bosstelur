"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Shield, Wrench } from "lucide-react";
import { ChickenBossIcon } from "@/components/logo/chicken-boss";
import { toast } from "sonner";
import { store } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const user = await store.login(email, password);
    if (!user) { toast.error("Invalid credentials"); setLoading(false); return; }
    toast.success(`Welcome back, ${user.name}!`);
    router.replace(user.role === "ADMIN" ? "/dashboard" : "/worker");
  };

  const quickLogin = async (role: "admin" | "worker") => {
    const em = role === "admin" ? "admin@farm.com" : "arby@farm.com";
    const pw = role === "admin" ? "admin123" : "worker123";
    setEmail(em); setPassword(pw); setLoading(true);
    const user = await store.login(em, pw);
    if (user) { toast.success(`Welcome back, ${user.name}!`); router.replace(user.role === "ADMIN" ? "/dashboard" : "/worker"); }
    else { toast.error("Login failed"); setLoading(false); }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#3ecf8e]/[0.07] blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#b4783c]/[0.05] blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#3ecf8e]/[0.03] blur-[100px]" />

      {/* Dot patterns */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 dot-pattern text-[#3ecf8e] opacity-[0.02]" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 dot-pattern text-[#b4783c] opacity-[0.015]" />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#3ecf8e]/30 to-transparent" />

      <div className="relative z-10 w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#3ecf8e] to-[#2ea872] shadow-lg shadow-[#3ecf8e]/20 overflow-hidden">
            <ChickenBossIcon size={48} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Boss Telur</h1>
            <p className="text-[11px] text-[#3ecf8e] font-semibold uppercase tracking-[0.2em] mt-0.5">Fresh</p>
          </div>
          <p className="text-sm text-[#6b6b6b]">Farm Management System</p>
        </div>

        {/* Login Form Card — gradient border */}
        <div className="relative rounded-xl overflow-hidden">
          {/* Gradient border */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#3ecf8e]/25 via-[#1e1e1e] to-[#b4783c]/15 p-px">
            <div className="h-full w-full rounded-xl bg-[#0e0e0e]" />
          </div>
          <div className="relative z-10 p-6">
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-[#6b6b6b] text-xs">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 bg-[#0a0a0a] border-[#1e1e1e] text-white placeholder:text-[#3a3a3a] focus:border-[#3ecf8e]/40 rounded-lg" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-[#6b6b6b] text-xs">Password</Label>
                <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 bg-[#0a0a0a] border-[#1e1e1e] text-white placeholder:text-[#3a3a3a] focus:border-[#3ecf8e]/40 rounded-lg" />
              </div>
              <Button type="submit" className="w-full h-11 bg-gradient-to-r from-[#3ecf8e] to-[#2ea872] text-black hover:from-[#4ae39e] hover:to-[#3ecf8e] font-semibold rounded-lg shadow-md shadow-[#3ecf8e]/15" disabled={loading}>
                {loading ? "Signing in..." : <><LogIn className="mr-2 h-4 w-4" />Sign In</>}
              </Button>
            </form>
          </div>
        </div>

        {/* Quick Login */}
        <div className="space-y-3">
          <p className="text-center text-[10px] text-[#4a4a4a] uppercase tracking-widest">Quick Login</p>
          <div className="grid gap-2">
            <button type="button" onClick={() => quickLogin("admin")}
              className="relative flex items-center gap-3 rounded-xl overflow-hidden bg-[#111]/80 p-3 text-left transition hover:bg-[#161616] group">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#3ecf8e]/50 to-[#3ecf8e]/10" />
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#3ecf8e]/10 to-transparent border border-[#1e1e1e] group-hover:border-[#3ecf8e]/20 transition">
                <Shield className="h-4 w-4 text-[#3ecf8e]/60" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#ccc]">Admin / Pemilik</p>
                <p className="text-xs text-[#4a4a4a] font-mono">admin@farm.com</p>
              </div>
            </button>

            <button type="button" onClick={() => quickLogin("worker")}
              className="relative flex items-center gap-3 rounded-xl overflow-hidden bg-[#111]/80 p-3 text-left transition hover:bg-[#161616] group">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#b4783c]/50 to-[#b4783c]/10" />
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#b4783c]/10 to-transparent border border-[#1e1e1e] group-hover:border-[#b4783c]/20 transition">
                <Wrench className="h-4 w-4 text-[#b4783c]/60" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#ccc]">Pekerja</p>
                <p className="text-xs text-[#4a4a4a] font-mono">arby@farm.com</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
