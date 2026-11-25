import React, { useState } from 'react';
import { History, Trash2, X } from 'lucide-react';
import { NewsArticle } from '../data/newsData';
import { calculateReadingTime } from '../utils/readingTime';

interface ReadingHistorySectionProps {
  historyArticles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  onRemoveArticle: (articleId: string) => void;
  onClearHistory: () => void;
}

const DEFAULT_VISIBLE_COUNT = 5;

export const ReadingHistorySection: React.FC<ReadingHistorySectionProps> = ({
  historyArticles,
  onSelectArticle,
  onRemoveArticle,
  onClearHistory,
}) => {
  const [showAll, setShowAll] = useState(false);

  const visibleArticles = showAll
    ? historyArticles
    : historyArticles.slice(0, DEFAULT_VISIBLE_COUNT);

  return (
    <section
      aria-label="Riwayat Baca"
      className="p-5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4"
    >
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <History className="w-4 h-4 text-[#16A085] shrink-0" aria-hidden="true" />
          <h2 className="font-editorial text-lg font-bold truncate">Riwayat Baca</h2>
        </div>
        <span className="font-mono-tabular text-xs font-semibold text-zinc-500 dark:text-zinc-400 shrink-0">
          {historyArticles.length}
        </span>
      </div>

      {historyArticles.length === 0 ? (
        <div className="py-4 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Belum ada riwayat baca. Artikel yang Anda buka akan tercatat otomatis di sini agar mudah
          dibaca kembali.
        </div>
      ) : (
        <>
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {visibleArticles.map((article) => (
              <li
                key={article.id}
                className="py-3 first:pt-1 last:pb-0 flex items-start gap-2.5"
              >
                <button
                  type="button"
                  onClick={() => onSelectArticle(article)}
                  className="flex-1 min-w-0 text-left group space-y-1 cursor-pointer"
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#16A085]">
                    {article.category}
                  </div>
                  <h3 className="font-editorial text-sm font-bold leading-snug text-zinc-900 dark:text-zinc-100 group-hover:text-[#16A085] line-clamp-2">
                    {article.title}
                  </h3>
                  <div className="font-mono-tabular text-[11px] text-zinc-500 dark:text-zinc-400">
                    {article.author} · {calculateReadingTime(article)}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onRemoveArticle(article.id)}
                  aria-label={`Hapus ${article.title} dari Riwayat Baca`}
                  title="Hapus dari Riwayat Baca"
                  className="w-7 h-7 shrink-0 rounded flex items-center justify-center text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>

          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
            {historyArticles.length > DEFAULT_VISIBLE_COUNT ? (
              <button
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
                className="text-xs font-semibold text-[#16A085] hover:underline underline-offset-4 cursor-pointer"
              >
                {showAll
                  ? 'Tampilkan Ringkas'
                  : `Lihat Semua (${historyArticles.length})`}
              </button>
            ) : (
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                Terbaru di atas
              </span>
            )}

            <button
              type="button"
              onClick={() => {
                setShowAll(false);
                onClearHistory();
              }}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" aria-hidden="true" />
              <span>Hapus Riwayat</span>
            </button>
          </div>
        </>
      )}
    </section>
  );
};
