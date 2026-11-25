import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, BellOff, Radio, X } from 'lucide-react';
import { NewsArticle } from '../data/newsData';
import { calculateReadingTime } from '../utils/readingTime';

interface NewsToastStackProps {
  articles: NewsArticle[];
  readArticleIds: string[];
  isPaused: boolean;
  hasBackToTop: boolean;
  onOpenArticle: (article: NewsArticle) => void;
}

interface ActiveToast {
  toastId: string;
  article: NewsArticle;
  timestampLabel: string;
}

const INITIAL_DELAY_MS = 5500;
const INTERVAL_MS = 26000;
const AUTO_DISMISS_MS = 7500;

export const NewsToastStack: React.FC<NewsToastStackProps> = ({
  articles,
  readArticleIds,
  isPaused,
  hasBackToTop,
  onOpenArticle,
}) => {
  const [activeToast, setActiveToast] = useState<ActiveToast | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [remainingMs, setRemainingMs] = useState(AUTO_DISMISS_MS);

  const cursorRef = useRef(0);
  const articlesRef = useRef(articles);
  const readIdsRef = useRef(readArticleIds);
  const isPausedRef = useRef(isPaused);
  const remainingRef = useRef(AUTO_DISMISS_MS);

  articlesRef.current = articles;
  readIdsRef.current = readArticleIds;
  isPausedRef.current = isPaused;

  const spawnNextToast = () => {
    const pool = articlesRef.current;
    if (pool.length === 0 || isPausedRef.current) return;

    const unreadPool = pool.filter((a) => !readIdsRef.current.includes(a.id));
    const candidates = unreadPool.length > 0 ? unreadPool : pool;
    const chosen = candidates[cursorRef.current % candidates.length];
    cursorRef.current += 1;

    remainingRef.current = AUTO_DISMISS_MS;
    setRemainingMs(AUTO_DISMISS_MS);
    setActiveToast({
      toastId: `toast-${chosen.id}-${Date.now()}`,
      article: chosen,
      timestampLabel: 'Baru saja',
    });
  };

  useEffect(() => {
    if (isMuted || articles.length === 0) return;

    const initialTimer = window.setTimeout(() => {
      spawnNextToast();
    }, INITIAL_DELAY_MS);

    const recurringTimer = window.setInterval(() => {
      spawnNextToast();
    }, INTERVAL_MS);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(recurringTimer);
    };
  }, [isMuted, articles.length]);

  const activeToastId = activeToast?.toastId ?? null;

  useEffect(() => {
    if (!activeToastId || isHovered || isPaused) return;

    const tickMs = 100;
    const timer = window.setInterval(() => {
      const next = Math.max(0, remainingRef.current - tickMs);
      remainingRef.current = next;
      setRemainingMs(next);
      if (next <= 0) {
        window.clearInterval(timer);
        setActiveToast(null);
      }
    }, tickMs);

    return () => window.clearInterval(timer);
  }, [activeToastId, isHovered, isPaused]);

  if (!activeToast || isMuted) return null;

  const progressRatio = Math.max(0, Math.min(100, (remainingMs / AUTO_DISMISS_MS) * 100));

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Notifikasi berita terbaru"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsHovered(true)}
      onBlurCapture={() => setIsHovered(false)}
      className={`print-hidden fixed left-4 sm:left-6 z-40 w-[calc(100vw-2rem)] max-w-sm transition-all duration-200 ${
        hasBackToTop ? 'bottom-16 sm:bottom-6' : 'bottom-5 sm:bottom-6'
      }`}
    >
      <div
        key={activeToast.toastId}
        className="animate-feed-fade-in rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden"
      >
        <div className="p-3.5 space-y-2">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#16A085]">
                <Radio className="w-3 h-3 motion-safe:animate-pulse shrink-0" aria-hidden="true" />
                <span>Kabar Terkini</span>
              </span>
              <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-700 text-xs">
                ·
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 truncate">
                {activeToast.article.category}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className="font-mono-tabular text-[10px] text-zinc-400 dark:text-zinc-500 mr-1">
                {activeToast.timestampLabel}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsMuted(true);
                  setActiveToast(null);
                }}
                title="Bisukan notifikasi berita"
                aria-label="Bisukan notifikasi berita terbaru"
                className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <BellOff className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setActiveToast(null)}
                title="Tutup notifikasi"
                aria-label="Tutup notifikasi berita"
                className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Headline */}
          <button
            type="button"
            onClick={() => {
              const target = activeToast.article;
              setActiveToast(null);
              onOpenArticle(target);
            }}
            className="w-full text-left group cursor-pointer space-y-1"
          >
            <h3 className="font-editorial font-bold text-sm leading-snug text-zinc-900 dark:text-zinc-50 group-hover:text-[#16A085] line-clamp-2 transition-colors">
              {activeToast.article.title}
            </h3>
            <div className="flex items-center justify-between gap-2 pt-0.5 text-[11px]">
              <span className="font-mono-tabular text-zinc-500 dark:text-zinc-400">
                {activeToast.article.author} · {calculateReadingTime(activeToast.article)}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-[#16A085] group-hover:underline underline-offset-4 shrink-0">
                <span>Baca Berita</span>
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </span>
            </div>
          </button>
        </div>

        {/* Hairline Auto-Dismiss Countdown */}
        <div className="h-[2px] w-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full bg-[#16A085] transition-[width] duration-100 ease-linear"
            style={{ width: `${progressRatio}%` }}
          />
        </div>
      </div>
    </div>
  );
};
