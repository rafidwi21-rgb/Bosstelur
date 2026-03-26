"use client";

import { useEffect, useState } from "react";

export function WibClock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    function update() {
      const now = new Date();
      const wib = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now);

      const wibDate = new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(now);

      setTime(wib);
      setDate(wibDate);
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  return (
    <div className="flex items-center gap-2 text-right">
      <div className="flex flex-col items-end leading-tight">
        <span className="text-[13px] font-mono font-semibold text-white tabular-nums">
          {time} <span className="text-[10px] font-sans text-[#6b6b6b]">WIB</span>
        </span>
        <span className="text-[10px] text-[#4a4a4a]">{date}</span>
      </div>
    </div>
  );
}
