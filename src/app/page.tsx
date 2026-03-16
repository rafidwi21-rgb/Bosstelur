"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { store } from "@/lib/store";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const user = store.getCurrentUser();
    if (!user) {
      router.replace("/login");
    } else if (user.role === "ADMIN") {
      router.replace("/dashboard");
    } else {
      router.replace("/worker");
    }
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
      <div className="size-6 animate-spin rounded-full border-2 border-neutral-700 border-t-white" />
    </div>
  );
}
