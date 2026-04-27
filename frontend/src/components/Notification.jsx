import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';

const icons = {
  success: FiCheckCircle,
  error:   FiAlertCircle,
  warning: FiAlertTriangle,
  info:    FiInfo,
};

const styles = {
  success: {
    bg:       'bg-emerald-50 dark:bg-emerald-900/30',
    border:   'border-emerald-200 dark:border-emerald-700/50',
    icon:     'text-emerald-500',
    progress: 'bg-emerald-500',
    text:     'text-emerald-800 dark:text-emerald-200',
  },
  error: {
    bg:       'bg-red-50 dark:bg-red-900/30',
    border:   'border-red-200 dark:border-red-700/50',
    icon:     'text-red-500',
    progress: 'bg-red-500',
    text:     'text-red-800 dark:text-red-200',
  },
  warning: {
    bg:       'bg-amber-50 dark:bg-amber-900/30',
    border:   'border-amber-200 dark:border-amber-700/50',
    icon:     'text-amber-500',
    progress: 'bg-amber-500',
    text:     'text-amber-800 dark:text-amber-200',
  },
  info: {
    bg:       'bg-indigo-50 dark:bg-indigo-900/30',
    border:   'border-indigo-200 dark:border-indigo-700/50',
    icon:     'text-indigo-500',
    progress: 'bg-indigo-500',
    text:     'text-indigo-800 dark:text-indigo-200',
  },
};

const Notification = () => {
  const { notification, showNotification } = useAppContext();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setVisible(true);
    } else {
      const timeout = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [notification]);

  if (!visible && !notification) return null;

  const type = notification?.type || 'info';
  const s = styles[type] || styles.info;
  const Icon = icons[type] || FiInfo;

  return (
    <div
      className={`fixed top-5 right-5 z-[9999] max-w-sm w-full transition-all duration-300 ${
        notification ? 'animate-slide-in opacity-100' : 'opacity-0 translate-x-4'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className={`relative overflow-hidden rounded-2xl border shadow-lg backdrop-blur-sm ${s.bg} ${s.border}`}>
        <div className="flex items-start gap-3 p-4">
          <Icon className={`mt-0.5 shrink-0 text-xl ${s.icon}`} />
          <p className={`flex-1 text-sm font-medium leading-snug ${s.text}`}>
            {notification?.message}
          </p>
          <button
            onClick={() => showNotification(null)}
            className={`shrink-0 p-0.5 rounded-md opacity-60 hover:opacity-100 transition-opacity ${s.text}`}
            aria-label="Dismiss notification"
          >
            <FiX size={16} />
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 w-full bg-black/5 dark:bg-white/5">
          <div
            className={`h-full ${s.progress} animate-progress`}
            style={{ animationDuration: '3.5s' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Notification;
