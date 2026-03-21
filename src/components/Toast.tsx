"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Check, X, AlertTriangle, Info, Copy, Trash2 } from "lucide-react";

type ToastType = "success" | "error" | "info" | "copy" | "delete";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

const ICONS: Record<ToastType, typeof Check> = {
  success: Check,
  error: AlertTriangle,
  info: Info,
  copy: Copy,
  delete: Trash2,
};

const STYLES: Record<ToastType, string> = {
  success: "bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a]",
  error: "bg-red-600 text-white",
  info: "bg-[#4F46E5] text-white",
  copy: "bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a]",
  delete: "bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a]",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed top-0 left-0 right-0 z-[100] flex flex-col items-center pointer-events-none">
        {toasts.map((t, i) => {
          const Icon = ICONS[t.type];
          return (
            <div
              key={t.id}
              className={`
                ${STYLES[t.type]}
                flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg
                text-sm font-medium pointer-events-auto
                animate-toast-in mx-4
              `}
              style={{
                marginTop: `${(i * 56) + 52}px`,
                transition: "margin-top 0.2s ease",
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
              <span>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
