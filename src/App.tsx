import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ALargeSmall,
  ArrowUp,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronDown,
  Clock,
  Code2,
  Download,
  LayoutGrid,
  List,
  Monitor,
  Moon,
  Scale,
  SlidersHorizontal,
  Sun,
} from 'lucide-react';
import {
  BreakingNewsItem,
  INITIAL_BREAKING_ITEMS,
  NEWS_ARTICLES,
  NewsArticle,
  NewsCategory,
  TickerConfig,
} from './data/newsData';
import { BreakingNewsBar } from './components/BreakingNewsBar';
import { TickerCustomizerDrawer } from './components/TickerCustomizerDrawer';
import { ArticleModal } from './components/ArticleModal';
import { EditorialArtwork } from './components/EditorialArtwork';
import { NewsletterSignup } from './components/NewsletterSignup';
import { ReadLaterSection } from './components/ReadLaterSection';
import { CirebonWeatherWidget } from './components/CirebonWeatherWidget';
import { FollowUsSection } from './components/FollowUsSection';
import { TrendingTopicsCloud } from './components/TrendingTopicsCloud';
import { NewsToastStack } from './components/NewsToastStack';
import {
  RecentlyReadToast,
  RecentlyReadToastData,
} from './components/RecentlyReadToast';
import { ReadingHistorySection } from './components/ReadingHistorySection';
import { SearchWithRecentDropdown } from './components/SearchWithRecentDropdown';
import { SendFeedback } from './components/SendFeedback';
import { calculateReadingTime, getFeedReadingSummary } from './utils/readingTime';
import {
  downloadXmlFile,
  generateFullBloggerThemeXml,
} from './utils/bloggerXmlExport';

const STORAGE_KEYS = {
  config: 'keadilan_ticker_config',
  items: 'keadilan_breaking_items',
  theme: 'keadilan_dark_mode',
  saved: 'keadilan_saved_articles',
  unreadBreaking: 'keadilan_unread_breaking',
  readArticles: 'keadilan_read_articles',
  fontSize: 'keadilan_font_size',
  recentSearches: 'keadilan_recent_searches',
};

const MAX_RECENT_SEARCHES = 8;

type PortalFontSize = 'small' | 'medium' | 'large';
type ThemePreference = 'system' | 'light' | 'dark';

const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

const DEFAULT_TICKER_CONFIG: TickerConfig = {
  duration: 28,
  backgroundColor: '#B91C1C',
  isPaused: false,
  autoCycle: false,
  autoCycleInterval: 5,
};

const ALL_CATEGORIES: Array<'Semua' | NewsCategory> = [
  'Semua',
  'Sorot',
  'Hukum',
  'Umum',
  'Politik',
  'Daerah',
  'Ekonomi',
  'Teknologi',
];

const HEADER_NAV_ITEMS: Array<{ label: string; category: 'Semua' | NewsCategory }> = [
  { label: 'Beranda', category: 'Semua' },
  { label: 'Sorot', category: 'Sorot' },
  { label: 'Hukum', category: 'Hukum' },
  { label: 'Politik', category: 'Politik' },
  { label: 'Daerah', category: 'Daerah' },
  { label: 'Ekonomi', category: 'Ekonomi' },
  { label: 'Teknologi', category: 'Teknologi' },
];

export default function App() {
  const [tickerConfig, setTickerConfig] = useState<TickerConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.config);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          duration: typeof parsed.duration === 'number' ? parsed.duration : 28,
          backgroundColor:
            typeof parsed.backgroundColor === 'string' ? parsed.backgroundColor : '#B91C1C',
          isPaused: Boolean(parsed.isPaused),
          autoCycle: Boolean(parsed.autoCycle),
          autoCycleInterval:
            typeof parsed.autoCycleInterval === 'number' ? parsed.autoCycleInterval : 5,
        };
      }
    } catch {
      // Ignore storage error
    }
    return DEFAULT_TICKER_CONFIG;
  });

  const [breakingItems, setBreakingItems] = useState<BreakingNewsItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.items);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore storage error
    }
    return INITIAL_BREAKING_ITEMS;
  });

  const [themePreference, setThemePreference] = useState<ThemePreference>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.theme);
      if (saved === 'dark' || saved === 'true') return 'dark';
      if (saved === 'light' || saved === 'false') return 'light';
      if (saved === 'system') return 'system';
    } catch {
      // Ignore storage error
    }
    return 'system';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }
    return window.matchMedia(COLOR_SCHEME_QUERY).matches;
  });

  const darkMode =
    themePreference === 'system' ? systemPrefersDark : themePreference === 'dark';

  const [fontSize, setFontSize] = useState<PortalFontSize>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.fontSize);
      if (saved === 'small' || saved === 'medium' || saved === 'large') {
        return saved;
      }
    } catch {
      // Ignore storage error
    }
    return 'medium';
  });

  const [savedArticleIds, setSavedArticleIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.saved);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((id): id is string => typeof id === 'string');
        }
      }
    } catch {
      // Ignore storage error
    }
    return [];
  });

  const [unreadBreakingIds, setUnreadBreakingIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.unreadBreaking);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((id): id is string => typeof id === 'string');
        }
      }
    } catch {
      // Ignore storage error
    }
    return [];
  });

  const [readArticleIds, setReadArticleIds] = useState<string[]>(() => {
    const initialIds: string[] = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.readArticles);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((id) => {
            if (typeof id === 'string') initialIds.push(id);
          });
        }
      }
      const params = new URLSearchParams(window.location.search);
      const urlArticleId = params.get('article');
      if (
        urlArticleId &&
        NEWS_ARTICLES.some((a) => a.id === urlArticleId) &&
        !initialIds.includes(urlArticleId)
      ) {
        initialIds.push(urlArticleId);
      }
    } catch {
      // Ignore storage/URL error
    }
    return initialIds;
  });

  const [activeCategory, setActiveCategory] = useState<'Semua' | 'Baca Nanti' | NewsCategory>('Semua');
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.recentSearches);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const seen = new Set<string>();
          const valid: string[] = [];
          for (const entry of parsed) {
            if (typeof entry !== 'string') continue;
            const normalized = entry.trim().replace(/\s+/g, ' ');
            const key = normalized.toLowerCase();
            if (normalized.length >= 2 && !seen.has(key)) {
              seen.add(key);
              valid.push(normalized);
            }
            if (valid.length >= MAX_RECENT_SEARCHES) break;
          }
          return valid;
        }
      }
    } catch {
      // Ignore storage error
    }
    return [];
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const articleId = params.get('article');
      if (articleId) {
        return NEWS_ARTICLES.find((a) => a.id === articleId) ?? null;
      }
    } catch {
      // Ignore URL parse error
    }
    return null;
  });
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [customizerTab, setCustomizerTab] = useState<'settings' | 'xml'>('settings');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [recentlyReadToast, setRecentlyReadToast] =
    useState<RecentlyReadToastData | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [progressTransitionMs, setProgressTransitionMs] = useState(60);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const dismissRecentlyReadToast = useCallback(() => {
    setRecentlyReadToast(null);
  }, []);

  const openCustomizer = (tab: 'settings' | 'xml' = 'settings') => {
    setCustomizerTab(tab);
    setIsCustomizerOpen(true);
  };

  const handleDownloadBloggerThemeXml = () => {
    const xml = generateFullBloggerThemeXml(tickerConfig, breakingItems);
    downloadXmlFile('keadilan-co-id-blogspot-theme.xml', xml);
  };

  const smoothScrollToTop = () => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.config, JSON.stringify(tickerConfig));
    } catch {
      // Ignore storage error
    }
  }, [tickerConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.items, JSON.stringify(breakingItems));
    } catch {
      // Ignore storage error
    }
  }, [breakingItems]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY);
    setSystemPrefersDark(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches);
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    try {
      localStorage.setItem(STORAGE_KEYS.theme, themePreference);
    } catch {
      // Ignore storage error
    }
  }, [darkMode, themePreference]);

  const handleCycleTheme = () => {
    setThemePreference((prev) => {
      if (prev === 'system') {
        return systemPrefersDark ? 'light' : 'dark';
      }
      if (prev === 'dark') {
        return systemPrefersDark ? 'system' : 'light';
      }
      return systemPrefersDark ? 'dark' : 'system';
    });
  };

  useEffect(() => {
    document.documentElement.dataset.fontSize = fontSize;
    try {
      localStorage.setItem(STORAGE_KEYS.fontSize, fontSize);
    } catch {
      // Ignore storage error
    }
  }, [fontSize]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.saved, JSON.stringify(savedArticleIds));
    } catch {
      // Ignore storage error
    }
  }, [savedArticleIds]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.unreadBreaking,
        JSON.stringify(unreadBreakingIds)
      );
    } catch {
      // Ignore storage error
    }
  }, [unreadBreakingIds]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.readArticles,
        JSON.stringify(readArticleIds)
      );
    } catch {
      // Ignore storage error
    }
  }, [readArticleIds]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.recentSearches,
        JSON.stringify(recentSearches)
      );
    } catch {
      // Ignore storage error
    }
  }, [recentSearches]);

  const recordRecentSearch = useCallback((rawQuery: string) => {
    const normalized = rawQuery.trim().replace(/\s+/g, ' ');
    if (normalized.length < 2) return;
    setRecentSearches((prev) => {
      if (
        prev.length > 0 &&
        prev[0].toLowerCase() === normalized.toLowerCase()
      ) {
        return prev;
      }
      const filtered = prev.filter(
        (item) => item.toLowerCase() !== normalized.toLowerCase()
      );
      return [normalized, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    });
  }, []);

  useEffect(() => {
    const normalized = searchQuery.trim().replace(/\s+/g, ' ');
    if (normalized.length < 2) return;
    const timer = window.setTimeout(() => {
      recordRecentSearch(normalized);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [searchQuery, recordRecentSearch]);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (selectedArticle) {
        url.searchParams.set('article', selectedArticle.id);
      } else {
        url.searchParams.delete('article');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Ignore history error in restricted environments
    }
  }, [selectedArticle]);

  useEffect(() => {
    let rafId: number | null = null;
    let lastScrollY = window.scrollY;
    let lastTimestamp = performance.now();

    const updateProgress = () => {
      rafId = null;
      const now = performance.now();
      const scrollTop = window.scrollY;
      const dt = Math.max(8, now - lastTimestamp);
      const velocity = Math.abs(scrollTop - lastScrollY) / dt; // px per ms

      lastScrollY = scrollTop;
      lastTimestamp = now;

      setShowBackToTop(scrollTop > 320);

      // Faster scrolling gets tighter (0ms) response; gentle scrolling stays silky
      const adaptiveDuration = Math.max(0, Math.round(85 - Math.min(velocity, 2.4) * 35));
      setProgressTransitionMs(adaptiveDuration);

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        setScrollProgress(0);
        return;
      }
      setScrollProgress(Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)));
    };

    const onScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const updateTickerConfig = (partial: Partial<TickerConfig>) => {
    setTickerConfig((prev) => ({ ...prev, ...partial }));
  };

  const handleAddBreakingItem = (label: BreakingNewsItem['label'], text: string) => {
    const newId = `bn-${Date.now()}`;
    const newItem: BreakingNewsItem = {
      id: newId,
      label,
      text,
      active: true,
    };
    setBreakingItems((prev) => [newItem, ...prev]);
    setUnreadBreakingIds((prev) => [newId, ...prev]);
  };

  const handleToggleBreakingItem = (id: string) => {
    setBreakingItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
  };

  const handleEditBreakingItem = (id: string, text: string) => {
    setBreakingItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text } : item))
    );
  };

  const handleDeleteBreakingItem = (id: string) => {
    setBreakingItems((prev) => prev.filter((item) => item.id !== id));
    setUnreadBreakingIds((prev) => prev.filter((unreadId) => unreadId !== id));
  };

  const handleResetDefaults = () => {
    setTickerConfig(DEFAULT_TICKER_CONFIG);
    setBreakingItems(INITIAL_BREAKING_ITEMS);
    setUnreadBreakingIds([]);
  };

  const handleMarkBreakingItemRead = (id: string) => {
    setUnreadBreakingIds((prev) => prev.filter((unreadId) => unreadId !== id));
  };

  const handleMarkAllBreakingRead = () => {
    setUnreadBreakingIds([]);
  };

  const handleOpenArticle = (article: NewsArticle) => {
    if (searchQuery.trim().length >= 2) {
      recordRecentSearch(searchQuery);
    }
    const wasAlreadyRead = readArticleIds.includes(article.id);
    if (wasAlreadyRead) {
      setRecentlyReadToast({
        toastId: `revisit-${article.id}-${Date.now()}`,
        article,
      });
    } else {
      setRecentlyReadToast(null);
    }
    setReadArticleIds((prev) => [
      article.id,
      ...prev.filter((id) => id !== article.id),
    ]);
    setSelectedArticle(article);
  };

  const handleSelectRecentSearch = (term: string) => {
    setActiveCategory('Semua');
    setSelectedAuthor(null);
    setSearchQuery(term);
    recordRecentSearch(term);
  };

  const handleRemoveRecentSearch = (term: string) => {
    setRecentSearches((prev) =>
      prev.filter((item) => item.toLowerCase() !== term.toLowerCase())
    );
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
  };

  const removeHistoryArticle = (articleId: string) => {
    setReadArticleIds((prev) => prev.filter((id) => id !== articleId));
  };

  const clearReadingHistory = () => {
    setReadArticleIds([]);
  };

  const handleOpenBreakingArticle = (articleId?: string) => {
    if (articleId) {
      const found = NEWS_ARTICLES.find((a) => a.id === articleId);
      if (found) {
        handleOpenArticle(found);
        return;
      }
    }
    openCustomizer('settings');
  };

  const toggleSaveArticle = (articleId: string) => {
    setSavedArticleIds((prev) =>
      prev.includes(articleId)
        ? prev.filter((id) => id !== articleId)
        : [articleId, ...prev]
    );
  };

  const removeSavedArticle = (articleId: string) => {
    setSavedArticleIds((prev) => prev.filter((id) => id !== articleId));
  };

  const clearSavedArticles = () => {
    setSavedArticleIds([]);
  };

  const handleViewAuthorArticles = (authorName: string) => {
    setSelectedArticle(null);
    setActiveCategory('Semua');
    setSearchQuery('');
    setSelectedAuthor(authorName);
    smoothScrollToTop();
  };

  const savedArticles = useMemo(
    () =>
      savedArticleIds
        .map((id) => NEWS_ARTICLES.find((a) => a.id === id))
        .filter((a): a is NewsArticle => Boolean(a)),
    [savedArticleIds]
  );

  const historyArticles = useMemo(
    () =>
      readArticleIds
        .map((id) => NEWS_ARTICLES.find((a) => a.id === id))
        .filter((a): a is NewsArticle => Boolean(a)),
    [readArticleIds]
  );

  const featuredArticles = useMemo(
    () => NEWS_ARTICLES.filter((a) => a.featured).slice(0, 4),
    []
  );

  const knownAuthors = useMemo(
    () => Array.from(new Set(NEWS_ARTICLES.map((a) => a.author))),
    []
  );

  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const source = activeCategory === 'Baca Nanti' ? savedArticles : NEWS_ARTICLES;
    return source.filter((article) => {
      const matchesCat =
        activeCategory === 'Semua' ||
        activeCategory === 'Baca Nanti' ||
        article.category === activeCategory;
      const matchesAuthor = !selectedAuthor || article.author === selectedAuthor;
      const matchesQuery =
        !q ||
        article.title.toLowerCase().includes(q) ||
        article.excerpt.toLowerCase().includes(q) ||
        article.category.toLowerCase().includes(q) ||
        article.author.toLowerCase().includes(q) ||
        article.content.some((paragraph) => paragraph.toLowerCase().includes(q));
      return matchesCat && matchesAuthor && matchesQuery;
    });
  }, [activeCategory, savedArticles, searchQuery, selectedAuthor]);

  const feedReadingSummary = useMemo(
    () => getFeedReadingSummary(filteredArticles),
    [filteredArticles]
  );

  const popularArticles = useMemo(
    () => [...NEWS_ARTICLES].sort((a, b) => b.views - a.views).slice(0, 5),
    []
  );

  const categoryCounts = useMemo(() => {
    const map: Record<NewsCategory, number> = {
      Sorot: 0,
      Hukum: 0,
      Umum: 0,
      Politik: 0,
      Daerah: 0,
      Ekonomi: 0,
      Teknologi: 0,
    };
    NEWS_ARTICLES.forEach((a) => {
      map[a.category] += 1;
    });
    return map;
  }, []);

  const relatedForModal = useMemo(() => {
    if (!selectedArticle) return [];
    return NEWS_ARTICLES.filter(
      (a) => a.id !== selectedArticle.id && a.category === selectedArticle.category
    ).sort((a, b) => b.views - a.views);
  }, [selectedArticle]);

  const showHero =
    activeCategory === 'Semua' && searchQuery.trim() === '' && !selectedAuthor;
  const leadStory = featuredArticles[0];
  const secondaryStory = featuredArticles[1];
  const sideStories = featuredArticles.slice(2, 4);

  return (
    <div className="portal-shell min-h-screen bg-[#FAF9F6] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors duration-200">
      {/* 1. Sticky Top Breaking News Running Text Bar */}
      <BreakingNewsBar
        config={tickerConfig}
        items={breakingItems}
        unreadIds={unreadBreakingIds}
        onTogglePause={() => updateTickerConfig({ isPaused: !tickerConfig.isPaused })}
        onOpenCustomizer={() => openCustomizer('settings')}
        onSelectArticle={handleOpenBreakingArticle}
        onMarkItemRead={handleMarkBreakingItemRead}
        onMarkAllRead={handleMarkAllBreakingRead}
      />

      {/* 2. Clean 3-Zone Editorial Header */}
      <header className="sticky top-9 sm:top-10 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-6 sm:gap-8">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => {
              setActiveCategory('Semua');
              setSelectedAuthor(null);
              setSearchQuery('');
              smoothScrollToTop();
            }}
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer group"
          >
            <span className="w-7 h-7 rounded-sm bg-[#0F2A44] text-white flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4 text-[#C9A227]" />
            </span>
            <span className="font-editorial font-bold text-lg sm:text-xl tracking-tight text-zinc-900 dark:text-zinc-50 group-hover:text-[#16A085] transition-colors">
              KEADILAN<span className="text-[#16A085]">.CO.ID</span>
            </span>
          </button>

          {/* Zone 2: Primary Navigation */}
          <nav
            aria-label="Navigasi Utama"
            className="hidden md:flex items-center gap-4 lg:gap-6 overflow-x-auto"
          >
            {HEADER_NAV_ITEMS.map((nav) => {
              const active = activeCategory === nav.category;
              return (
                <button
                  key={nav.label}
                  type="button"
                  onClick={() => {
                    setActiveCategory(nav.category);
                    setSelectedAuthor(null);
                    smoothScrollToTop();
                  }}
                  className={`text-sm font-medium whitespace-nowrap transition-colors py-1 border-b-2 cursor-pointer ${
                    active
                      ? 'border-[#16A085] text-[#16A085] font-semibold'
                      : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100'
                  }`}
                >
                  {nav.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary CTA */}
          <div className="shrink-0 flex items-center">
            <button
              type="button"
              onClick={() => openCustomizer('settings')}
              className="h-9 px-3.5 rounded-md bg-[#16A085] hover:bg-[#138D75] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Atur Ticker</span>
            </button>
          </div>
        </div>

        {/* Hairline Reading Scroll Progress Indicator */}
        <div
          role="progressbar"
          aria-label="Progres baca halaman"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(scrollProgress)}
          className="h-[3px] w-full bg-zinc-100 dark:bg-zinc-900 relative"
        >
          <div
            className={`h-full w-full origin-left will-change-transform transition-[transform,box-shadow] ease-out ${
              scrollProgress >= 85 ? 'reading-progress-glow' : 'bg-[#16A085]'
            }`}
            style={{
              transform: `scaleX(${scrollProgress / 100})`,
              transitionDuration: `${progressTransitionMs}ms, 300ms`,
            }}
          />
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* 3. Editorial Sorot 3-Tier Hero Showcase */}
        {showHero && leadStory && secondaryStory && (
          <section aria-label="Sorotan Utama" className="space-y-4">
            <div className="flex items-baseline justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <h1 className="font-editorial text-xl sm:text-2xl font-bold tracking-tight">
                Sorotan Redaksi
              </h1>
              <span className="font-mono-tabular text-xs text-zinc-500 dark:text-zinc-400">
                Edisi Selasa, 24 Nov 2026
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Lead Hero Story (6 cols) */}
              <button
                type="button"
                onClick={() => handleOpenArticle(leadStory)}
                className="lg:col-span-6 group relative aspect-[16/11] lg:aspect-auto lg:min-h-[380px] rounded-md overflow-hidden text-left cursor-pointer border border-zinc-200 dark:border-zinc-800"
              >
                <EditorialArtwork
                  variant={leadStory.artworkVariant}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-[#5EEAD4]">
                    {leadStory.category} · Utama
                  </div>
                  <h2 className="font-editorial text-xl sm:text-2xl font-bold leading-snug group-hover:underline underline-offset-4">
                    {leadStory.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-200 line-clamp-2">
                    {leadStory.excerpt}
                  </p>
                  <div className="text-[11px] text-zinc-300 font-mono-tabular pt-1">
                    {leadStory.author} · {leadStory.date} · {calculateReadingTime(leadStory)}
                  </div>
                </div>
              </button>

              {/* Secondary Hero Story (3 cols) */}
              <button
                type="button"
                onClick={() => handleOpenArticle(secondaryStory)}
                className="lg:col-span-3 group relative aspect-[16/10] lg:aspect-auto lg:min-h-[380px] rounded-md overflow-hidden text-left cursor-pointer border border-zinc-200 dark:border-zinc-800"
              >
                <EditorialArtwork
                  variant={secondaryStory.artworkVariant}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#5EEAD4]">
                    {secondaryStory.category}
                  </div>
                  <h2 className="font-editorial text-lg font-bold leading-snug group-hover:underline underline-offset-4">
                    {secondaryStory.title}
                  </h2>
                  <div className="text-[11px] text-zinc-300 font-mono-tabular">
                    {secondaryStory.author} · {secondaryStory.date} · {calculateReadingTime(secondaryStory)}
                  </div>
                </div>
              </button>

              {/* Two Stacked Stories (3 cols) */}
              <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {sideStories.map((story) => (
                  <button
                    key={story.id}
                    type="button"
                    onClick={() => handleOpenArticle(story)}
                    className="group relative min-h-[182px] rounded-md overflow-hidden text-left cursor-pointer border border-zinc-200 dark:border-zinc-800"
                  >
                    <EditorialArtwork
                      variant={story.artworkVariant}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[#5EEAD4]">
                        {story.category}
                      </div>
                      <h3 className="font-editorial text-base font-bold leading-snug line-clamp-2 group-hover:underline underline-offset-4">
                        {story.title}
                      </h3>
                      <div className="text-[11px] text-zinc-300 font-mono-tabular">
                        {story.date} · {calculateReadingTime(story)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 4. Editorial Sub-Toolbar (Rubrik Tabs, Search, Layout & Theme Controls) */}
        <section
          aria-label="Filter dan Pencarian Berita"
          className="py-3 border-y border-zinc-200 dark:border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
        >
          {/* Interactive Category Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {ALL_CATEGORIES.map((category) => {
              const selected = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setActiveCategory(category);
                    setSelectedAuthor(null);
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selected
                      ? 'bg-[#0F2A44] text-white dark:bg-[#16A085]'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-900'
                  }`}
                >
                  {category}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                setActiveCategory('Baca Nanti');
                setSelectedAuthor(null);
              }}
              className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeCategory === 'Baca Nanti'
                  ? 'bg-[#0F2A44] text-white dark:bg-[#16A085]'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-900'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${activeCategory === 'Baca Nanti' ? 'fill-current' : ''}`} />
              <span>Baca Nanti</span>
              <span className="font-mono-tabular text-[11px] opacity-80">
                ({savedArticles.length})
              </span>
            </button>
          </div>

          {/* Search + Layout + Font Size + Theme Controls */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <SearchWithRecentDropdown
              value={searchQuery}
              onChange={setSearchQuery}
              recentSearches={recentSearches}
              knownAuthors={knownAuthors}
              onCommitSearch={recordRecentSearch}
              onSelectRecentSearch={handleSelectRecentSearch}
              onRemoveRecentSearch={handleRemoveRecentSearch}
              onClearRecentSearches={handleClearRecentSearches}
            />

            <div className="flex items-center rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-label="Tampilan daftar"
                title="Tampilan daftar"
                className={`w-8 h-7 rounded flex items-center justify-center cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-[#16A085]'
                    : 'text-zinc-500'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Tampilan kisi"
                title="Tampilan kisi"
                className={`w-8 h-7 rounded flex items-center justify-center cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-[#16A085]'
                    : 'text-zinc-500'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <div className="relative shrink-0">
              <ALargeSmall
                className="w-4 h-4 text-zinc-500 dark:text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value as PortalFontSize)}
                aria-label="Ukuran Teks (Font Size)"
                title="Ukuran Teks (Font Size)"
                className="appearance-none h-9 pl-8 pr-7 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:border-[#16A085] focus:outline-none focus:border-[#16A085] cursor-pointer transition-colors"
              >
                <option value="small">Kecil</option>
                <option value="medium">Sedang</option>
                <option value="large">Besar</option>
              </select>
              <ChevronDown
                className="w-3.5 h-3.5 text-zinc-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
            </div>

            <button
              type="button"
              onClick={handleCycleTheme}
              aria-label={
                themePreference === 'system'
                  ? `Tema otomatis mengikuti sistem (${systemPrefersDark ? 'gelap' : 'terang'}). Klik untuk beralih`
                  : themePreference === 'dark'
                    ? 'Mode gelap aktif. Klik untuk beralih'
                    : 'Mode terang aktif. Klik untuk beralih'
              }
              title={
                themePreference === 'system'
                  ? `Otomatis · Sistem (${systemPrefersDark ? 'Gelap' : 'Terang'})`
                  : themePreference === 'dark'
                    ? 'Mode Gelap (Manual)'
                    : 'Mode Terang (Manual)'
              }
              className="w-9 h-9 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:border-[#16A085] cursor-pointer shrink-0"
            >
              {themePreference === 'system' ? (
                <Monitor className="w-4 h-4 text-[#16A085]" aria-hidden="true" />
              ) : themePreference === 'dark' ? (
                <Moon className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Sun className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </section>

        {/* 5. Asymmetric 8 + 4 Editorial Feed & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main News Feed (8 columns) */}
          <section className="lg:col-span-8 space-y-5" aria-label="Daftar Berita Terbaru">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
              <h2 className="font-editorial text-xl font-bold">
                {selectedAuthor
                  ? `Tulisan oleh ${selectedAuthor}`
                  : activeCategory === 'Semua'
                    ? 'Kabar Terbaru'
                    : activeCategory === 'Baca Nanti'
                      ? 'Baca Nanti — Artikel Tersimpan'
                      : `Rubrik ${activeCategory}`}
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                {selectedAuthor && (
                  <button
                    type="button"
                    onClick={() => setSelectedAuthor(null)}
                    className="text-xs font-semibold text-[#16A085] hover:underline cursor-pointer"
                  >
                    Tampilkan Semua
                  </button>
                )}
                {activeCategory === 'Baca Nanti' && savedArticles.length > 0 && (
                  <button
                    type="button"
                    onClick={clearSavedArticles}
                    className="text-xs font-semibold text-zinc-500 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                  >
                    Hapus Semua
                  </button>
                )}
                <span
                  className="font-mono-tabular text-xs text-zinc-500 dark:text-zinc-400 inline-flex items-center gap-1.5 whitespace-nowrap"
                  title={
                    feedReadingSummary.articleCount > 0
                      ? `Estimasi total waktu baca untuk ${feedReadingSummary.articleCount} artikel (${feedReadingSummary.totalWords.toLocaleString('id-ID')} kata)`
                      : 'Tidak ada artikel ditampilkan'
                  }
                >
                  <Clock className="w-3.5 h-3.5 text-[#16A085] shrink-0" aria-hidden="true" />
                  <span>{feedReadingSummary.articleCount} artikel</span>
                  {feedReadingSummary.articleCount > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Waktu baca semua: {feedReadingSummary.formattedTime}</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            <div
              key={`${activeCategory}-${selectedAuthor ?? 'all'}-${viewMode}`}
              className="animate-feed-fade-in"
            >
            {filteredArticles.length === 0 ? (
              <div className="py-14 px-6 text-center rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 space-y-3">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {activeCategory === 'Baca Nanti' && searchQuery.trim() === ''
                    ? 'Belum ada artikel yang disimpan ke daftar Baca Nanti.'
                    : searchQuery.trim() !== ''
                      ? `Tidak ditemukan berita untuk pencarian “${searchQuery}”.`
                      : 'Belum ada berita tersedia untuk filter yang dipilih.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory('Semua');
                    setSelectedAuthor(null);
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-md bg-[#16A085] text-white text-xs font-semibold cursor-pointer"
                >
                  Jelajahi Berita Terbaru
                </button>
              </div>
            ) : viewMode === 'list' ? (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border-t border-zinc-200 dark:border-zinc-800">
                {filteredArticles.map((article) => {
                  const isSaved = savedArticleIds.includes(article.id);
                  const isRead = readArticleIds.includes(article.id);
                  return (
                    <article key={article.id} className="py-5 first:pt-4">
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                        <button
                          type="button"
                          onClick={() => handleOpenArticle(article)}
                          className="sm:w-52 aspect-[16/10] rounded overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800 group cursor-pointer"
                          aria-label={`Baca ${article.title}`}
                        >
                          <EditorialArtwork
                            variant={article.artworkVariant}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </button>
                        <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-[#16A085]">
                                {article.category}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleSaveArticle(article.id)}
                                aria-pressed={isSaved}
                                aria-label={
                                  isSaved
                                    ? `Hapus ${article.title} dari Baca Nanti`
                                    : `Simpan ${article.title} ke Baca Nanti`
                                }
                                title={isSaved ? 'Tersimpan di Baca Nanti' : 'Simpan untuk dibaca nanti'}
                                className={`h-7 px-2 rounded border text-[11px] font-semibold inline-flex items-center gap-1 whitespace-nowrap transition-colors cursor-pointer ${
                                  isSaved
                                    ? 'bg-[#16A085] border-[#16A085] text-white'
                                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-[#16A085] hover:text-[#16A085]'
                                }`}
                              >
                                <Bookmark className={`w-3 h-3 ${isSaved ? 'fill-current' : ''}`} />
                                <span>{isSaved ? 'Tersimpan' : 'Simpan'}</span>
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenArticle(article)}
                              className="text-left group block w-full cursor-pointer"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <h3
                                  className={`font-editorial text-lg sm:text-xl font-bold leading-snug group-hover:text-[#16A085] transition-colors ${
                                    isRead
                                      ? 'text-zinc-600 dark:text-zinc-400'
                                      : 'text-zinc-900 dark:text-zinc-50'
                                  }`}
                                >
                                  {article.title}
                                </h3>
                                <span
                                  className={`shrink-0 pt-1 inline-flex items-center gap-1 text-[11px] font-medium whitespace-nowrap ${
                                    isRead
                                      ? 'text-zinc-400 dark:text-zinc-500'
                                      : 'text-[#16A085]'
                                  }`}
                                >
                                  {isRead && <Check className="w-3 h-3" aria-hidden="true" />}
                                  <span>{isRead ? 'Dibaca' : 'Belum dibaca'}</span>
                                </span>
                              </div>
                            </button>
                            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                              {article.excerpt}
                            </p>
                          </div>
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono-tabular pt-1">
                            {article.author} · {article.date} · {calculateReadingTime(article)}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filteredArticles.map((article) => {
                  const isSaved = savedArticleIds.includes(article.id);
                  const isRead = readArticleIds.includes(article.id);
                  return (
                    <article
                      key={article.id}
                      className="rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col"
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenArticle(article)}
                        className="w-full aspect-[16/10] overflow-hidden border-b border-zinc-200 dark:border-zinc-800 group cursor-pointer"
                        aria-label={`Baca ${article.title}`}
                      >
                        <EditorialArtwork
                          variant={article.artworkVariant}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </button>
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#16A085]">
                              {article.category}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleSaveArticle(article.id)}
                              aria-pressed={isSaved}
                              aria-label={
                                isSaved
                                  ? `Hapus ${article.title} dari Baca Nanti`
                                  : `Simpan ${article.title} ke Baca Nanti`
                              }
                              title={isSaved ? 'Tersimpan di Baca Nanti' : 'Simpan untuk dibaca nanti'}
                              className={`h-7 px-2 rounded border text-[11px] font-semibold inline-flex items-center gap-1 whitespace-nowrap transition-colors cursor-pointer ${
                                isSaved
                                  ? 'bg-[#16A085] border-[#16A085] text-white'
                                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-[#16A085] hover:text-[#16A085]'
                              }`}
                            >
                              <Bookmark className={`w-3 h-3 ${isSaved ? 'fill-current' : ''}`} />
                              <span>{isSaved ? 'Tersimpan' : 'Simpan'}</span>
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenArticle(article)}
                            className="text-left group block w-full cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h3
                                className={`font-editorial text-base sm:text-lg font-bold leading-snug group-hover:text-[#16A085] transition-colors ${
                                  isRead
                                    ? 'text-zinc-600 dark:text-zinc-400'
                                    : 'text-zinc-900 dark:text-zinc-50'
                                }`}
                              >
                                {article.title}
                              </h3>
                              <span
                                className={`shrink-0 pt-1 inline-flex items-center gap-1 text-[11px] font-medium whitespace-nowrap ${
                                  isRead
                                    ? 'text-zinc-400 dark:text-zinc-500'
                                    : 'text-[#16A085]'
                                }`}
                              >
                                {isRead && <Check className="w-3 h-3" aria-hidden="true" />}
                                <span>{isRead ? 'Dibaca' : 'Belum dibaca'}</span>
                              </span>
                            </div>
                          </button>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                            {article.excerpt}
                          </p>
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono-tabular">
                          {article.author} · {article.date} · {calculateReadingTime(article)}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
            </div>
          </section>

          {/* Editorial Sidebar (4 columns) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Cirebon Local Weather Widget */}
            <CirebonWeatherWidget />

            {/* Berita Populer (Numbered 01-05) */}
            <section className="p-5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
                <h2 className="font-editorial text-lg font-bold">Berita Populer</h2>
                <ArrowUpRight className="w-4 h-4 text-[#16A085]" />
              </div>

              <ol className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {popularArticles.map((art, idx) => (
                  <li key={art.id} className="py-3 first:pt-1 last:pb-0">
                    <button
                      type="button"
                      onClick={() => handleOpenArticle(art)}
                      className="w-full text-left group flex items-start gap-3.5 cursor-pointer"
                    >
                      <span className="font-mono-tabular text-xl font-bold text-zinc-300 dark:text-zinc-700 group-hover:text-[#16A085] leading-none pt-0.5">
                        0{idx + 1}
                      </span>
                      <div className="space-y-1 min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#16A085]">
                          {art.category}
                        </div>
                        <h3 className="font-editorial text-sm font-bold leading-snug text-zinc-900 dark:text-zinc-100 group-hover:text-[#16A085] line-clamp-2">
                          {art.title}
                        </h3>
                        <div className="font-mono-tabular text-[11px] text-zinc-500 dark:text-zinc-400">
                          {art.views.toLocaleString('id-ID')} dibaca · {art.date}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ol>
            </section>

            {/* Read Later Section (Saved Articles) */}
            <ReadLaterSection
              savedArticles={savedArticles}
              onSelectArticle={handleOpenArticle}
              onRemoveArticle={removeSavedArticle}
              onClearAll={clearSavedArticles}
              onViewAllInFeed={() => {
                setActiveCategory('Baca Nanti');
                setSelectedAuthor(null);
                smoothScrollToTop();
              }}
            />

            {/* Reading History Section */}
            <ReadingHistorySection
              historyArticles={historyArticles}
              onSelectArticle={handleOpenArticle}
              onRemoveArticle={removeHistoryArticle}
              onClearHistory={clearReadingHistory}
            />

            {/* Daily Briefing Newsletter Signup */}
            <NewsletterSignup />

            {/* Follow Us Social Links */}
            <FollowUsSection />

            {/* Trending Topics Cloud */}
            <TrendingTopicsCloud
              articles={NEWS_ARTICLES}
              activeCategory={activeCategory}
              searchQuery={searchQuery}
              onSelectCategory={(cat) => {
                setActiveCategory(cat);
                setSelectedAuthor(null);
                setSearchQuery('');
                smoothScrollToTop();
              }}
              onSelectKeyword={(keyword) => {
                setActiveCategory('Semua');
                setSelectedAuthor(null);
                setSearchQuery(keyword);
                recordRecentSearch(keyword);
                smoothScrollToTop();
              }}
              onResetFilter={() => {
                setActiveCategory('Semua');
                setSelectedAuthor(null);
                setSearchQuery('');
                smoothScrollToTop();
              }}
            />

            {/* Direktori Rubrik */}
            <section className="p-5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <h2 className="font-editorial text-lg font-bold border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
                Direktori Rubrik
              </h2>
              <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {(Object.keys(categoryCounts) as NewsCategory[]).map((cat) => (
                  <li key={cat}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat);
                        setSelectedAuthor(null);
                        smoothScrollToTop();
                      }}
                      className="w-full py-2.5 flex items-center justify-between text-sm hover:text-[#16A085] transition-colors cursor-pointer"
                    >
                      <span className={activeCategory === cat ? 'font-bold text-[#16A085]' : 'font-medium'}>
                        {cat}
                      </span>
                      <span className="font-mono-tabular text-xs text-zinc-500 dark:text-zinc-400">
                        {categoryCounts[cat]}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {/* Quick Customizer Prompt */}
            <section className="p-5 rounded-md bg-[#0F2A44] text-white space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">
                Kontrol Tampilan Redaksi
              </div>
              <h2 className="font-editorial text-lg font-bold leading-snug">
                Sesuaikan Durasi &amp; Warna Teks Berjalan
              </h2>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Ubah kecepatan gulir (<span className="font-mono-tabular">{tickerConfig.duration}s</span>),
                warna latar (<span className="font-mono-tabular">{tickerConfig.backgroundColor}</span>),
                atau ekspor 4 file utama tema (CSS, JS, HTML &amp; XML) untuk Desainer Tema dan Tata Letak Blogger.
              </p>
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadBloggerThemeXml}
                  className="w-full h-9 rounded bg-[#16A085] hover:bg-[#138D75] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh Tema Blogspot (.xml)
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => openCustomizer('settings')}
                    className="h-8 rounded border border-white/20 hover:bg-white/10 text-white text-[11px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    Atur Ticker
                  </button>
                  <button
                    type="button"
                    onClick={() => openCustomizer('xml')}
                    className="h-8 rounded border border-white/20 hover:bg-white/10 text-white text-[11px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Code2 className="w-3 h-3" />
                    Ekspor 4 File
                  </button>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>

      {/* 6. Institutional Navy Footer (KEADILAN.CO.ID DNA) */}
      <footer className="bg-[#0F2A44] text-zinc-200 border-t-2 border-[#C9A227] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-sm bg-white/10 flex items-center justify-center">
                <Scale className="w-4 h-4 text-[#C9A227]" />
              </span>
              <span className="font-editorial font-bold text-xl text-white">
                KEADILAN<span className="text-[#19B496]">.CO.ID</span>
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed max-w-md">
              Media Daring — Sobat Keadilan. Diterbitkan oleh PT Wahana Sahabat Kreatif untuk
              menyajikan berita hukum, kebijakan publik, ekonomi daerah, serta kabar terverifikasi
              dari Cirebon dan Jawa Barat.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
              <button
                type="button"
                onClick={() => openCustomizer('xml')}
                className="h-8 px-3 rounded bg-[#16A085] hover:bg-[#138D75] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor 4 File Tema</span>
              </button>
              <a
                href="/blogger-theme/keadilan-theme.css"
                download="keadilan-theme.css"
                className="text-xs text-zinc-300 hover:text-white underline underline-offset-4"
              >
                .css
              </a>
              <a
                href="/blogger-theme/keadilan-theme.js"
                download="keadilan-theme.js"
                className="text-xs text-zinc-300 hover:text-white underline underline-offset-4"
              >
                .js
              </a>
              <a
                href="/blogger-theme/keadilan-theme-structure.html"
                download="keadilan-theme-structure.html"
                className="text-xs text-zinc-300 hover:text-white underline underline-offset-4"
              >
                .html
              </a>
              <a
                href="/blogger-theme/keadilan-co-id-blogspot-theme.xml"
                download="keadilan-co-id-blogspot-theme.xml"
                className="text-xs text-zinc-300 hover:text-white underline underline-offset-4"
              >
                .xml
              </a>
            </div>
          </div>

          <div className="md:col-span-4 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#C9A227]">
              Alamat Redaksi
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Jl. Raya Plumbon – Cirebon, Kabupaten Cirebon, Jawa Barat
              <br />
              Surel: redaksi@keadilan.co.id
            </p>
            <SendFeedback onOpenChange={setIsFeedbackOpen} />
          </div>

          <div className="md:col-span-3 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#C9A227]">
              Rubrikasi
            </h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-zinc-300">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat);
                    setSelectedAuthor(null);
                    smoothScrollToTop();
                  }}
                  className="hover:text-white underline-offset-4 hover:underline cursor-pointer"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-400">
            <span>© 2026 KEADILAN.CO.ID — PT Wahana Sahabat Kreatif.</span>
            <span>Menjunjung Kode Etik Jurnalistik &amp; Pedoman Pemberitaan Media Siber.</span>
          </div>
        </div>
      </footer>

      {/* Floating Back to Top Button */}
      <button
        type="button"
        onClick={smoothScrollToTop}
        aria-label="Kembali ke atas halaman"
        title="Kembali ke Atas"
        aria-hidden={!showBackToTop}
        tabIndex={showBackToTop ? 0 : -1}
        className={`print-hidden fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 h-10 px-3.5 rounded-md bg-[#0F2A44] hover:bg-[#16A085] dark:bg-[#16A085] dark:hover:bg-[#138D75] text-white text-xs font-semibold shadow-lg border border-white/15 inline-flex items-center gap-2 transition-all duration-200 cursor-pointer ${
          showBackToTop
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <ArrowUp className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>Kembali ke Atas</span>
      </button>

      {/* Live Breaking News Toast Notification */}
      <NewsToastStack
        articles={NEWS_ARTICLES}
        readArticleIds={readArticleIds}
        isPaused={Boolean(selectedArticle) || isCustomizerOpen || isFeedbackOpen}
        hasBackToTop={showBackToTop}
        onOpenArticle={handleOpenArticle}
      />

      {/* Subtle Recently Read Revisit Reminder Toast */}
      <RecentlyReadToast
        toast={recentlyReadToast}
        onDismiss={dismissRecentlyReadToast}
      />

      {/* Slide-over Customizer Drawer */}
      <TickerCustomizerDrawer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        config={tickerConfig}
        onUpdateConfig={updateTickerConfig}
        items={breakingItems}
        onAddItem={handleAddBreakingItem}
        onToggleItem={handleToggleBreakingItem}
        onEditItem={handleEditBreakingItem}
        onDeleteItem={handleDeleteBreakingItem}
        onResetDefaults={handleResetDefaults}
        initialTab={customizerTab}
      />

      {/* Article Reader Modal */}
      <ArticleModal
        article={selectedArticle}
        relatedArticles={relatedForModal}
        isSaved={selectedArticle ? savedArticleIds.includes(selectedArticle.id) : false}
        onToggleSave={toggleSaveArticle}
        onViewAuthorArticles={handleViewAuthorArticles}
        onClose={() => setSelectedArticle(null)}
        onSelectArticle={handleOpenArticle}
      />
    </div>
  );
}
