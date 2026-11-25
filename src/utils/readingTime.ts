import { NewsArticle } from '../data/newsData';

type ReadableArticleFields = Pick<
  NewsArticle,
  'title' | 'excerpt' | 'content' | 'pullQuote'
>;

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export function getArticleWordCount(article: ReadableArticleFields): number {
  const sections = [
    article.title,
    article.excerpt,
    ...article.content,
    article.pullQuote ?? '',
  ];
  return sections.reduce((total, section) => total + countWords(section), 0);
}

export function getReadingTimeMinutes(
  article: ReadableArticleFields,
  wordsPerMinute = 180
): number {
  const words = getArticleWordCount(article);
  const safeWpm = Math.max(1, wordsPerMinute);
  return Math.max(1, Math.ceil(words / safeWpm));
}

export function calculateReadingTime(
  article: ReadableArticleFields,
  wordsPerMinute = 180
): string {
  const minutes = getReadingTimeMinutes(article, wordsPerMinute);
  return `${minutes} mnt baca`;
}

export function getTotalReadingTimeMinutes(
  articles: ReadableArticleFields[],
  wordsPerMinute = 180
): number {
  if (articles.length === 0) return 0;
  const totalWords = articles.reduce(
    (sum, article) => sum + getArticleWordCount(article),
    0
  );
  const safeWpm = Math.max(1, wordsPerMinute);
  return Math.max(1, Math.ceil(totalWords / safeWpm));
}

export function formatReadingDuration(minutes: number): string {
  if (minutes <= 0) return '0 mnt';
  if (minutes < 60) return `${minutes} mnt`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours} jam ${remainingMinutes} mnt` : `${hours} jam`;
}

export function calculateTotalReadingTime(
  articles: ReadableArticleFields[],
  wordsPerMinute = 180
): string {
  const minutes = getTotalReadingTimeMinutes(articles, wordsPerMinute);
  return formatReadingDuration(minutes);
}

export interface FeedReadingSummary {
  articleCount: number;
  totalWords: number;
  totalMinutes: number;
  formattedTime: string;
}

export function getFeedReadingSummary(
  articles: ReadableArticleFields[],
  wordsPerMinute = 180
): FeedReadingSummary {
  const articleCount = articles.length;
  const totalWords = articles.reduce(
    (sum, article) => sum + getArticleWordCount(article),
    0
  );
  const totalMinutes =
    articleCount === 0
      ? 0
      : Math.max(1, Math.ceil(totalWords / Math.max(1, wordsPerMinute)));

  return {
    articleCount,
    totalWords,
    totalMinutes,
    formattedTime: formatReadingDuration(totalMinutes),
  };
}
