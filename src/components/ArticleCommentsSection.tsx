import React, { useEffect, useState } from 'react';
import { AlertCircle, MessageSquare, Send, ThumbsUp } from 'lucide-react';

export interface ArticleComment {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
  likes: number;
  likedByUser: boolean;
}

interface ArticleCommentsSectionProps {
  articleId: string;
}

const STORAGE_KEY = 'keadilan_article_comments';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'PB';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function loadStoredComments(): Record<string, ArticleComment[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, ArticleComment[]>;
    }
  } catch {
    // Ignore storage read error
  }
  return {};
}

export const ArticleCommentsSection: React.FC<ArticleCommentsSectionProps> = ({
  articleId,
}) => {
  const [commentsByArticle, setCommentsByArticle] = useState<
    Record<string, ArticleComment[]>
  >(() => loadStoredComments());

  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setCommentText('');
    setErrorMessage(null);
  }, [articleId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(commentsByArticle));
    } catch {
      // Ignore storage write error
    }
  }, [commentsByArticle]);

  const articleComments = commentsByArticle[articleId] ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = authorName.trim();
    const trimmedText = commentText.trim();

    if (!trimmedName) {
      setErrorMessage('Masukkan nama Anda terlebih dahulu.');
      return;
    }

    if (!trimmedText) {
      setErrorMessage('Tuliskan komentar Anda sebelum mengirim.');
      return;
    }

    const newComment: ArticleComment = {
      id: `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      authorName: trimmedName,
      text: trimmedText,
      createdAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      likes: 0,
      likedByUser: false,
    };

    setCommentsByArticle((prev) => ({
      ...prev,
      [articleId]: [newComment, ...(prev[articleId] ?? [])],
    }));

    setCommentText('');
    setErrorMessage(null);
  };

  const handleToggleLike = (commentId: string) => {
    setCommentsByArticle((prev) => {
      const existing = prev[articleId] ?? [];
      return {
        ...prev,
        [articleId]: existing.map((comment) => {
          if (comment.id !== commentId) return comment;
          const nextLiked = !comment.likedByUser;
          return {
            ...comment,
            likedByUser: nextLiked,
            likes: Math.max(0, comment.likes + (nextLiked ? 1 : -1)),
          };
        }),
      };
    });
  };

  return (
    <section
      aria-label="Komentar Pembaca"
      className="print-hidden pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-4"
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#16A085]" aria-hidden="true" />
          <h3 className="font-editorial text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Komentar Pembaca
          </h3>
        </div>
        <span className="font-mono-tabular text-[11px] text-zinc-500 dark:text-zinc-400">
          {articleComments.length} komentar
        </span>
      </div>

      {/* Post Comment Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className="p-4 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 space-y-3"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label
              htmlFor={`comment-name-${articleId}`}
              className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300"
            >
              Nama Pembaca
            </label>
            <input
              id={`comment-name-${articleId}`}
              type="text"
              value={authorName}
              onChange={(e) => {
                setAuthorName(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              maxLength={60}
              placeholder="Nama lengkap atau inisial"
              className="w-full h-9 px-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#16A085]"
            />
          </div>

          <div className="hidden sm:flex items-end justify-end text-[11px] text-zinc-500 dark:text-zinc-400 pb-2">
            Sampaikan tanggapan secara santun dan konstruktif.
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor={`comment-body-${articleId}`}
            className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300"
          >
            Komentar
          </label>
          <textarea
            id={`comment-body-${articleId}`}
            rows={3}
            value={commentText}
            onChange={(e) => {
              setCommentText(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            maxLength={500}
            placeholder="Tulis pandangan Anda mengenai berita ini..."
            className="w-full p-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs sm:text-[13px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-[#16A085] resize-y"
          />
        </div>

        {errorMessage && (
          <p
            role="alert"
            className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </p>
        )}

        <div className="flex items-center justify-between gap-3 pt-0.5">
          <span className="font-mono-tabular text-[11px] text-zinc-400 dark:text-zinc-500">
            {commentText.length}/500 karakter
          </span>
          <button
            type="submit"
            className="h-9 px-4 rounded-md bg-[#16A085] hover:bg-[#138D75] text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Kirim Komentar</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      {articleComments.length === 0 ? (
        <div className="py-6 px-4 text-center rounded-md border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
          Belum ada komentar pada artikel ini. Jadilah pembaca pertama yang memberikan tanggapan.
        </div>
      ) : (
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800 border-t border-zinc-200 dark:border-zinc-800">
          {articleComments.map((comment) => (
            <li key={comment.id} className="py-3.5 last:pb-0 flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-full bg-[#0F2A44] text-white font-editorial font-bold text-xs flex items-center justify-center shrink-0 mt-0.5"
                aria-hidden="true"
              >
                {getInitials(comment.authorName)}
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {comment.authorName}
                  </span>
                  <span className="font-mono-tabular text-[11px] text-zinc-500 dark:text-zinc-400">
                    {comment.createdAt}
                  </span>
                </div>

                <p className="text-xs sm:text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line break-words">
                  {comment.text}
                </p>

                <div className="pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleToggleLike(comment.id)}
                    aria-pressed={comment.likedByUser}
                    aria-label={
                      comment.likedByUser
                        ? `Batal menyukai komentar dari ${comment.authorName}`
                        : `Sukai komentar dari ${comment.authorName}`
                    }
                    className={`h-7 px-2.5 rounded border text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                      comment.likedByUser
                        ? 'bg-[#16A085]/10 border-[#16A085] text-[#16A085]'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-[#16A085] hover:text-[#16A085]'
                    }`}
                  >
                    <ThumbsUp
                      className={`w-3 h-3 ${comment.likedByUser ? 'fill-current' : ''}`}
                      aria-hidden="true"
                    />
                    <span>Suka</span>
                    <span className="font-mono-tabular">({comment.likes})</span>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
