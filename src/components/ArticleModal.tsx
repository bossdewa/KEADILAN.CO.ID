import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Bookmark,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  FileText,
  Highlighter,
  Printer,
  Share2,
  StickyNote,
  X,
} from 'lucide-react';
import { AUTHOR_PROFILES, NEWS_ARTICLES, NewsArticle } from '../data/newsData';
import { EditorialArtwork } from './EditorialArtwork';
import { ArticleAiSummary } from './ArticleAiSummary';
import { ArticleAudioPlayer } from './ArticleAudioPlayer';
import { ArticleCommentsSection } from './ArticleCommentsSection';
import {
  ArticleAnnotation,
  ArticleNotesPanel,
  HIGHLIGHT_COLOR_STYLES,
  HighlightColor,
} from './ArticleNotesPanel';
import { calculateReadingTime } from '../utils/readingTime';

const NOTES_STORAGE_KEY = 'keadilan_article_notes';

function loadStoredAnnotations(): ArticleAnnotation[] {
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is ArticleAnnotation =>
          Boolean(item) &&
          typeof item.id === 'string' &&
          typeof item.articleId === 'string' &&
          typeof item.paragraphIndex === 'number' &&
          typeof item.startOffset === 'number' &&
          typeof item.endOffset === 'number' &&
          typeof item.quote === 'string'
      );
    }
  } catch {
    // Ignore storage error
  }
  return [];
}

function findParagraphElement(node: Node | null): HTMLElement | null {
  let current: Node | null = node;
  while (current) {
    if (
      current instanceof HTMLElement &&
      current.hasAttribute('data-paragraph-index')
    ) {
      return current;
    }
    current = current.parentNode;
  }
  return null;
}

interface PendingTextSelection {
  paragraphIndex: number;
  startOffset: number;
  endOffset: number;
  quote: string;
  top: number;
  left: number;
}

interface ArticleModalProps {
  article: NewsArticle | null;
  relatedArticles: NewsArticle[];
  isSaved: boolean;
  onToggleSave: (articleId: string) => void;
  onViewAuthorArticles: (authorName: string) => void;
  onClose: () => void;
  onSelectArticle: (article: NewsArticle) => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  relatedArticles,
  isSaved,
  onToggleSave,
  onViewAuthorArticles,
  onClose,
  onSelectArticle,
}) => {
  const [copied, setCopied] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'article' | 'notes'>('article');
  const [allAnnotations, setAllAnnotations] = useState<ArticleAnnotation[]>(() =>
    loadStoredAnnotations()
  );
  const [pendingSelection, setPendingSelection] =
    useState<PendingTextSelection | null>(null);
  const [pendingNote, setPendingNote] = useState('');
  const [pendingColor, setPendingColor] = useState<HighlightColor>('amber');
  const [flashedParagraphIndex, setFlashedParagraphIndex] = useState<number | null>(
    null
  );
  const [activeSpeechParagraph, setActiveSpeechParagraph] = useState<number | null>(
    null
  );
  const [modalScrollProgress, setModalScrollProgress] = useState(0);
  const [modalProgressTransitionMs, setModalProgressTransitionMs] = useState(60);
  const modalCardRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const articleContentRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const selectionPopoverRef = useRef<HTMLDivElement>(null);
  const modalRafRef = useRef<number | null>(null);
  const copiedTimeoutRef = useRef<number | null>(null);
  const modalLastScrollRef = useRef({ top: 0, time: 0 });

  const computeArticleProgress = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const now = performance.now();
    const scrollTop = el.scrollTop;
    const dt = Math.max(8, now - modalLastScrollRef.current.time);
    const velocity = Math.abs(scrollTop - modalLastScrollRef.current.top) / dt;
    modalLastScrollRef.current = { top: scrollTop, time: now };

    const adaptiveDuration = Math.max(0, Math.round(85 - Math.min(velocity, 2.4) * 35));
    setModalProgressTransitionMs(adaptiveDuration);

    const contentEl = articleContentRef.current;
    if (contentEl) {
      const containerRect = el.getBoundingClientRect();
      const contentRect = contentEl.getBoundingClientRect();
      const remaining = contentRect.bottom - containerRect.bottom;
      const totalArticleScroll = remaining + scrollTop;

      if (totalArticleScroll <= 0) {
        setModalScrollProgress(100);
        return;
      }

      const pct = Math.min(100, Math.max(0, (scrollTop / totalArticleScroll) * 100));
      setModalScrollProgress(pct);
      return;
    }

    const scrollable = el.scrollHeight - el.clientHeight;
    if (scrollable <= 0) {
      setModalScrollProgress(100);
      return;
    }
    setModalScrollProgress(Math.min(100, Math.max(0, (scrollTop / scrollable) * 100)));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(allAnnotations));
    } catch {
      // Ignore storage error
    }
  }, [allAnnotations]);

  useEffect(() => {
    setCopied(false);
    setIsShareMenuOpen(false);
    setActiveTab('article');
    setPendingSelection(null);
    setPendingNote('');
    setFlashedParagraphIndex(null);
    setActiveSpeechParagraph(null);
    setModalScrollProgress(0);
    modalLastScrollRef.current = { top: 0, time: performance.now() };
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'auto',
      });
    }
    const rafId = window.requestAnimationFrame(() => {
      computeArticleProgress();
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [article?.id, computeArticleProgress]);

  useEffect(() => {
    if (!article || activeTab !== 'article') return;
    const containerEl = scrollContainerRef.current;
    const contentEl = articleContentRef.current;
    if (!containerEl || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      computeArticleProgress();
    });
    observer.observe(containerEl);
    if (contentEl) {
      observer.observe(contentEl);
    }
    return () => observer.disconnect();
  }, [article, activeTab, computeArticleProgress]);

  useEffect(() => {
    return () => {
      if (modalRafRef.current !== null) {
        window.cancelAnimationFrame(modalRafRef.current);
      }
      if (copiedTimeoutRef.current !== null) {
        window.clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  const handleModalScroll = () => {
    if (pendingSelection) {
      setPendingSelection(null);
    }
    if (modalRafRef.current !== null) return;
    modalRafRef.current = window.requestAnimationFrame(() => {
      modalRafRef.current = null;
      computeArticleProgress();
    });
  };

  useEffect(() => {
    if (!article) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (pendingSelection) {
          setPendingSelection(null);
          return;
        }
        if (isShareMenuOpen) {
          setIsShareMenuOpen(false);
          return;
        }
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [article, isShareMenuOpen, pendingSelection, onClose]);

  useEffect(() => {
    if (!isShareMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setIsShareMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isShareMenuOpen]);

  useEffect(() => {
    if (!pendingSelection) return;
    const handleMouseDownOutside = (e: MouseEvent) => {
      if (
        selectionPopoverRef.current &&
        !selectionPopoverRef.current.contains(e.target as Node)
      ) {
        setPendingSelection(null);
      }
    };
    document.addEventListener('mousedown', handleMouseDownOutside);
    return () => document.removeEventListener('mousedown', handleMouseDownOutside);
  }, [pendingSelection]);

  const articleAnnotations = useMemo(() => {
    if (!article) return [];
    return allAnnotations
      .filter((item) => item.articleId === article.id)
      .sort((a, b) =>
        a.paragraphIndex !== b.paragraphIndex
          ? a.paragraphIndex - b.paragraphIndex
          : a.startOffset - b.startOffset
      );
  }, [allAnnotations, article]);

  if (!article) return null;

  const authorProfile = AUTHOR_PROFILES[article.author] ?? {
    name: article.author,
    role: article.authorRole,
    initials: article.author
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    accentColor: '#0F2A44',
    bio: 'Jurnalis dan kontributor editorial KEADILAN.CO.ID untuk peliputan berita terverifikasi.',
  };

  const authorArticleCount = NEWS_ARTICLES.filter(
    (item) => item.author === article.author
  ).length;

  const shareUrl = (() => {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('article', article.id);
    return url.toString();
  })();

  const shareSummary = `${article.title} — KEADILAN.CO.ID`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `${shareSummary}\n${shareUrl}`
  )}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(
    shareUrl
  )}&text=${encodeURIComponent(shareSummary)}`;
  const xShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    shareUrl
  )}&text=${encodeURIComponent(shareSummary)}`;
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareUrl
  )}&quote=${encodeURIComponent(shareSummary)}`;

  const markCopied = () => {
    if (copiedTimeoutRef.current !== null) {
      window.clearTimeout(copiedTimeoutRef.current);
    }
    setCopied(true);
    copiedTimeoutRef.current = window.setTimeout(() => {
      setCopied(false);
      copiedTimeoutRef.current = null;
    }, 2400);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      markCopied();
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        markCopied();
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const handlePrint = () => {
    setIsShareMenuOpen(false);
    setPendingSelection(null);

    if (activeTab !== 'article') {
      setActiveTab('article');
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          window.print();
        });
      });
      return;
    }

    window.requestAnimationFrame(() => {
      window.print();
    });
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    const startParagraph = findParagraphElement(range.startContainer);
    const endParagraph = findParagraphElement(range.endContainer);

    if (!startParagraph || !endParagraph || startParagraph !== endParagraph) {
      return;
    }

    const indexAttr = startParagraph.getAttribute('data-paragraph-index');
    const paragraphIndex = indexAttr !== null ? Number(indexAttr) : -1;
    const fullParagraphText = article.content[paragraphIndex];
    if (paragraphIndex < 0 || typeof fullParagraphText !== 'string') {
      return;
    }

    const preStart = document.createRange();
    preStart.selectNodeContents(startParagraph);
    preStart.setEnd(range.startContainer, range.startOffset);
    const rawStart = preStart.toString().length;

    const preEnd = document.createRange();
    preEnd.selectNodeContents(startParagraph);
    preEnd.setEnd(range.endContainer, range.endOffset);
    const rawEnd = preEnd.toString().length;

    let startOffset = Math.max(0, Math.min(rawStart, rawEnd));
    let endOffset = Math.min(fullParagraphText.length, Math.max(rawStart, rawEnd));

    while (
      startOffset < endOffset &&
      /\s/.test(fullParagraphText.charAt(startOffset))
    ) {
      startOffset += 1;
    }
    while (
      endOffset > startOffset &&
      /\s/.test(fullParagraphText.charAt(endOffset - 1))
    ) {
      endOffset -= 1;
    }

    const quote = fullParagraphText.slice(startOffset, endOffset);
    if (quote.length < 2) {
      return;
    }

    const cardRect = modalCardRef.current?.getBoundingClientRect();
    const selRect = range.getBoundingClientRect();
    if (!cardRect || (selRect.width === 0 && selRect.height === 0)) {
      return;
    }

    const popoverWidth = 288;
    const rawLeft = selRect.left - cardRect.left + selRect.width / 2 - popoverWidth / 2;
    const clampedLeft = Math.max(12, Math.min(cardRect.width - popoverWidth - 12, rawLeft));
    const preferTop = selRect.top - cardRect.top - 134;
    const clampedTop =
      preferTop > 88 ? preferTop : Math.min(cardRect.height - 150, selRect.bottom - cardRect.top + 8);

    setPendingNote('');
    setPendingSelection({
      paragraphIndex,
      startOffset,
      endOffset,
      quote,
      top: clampedTop,
      left: clampedLeft,
    });
  };

  const handleSaveAnnotation = (colorOverride?: HighlightColor) => {
    if (!pendingSelection) return;
    const chosenColor = colorOverride ?? pendingColor;
    const nowLabel = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newAnnotation: ArticleAnnotation = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      articleId: article.id,
      paragraphIndex: pendingSelection.paragraphIndex,
      startOffset: pendingSelection.startOffset,
      endOffset: pendingSelection.endOffset,
      quote: pendingSelection.quote,
      note: pendingNote.trim(),
      color: chosenColor,
      createdAt: `Hari ini, ${nowLabel}`,
    };

    setAllAnnotations((prev) => [newAnnotation, ...prev]);
    setPendingSelection(null);
    setPendingNote('');
    window.getSelection()?.removeAllRanges();
  };

  const handleUpdateAnnotationNote = (id: string, note: string) => {
    setAllAnnotations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, note } : item))
    );
  };

  const handleUpdateAnnotationColor = (id: string, color: HighlightColor) => {
    setAllAnnotations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, color } : item))
    );
  };

  const handleDeleteAnnotation = (id: string) => {
    setAllAnnotations((prev) => prev.filter((item) => item.id !== id));
  };

  const handleJumpToHighlight = (paragraphIndex: number) => {
    setActiveTab('article');
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const container = scrollContainerRef.current;
        const target = container?.querySelector<HTMLElement>(
          `[data-paragraph-index="${paragraphIndex}"]`
        );
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setFlashedParagraphIndex(paragraphIndex);
          window.setTimeout(() => {
            setFlashedParagraphIndex((curr) =>
              curr === paragraphIndex ? null : curr
            );
          }, 1600);
        }
      });
    });
  };

  const renderParagraphWithHighlights = (
    text: string,
    paragraphIndex: number
  ): React.ReactNode => {
    const marks = articleAnnotations
      .filter((a) => a.paragraphIndex === paragraphIndex)
      .sort((a, b) => a.startOffset - b.startOffset);

    if (marks.length === 0) return text;

    const nodes: React.ReactNode[] = [];
    let cursor = 0;

    marks.forEach((ann) => {
      const start = Math.max(cursor, Math.min(text.length, ann.startOffset));
      const end = Math.max(start, Math.min(text.length, ann.endOffset));

      if (start > cursor) {
        nodes.push(text.slice(cursor, start));
      }

      if (end > start) {
        const style = HIGHLIGHT_COLOR_STYLES[ann.color];
        nodes.push(
          <mark
            key={ann.id}
            onClick={(e) => {
              const sel = window.getSelection();
              if (sel && !sel.isCollapsed) return;
              e.stopPropagation();
              setActiveTab('notes');
            }}
            title={
              ann.note
                ? `Catatan: ${ann.note}`
                : 'Klik untuk membuka catatan sorotan'
            }
            className={style.markClass}
          >
            {text.slice(start, end)}
          </mark>
        );
        cursor = end;
      }
    });

    if (cursor < text.length) {
      nodes.push(text.slice(cursor));
    }

    return nodes;
  };

  return (
    <div
      className="print-modal-root fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={article.title}
    >
      <div
        className="print-hidden fixed inset-0 bg-zinc-950/65 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <article
        ref={modalCardRef}
        className="print-modal-article relative z-10 w-full max-w-3xl max-h-[90vh] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-lg shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden"
      >
        {/* Top-Edge Article Reading Progress Bar */}
        <div
          role="progressbar"
          aria-label="Progres baca artikel"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(modalScrollProgress)}
          className="print-hidden h-1 w-full bg-zinc-200/80 dark:bg-zinc-800 shrink-0 relative overflow-hidden"
        >
          <div
            className={`h-full w-full origin-left will-change-transform transition-[transform,box-shadow] ease-out ${
              modalScrollProgress >= 85 ? 'reading-progress-glow' : 'bg-[#16A085]'
            }`}
            style={{
              transform: `scaleX(${modalScrollProgress / 100})`,
              transitionDuration: `${modalProgressTransitionMs}ms, 300ms`,
            }}
          />
        </div>

        {/* Top Modal Header */}
        <div className="print-hidden px-5 sm:px-7 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-zinc-50/80 dark:bg-zinc-900/70">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 truncate"
          >
            <span>Beranda</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <span className="font-semibold text-[#16A085]">{article.category}</span>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate text-zinc-700 dark:text-zinc-300">{article.title}</span>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`hidden sm:inline-block font-mono-tabular text-[11px] font-semibold mr-1 transition-colors ${
                Math.round(modalScrollProgress) >= 100
                  ? 'text-[#16A085]'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
              title="Progres baca konten artikel"
            >
              {Math.round(modalScrollProgress)}%
            </span>
            {/* One-Click Permalink Copy + Share to Socials Menu */}
            <div ref={shareMenuRef} className="relative inline-flex items-center">
              <button
                type="button"
                onClick={handleCopyLink}
                aria-label="Bagikan dan salin tautan permanen artikel"
                title="Salin tautan permanen artikel ke papan klip"
                className={`h-8 px-2.5 rounded-l-md border text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                  copied
                    ? 'bg-[#16A085] border-[#16A085] text-white'
                    : 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:border-[#16A085]'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Tautan Tersalin</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline">Salin Tautan</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsShareMenuOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={isShareMenuOpen}
                aria-label="Bagikan ke media sosial"
                title="Bagikan ke WhatsApp, Twitter, dan Facebook"
                className={`h-8 px-2.5 rounded-r-md border border-l-0 text-xs font-semibold inline-flex items-center gap-1 whitespace-nowrap transition-colors cursor-pointer ${
                  isShareMenuOpen
                    ? 'bg-[#0F2A44] border-[#0F2A44] text-white dark:bg-[#16A085] dark:border-[#16A085]'
                    : 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:border-[#16A085] hover:text-[#16A085]'
                }`}
              >
                <span>Bagikan ke Medsos</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${
                    isShareMenuOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
              <span className="sr-only" aria-live="polite">
                {copied ? 'Tautan permanen artikel telah disalin ke papan klip.' : ''}
              </span>

              {isShareMenuOpen && (
                <div
                  role="menu"
                  aria-label="Pilihan bagikan ke media sosial"
                  className="absolute right-0 top-full mt-1.5 w-52 z-30 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl py-1.5 text-xs"
                >
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    Bagikan ke Media Sosial
                  </div>

                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    onClick={() => setIsShareMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-[#16A085] transition-colors"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 shrink-0 text-[#16A34A]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    <span className="font-medium">WhatsApp</span>
                  </a>

                  <a
                    href={telegramShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    onClick={() => setIsShareMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-[#16A085] transition-colors"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 shrink-0 text-[#0284C7]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                    <span className="font-medium">Telegram</span>
                  </a>

                  <a
                    href={xShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    onClick={() => setIsShareMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-[#16A085] transition-colors"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 shrink-0 text-zinc-900 dark:text-zinc-100"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span className="font-medium">Twitter (X)</span>
                  </a>

                  <a
                    href={facebookShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    onClick={() => setIsShareMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-[#16A085] transition-colors"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 shrink-0 text-[#1877F2]"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                    <span className="font-medium">Facebook</span>
                  </a>

                  <div className="my-1 border-t border-zinc-200 dark:border-zinc-800" />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-[#16A085] transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 shrink-0 text-[#16A085]" aria-hidden="true" />
                        <span className="font-semibold text-[#16A085]">Tautan Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 shrink-0 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />
                        <span className="font-medium">Salin Tautan</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onToggleSave(article.id)}
              aria-pressed={isSaved}
              className={`h-8 px-2.5 rounded-md border text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-[#16A085] border-[#16A085] text-white'
                  : 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:border-[#16A085]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Tersimpan' : 'Simpan'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              aria-label="Cetak artikel ini"
              title="Cetak Artikel (Ctrl/Cmd+P)"
              className="h-8 px-2.5 rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 hover:border-[#16A085] hover:text-[#16A085] text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden md:inline">Cetak Artikel</span>
              <span className="md:hidden">Cetak</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup artikel"
              className="w-8 h-8 shrink-0 rounded-md flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs: Article vs Notes */}
        <div
          role="tablist"
          aria-label="Tampilan modal artikel"
          className="print-hidden px-5 sm:px-7 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between gap-4 shrink-0"
        >
          <div className="flex items-center gap-5">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'article'}
              onClick={() => setActiveTab('article')}
              className={`py-2.5 text-xs font-semibold border-b-2 transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'article'
                  ? 'border-[#16A085] text-[#16A085]'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Artikel</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'notes'}
              onClick={() => {
                setPendingSelection(null);
                setActiveTab('notes');
              }}
              className={`py-2.5 text-xs font-semibold border-b-2 transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'notes'
                  ? 'border-[#16A085] text-[#16A085]'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <StickyNote className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Catatan</span>
              <span className="font-mono-tabular text-[11px] opacity-80">
                ({articleAnnotations.length})
              </span>
            </button>
          </div>

          {activeTab === 'article' && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500">
              <Highlighter className="w-3 h-3 text-[#16A085]" aria-hidden="true" />
              <span>Blok teks paragraf untuk menandai sorotan</span>
            </span>
          )}
        </div>

        {/* Floating Highlight & Annotation Popover */}
        {pendingSelection && activeTab === 'article' && (
          <div
            ref={selectionPopoverRef}
            role="dialog"
            aria-label="Sorot teks dan tambah catatan"
            style={{ top: `${pendingSelection.top}px`, left: `${pendingSelection.left}px` }}
            className="print-hidden absolute z-40 w-72 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl p-3 space-y-2.5 animate-feed-fade-in"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#16A085] inline-flex items-center gap-1">
                <Highlighter className="w-3 h-3" aria-hidden="true" />
                Sorot &amp; Simpan Catatan
              </span>
              <div className="flex items-center gap-1.5">
                {(['amber', 'emerald', 'sky'] as HighlightColor[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setPendingColor(c)}
                    title={`Warna ${HIGHLIGHT_COLOR_STYLES[c].label}`}
                    aria-label={`Pilih warna sorotan ${HIGHLIGHT_COLOR_STYLES[c].label}`}
                    className={`w-4 h-4 rounded-full ${HIGHLIGHT_COLOR_STYLES[c].swatch} cursor-pointer transition-transform ${
                      pendingColor === c
                        ? 'ring-2 ring-offset-1 ring-zinc-800 dark:ring-zinc-100 scale-110'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <input
              type="text"
              value={pendingNote}
              onChange={(e) => setPendingNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSaveAnnotation();
                }
              }}
              placeholder="Tambah catatan (opsional)..."
              className="w-full h-8 px-2.5 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#16A085]"
            />

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setPendingSelection(null);
                  window.getSelection()?.removeAllRanges();
                }}
                className="h-7 px-2 rounded text-[11px] font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleSaveAnnotation()}
                className="h-7 px-3 rounded bg-[#16A085] hover:bg-[#138D75] text-white text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" aria-hidden="true" />
                <span>Simpan ke Catatan</span>
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Editorial Body */}
        <div
          ref={scrollContainerRef}
          onScroll={handleModalScroll}
          className="print-modal-scroll overflow-y-auto px-5 sm:px-8 py-6 sm:py-8 space-y-6"
        >
          {activeTab === 'notes' ? (
            <ArticleNotesPanel
              articleTitle={article.title}
              annotations={articleAnnotations}
              onUpdateNote={handleUpdateAnnotationNote}
              onUpdateColor={handleUpdateAnnotationColor}
              onDeleteAnnotation={handleDeleteAnnotation}
              onJumpToHighlight={handleJumpToHighlight}
              onSwitchToArticle={() => setActiveTab('article')}
            />
          ) : (
            <>
          {/* Print-only Broadsheet Masthead */}
          <div className="hidden print:flex items-baseline justify-between border-b-2 border-zinc-900 pb-3 mb-4">
            <div>
              <div className="font-editorial text-xl font-bold tracking-tight text-zinc-900">
                KEADILAN.CO.ID
              </div>
              <div className="text-[11px] text-zinc-600">
                Media Daring — Sobat Keadilan · PT Wahana Sahabat Kreatif
              </div>
            </div>
            <div className="font-mono-tabular text-[11px] text-zinc-600">
              Edisi Cetak · {article.date}
            </div>
          </div>

          <div ref={articleContentRef} className="space-y-6">
          {/* AI-Generated 3-Bullet Point Summary at Top of Modal */}
          <ArticleAiSummary article={article} />

          <header className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest text-[#16A085]">
              {article.category}
            </div>
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold leading-tight text-zinc-900 dark:text-zinc-50">
              {article.title}
            </h1>
            {/* Unboxed Metadata Line (Zero Pill Discipline) */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400 print:text-zinc-600 pt-1">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 print:text-zinc-900">
                {article.author}
              </span>
              <span>·</span>
              <span>{article.authorRole}</span>
              <span>·</span>
              <span className="font-mono-tabular">{article.date}</span>
              <span>·</span>
              <span className="font-mono-tabular">{calculateReadingTime(article)}</span>
            </div>
          </header>

          {/* Audio Version / Read-Aloud Player */}
          <ArticleAudioPlayer
            article={article}
            onActiveParagraphChange={setActiveSpeechParagraph}
          />

          <figure className="space-y-2">
            <div className="w-full aspect-[16/9] rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800 print:border-zinc-300">
              <EditorialArtwork variant={article.artworkVariant} />
            </div>
            <figcaption className="text-[11px] text-zinc-500 dark:text-zinc-400 print:text-zinc-600">
              Ilustrasi Editorial KEADILAN.CO.ID — {article.excerpt}
            </figcaption>
          </figure>

          {/* Body Copy with Editorial Drop Cap & Interactive Text Highlighting */}
          <div
            onMouseUp={handleTextSelection}
            onTouchEnd={handleTextSelection}
            className="space-y-4 text-[15px] sm:text-base leading-relaxed text-zinc-700 dark:text-zinc-300 selection:bg-amber-200/75 dark:selection:bg-amber-500/35"
          >
            {article.content.map((paragraph, index) => (
              <p
                key={index}
                data-paragraph-index={index}
                className={`rounded transition-colors duration-300 ${
                  flashedParagraphIndex === index
                    ? 'bg-amber-100/70 dark:bg-amber-900/25 px-2 -mx-2 py-1'
                    : activeSpeechParagraph === index
                      ? 'border-l-2 border-[#16A085] pl-3 -ml-3.5 bg-[#16A085]/[0.05] dark:bg-[#16A085]/[0.09] py-1'
                      : ''
                } ${
                  index === 0
                    ? 'first-letter:font-editorial first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:leading-[0.85] first-letter:text-zinc-900 dark:first-letter:text-zinc-100'
                    : ''
                }`}
              >
                {renderParagraphWithHighlights(paragraph, index)}
              </p>
            ))}

            {article.pullQuote && (
              <blockquote className="my-6 py-4 border-y border-zinc-200 dark:border-zinc-800 text-center">
                <p className="font-editorial italic text-lg sm:text-xl text-zinc-900 dark:text-zinc-100">
                  “{article.pullQuote}”
                </p>
              </blockquote>
            )}
          </div>
          </div>

          {/* Author Bio Section */}
          <section
            aria-label="Profil Penulis"
            className="pt-6 border-t border-zinc-200 dark:border-zinc-800"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Editorial Vector Portrait / Monogram Avatar */}
              <div
                className="w-14 h-14 rounded-full shrink-0 flex items-center justify-center text-white font-editorial font-bold text-lg tracking-wide ring-2 ring-zinc-200 dark:ring-zinc-800 relative overflow-hidden"
                style={{ backgroundColor: authorProfile.accentColor }}
                aria-hidden="true"
              >
                <svg
                  viewBox="0 0 64 64"
                  className="absolute inset-0 w-full h-full opacity-20"
                >
                  <circle cx="32" cy="24" r="11" fill="#FFFFFF" />
                  <path d="M12,58 C12,44 52,44 52,58" fill="#FFFFFF" />
                </svg>
                <span className="relative z-10">{authorProfile.initials}</span>
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#16A085]">
                    Penulis
                  </span>
                  <span aria-hidden="true" className="text-zinc-400 text-xs">
                    ·
                  </span>
                  <h3 className="font-editorial text-base font-bold text-zinc-900 dark:text-zinc-50">
                    {authorProfile.name}
                  </h3>
                  <span aria-hidden="true" className="text-zinc-400 text-xs">
                    ·
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {authorProfile.role}
                  </span>
                </div>

                <p className="text-xs sm:text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {authorProfile.bio}
                </p>

                <div className="print-hidden pt-0.5">
                  <button
                    type="button"
                    onClick={() => onViewAuthorArticles(article.author)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A085] hover:underline underline-offset-4 cursor-pointer"
                  >
                    <span>
                      Lihat semua artikel oleh {authorProfile.name} ({authorArticleCount})
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Reader Comments Section */}
          <ArticleCommentsSection articleId={article.id} />

          {/* More from [Category] — 3-Card Thumbnail Grid */}
          {(() => {
            const sameCategoryArticles = relatedArticles
              .filter((rel) => rel.category === article.category)
              .slice(0, 3);
            if (sameCategoryArticles.length === 0) return null;

            return (
              <section
                aria-label={`Lainnya dari ${article.category}`}
                className="print-hidden pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-3.5"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-editorial text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    Lainnya dari {article.category}
                  </h3>
                  <span className="font-mono-tabular text-[11px] text-zinc-500 dark:text-zinc-400">
                    {sameCategoryArticles.length} artikel terkait
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {sameCategoryArticles.map((rel) => (
                    <button
                      key={rel.id}
                      type="button"
                      onClick={() => onSelectArticle(rel)}
                      className="group text-left rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 hover:border-[#16A085] transition-colors flex flex-col cursor-pointer"
                    >
                      <div className="w-full aspect-[16/10] overflow-hidden border-b border-zinc-200 dark:border-zinc-800 shrink-0">
                        <EditorialArtwork
                          variant={rel.artworkVariant}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[#16A085]">
                            {rel.category} · {rel.date}
                          </div>
                          <div className="font-editorial font-bold text-sm leading-snug text-zinc-900 dark:text-zinc-100 group-hover:text-[#16A085] line-clamp-2 transition-colors">
                            {rel.title}
                          </div>
                        </div>
                        <div className="font-mono-tabular text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between gap-2 pt-1">
                          <span>{calculateReadingTime(rel)}</span>
                          <ArrowRight
                            className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100 group-hover:text-[#16A085] transition-opacity"
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            );
          })()}

          {/* Print-only Broadsheet Attribution Footer */}
          <footer className="hidden print:flex items-center justify-between gap-4 pt-4 mt-6 border-t border-zinc-300 text-[10px] text-zinc-600">
            <span className="font-mono-tabular truncate">Sumber: {shareUrl}</span>
            <span className="shrink-0">© 2026 KEADILAN.CO.ID — PT Wahana Sahabat Kreatif</span>
          </footer>
            </>
          )}
        </div>
      </article>
    </div>
  );
};
