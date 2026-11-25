import React, { useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Copy,
  Edit3,
  Highlighter,
  StickyNote,
  Trash2,
} from 'lucide-react';

export type HighlightColor = 'amber' | 'emerald' | 'sky';

export interface ArticleAnnotation {
  id: string;
  articleId: string;
  paragraphIndex: number;
  startOffset: number;
  endOffset: number;
  quote: string;
  note: string;
  color: HighlightColor;
  createdAt: string;
}

interface ArticleNotesPanelProps {
  articleTitle: string;
  annotations: ArticleAnnotation[];
  onUpdateNote: (id: string, note: string) => void;
  onUpdateColor: (id: string, color: HighlightColor) => void;
  onDeleteAnnotation: (id: string) => void;
  onJumpToHighlight: (paragraphIndex: number) => void;
  onSwitchToArticle: () => void;
}

export const HIGHLIGHT_COLOR_STYLES: Record<
  HighlightColor,
  {
    label: string;
    swatch: string;
    markClass: string;
    borderAccent: string;
  }
> = {
  amber: {
    label: 'Kuning',
    swatch: 'bg-amber-300 dark:bg-amber-400',
    markClass:
      'bg-amber-200/80 dark:bg-amber-500/30 text-zinc-900 dark:text-zinc-100 rounded-[2px] px-0.5 cursor-pointer hover:bg-amber-300/85 dark:hover:bg-amber-500/45 transition-colors',
    borderAccent: 'border-l-amber-400',
  },
  emerald: {
    label: 'Hijau',
    swatch: 'bg-emerald-300 dark:bg-emerald-400',
    markClass:
      'bg-emerald-200/80 dark:bg-emerald-500/30 text-zinc-900 dark:text-zinc-100 rounded-[2px] px-0.5 cursor-pointer hover:bg-emerald-300/85 dark:hover:bg-emerald-500/45 transition-colors',
    borderAccent: 'border-l-[#16A085]',
  },
  sky: {
    label: 'Biru',
    swatch: 'bg-sky-300 dark:bg-sky-400',
    markClass:
      'bg-sky-200/80 dark:bg-sky-500/30 text-zinc-900 dark:text-zinc-100 rounded-[2px] px-0.5 cursor-pointer hover:bg-sky-300/85 dark:hover:bg-sky-500/45 transition-colors',
    borderAccent: 'border-l-sky-400',
  },
};

export const ArticleNotesPanel: React.FC<ArticleNotesPanelProps> = ({
  articleTitle,
  annotations,
  onUpdateNote,
  onUpdateColor,
  onDeleteAnnotation,
  onJumpToHighlight,
  onSwitchToArticle,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyAllNotes = async () => {
    if (annotations.length === 0) return;
    const formatted = [
      `Catatan Bacaan — ${articleTitle}`,
      '',
      ...annotations.map((item, idx) => {
        const header = `${idx + 1}. [Paragraf ${item.paragraphIndex + 1}] "${item.quote}"`;
        return item.note.trim() ? `${header}\n   Catatan: ${item.note.trim()}` : header;
      }),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedAll(true);
      window.setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  if (annotations.length === 0) {
    return (
      <div className="py-12 px-6 text-center rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 space-y-3">
        <div className="w-10 h-10 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-[#16A085]">
          <Highlighter className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="space-y-1 max-w-md mx-auto">
          <h3 className="font-editorial text-base font-bold text-zinc-900 dark:text-zinc-100">
            Belum Ada Sorotan &amp; Catatan
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Blok atau pilih kalimat penting di dalam teks artikel untuk menandai sorotan dan menyimpan catatan pribadi Anda di sini.
          </p>
        </div>
        <button
          type="button"
          onClick={onSwitchToArticle}
          className="px-4 py-2 rounded-md bg-[#16A085] hover:bg-[#138D75] text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          Kembali ke Artikel
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-[#16A085]" aria-hidden="true" />
          <h2 className="font-editorial text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Catatan &amp; Sorotan ({annotations.length})
          </h2>
        </div>

        <button
          type="button"
          onClick={handleCopyAllNotes}
          className="h-8 px-2.5 rounded-md border border-zinc-300 dark:border-zinc-700 text-xs font-semibold inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-200 hover:border-[#16A085] hover:text-[#16A085] transition-colors cursor-pointer"
        >
          {copiedAll ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#16A085]" aria-hidden="true" />
              <span className="text-[#16A085]">Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Salin Semua</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-3">
        {annotations.map((item) => {
          const style = HIGHLIGHT_COLOR_STYLES[item.color];
          const isEditing = editingId === item.id;

          return (
            <article
              key={item.id}
              className={`rounded-md border border-zinc-200 dark:border-zinc-800 border-l-4 ${style.borderAccent} bg-zinc-50/70 dark:bg-zinc-900/50 p-4 space-y-2.5`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[11px] font-mono-tabular text-zinc-500 dark:text-zinc-400">
                  <span className="font-semibold text-[#16A085]">
                    Paragraf {item.paragraphIndex + 1}
                  </span>
                  <span>·</span>
                  <span>{item.createdAt}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Color Switcher */}
                  <div className="flex items-center gap-1 mr-1" aria-label="Warna sorotan">
                    {(['amber', 'emerald', 'sky'] as HighlightColor[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => onUpdateColor(item.id, c)}
                        title={`Ubah warna ke ${HIGHLIGHT_COLOR_STYLES[c].label}`}
                        aria-label={`Ubah warna sorotan ke ${HIGHLIGHT_COLOR_STYLES[c].label}`}
                        className={`w-3.5 h-3.5 rounded-full ${HIGHLIGHT_COLOR_STYLES[c].swatch} cursor-pointer transition-transform ${
                          item.color === c
                            ? 'ring-2 ring-offset-1 ring-zinc-700 dark:ring-zinc-200 scale-110'
                            : 'opacity-65 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => onJumpToHighlight(item.paragraphIndex)}
                    className="h-7 px-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:border-[#16A085] hover:text-[#16A085] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Lihat</span>
                    <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(item.id);
                      setDraftNote(item.note);
                    }}
                    aria-label="Sunting catatan"
                    title="Sunting catatan"
                    className="w-7 h-7 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-500 hover:text-[#16A085] hover:border-[#16A085] flex items-center justify-center cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteAnnotation(item.id)}
                    aria-label="Hapus sorotan"
                    title="Hapus sorotan"
                    className="w-7 h-7 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-400 hover:text-red-600 hover:border-red-300 flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <blockquote className="text-sm font-editorial italic text-zinc-800 dark:text-zinc-100 leading-relaxed">
                “{item.quote}”
              </blockquote>

              {isEditing ? (
                <div className="space-y-2 pt-1">
                  <textarea
                    value={draftNote}
                    onChange={(e) => setDraftNote(e.target.value)}
                    rows={2}
                    placeholder="Tulis catatan Anda untuk kutipan ini..."
                    className="w-full rounded-md border border-[#16A085] bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-800 dark:text-zinc-100 focus:outline-none"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="h-7 px-2.5 rounded text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateNote(item.id, draftNote.trim());
                        setEditingId(null);
                      }}
                      className="h-7 px-3 rounded bg-[#16A085] hover:bg-[#138D75] text-white text-xs font-semibold cursor-pointer"
                    >
                      Simpan Catatan
                    </button>
                  </div>
                </div>
              ) : item.note.trim() ? (
                <p className="text-xs text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded px-3 py-2 leading-relaxed">
                  {item.note}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(item.id);
                    setDraftNote('');
                  }}
                  className="text-[11px] font-medium text-[#16A085] hover:underline cursor-pointer"
                >
                  + Tambah catatan untuk sorotan ini
                </button>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};
