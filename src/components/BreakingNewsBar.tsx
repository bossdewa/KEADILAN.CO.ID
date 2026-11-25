import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  SlidersHorizontal,
  Zap,
} from 'lucide-react';
import { BreakingNewsItem, TickerConfig } from '../data/newsData';
import { getTickerContrastPalette } from '../utils/colorContrast';

interface BreakingNewsBarProps {
  config: TickerConfig;
  items: BreakingNewsItem[];
  unreadIds: string[];
  onTogglePause: () => void;
  onOpenCustomizer: () => void;
  onSelectArticle: (articleId?: string) => void;
  onMarkItemRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export const BreakingNewsBar: React.FC<BreakingNewsBarProps> = ({
  config,
  items,
  unreadIds,
  onTogglePause,
  onOpenCustomizer,
  onSelectArticle,
  onMarkItemRead,
  onMarkAllRead,
}) => {
  const palette = getTickerContrastPalette(config.backgroundColor);
  const activeItems = items.filter(
    (item) => item.active && item.text.trim().length > 0
  );
  const unreadCount = activeItems.filter((item) =>
    unreadIds.includes(item.id)
  ).length;

  const [cycleIndex, setCycleIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);

  const isAutoCycle = Boolean(config.autoCycle);
  const cycleIntervalMs =
    Math.max(2, config.autoCycleInterval ?? 5) * 1000;

  useEffect(() => {
    if (activeItems.length === 0) {
      setCycleIndex(0);
      return;
    }
    setCycleIndex((prev) => (prev >= activeItems.length ? 0 : prev));
  }, [activeItems.length]);

  useEffect(() => {
    if (!isAutoCycle || config.isPaused || isInteracting || activeItems.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setCycleIndex((prev) => (prev + 1) % activeItems.length);
    }, cycleIntervalMs);

    return () => window.clearInterval(timer);
  }, [
    isAutoCycle,
    config.isPaused,
    isInteracting,
    activeItems.length,
    cycleIntervalMs,
  ]);

  const safeCycleIndex =
    activeItems.length > 0 ? cycleIndex % activeItems.length : 0;
  const currentCycleItem = activeItems[safeCycleIndex];

  const handleStepCycle = (delta: number) => {
    if (activeItems.length <= 1) return;
    setCycleIndex(
      (prev) => (prev + delta + activeItems.length) % activeItems.length
    );
  };

  return (
    <div
      role="region"
      aria-label="Breaking News Terkini"
      className="sticky top-0 z-50 w-full h-9 sm:h-10 transition-colors duration-200 border-b"
      style={{
        backgroundColor: config.backgroundColor,
        color: palette.textColor,
        borderColor: palette.borderColor,
      }}
    >
      <div className="max-w-7xl mx-auto h-full px-3 sm:px-6 flex items-center gap-2.5 sm:gap-3.5">
        {/* Crisp Editorial Breaking Stamp */}
        <div
          className="shrink-0 flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-extrabold tracking-widest uppercase rounded-sm select-none"
          style={{
            backgroundColor: palette.badgeBg,
            color: palette.badgeText,
          }}
        >
          <Zap className="w-3 h-3 fill-current shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">Breaking News</span>
          <span className="sm:hidden">Breaking</span>
        </div>

        {/* Pulsing Unread Breaking News Badge */}
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            title="Tandai berita terbaru sudah dibaca"
            aria-label={`${unreadCount} berita berjalan baru belum dibaca. Klik untuk menandai sudah dibaca`}
            className="shrink-0 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-[10px] sm:text-[11px] font-bold tracking-wide uppercase cursor-pointer motion-safe:animate-pulse"
            style={{
              backgroundColor: palette.badgeBg,
              color: palette.badgeText,
              borderColor: palette.controlBorder,
            }}
          >
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span
                className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: palette.badgeText }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: palette.badgeText }}
              />
            </span>
            <span className="font-mono-tabular whitespace-nowrap">
              {unreadCount} Baru
            </span>
          </button>
        )}

        {/* Ticker Content: Periodic Auto-Cycle Mode OR Continuous Marquee */}
        <div
          className="ticker-container flex-1 min-w-0 overflow-hidden h-full flex items-center relative"
          onMouseEnter={() => setIsInteracting(true)}
          onMouseLeave={() => setIsInteracting(false)}
          onFocus={() => setIsInteracting(true)}
          onBlur={() => setIsInteracting(false)}
        >
          {activeItems.length === 0 ? (
            <button
              type="button"
              onClick={onOpenCustomizer}
              className="text-xs font-medium opacity-85 hover:opacity-100 underline underline-offset-4 cursor-pointer truncate"
            >
              Belum ada berita berjalan aktif — klik Atur untuk menambahkan berita terkini.
            </button>
          ) : isAutoCycle && currentCycleItem ? (
            <div className="w-full flex items-center justify-between gap-2 min-w-0">
              <button
                key={currentCycleItem.id}
                type="button"
                onClick={() => {
                  onMarkItemRead(currentCycleItem.id);
                  onSelectArticle(currentCycleItem.articleId);
                }}
                className="animate-feed-fade-in flex-1 min-w-0 flex items-center text-left text-xs sm:text-[13px] font-medium hover:underline underline-offset-4 focus:outline-none focus-visible:underline cursor-pointer"
              >
                {unreadIds.includes(currentCycleItem.id) && (
                  <span className="shrink-0 font-bold uppercase tracking-wider text-[10px] mr-1.5 underline underline-offset-2">
                    BARU
                  </span>
                )}
                <span className="shrink-0 font-bold uppercase tracking-wider text-[10px] sm:text-[11px] mr-2 opacity-85">
                  [{currentCycleItem.label}]
                </span>
                <span className="truncate">{currentCycleItem.text}</span>
              </button>

              {activeItems.length > 1 && (
                <div className="hidden sm:flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStepCycle(-1)}
                    aria-label="Berita breaking sebelumnya"
                    className="w-5 h-5 rounded flex items-center justify-center opacity-75 hover:opacity-100 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <span
                    className="font-mono-tabular text-[10px] font-semibold opacity-80 select-none"
                    aria-live="polite"
                  >
                    {safeCycleIndex + 1}/{activeItems.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleStepCycle(1)}
                    aria-label="Berita breaking berikutnya"
                    className="w-5 h-5 rounded flex items-center justify-center opacity-75 hover:opacity-100 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`animate-breaking-marquee items-center ${config.isPaused ? 'is-paused' : ''}`}
              style={
                {
                  '--ticker-duration': `${config.duration}s`,
                } as React.CSSProperties
              }
            >
              {[0, 1].map((dupIndex) => (
                <div
                  key={dupIndex}
                  aria-hidden={dupIndex === 1}
                  className="flex items-center shrink-0"
                >
                  {activeItems.map((item) => {
                    const isUnread = unreadIds.includes(item.id);
                    return (
                      <button
                        key={`${dupIndex}-${item.id}`}
                        type="button"
                        tabIndex={dupIndex === 1 ? -1 : 0}
                        onClick={() => {
                          onMarkItemRead(item.id);
                          onSelectArticle(item.articleId);
                        }}
                        className="inline-flex items-center whitespace-nowrap text-xs sm:text-[13px] font-medium mr-7 hover:underline underline-offset-4 focus:outline-none focus-visible:underline cursor-pointer"
                      >
                        {isUnread && (
                          <span className="font-bold uppercase tracking-wider text-[10px] mr-1.5 underline underline-offset-2">
                            BARU
                          </span>
                        )}
                        <span className="font-bold uppercase tracking-wider text-[10px] sm:text-[11px] mr-2 opacity-85">
                          [{item.label}]
                        </span>
                        <span>{item.text}</span>
                        <span
                          aria-hidden="true"
                          className="ml-7 text-xs select-none"
                          style={{ color: palette.mutedTextColor }}
                        >
                          /
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Compact Controls */}
        <div className="shrink-0 flex items-center gap-1.5">
          <button
            type="button"
            onClick={onTogglePause}
            aria-label={config.isPaused ? 'Putar teks berjalan' : 'Jeda teks berjalan'}
            title={config.isPaused ? 'Putar teks berjalan' : 'Jeda teks berjalan'}
            className="w-7 h-7 flex items-center justify-center rounded border transition-opacity hover:opacity-85 cursor-pointer"
            style={{
              backgroundColor: palette.controlBg,
              borderColor: palette.controlBorder,
              color: palette.textColor,
            }}
          >
            {config.isPaused ? (
              <Play className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Pause className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenCustomizer}
            aria-label="Kustomisasi Breaking News"
            className="h-7 px-2 sm:px-2.5 flex items-center gap-1.5 rounded border text-[11px] font-semibold tracking-wide transition-opacity hover:opacity-85 cursor-pointer"
            style={{
              backgroundColor: palette.controlBg,
              borderColor: palette.controlBorder,
              color: palette.textColor,
            }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Atur</span>
          </button>
        </div>
      </div>
    </div>
  );
};
