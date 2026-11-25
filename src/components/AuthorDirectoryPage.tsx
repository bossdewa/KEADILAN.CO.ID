import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Eye, Search, Users } from 'lucide-react';
import { AUTHOR_PROFILES, AuthorProfile, NewsArticle, NewsCategory } from '../data/newsData';
import { getAuthorPhotoUrl } from '../utils/authorPortraits';

interface AuthorDirectoryPageProps {
  articles: NewsArticle[];
  onViewAuthorArticles: (authorName: string) => void;
  onSelectArticle: (article: NewsArticle) => void;
  onBackToFeed: () => void;
}

interface AuthorDirectoryItem {
  profile: AuthorProfile;
  photoUrl: string;
  articleCount: number;
  totalViews: number;
  categories: NewsCategory[];
  latestArticle: NewsArticle | null;
}

export const AuthorDirectoryPage: React.FC<AuthorDirectoryPageProps> = ({
  articles,
  onViewAuthorArticles,
  onSelectArticle,
  onBackToFeed,
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const authors = useMemo<AuthorDirectoryItem[]>(() => {
    const grouped = new Map<string, NewsArticle[]>();
    articles.forEach((article) => {
      const list = grouped.get(article.author) ?? [];
      list.push(article);
      grouped.set(article.author, list);
    });

    const allNames = new Set<string>([
      ...Object.keys(AUTHOR_PROFILES),
      ...Array.from(grouped.keys()),
    ]);

    return Array.from(allNames).map((name) => {
      const authoredArticles = grouped.get(name) ?? [];
      const fallbackRole = authoredArticles[0]?.authorRole ?? 'Kontributor Redaksi';
      const profile: AuthorProfile = AUTHOR_PROFILES[name] ?? {
        name,
        role: fallbackRole,
        initials: name
          .split(' ')
          .map((part) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        accentColor: '#0F2A44',
        bio: 'Jurnalis dan kontributor editorial KEADILAN.CO.ID untuk peliputan berita terverifikasi.',
      };

      const categories = Array.from(
        new Set(authoredArticles.map((article) => article.category))
      );
      const totalViews = authoredArticles.reduce(
        (sum, article) => sum + article.views,
        0
      );

      return {
        profile,
        photoUrl: getAuthorPhotoUrl(name),
        articleCount: authoredArticles.length,
        totalViews,
        categories,
        latestArticle: authoredArticles[0] ?? null,
      };
    });
  }, [articles]);

  const filteredAuthors = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return authors;
    return authors.filter(
      ({ profile, categories }) =>
        profile.name.toLowerCase().includes(q) ||
        profile.role.toLowerCase().includes(q) ||
        profile.bio.toLowerCase().includes(q) ||
        categories.some((cat) => cat.toLowerCase().includes(q))
    );
  }, [authors, filterQuery]);

  return (
    <section aria-label="Direktori Penulis KEADILAN.CO.ID" className="space-y-6">
      {/* Top Breadcrumb / Back Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="space-y-1">
          <button
            type="button"
            onClick={onBackToFeed}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A085] hover:underline underline-offset-4 cursor-pointer mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Kembali ke Kabar Terbaru</span>
          </button>
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-[#16A085]" aria-hidden="true" />
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight">
              Direktori Penulis &amp; Tim Redaksi
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Mengenal para jurnalis, redaktur, dan koresponden lapangan KEADILAN.CO.ID yang
            menyajikan laporan hukum, kebijakan publik, ekonomi daerah, serta kabar terverifikasi.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
          <div className="font-mono-tabular text-xs text-zinc-500 dark:text-zinc-400">
            {authors.length} Penulis · {articles.length} Artikel Terbit
          </div>
          <div className="relative w-full sm:w-64">
            <Search
              className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Cari nama penulis atau bidang..."
              aria-label="Cari penulis di direktori"
              className="w-full h-9 pl-8 pr-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#16A085]"
            />
          </div>
        </div>
      </div>

      {/* Author Cards Grid */}
      {filteredAuthors.length === 0 ? (
        <div className="py-12 px-6 text-center rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 space-y-2">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Tidak ditemukan penulis dengan kata kunci “{filterQuery}”.
          </p>
          <button
            type="button"
            onClick={() => setFilterQuery('')}
            className="px-3.5 py-1.5 rounded-md bg-[#16A085] text-white text-xs font-semibold cursor-pointer"
          >
            Tampilkan Semua Penulis
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAuthors.map(
            ({ profile, photoUrl, articleCount, totalViews, categories, latestArticle }) => (
              <article
                key={profile.name}
                className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col justify-between gap-4 hover:border-[#16A085]/70 transition-colors"
              >
                <div className="space-y-4">
                  {/* Photo + Name + Role */}
                  <div className="flex items-start gap-4">
                    <img
                      src={photoUrl}
                      alt={`Foto ${profile.name}`}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-md object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[#16A085]">
                        {profile.role}
                      </div>
                      <h2 className="font-editorial text-lg font-bold text-zinc-900 dark:text-zinc-50 leading-snug">
                        {profile.name}
                      </h2>
                      {categories.length > 0 && (
                        <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                          Rubrik: {categories.join(' · ')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {profile.bio}
                  </p>

                  {/* Stats Bar */}
                  <div className="grid grid-cols-2 gap-3 py-2.5 px-3 rounded bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800">
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-[#16A085]" aria-hidden="true" />
                        <span>Total Artikel</span>
                      </div>
                      <div className="font-mono-tabular text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {articleCount} diterbitkan
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                        <Eye className="w-3 h-3 text-[#C9A227]" aria-hidden="true" />
                        <span>Pembaca</span>
                      </div>
                      <div className="font-mono-tabular text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {totalViews.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>

                  {/* Latest Published Piece */}
                  {latestArticle && (
                    <div className="space-y-1 pt-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        Tulisan Terbaru
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectArticle(latestArticle)}
                        className="text-left text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:text-[#16A085] line-clamp-2 leading-snug cursor-pointer"
                      >
                        {latestArticle.title}
                      </button>
                    </div>
                  )}
                </div>

                {/* Action Link to Collective Work */}
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => onViewAuthorArticles(profile.name)}
                    className="w-full h-9 px-3 rounded-md bg-[#0F2A44] hover:bg-[#16A085] dark:bg-zinc-800 dark:hover:bg-[#16A085] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Lihat Semua Karya ({articleCount})</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </article>
            )
          )}
        </div>
      )}
    </section>
  );
};
