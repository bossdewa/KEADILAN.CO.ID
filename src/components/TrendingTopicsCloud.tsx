import React, { useMemo, useState } from 'react';
import { Check, Download, FileText, Hash, ListOrdered, TrendingUp } from 'lucide-react';
import { NewsArticle, NewsCategory } from '../data/newsData';
import { calculateReadingTime } from '../utils/readingTime';

export interface TrendingTopic {
  label: string;
  count: number;
  kind: 'category' | 'keyword';
  categoryValue?: NewsCategory;
}

interface TrendingTopicsCloudProps {
  articles: NewsArticle[];
  activeCategory: 'Semua' | 'Baca Nanti' | NewsCategory;
  searchQuery: string;
  onSelectCategory: (category: 'Semua' | NewsCategory) => void;
  onSelectKeyword: (keyword: string) => void;
  onResetFilter: () => void;
}

const STOPWORDS = new Set([
  'yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'pada', 'dengan', 'dalam', 'serta',
  'atau', 'agar', 'juga', 'ini', 'itu', 'bagi', 'oleh', 'secara', 'melalui',
  'hingga', 'lebih', 'telah', 'dapat', 'tidak', 'sebagai', 'tersebut', 'kini',
  'mulai', 'tahun', 'setiap', 'para', 'bisa', 'akan', 'saat', 'masih', 'tetap',
  'harus', 'antara', 'sejak', 'sudah', 'belum', 'banyak', 'semua', 'sejumlah',
  'maupun', 'bukan', 'sekadar', 'hanya', 'menjadi', 'membuat', 'memberikan',
  'seiring', 'mencatat', 'menilai', 'menekankan', 'menyiapkan', 'membahas',
  'sepakat', 'dorong', 'bantu', 'masuk', 'masuki', 'tembus', 'diminta',
  'sepanjang', 'sekitar', 'berbagai', 'lainnya', 'sendiri', 'paling', 'guna',
  'berjalan', 'berbasis', 'berbekal', 'tingkat', 'bagian', 'utama', 'baru',
  'warga', 'masyarakat', 'pemerintah', 'daerah', 'umum', 'hukum', 'politik', 'sorot',
  'ekonomi', 'teknologi',
]);

const ACRONYMS = new Set(['UMKM', 'DPRD', 'BMKG', 'UU']);

function formatKeywordLabel(raw: string): string {
  const upper = raw.toUpperCase();
  if (ACRONYMS.has(upper)) return upper;
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

function triggerTextDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const TrendingTopicsCloud: React.FC<TrendingTopicsCloudProps> = ({
  articles,
  activeCategory,
  searchQuery,
  onSelectCategory,
  onSelectKeyword,
  onResetFilter,
}) => {
  const [downloadedFormat, setDownloadedFormat] = useState<'text' | 'featured' | null>(null);

  const topics = useMemo<TrendingTopic[]>(() => {
    const categoryFreq = new Map<NewsCategory, number>();
    const keywordDocs = new Map<string, Set<string>>();

    articles.forEach((article) => {
      categoryFreq.set(
        article.category,
        (categoryFreq.get(article.category) ?? 0) + 1
      );

      const text = `${article.title} ${article.excerpt} ${article.content.join(' ')}`;
      const tokens = text
        .replace(/[^a-zA-Z0-9\s-]/g, ' ')
        .split(/\s+/)
        .map((t) => t.trim())
        .filter((t) => t.length >= 4 || ACRONYMS.has(t.toUpperCase()));

      tokens.forEach((token) => {
        const lower = token.toLowerCase();
        if (STOPWORDS.has(lower)) return;
        const existing = keywordDocs.get(lower) ?? new Set<string>();
        existing.add(article.id);
        keywordDocs.set(lower, existing);
      });
    });

    const categoryTopics: TrendingTopic[] = Array.from(categoryFreq.entries())
      .map(([cat, count]) => ({
        label: cat,
        count,
        kind: 'category' as const,
        categoryValue: cat,
      }))
      .sort((a, b) => b.count - a.count);

    const keywordTopics: TrendingTopic[] = Array.from(keywordDocs.entries())
      .map(([word, docSet]) => ({
        label: formatKeywordLabel(word),
        count: docSet.size,
        kind: 'keyword' as const,
      }))
      .filter((item) => item.count >= 2)
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      .slice(0, 8);

    return [...categoryTopics, ...keywordTopics].sort(
      (a, b) => b.count - a.count || a.label.localeCompare(b.label)
    );
  }, [articles]);

  const featuredDigestArticles = useMemo(() => {
    const featured = articles.filter((a) => a.featured);
    const remainingPopular = [...articles]
      .filter((a) => !a.featured)
      .sort((a, b) => b.views - a.views)
      .slice(0, Math.max(0, 6 - featured.length));
    return [...featured, ...remainingPopular].sort((a, b) => b.views - a.views);
  }, [articles]);

  const handleDownloadTextSummary = () => {
    const generatedAt = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const categoryLines = topics
      .filter((t) => t.kind === 'category')
      .map((t, idx) => `  ${idx + 1}. ${t.label} (${t.count} artikel)`);

    const keywordLines = topics
      .filter((t) => t.kind === 'keyword')
      .map((t, idx) => `  ${idx + 1}. #${t.label} (${t.count} liputan terkait)`);

    const topStories = [...articles]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map(
        (art, idx) =>
          `${idx + 1}. [${art.category}] ${art.title}\n` +
          `   Penulis: ${art.author} · ${art.date} · ${calculateReadingTime(art)} · ${art.views.toLocaleString('id-ID')} dibaca\n` +
          `   Ringkasan: ${art.excerpt}`
      );

    const content = [
      'KEADILAN.CO.ID — MEDIA DARING SOBAT KEADILAN',
      'RINGKASAN MINGGUAN TOPIK TERPOPULER',
      `Diperbarui: ${generatedAt}`,
      `Total Liputan Terindeks: ${articles.length} artikel`,
      '============================================================',
      '',
      'A. RUBRIK PALING AKTIF MINGGU INI',
      ...categoryLines,
      '',
      'B. KATA KUNCI HANGAT',
      ...keywordLines,
      '',
      'C. SOROTAN BERITA PALING BANYAK DIBACA',
      ...topStories,
      '',
      '------------------------------------------------------------',
      'Diterbitkan oleh KEADILAN.CO.ID · PT Wahana Sahabat Kreatif',
    ].join('\n');

    triggerTextDownload('keadilan-ringkasan-mingguan-topik.txt', content, 'text/plain');
    setDownloadedFormat('text');
    window.setTimeout(() => setDownloadedFormat(null), 2200);
  };

  const handleDownloadFeaturedList = () => {
    const generatedAt = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const topKeywords = topics
      .slice(0, 6)
      .map((t) => `#${t.label} (${t.count})`)
      .join(' · ');

    const lines = [
      '# Daftar Artikel Unggulan Mingguan — KEADILAN.CO.ID',
      '',
      `> Edisi ${generatedAt} | Topik Hangat: ${topKeywords}`,
      '',
      ...featuredDigestArticles.flatMap((art, idx) => [
        `## ${idx + 1}. ${art.title}`,
        `- **Rubrik:** ${art.category}${art.featured ? ' (Sorotan Utama)' : ''}`,
        `- **Penulis:** ${art.author} (${art.authorRole})`,
        `- **Tanggal & Estimasi Baca:** ${art.date} · ${calculateReadingTime(art)} · ${art.views.toLocaleString('id-ID')} pembaca`,
        '',
        art.excerpt,
        '',
      ]),
      '---',
      '*Disusun dari kanal Topik Hangat KEADILAN.CO.ID — Media Daring Sobat Keadilan.*',
    ].join('\n');

    triggerTextDownload('keadilan-daftar-artikel-unggulan.md', lines, 'text/markdown');
    setDownloadedFormat('featured');
    window.setTimeout(() => setDownloadedFormat(null), 2200);
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const hasTopicFilter =
    (activeCategory !== 'Semua' && activeCategory !== 'Baca Nanti') ||
    topics.some(
      (t) => t.kind === 'keyword' && t.label.toLowerCase() === normalizedQuery
    );

  return (
    <section
      aria-label="Topik Hangat"
      className="p-5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3.5"
    >
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5 gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#16A085]" aria-hidden="true" />
          <h2 className="font-editorial text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Topik Hangat
          </h2>
        </div>

        {hasTopicFilter && (
          <button
            type="button"
            onClick={onResetFilter}
            className="text-[11px] font-semibold text-[#16A085] hover:underline underline-offset-4 cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {topics.map((topic) => {
          const isActive =
            topic.kind === 'category'
              ? activeCategory === topic.categoryValue
              : normalizedQuery === topic.label.toLowerCase();

          const isHighFreq = topic.count >= 4;

          return (
            <button
              key={`${topic.kind}-${topic.label}`}
              type="button"
              aria-pressed={isActive}
              onClick={() => {
                if (topic.kind === 'category' && topic.categoryValue) {
                  onSelectCategory(
                    activeCategory === topic.categoryValue ? 'Semua' : topic.categoryValue
                  );
                } else {
                  onSelectKeyword(
                    normalizedQuery === topic.label.toLowerCase() ? '' : topic.label
                  );
                }
              }}
              className={`h-8 px-2.5 rounded border text-xs inline-flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#0F2A44] border-[#0F2A44] text-white dark:bg-[#16A085] dark:border-[#16A085] font-semibold'
                  : isHighFreq
                    ? 'bg-zinc-50 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 font-semibold hover:border-[#16A085] hover:text-[#16A085]'
                    : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium hover:border-[#16A085] hover:text-[#16A085]'
              }`}
            >
              <Hash className="w-3 h-3 opacity-60 shrink-0" aria-hidden="true" />
              <span>{topic.label}</span>
              <span
                className={`font-mono-tabular text-[10px] ml-0.5 ${
                  isActive ? 'opacity-85' : 'text-zinc-400 dark:text-zinc-500'
                }`}
              >
                {topic.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Weekly Trending Summary Export Actions */}
      <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
            <Download className="w-3.5 h-3.5 text-[#16A085]" aria-hidden="true" />
            <span>Unduh Ringkasan Mingguan</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleDownloadTextSummary}
            aria-label="Unduh ringkasan mingguan topik terpopuler dalam format teks (.txt)"
            className="h-8 px-2.5 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 hover:border-[#16A085] hover:text-[#16A085] text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
          >
            {downloadedFormat === 'text' ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#16A085] shrink-0" aria-hidden="true" />
                <span>Teks Terunduh</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Format Teks (.txt)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadFeaturedList}
            aria-label="Unduh ringkasan mingguan sebagai daftar artikel unggulan (.md)"
            className="h-8 px-2.5 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 hover:border-[#16A085] hover:text-[#16A085] text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
          >
            {downloadedFormat === 'featured' ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#16A085] shrink-0" aria-hidden="true" />
                <span>Daftar Terunduh</span>
              </>
            ) : (
              <>
                <ListOrdered className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Artikel Unggulan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};

