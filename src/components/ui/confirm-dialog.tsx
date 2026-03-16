"use client";

import { useState, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({ open: false, title: "", message: "" });
  const resolveRef = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback((title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({ open: true, title, message });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setState({ open: false, title: "", message: "" });
    resolveRef.current?.(true);
    resolveRef.current = null;
  }, []);

  const handleCancel = useCallback(() => {
    setState({ open: false, title: "", message: "" });
    resolveRef.current?.(false);
    resolveRef.current = null;
  }, []);

  // Return JSX element directly, not a component
  const confirmDialog = (
    <Dialog open={state.open} onOpenChange={(open) => { if (!open) handleCancel(); }}>
      <DialogContent className="sm:max-w-[360px] bg-[#131313] border-[#1e1e1e] p-6">
        <DialogHeader className="space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/10">
            <AlertTriangle className="h-7 w-7 text-red-400" />
          </div>
          <DialogTitle className="text-center text-lg text-white">{state.title}</DialogTitle>
        </DialogHeader>
        <p className="text-center text-sm text-[#6b6b6b] pb-1">{state.message}</p>
        <DialogFooter className="flex gap-3 sm:justify-center pt-1">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 h-11 rounded-lg border-[#1e1e1e] text-[#999] hover:bg-[#1a1a1a] hover:text-white"
          >
            Batal
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 h-11 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold"
          >
            Ya, Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { confirm, confirmDialog };
}
