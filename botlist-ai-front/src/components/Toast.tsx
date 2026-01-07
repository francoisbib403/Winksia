"use client"

import { useState, useEffect, createContext, useContext, ReactNode } from "react"
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"

type ToastType = "error" | "success" | "info" | "warning"

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (message: string, type: ToastType = "error") => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  const icons = {
    error: AlertCircle,
    success: CheckCircle,
    info: Info,
    warning: AlertTriangle
  }

  const styles = {
    error: "bg-red-50 border-red-200 text-red-800",
    success: "bg-green-50 border-green-200 text-green-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800"
  }

  const iconStyles = {
    error: "text-red-500",
    success: "text-green-500",
    info: "text-blue-500",
    warning: "text-yellow-500"
  }

  const Icon = icons[toast.type]

  return (
    <div className={`flex items-center p-4 rounded-lg shadow-lg border ${styles[toast.type]} animate-slide-in`}>
      <Icon className={`w-5 h-5 mr-3 ${iconStyles[toast.type]}`} />
      <p className="text-sm font-medium">{toast.message}</p>
      <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
