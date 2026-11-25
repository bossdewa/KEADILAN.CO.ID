import React, { useEffect, useId, useRef, useState } from 'react';
import {
  Bug,
  CheckCircle2,
  Lightbulb,
  Loader2,
  MessageSquarePlus,
  Send,
  Trash2,
  X,
} from 'lucide-react';

export type FeedbackType = 'bug' | 'feature';

export interface FeedbackEntry {
  id: string;
  type: FeedbackType;
  title: string;
  message: string;
  email?: string;
  createdAt: string;
}

const STORAGE_KEY = 'keadilan_user_feedback';
const MAX_STORED_FEEDBACK = 20;

interface SendFeedbackProps {
  onOpenChange?: (isOpen: boolean) => void;
}

export const SendFeedback: React.FC<SendFeedbackProps> = ({ onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('bug');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEntry, setSubmittedEntry] = useState<FeedbackEntry | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const [entries, setEntries] = useState<FeedbackEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (item): item is FeedbackEntry =>
              item &&
              typeof item.id === 'string' &&
              (item.type === 'bug' || item.type === 'feature') &&
              typeof item.title === 'string' &&
              typeof item.message === 'string' &&
              typeof item.createdAt === 'string'
          );
        }
      }
    } catch {
      // Ignore storage error
    }
    return [];
  });

  const titleInputRef = useRef<HTMLInputElement>(null);
  const submitTimerRef = useRef<number | null>(null);
  const headingId = useId();
  const titleId = useId();
  const messageId = useId();
  const emailId = useId();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Ignore storage error
    }
  }, [entries]);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  useEffect(() => {
    return () => {
      if (submitTimerRef.current !== null) {
        window.clearTimeout(submitTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const focusTimer = window.setTimeout(() => {
      titleInputRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [isOpen, isSubmitting]);

  const openModal = () => {
    setError(null);
    setSubmittedEntry(null);
    setShowHistory(false);
    setIsOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsOpen(false);
  };

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setEmail('');
    setError(null);
    setSubmittedEntry(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const cleanTitle = title.trim();
    const cleanMessage = message.trim();
    const cleanEmail = email.trim();

    if (cleanTitle.length < 3) {
      setError('Mohon isi ringkasan masukan minimal 3 karakter.');
      return;
    }

    if (cleanMessage.length < 10) {
      setError('Mohon jelaskan detail masukan minimal 10 karakter.');
      return;
    }

    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Format alamat surel tidak valid.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    submitTimerRef.current = window.setTimeout(() => {
      const newEntry: FeedbackEntry = {
        id: `fb-${Date.now()}`,
        type: feedbackType,
        title: cleanTitle,
        message: cleanMessage,
        email: cleanEmail || undefined,
        createdAt: new Date().toLocaleString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setEntries((prev) => [newEntry, ...prev].slice(0, MAX_STORED_FEEDBACK));
      setSubmittedEntry(newEntry);
      setTitle('');
      setMessage('');
      setEmail('');
      setIsSubmitting(false);
    }, 450);
  };

  return (
    <>
      <div className="pt-1">
        <button
          type="button"
          onClick={openModal}
          className="h-9 px-3.5 rounded-md bg-white/10 hover:bg-[#16A085] border border-white/15 hover:border-[#16A085] text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
        >
          <MessageSquarePlus className="w-3.5 h-3.5 text-[#C9A227]" aria-hidden="true" />
          <span>Kirim Masukan</span>
        </button>
      </div>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="w-full max-w-lg rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-[#0F2A44] text-white flex items-center justify-between gap-4 border-b-2 border-[#C9A227]">
              <div className="space-y-0.5 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#C9A227]">
                  Umpan Balik Pembaca
                </div>
                <h2 id={headingId} className="font-editorial text-lg font-bold truncate">
                  Kirim Laporan Bug atau Usulan Fitur
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                aria-label="Tutup formulir masukan"
                className="w-8 h-8 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Mode Tabs: Form vs History */}
            <div className="px-5 pt-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-950/40">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                    !showHistory
                      ? 'border-[#16A085] text-[#16A085]'
                      : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Formulir Masukan
                </button>
                <button
                  type="button"
                  onClick={() => setShowHistory(true)}
                  className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                    showHistory
                      ? 'border-[#16A085] text-[#16A085]'
                      : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  <span>Riwayat Terkirim</span>
                  <span className="font-mono-tabular text-[11px] opacity-80">
                    ({entries.length})
                  </span>
                </button>
              </div>
            </div>

            {showHistory ? (
              <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
                {entries.length === 0 ? (
                  <p className="py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
                    Belum ada laporan bug atau usulan fitur yang Anda kirim dari perangkat ini.
                  </p>
                ) : (
                  <>
                    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {entries.map((entry) => (
                        <li key={entry.id} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                                entry.type === 'bug'
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-[#16A085]'
                              }`}
                            >
                              {entry.type === 'bug' ? (
                                <Bug className="w-3 h-3" aria-hidden="true" />
                              ) : (
                                <Lightbulb className="w-3 h-3" aria-hidden="true" />
                              )}
                              <span>
                                {entry.type === 'bug' ? 'Laporan Bug' : 'Usulan Fitur'}
                              </span>
                            </span>
                            <span className="font-mono-tabular text-[11px] text-zinc-400 dark:text-zinc-500">
                              {entry.createdAt}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {entry.title}
                          </h3>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                            {entry.message}
                          </p>
                          {entry.email && (
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                              Kontak: {entry.email}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>

                    <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setShowHistory(false)}
                        className="text-xs font-semibold text-[#16A085] hover:underline cursor-pointer"
                      >
                        Kembali ke Formulir
                      </button>
                      <button
                        type="button"
                        onClick={() => setEntries([])}
                        className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Hapus Riwayat</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : submittedEntry ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-11 h-11 rounded-full bg-[#16A085]/15 text-[#16A085] mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-editorial text-lg font-bold">
                    Terima Kasih atas Masukan Anda
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
                    {submittedEntry.type === 'bug'
                      ? 'Laporan bug'
                      : 'Usulan fitur'}{' '}
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      “{submittedEntry.title}”
                    </span>{' '}
                    telah tercatat untuk ditinjau oleh tim pengembang KEADILAN.CO.ID.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="h-9 px-3.5 rounded-md border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:border-[#16A085] cursor-pointer transition-colors"
                  >
                    Kirim Masukan Lain
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="h-9 px-4 rounded-md bg-[#16A085] hover:bg-[#138D75] text-white text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Selesai
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* Feedback Category Toggle */}
                <div className="space-y-1.5">
                  <span className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Kategori Masukan
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setFeedbackType('bug')}
                      aria-pressed={feedbackType === 'bug'}
                      className={`h-10 px-3 rounded-md border text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                        feedbackType === 'bug'
                          ? 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-700 dark:text-red-300'
                          : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600'
                      }`}
                    >
                      <Bug className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Laporan Bug</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFeedbackType('feature')}
                      aria-pressed={feedbackType === 'feature'}
                      className={`h-10 px-3 rounded-md border text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                        feedbackType === 'feature'
                          ? 'bg-[#16A085]/10 border-[#16A085] text-[#16A085]'
                          : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600'
                      }`}
                    >
                      <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Usulan Fitur</span>
                    </button>
                  </div>
                </div>

                {/* Title Input */}
                <div className="space-y-1.5">
                  <label
                    htmlFor={titleId}
                    className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                  >
                    Ringkasan <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={titleInputRef}
                    id={titleId}
                    type="text"
                    maxLength={100}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      feedbackType === 'bug'
                        ? 'Contoh: Tampilan berita terpotong saat layar sempit'
                        : 'Contoh: Tambahkan mode baca fokus tanpa gambar'
                    }
                    className="w-full h-9 px-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:border-[#16A085]"
                  />
                </div>

                {/* Detail Message */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={messageId}
                      className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                    >
                      Detail Masukan <span className="text-red-500">*</span>
                    </label>
                    <span className="font-mono-tabular text-[11px] text-zinc-400">
                      {message.length}/500
                    </span>
                  </div>
                  <textarea
                    id={messageId}
                    rows={4}
                    maxLength={500}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      feedbackType === 'bug'
                        ? 'Jelaskan langkah kejadian atau kendala yang Anda temui...'
                        : 'Ceritakan fitur yang ingin Anda lihat di portal KEADILAN.CO.ID...'
                    }
                    className="w-full p-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs leading-relaxed resize-none focus:outline-none focus:border-[#16A085]"
                  />
                </div>

                {/* Optional Email */}
                <div className="space-y-1.5">
                  <label
                    htmlFor={emailId}
                    className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                  >
                    Surel Kontak <span className="font-normal text-zinc-400">(Opsional)</span>
                  </label>
                  <input
                    id={emailId}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@contoh.com (jika bersedia dihubungi)"
                    className="w-full h-9 px-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:border-[#16A085]"
                  />
                </div>

                {error && (
                  <p
                    role="alert"
                    className="text-xs font-medium text-red-600 dark:text-red-400"
                  >
                    {error}
                  </p>
                )}

                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSubmitting}
                    className="h-9 px-3.5 rounded-md border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-9 px-4 rounded-md bg-[#16A085] hover:bg-[#138D75] text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Kirim Masukan</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
