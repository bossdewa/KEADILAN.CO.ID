import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, RefreshCw, Sparkles } from 'lucide-react';
import { NewsArticle } from '../data/newsData';

interface ArticleAiSummaryProps {
  article: NewsArticle;
}

const summaryCache = new Map<string, string[]>();

export const ArticleAiSummary: React.FC<ArticleAiSummaryProps> = ({ article }) => {
  const [bullets, setBullets] = useState<string[]>(
    () => summaryCache.get(article.id) ?? []
  );
  const [isLoading, setIsLoading] = useState<boolean>(!summaryCache.has(article.id));
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchSummary = useCallback(
    async (forceRefresh: boolean, signal?: AbortSignal) => {
      if (!forceRefresh && summaryCache.has(article.id)) {
        setBullets(summaryCache.get(article.id) ?? []);
        setIsLoading(false);
        setErrorMessage(null);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: article.title,
            category: article.category,
            excerpt: article.excerpt,
            content: article.content,
          }),
          signal,
        });

        const data = (await response.json()) as {
          bullets?: unknown;
          summary?: string;
          error?: string;
        };

        let nextBullets: string[] = [];
        if (Array.isArray(data.bullets)) {
          nextBullets = data.bullets
            .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
            .slice(0, 3);
        } else if (typeof data.summary === 'string' && data.summary.trim().length > 0) {
          nextBullets = data.summary
            .split(/(?<=[.!?])\s+/)
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 3);
        }

        if (!response.ok || nextBullets.length === 0) {
          throw new Error(
            data.error || 'Gagal memuat ringkasan AI untuk artikel ini.'
          );
        }

        summaryCache.set(article.id, nextBullets);
        setBullets(nextBullets);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        const message =
          err instanceof Error
            ? err.message
            : 'Terjadi gangguan saat menyusun ringkasan AI.';
        setErrorMessage(message);
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [article.id, article.title, article.category, article.excerpt, article.content]
  );

  useEffect(() => {
    const cached = summaryCache.get(article.id);
    if (cached) {
      setBullets(cached);
      setIsLoading(false);
      setErrorMessage(null);
      return;
    }

    const controller = new AbortController();
    fetchSummary(false, controller.signal);
    return () => controller.abort();
  }, [article.id, fetchSummary]);

  return (
    <section
      aria-label="Ringkasan AI 3 Poin"
      className={`rounded-md border border-[#16A085]/35 bg-[#16A085]/[0.05] dark:bg-[#16A085]/[0.08] print:bg-zinc-50 print:border-zinc-300 p-4 space-y-2.5 ${
        isLoading || errorMessage ? 'print-hidden' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Sparkles className="w-3.5 h-3.5 text-[#16A085] shrink-0" aria-hidden="true" />
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#16A085] truncate">
            AI Summary · 3 Poin Inti
          </span>
        </div>

        <div className="print-hidden flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => fetchSummary(true)}
            disabled={isLoading}
            aria-label="Buat ulang ringkasan AI"
            className="h-7 px-2 rounded border border-[#16A085]/30 text-[11px] font-semibold text-[#16A085] hover:bg-[#16A085]/10 disabled:opacity-50 inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RefreshCw
              className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>{isLoading ? 'Memproses...' : 'Buat Ulang'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Sembunyikan ringkasan AI' : 'Tampilkan ringkasan AI'}
            className="w-7 h-7 rounded border border-[#16A085]/30 text-[#16A085] hover:bg-[#16A085]/10 inline-flex items-center justify-center transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {isLoading ? (
            <ul className="space-y-2 py-0.5" aria-live="polite" aria-busy="true">
              {[0, 1, 2].map((idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#16A085]/40 shrink-0" />
                  <div
                    className={`h-3.5 rounded bg-zinc-200/80 dark:bg-zinc-800 animate-pulse ${
                      idx === 0 ? 'w-full' : idx === 1 ? 'w-11/12' : 'w-4/5'
                    }`}
                  />
                </li>
              ))}
            </ul>
          ) : errorMessage ? (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-2 text-xs text-red-600 dark:text-red-400"
            >
              <span className="inline-flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{errorMessage}</span>
              </span>
              <button
                type="button"
                onClick={() => fetchSummary(true)}
                className="text-xs font-semibold underline underline-offset-4 hover:text-red-700 dark:hover:text-red-300 cursor-pointer"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <ul className="space-y-1.5 text-xs sm:text-[13.5px] leading-relaxed text-zinc-800 dark:text-zinc-200 print:text-zinc-900">
              {bullets.map((point, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <span
                    className="mt-2 w-1.5 h-1.5 rounded-full bg-[#16A085] shrink-0"
                    aria-hidden="true"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
};

