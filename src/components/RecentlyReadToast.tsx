import React, { useEffect, useRef, useState } from 'react';
import { History, X } from 'lucide-react';
import { NewsArticle } from '../data/newsData';

export interface RecentlyReadToastData {
  toastId: string;
  article: NewsArticle;
}

interface RecentlyReadToastProps {
  toast: RecentlyReadToastData | null;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 4000;

export const RecentlyReadToast: React.FC<RecentlyReadToastProps> = ({
  toast,
  onDismiss,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [remainingMs, setRemainingMs] = useState(AUTO_DISMISS_MS);
  const remainingRef = useRef(AUTO_DISMISS_MS);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const currentToastId = toast?.toastId ?? null;

  useEffect(() => {
    remainingRef.current = AUTO_DISMISS_MS;
    setRemainingMs(AUTO_DISMISS_MS);
    setIsHovered(false);
  }, [currentToastId]);

  useEffect(() => {
    if (!currentToastId || isHovered) return;

    const tickMs = 80;
    const timer = window.setInterval(() => {
      const next = Math.max(0, remainingRef.current - tickMs);
      remainingRef.current = next;
      setRemainingMs(next);
      if (next <= 0) {
        window.clearInterval(timer);
        onDismissRef.current();
      }
    }, tickMs);

    return () => window.clearInterval(timer);
  }, [currentToastId, isHovered]);

  if (!toast) return null;

  const progressPct = Math.max(
    0,
    Math.min(100, (remainingMs / AUTO_DISMISS_MS) * 100)
  );

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Pengingat artikel pernah dibaca"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsHovered(true)}
      onBlurCapture={() => setIsHovered(false)}
      className="print-hidden fixed bottom-5 left-4 sm:left-6 z-[60] w-[calc(100vw-2rem)] max-w-xs sm:max-w-sm pointer-events-auto"
    >
      <div
        key={toast.toastId}
        className="animate-feed-fade-in rounded-md border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur shadow-lg overflow-hidden"
      >
        <div className="px-3.5 py-2.5 flex items-start gap-2.5">
          <span className="w-7 h-7 rounded bg-[#0F2A44] text-[#5EEAD4] flex items-center justify-center shrink-0 mt-0.5">
            <History className="w-3.5 h-3.5" aria-hidden="true" />
          </span>

          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#16A085]">
              Baru Saja Dibaca
            </div>
            <p className="text-xs text-zinc-700 dark:text-zinc-200 leading-snug">
              Anda sudah pernah mengunjungi artikel ini sebelumnya.
            </p>
            <p className="text-[11px] font-editorial font-semibold text-zinc-500 dark:text-zinc-400 truncate">
              {toast.article.title}
            </p>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Tutup pengingat pernah dibaca"
            title="Tutup"
            className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="h-[2px] w-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full bg-[#16A085] transition-[width] duration-75 ease-linear"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </div>
  );
};
