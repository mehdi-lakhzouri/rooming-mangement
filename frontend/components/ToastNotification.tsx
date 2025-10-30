'use client';

import React, { useEffect, useState } from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface ToastNotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  onDismiss: (id: string) => void;
}

export function ToastNotification({
  id,
  type,
  title,
  description,
  duration = 5000,
  onDismiss
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Entry animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto-dismiss
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="h-5 w-5" />;
      case 'error':
        return <X className="h-5 w-5" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5" />;
      case 'info':
        return <Info className="h-5 w-5" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  const getIconStyles = () => {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
    }
  };

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 w-96 max-w-sm border rounded-lg shadow-lg transition-all duration-300 transform',
        getStyles(),
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start p-4">
        <div className={cn('shrink-0', getIconStyles())}>
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h4 className="font-medium text-sm">{title}</h4>
          {description && (
            <p className="mt-1 text-xs opacity-80">{description}</p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="ml-4 shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

export class ToastManager {
  private static instance: ToastManager;
  private toasts: Toast[] = [];
  private listeners: ((toasts: Toast[]) => void)[] = [];

  static getInstance() {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  show(toast: Omit<Toast, 'id'>) {
    const id = Math.random().toString(36).substring(7);
    const newToast = { ...toast, id };
    this.toasts.push(newToast);
    this.notify();
    return id;
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notify();
  }

  success(title: string, description?: string, duration?: number) {
    return this.show({ type: 'success', title, description, duration });
  }

  error(title: string, description?: string, duration?: number) {
    return this.show({ type: 'error', title, description, duration });
  }

  warning(title: string, description?: string, duration?: number) {
    return this.show({ type: 'warning', title, description, duration });
  }

  info(title: string, description?: string, duration?: number) {
    return this.show({ type: 'info', title, description, duration });
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const toastManager = ToastManager.getInstance();
    const unsubscribe = toastManager.subscribe(setToasts);
    return unsubscribe;
  }, []);

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
      {toasts.map(toast => (
        <ToastNotification
          key={toast.id}
          {...toast}
          onDismiss={(id) => ToastManager.getInstance().dismiss(id)}
        />
      ))}
    </div>
  );
}