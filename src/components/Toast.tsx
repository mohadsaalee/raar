"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useStore } from "./StoreProvider";

export default function Toast() {
  const { toast } = useStore();
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-2 bg-ink px-5 py-3 text-sm text-white shadow-2xl"
        >
          <Check size={16} className="text-green-400" /> {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
