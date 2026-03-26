"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Shield, Wrench, X } from "lucide-react";
import { ChickenBossIcon } from "@/components/logo/chicken-boss";
import { toast } from "sonner";
import { store } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PASSCODE = "88888888";

function PasscodeModal({ role, onClose }: { role: "admin" | "worker"; onClose: () => void }) {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(8).fill(""));
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const char = value.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setError(false);

    if (char && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 8 digits filled
    if (char && index === 7) {
      const code = newDigits.join("");
      if (code.length === 8) tryLogin(code);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      const newDigits = [...digits];
      newDigits[index - 1] = "";
      setDigits(newDigits);
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Escape") onClose();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 8);
    if (!pasted) return;
    const newDigits = Array(8).fill("");
    for (let i = 0; i < pasted.length; i++) newDigits[i] = pasted[i];
    setDigits(newDigits);
    if (pasted.length === 8) tryLogin(pasted);
    else inputRefs.current[pasted.length]?.focus();
  };

  const tryLogin = async (code: string) => {
    if (code !== PASSCODE) {
      setError(true);
      setDigits(Array(8).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
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
  };

  const label = role === "admin" ? "Admin / Pemilik" : "Pekerja";
  const color = role === "admin" ? "#3ecf8e" : "#b4783c";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="relative w-full max-w-sm rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Gradient border */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[var(--accent)]/30 via-[#1e1e1e] to-[var(--accent)]/10 p-px" style={{ "--accent": color } as any}>
          <div className="h-full w-full rounded-2xl bg-[#0e0e0e]" />
        </div>

        <div className="relative z-10 p-6 space-y-5">
          {/* Close */}
          <button onClick={onClose} className="absolute top-4 right-4 text-[#4a4a4a] hover:text-white transition">
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `${color}15`, border: `1px solid ${color}20` }}>
              {role === "admin" ? <Shield className="h-5 w-5" style={{ color }} /> : <Wrench className="h-5 w-5" style={{ color }} />}
            </div>
            <p className="text-sm font-medium text-[#ccc]">{label}</p>
            <p className="text-xs text-[#4a4a4a]">Masukkan passcode 8 digit</p>
          </div>

          {/* Passcode inputs */}
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                disabled={loading}
                className={`w-9 h-12 text-center text-lg font-bold rounded-lg border bg-[#0a0a0a] text-white outline-none transition-all
                  ${error ? "border-red-500 animate-[shake_0.3s_ease-in-out]" : digit ? `border-[${color}]/50` : "border-[#1e1e1e]"}
                  focus:border-[${color}]/60 focus:ring-1 focus:ring-[${color}]/20`}
                style={digit ? { borderColor: `${color}80` } : error ? { borderColor: "#ef4444" } : {}}
              />
            ))}
          </div>

          {error && (
            <p className="text-center text-xs text-red-400 animate-pulse">Passcode salah, coba lagi</p>
          )}

          {loading && (
            <div className="flex justify-center">
              <div className="size-5 animate-spin rounded-full border-2 border-[#1e1e1e]" style={{ borderTopColor: color }} />
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

        {/* Login Form Card */}
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
                <p className="text-sm font-medium text-[#ccc]">Admin / Pemilik</p>
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
                <p className="text-sm font-medium text-[#ccc]">Pekerja</p>
                <p className="text-xs text-[#4a4a4a] font-mono">arby@farm.com</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Passcode Modal */}
      {passcodeRole && (
        <PasscodeModal role={passcodeRole} onClose={() => setPasscodeRole(null)} />
      )}
    </div>
  );
}
