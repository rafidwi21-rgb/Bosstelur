"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Shield, Wrench, Delete, X } from "lucide-react";
import { ChickenBossIcon } from "@/components/logo/chicken-boss";
import { toast } from "sonner";
import { store } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PASSCODE = "8888";

function PasscodeModal({ role, onClose }: { role: "admin" | "worker"; onClose: () => void }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const color = role === "admin" ? "#3ecf8e" : "#b4783c";
  const label = role === "admin" ? "Owner" : "Farm Worker";

  const tryLogin = useCallback(async (passcode: string) => {
    if (passcode !== PASSCODE) {
      setError(true);
      setCode("");
      setTimeout(() => setError(false), 600);
      return;
    }
    setLoading(true);
    const em = role === "admin" ? "admin@farm.com" : "arby@farm.com";
    const pw = role === "admin" ? "admin123" : "worker123";
    const user = await store.login(em, pw);
    if (user) {
      toast.success(`Selamat datang, ${user.name}!`);
      router.replace(user.role === "ADMIN" ? "/dashboard" : "/worker");
    } else {
      toast.error("Login gagal");
      setLoading(false);
    }
  }, [role, router]);

  const pressKey = (key: string) => {
    if (loading) return;
    setError(false);
    if (key === "del") {
      setCode(prev => prev.slice(0, -1));
      return;
    }
    const next = code + key;
    if (next.length > 4) return;
    setCode(next);
    if (next.length === 4) tryLogin(next);
  };

  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "del"],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md" onClick={onClose}>
      <div className="relative w-full max-w-xs" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button onClick={onClose} className="absolute -top-10 right-0 text-[#6b6b6b] hover:text-white transition">
          <X className="h-5 w-5" />
        </button>

        <div className="text-center space-y-6">
          {/* Icon + label */}
          <div className="space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
              {role === "admin" ? <Shield className="h-6 w-6" style={{ color }} /> : <Wrench className="h-6 w-6" style={{ color }} />}
            </div>
            <p className="text-sm font-medium text-white">{label}</p>
            <p className="text-xs text-[#6b6b6b]">Masukkan Passcode</p>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={`h-3.5 w-3.5 rounded-full border transition-all duration-200 ${
                  error
                    ? "border-red-500 bg-red-500"
                    : i < code.length
                    ? "border-white bg-white"
                    : "border-[#4a4a4a] bg-transparent"
                } ${error ? "animate-[shake_0.3s_ease-in-out]" : ""}`}
              />
            ))}
          </div>

          {error && <p className="text-xs text-red-400">Passcode salah</p>}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="size-6 animate-spin rounded-full border-2 border-[#1e1e1e]" style={{ borderTopColor: color }} />
            </div>
          ) : (
            /* Number pad */
            <div className="grid gap-3 px-4">
              {keys.map((row, ri) => (
                <div key={ri} className="flex justify-center gap-4">
                  {row.map((key, ki) => {
                    if (key === "") return <div key={ki} className="w-[72px] h-[72px]" />;
                    return (
                      <button
                        key={ki}
                        type="button"
                        onClick={() => pressKey(key)}
                        className={`w-[72px] h-[72px] rounded-full border border-[#333] flex items-center justify-center transition-all duration-150
                          hover:bg-[#222] active:bg-[#333] active:scale-95
                          ${key === "del" ? "text-[#999]" : "text-white"}`}
                      >
                        {key === "del" ? (
                          <Delete className="h-5 w-5" />
                        ) : (
                          <span className="text-2xl font-light">{key}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passcodeRole, setPasscodeRole] = useState<"admin" | "worker" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const user = await store.login(email, password);
    if (!user) { toast.error("Email atau password salah"); setLoading(false); return; }
    toast.success(`Selamat datang, ${user.name}!`);
    router.replace(user.role === "ADMIN" ? "/dashboard" : "/worker");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden">
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#3ecf8e]/[0.07] blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#b4783c]/[0.05] blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#3ecf8e]/[0.03] blur-[100px]" />
      <div className="absolute top-0 left-0 w-1/2 h-1/2 dot-pattern text-[#3ecf8e] opacity-[0.02]" />
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 dot-pattern text-[#b4783c] opacity-[0.015]" />
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

        {/* Login Form */}
        <div className="relative rounded-xl overflow-hidden">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#3ecf8e]/25 via-[#1e1e1e] to-[#b4783c]/15 p-px">
            <div className="h-full w-full rounded-xl bg-[#0e0e0e]" />
          </div>
          <div className="relative z-10 p-6">
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-[#6b6b6b] text-xs">Email</Label>
                <Input id="email" type="email" placeholder="Masukkan email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 bg-[#0a0a0a] border-[#1e1e1e] text-white placeholder:text-[#3a3a3a] focus:border-[#3ecf8e]/40 rounded-lg" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-[#6b6b6b] text-xs">Password</Label>
                <Input id="password" type="password" placeholder="Masukkan password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 bg-[#0a0a0a] border-[#1e1e1e] text-white placeholder:text-[#3a3a3a] focus:border-[#3ecf8e]/40 rounded-lg" />
              </div>
              <Button type="submit" className="w-full h-11 bg-gradient-to-r from-[#3ecf8e] to-[#2ea872] text-black hover:from-[#4ae39e] hover:to-[#3ecf8e] font-semibold rounded-lg shadow-md shadow-[#3ecf8e]/15" disabled={loading}>
                {loading ? "Masuk..." : <><LogIn className="mr-2 h-4 w-4" />Masuk</>}
              </Button>
            </form>
          </div>
        </div>

        {/* Quick Login */}
        <div className="space-y-3">
          <p className="text-center text-[10px] text-[#4a4a4a] uppercase tracking-widest">Quick Login</p>
          <div className="grid gap-2">
            <button type="button" onClick={() => setPasscodeRole("admin")}
              className="relative flex items-center gap-3 rounded-xl overflow-hidden bg-[#111]/80 p-3 text-left transition hover:bg-[#161616] group">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#3ecf8e]/50 to-[#3ecf8e]/10" />
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#3ecf8e]/10 to-transparent border border-[#1e1e1e] group-hover:border-[#3ecf8e]/20 transition">
                <Shield className="h-4 w-4 text-[#3ecf8e]/60" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#ccc]">Owner</p>
                <p className="text-xs text-[#4a4a4a] font-mono">admin@farm.com</p>
              </div>
            </button>

            <button type="button" onClick={() => setPasscodeRole("worker")}
              className="relative flex items-center gap-3 rounded-xl overflow-hidden bg-[#111]/80 p-3 text-left transition hover:bg-[#161616] group">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#b4783c]/50 to-[#b4783c]/10" />
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#b4783c]/10 to-transparent border border-[#1e1e1e] group-hover:border-[#b4783c]/20 transition">
                <Wrench className="h-4 w-4 text-[#b4783c]/60" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#ccc]">Farm Worker</p>
                <p className="text-xs text-[#4a4a4a] font-mono">arby@farm.com</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {passcodeRole && (
        <PasscodeModal role={passcodeRole} onClose={() => setPasscodeRole(null)} />
      )}
    </div>
  );
}
