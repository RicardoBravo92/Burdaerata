"use client";

import { useEffect, useState } from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const icons = {
    success: <FaCheckCircle className="text-green-500" />,
    error: <FaExclamationCircle className="text-red-500" />,
    info: <FaInfoCircle className="text-blue-500" />,
    warning: <FaExclamationCircle className="text-yellow-500" />,
  };

  const colors = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  };

  return (
    <div
      className={`
        ${colors[toast.type]}
        border rounded-lg p-4 shadow-lg flex items-center gap-3 min-w-[300px] max-w-md
        animate-in slide-in-from-top-5 fade-in duration-300
      `}
    >
      <div className="flex-shrink-0">{icons[toast.type]}</div>
      <p className="flex-1 font-medium text-sm">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close notification"
      >
        <FaTimes />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    // Listen for toast events
    const handleShowToast = (event: CustomEvent<Omit<Toast, "id">>) => {
      const newToast: Toast = {
        ...event.detail,
        id: Math.random().toString(36).substring(7),
      };
      setToasts((prev) => [...prev, newToast]);
    };

    window.addEventListener("show-toast" as any, handleShowToast as EventListener);

    return () => {
      window.removeEventListener("show-toast" as any, handleShowToast as EventListener);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 items-end">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

// Helper function to show toast
export function showToast(message: string, type: ToastType = "info", duration?: number) {
  const event = new CustomEvent("show-toast", {
    detail: { message, type, duration },
  });
  window.dispatchEvent(event);
}

