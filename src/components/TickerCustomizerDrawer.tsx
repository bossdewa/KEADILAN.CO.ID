import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  Download,
  Eye,
  EyeOff,
  Gauge,
  Palette,
  Pause,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react';
import {
  BreakingNewsItem,
  NewsCategory,
  TICKER_COLOR_PRESETS,
  TickerConfig,
} from '../data/newsData';
import { getTickerContrastPalette } from '../utils/colorContrast';
import {
  BloggerExportFileKey,
  downloadTextFile,
  generateFullBloggerPatchSnippet,
  generateThemeFourFileBundle,
} from '../utils/bloggerXmlExport';

interface TickerCustomizerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: TickerConfig;
  onUpdateConfig: (partial: Partial<TickerConfig>) => void;
  items: BreakingNewsItem[];
  onAddItem: (label: BreakingNewsItem['label'], text: string) => void;
  onToggleItem: (id: string) => void;
  onEditItem: (id: string, text: string) => void;
  onDeleteItem: (id: string) => void;
  onResetDefaults: () => void;
  initialTab?: 'settings' | 'xml';
}

const SPEED_PRESETS = [
  { label: 'Cepat', duration: 12 },
  { label: 'Normal', duration: 28 },
  { label: 'Santai', duration: 50 },
];

const AUTO_CYCLE_INTERVALS = [3, 5, 8, 12] as const;

const LABEL_OPTIONS: Array<NewsCategory | 'Terkini'> = [
  'Terkini',
  'Sorot',
  'Hukum',
  'Politik',
  'Daerah',
  'Ekonomi',
  'Teknologi',
  'Umum',
];

export const TickerCustomizerDrawer: React.FC<TickerCustomizerDrawerProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  items,
  onAddItem,
  onToggleItem,
  onEditItem,
  onDeleteItem,
  onResetDefaults,
  initialTab = 'settings',
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'xml'>(initialTab);
  const [exportFileKey, setExportFileKey] = useState<BloggerExportFileKey>('xml');
  const [hexInput, setHexInput] = useState(config.backgroundColor);
  const [newLabel, setNewLabel] = useState<BreakingNewsItem['label']>('Terkini');
  const [newText, setNewText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [copiedXml, setCopiedXml] = useState(false);
  const [downloadedAll, setDownloadedAll] = useState(false);
  const [previewCycleIndex, setPreviewCycleIndex] = useState(0);
  const [guideOpen, setGuideOpen] = useState(true);
  const [guideMode, setGuideMode] = useState<'files' | 'copypaste'>('files');
  const [copiedHelperKey, setCopiedHelperKey] = useState<'cdn' | 'style' | 'script' | null>(
    null
  );

  const activeItems = items.filter((i) => i.active && i.text.trim().length > 0);
  const isAutoCycle = Boolean(config.autoCycle);
  const cycleIntervalSec = config.autoCycleInterval ?? 5;

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    setHexInput(config.backgroundColor);
  }, [config.backgroundColor]);

  useEffect(() => {
    if (activeItems.length === 0) {
      setPreviewCycleIndex(0);
      return;
    }
    setPreviewCycleIndex((prev) => (prev >= activeItems.length ? 0 : prev));
  }, [activeItems.length]);

  useEffect(() => {
    if (!isOpen || !isAutoCycle || config.isPaused || activeItems.length <= 1) {
      return;
    }
    const timer = window.setInterval(() => {
      setPreviewCycleIndex((prev) => (prev + 1) % activeItems.length);
    }, Math.max(2, cycleIntervalSec) * 1000);
    return () => window.clearInterval(timer);
  }, [isOpen, isAutoCycle, config.isPaused, activeItems.length, cycleIntervalSec]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const previewItem = isAutoCycle
    ? activeItems[previewCycleIndex % Math.max(1, activeItems.length)]
    : activeItems[0];

  const palette = getTickerContrastPalette(config.backgroundColor);
  const contrastLabel =
    palette.contrastRatio >= 7
      ? 'AAA Optimal'
      : palette.contrastRatio >= 4.5
        ? 'AA Kontras Baik'
        : 'Kontras Rendah';

  const fourFileBundle = generateThemeFourFileBundle(config, items);

  const selectedExportFile = (() => {
    switch (exportFileKey) {
      case 'css':
        return fourFileBundle.css;
      case 'js':
        return fourFileBundle.js;
      case 'html':
        return fourFileBundle.html;
      case 'ticker-patch':
        return {
          filename: 'keadilan-breaking-news-patch.xml',
          content: generateFullBloggerPatchSnippet(config, items),
          mimeType: 'application/xml;charset=utf-8',
        };
      case 'xml':
      default:
        return fourFileBundle.xml;
    }
  })();

  const xmlSnippet = selectedExportFile.content;
  const xmlFilename = selectedExportFile.filename;

  const handleHexChange = (val: string) => {
    setHexInput(val);
    const cleaned = val.trim();
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(cleaned)) {
      onUpdateConfig({ backgroundColor: cleaned.toUpperCase() });
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newText.trim();
    if (!trimmed) return;
    onAddItem(newLabel, trimmed);
    setNewText('');
  };

  const handleCopyXml = async () => {
    try {
      await navigator.clipboard.writeText(xmlSnippet);
      setCopiedXml(true);
      setTimeout(() => setCopiedXml(false), 2200);
    } catch {
      // Fallback ignored if clipboard blocked
    }
  };

  const handleDownloadSelectedFile = () => {
    downloadTextFile(
      selectedExportFile.filename,
      selectedExportFile.content,
      selectedExportFile.mimeType
    );
  };

  const handleDownloadAllFourFiles = () => {
    const files = [
      fourFileBundle.css,
      fourFileBundle.js,
      fourFileBundle.html,
      fourFileBundle.xml,
    ];
    files.forEach((file, idx) => {
      window.setTimeout(() => {
        downloadTextFile(file.filename, file.content, file.mimeType);
      }, idx * 180);
    });
    setDownloadedAll(true);
    window.setTimeout(() => setDownloadedAll(false), 2600);
  };

  const handleCopyWrapperSnippet = async (key: 'cdn' | 'style' | 'script') => {
    const cdnSnippet = [
      "<!-- 1. Tempel sebelum </head> di Tema > Edit HTML -->",
      "<link href='https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/keadilan-theme.css' rel='stylesheet' type='text/css'/>",
      '',
      '<!-- 2. Tempel sebelum </body> di Tema > Edit HTML -->',
      "<script src='https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/keadilan-theme.js' type='text/javascript'></script>",
    ].join('\n');

    const wrappedStyle = `<style type='text/css'>\n/*<![CDATA[*/\n${fourFileBundle.css.content}\n/*]]>*/\n</style>`;
    const wrappedScript = `<script type='text/javascript'>//<![CDATA[\n${fourFileBundle.js.content}\n//]]></script>`;

    const payload =
      key === 'cdn' ? cdnSnippet : key === 'style' ? wrappedStyle : wrappedScript;

    try {
      await navigator.clipboard.writeText(payload);
      setCopiedHelperKey(key);
      window.setTimeout(() => setCopiedHelperKey(null), 2200);
    } catch {
      // Fallback ignored if clipboard blocked
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Kustomisasi Breaking News"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/55 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <aside className="relative z-10 w-full max-w-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 h-full shadow-2xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-4 h-4 text-[#16A085]" />
            <div>
              <h2 className="text-base font-bold tracking-tight">
                Kustomisasi Breaking News
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Atur durasi kecepatan, warna latar belakang, dan daftar berita
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panel kustomisasi"
            className="w-8 h-8 rounded-md flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-5">
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`pb-2.5 text-xs font-semibold tracking-wide border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-[#16A085] text-[#16A085]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Pengaturan Ticker
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('xml')}
            className={`pb-2.5 text-xs font-semibold tracking-wide border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'xml'
                ? 'border-[#16A085] text-[#16A085]'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Tema Blogger (4 File)
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {activeTab === 'settings' ? (
            <>
              {/* Live Mini Preview */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Pratinjau Langsung
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateConfig({ isPaused: !config.isPaused })}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A085] hover:underline cursor-pointer"
                  >
                    {config.isPaused ? (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Lanjutkan Gerak
                      </>
                    ) : (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        Jeda Gerak
                      </>
                    )}
                  </button>
                </div>
                <div
                  className="rounded-md px-3 py-2 flex items-center gap-2.5 border text-xs overflow-hidden"
                  style={{
                    backgroundColor: config.backgroundColor,
                    color: palette.textColor,
                    borderColor: palette.borderColor,
                  }}
                >
                  <span
                    className="shrink-0 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-sm"
                    style={{
                      backgroundColor: palette.badgeBg,
                      color: palette.badgeText,
                    }}
                  >
                    Breaking
                  </span>
                  <span className="truncate font-medium flex-1 min-w-0">
                    {previewItem ? (
                      <>
                        <span className="font-bold uppercase mr-1.5 opacity-85">
                          [{previewItem.label}]
                        </span>
                        {previewItem.text}
                      </>
                    ) : (
                      'Contoh berita terkini KEADILAN.CO.ID...'
                    )}
                  </span>
                  {isAutoCycle && activeItems.length > 1 && (
                    <span className="font-mono-tabular text-[10px] font-semibold opacity-80 shrink-0">
                      {(previewCycleIndex % activeItems.length) + 1}/{activeItems.length}
                    </span>
                  )}
                </div>
              </section>

              {/* Auto-Cycle Through Active Breaking Items */}
              <section className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <label
                      htmlFor="auto-cycle-toggle"
                      className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#16A085]" />
                      Putar Bergantian Otomatis
                    </label>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Otomatis perbarui konten ticker secara berkala melalui semua berita aktif ({activeItems.length} item).
                    </p>
                  </div>

                  <button
                    id="auto-cycle-toggle"
                    type="button"
                    role="switch"
                    aria-checked={isAutoCycle}
                    aria-label="Putar bergantian otomatis semua berita breaking aktif"
                    onClick={() => onUpdateConfig({ autoCycle: !isAutoCycle })}
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors cursor-pointer ${
                      isAutoCycle
                        ? 'bg-[#16A085] border-[#16A085]'
                        : 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        isAutoCycle ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {isAutoCycle && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-400">
                      <span>Interval pergantian berita</span>
                      <span className="font-mono-tabular font-semibold text-[#16A085]">
                        Setiap {cycleIntervalSec} detik
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {AUTO_CYCLE_INTERVALS.map((sec) => {
                        const selected = cycleIntervalSec === sec;
                        return (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => onUpdateConfig({ autoCycleInterval: sec })}
                            className={`py-1.5 px-2 rounded border font-mono-tabular text-xs font-semibold transition-colors cursor-pointer ${
                              selected
                                ? 'bg-[#16A085] border-[#16A085] text-white'
                                : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                            }`}
                          >
                            {sec}d
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>

              {/* 1. Durasi / Kecepatan */}
              <section className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="ticker-duration-slider"
                    className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5"
                  >
                    <Gauge className="w-3.5 h-3.5 text-[#16A085]" />
                    Durasi Teks Berjalan
                  </label>
                  <span className="font-mono-tabular text-xs font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
                    {config.duration} detik
                  </span>
                </div>

                <input
                  id="ticker-duration-slider"
                  type="range"
                  min={8}
                  max={90}
                  step={1}
                  value={config.duration}
                  onChange={(e) => onUpdateConfig({ duration: Number(e.target.value) })}
                  className="w-full accent-[#16A085] cursor-pointer"
                />

                <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>8s (Cepat)</span>
                  <span>45s (Sedang)</span>
                  <span>90s (Lambat)</span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {SPEED_PRESETS.map((preset) => {
                    const isSelected = config.duration === preset.duration;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => onUpdateConfig({ duration: preset.duration })}
                        className={`py-2 px-3 rounded border text-xs font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#16A085] border-[#16A085] text-white'
                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                        }`}
                      >
                        {preset.label} ({preset.duration}s)
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* 2. Warna Latar Belakang */}
              <section className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#16A085]" />
                    Warna Latar Belakang
                  </span>
                  <span className="font-mono-tabular text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    Rasio {palette.contrastRatio}:1 · {contrastLabel}
                  </span>
                </div>

                {/* Curated Swatches */}
                <div className="grid grid-cols-4 gap-2">
                  {TICKER_COLOR_PRESETS.map((swatch) => {
                    const selected =
                      config.backgroundColor.toUpperCase() === swatch.hex.toUpperCase();
                    return (
                      <button
                        key={swatch.hex}
                        type="button"
                        onClick={() => onUpdateConfig({ backgroundColor: swatch.hex })}
                        className={`group flex flex-col items-start p-2 rounded border text-left transition-all cursor-pointer ${
                          selected
                            ? 'border-[#16A085] ring-1 ring-[#16A085] bg-zinc-50 dark:bg-zinc-900'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                        }`}
                      >
                        <div className="w-full h-5 rounded-sm mb-1.5 flex items-center justify-end px-1 border border-black/10" style={{ backgroundColor: swatch.hex }}>
                          {selected && <Check className="w-3 h-3 text-white drop-shadow" />}
                        </div>
                        <span className="text-[11px] font-medium leading-tight truncate w-full">
                          {swatch.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Color Picker + Hex Field */}
                <div className="flex items-center gap-2.5 pt-1">
                  <label
                    htmlFor="ticker-color-picker"
                    className="text-xs font-medium text-zinc-600 dark:text-zinc-400 shrink-0"
                  >
                    Pilih Bebas:
                  </label>
                  <input
                    id="ticker-color-picker"
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => onUpdateConfig({ backgroundColor: e.target.value.toUpperCase() })}
                    className="w-9 h-9 rounded border border-zinc-300 dark:border-zinc-700 bg-transparent cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={hexInput}
                    onChange={(e) => handleHexChange(e.target.value)}
                    placeholder="#B91C1C"
                    maxLength={7}
                    aria-label="Kode warna hex"
                    className="flex-1 h-9 px-3 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-mono-tabular text-xs uppercase focus:outline-none focus:border-[#16A085]"
                  />
                </div>
              </section>

              {/* 3. Kelola Daftar Breaking News */}
              <section className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Daftar Teks Berita ({items.filter((i) => i.active).length} Aktif)
                  </span>
                  <button
                    type="button"
                    onClick={onResetDefaults}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Default
                  </button>
                </div>

                {/* Form Tambah Berita Baru */}
                <form onSubmit={handleAddSubmit} className="space-y-2 p-3 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <select
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value as BreakingNewsItem['label'])}
                      aria-label="Kategori berita berjalan"
                      className="h-8 px-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-semibold focus:outline-none focus:border-[#16A085]"
                    >
                      {LABEL_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      placeholder="Tulis judul breaking news baru..."
                      className="flex-1 h-8 px-2.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs focus:outline-none focus:border-[#16A085]"
                    />
                    <button
                      type="submit"
                      disabled={!newText.trim()}
                      className="h-8 px-3 rounded bg-[#16A085] text-white text-xs font-semibold inline-flex items-center gap-1 disabled:opacity-40 cursor-pointer hover:bg-[#138D75]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah
                    </button>
                  </div>
                </form>

                {/* Item List */}
                <div className="space-y-2">
                  {items.map((item) => {
                    const isEditing = editingId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-md border transition-colors ${
                          item.active
                            ? 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800'
                            : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200/70 dark:border-zinc-800/60 opacity-65'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#16A085] block mb-1">
                              {item.label}
                            </span>
                            {isEditing ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={editingText}
                                  onChange={(e) => setEditingText(e.target.value)}
                                  className="flex-1 h-7 px-2 rounded border border-[#16A085] bg-white dark:bg-zinc-900 text-xs focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (editingText.trim()) {
                                      onEditItem(item.id, editingText.trim());
                                    }
                                    setEditingId(null);
                                  }}
                                  className="h-7 px-2.5 rounded bg-[#16A085] text-white text-[11px] font-semibold cursor-pointer"
                                >
                                  Simpan
                                </button>
                              </div>
                            ) : (
                              <p
                                onClick={() => {
                                  setEditingId(item.id);
                                  setEditingText(item.text);
                                }}
                                title="Klik untuk sunting teks"
                                className="text-xs leading-relaxed text-zinc-800 dark:text-zinc-200 cursor-text hover:text-[#16A085]"
                              >
                                {item.text}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => onToggleItem(item.id)}
                              title={item.active ? 'Sembunyikan dari ticker' : 'Tampilkan di ticker'}
                              aria-label={item.active ? 'Sembunyikan berita' : 'Tampilkan berita'}
                              className="w-7 h-7 rounded flex items-center justify-center text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                            >
                              {item.active ? (
                                <Eye className="w-3.5 h-3.5 text-[#16A085]" />
                              ) : (
                                <EyeOff className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteItem(item.id)}
                              title="Hapus item"
                              aria-label="Hapus berita berjalan"
                              className="w-7 h-7 rounded flex items-center justify-center text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          ) : (
            /* Tab Tema Blogger (4 File Utama: XML, CSS, JS, HTML) */
            <section className="space-y-4">
              {/* 4-File Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    4 File Utama Tema
                  </span>
                  <button
                    type="button"
                    onClick={handleDownloadAllFourFiles}
                    className="h-7 px-2.5 rounded bg-[#0F2A44] hover:bg-[#16A085] dark:bg-[#16A085] dark:hover:bg-[#138D75] text-white text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {downloadedAll ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>4 File Diunduh</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3 h-3" />
                        <span>Unduh Semua (4 File)</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(
                    [
                      { key: 'xml', label: 'XML Blogger', ext: '.xml' },
                      { key: 'css', label: 'CSS Tema', ext: '.css' },
                      { key: 'js', label: 'JavaScript', ext: '.js' },
                      { key: 'html', label: 'HTML Struktur', ext: '.html' },
                    ] as const
                  ).map((item) => {
                    const active = exportFileKey === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setExportFileKey(item.key)}
                        className={`py-2 px-2 rounded-md border text-left transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#0F2A44] border-[#0F2A44] text-white dark:bg-[#16A085] dark:border-[#16A085]'
                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                        }`}
                      >
                        <div className="text-[11px] font-bold leading-tight">{item.label}</div>
                        <div className="font-mono-tabular text-[10px] opacity-75">{item.ext}</div>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setExportFileKey('ticker-patch')}
                  className={`w-full py-1.5 px-3 rounded border text-[11px] font-semibold transition-colors cursor-pointer ${
                    exportFileKey === 'ticker-patch'
                      ? 'bg-[#0F2A44] border-[#0F2A44] text-white dark:bg-[#16A085] dark:border-[#16A085]'
                      : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                  }`}
                >
                  Atau Ekspor Snippet Ticker Saja (untuk Template Lama)
                </button>
              </div>

              <div className="p-3.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {exportFileKey === 'xml' && 'File 4: Tema Lengkap Blogger (.xml)'}
                    {exportFileKey === 'css' && 'File 1: Stylesheet Utama (.css)'}
                    {exportFileKey === 'js' && 'File 2: Skrip Interaktif Utama (.js)'}
                    {exportFileKey === 'html' && 'File 3: Struktur HTML & Slot Gadget (.html)'}
                    {exportFileKey === 'ticker-patch' && 'Snippet Ticker untuk Template Lama'}
                  </p>
                  <span className="font-mono-tabular text-[10px] text-[#16A085]">
                    {xmlFilename}
                  </span>
                </div>

                <p>
                  {exportFileKey === 'xml' && (
                    <>
                      Berisi variabel <strong>Desainer Tema</strong> (warna, tipografi, lebar portal,
                      durasi &amp; warna ticker{' '}
                      <span className="font-mono-tabular font-semibold">{config.backgroundColor}</span>{' '}
                      / {config.duration}s) serta slot gadget bebas edit via{' '}
                      <strong>Tata Letak</strong>.
                    </>
                  )}
                  {exportFileKey === 'css' && (
                    <>
                      Memuat seluruh aturan gaya editorial, mode gelap, ukuran huruf, ticker{' '}
                      <span className="font-mono-tabular font-semibold">{config.backgroundColor}</span>,
                      cetak artikel, serta tata letak wireframe <code className="font-mono-tabular">body#layout</code>.
                    </>
                  )}
                  {exportFileKey === 'js' && (
                    <>
                      Skrip vanilla JS modular untuk jeda/putar ticker, mode putar bergantian otomatis,
                      drawer menu seluler, mode gelap, pengubah tampilan Daftar/Kisi, progres baca,
                      dan cetak artikel.
                    </>
                  )}
                  {exportFileKey === 'html' && (
                    <>
                      Cetak biru struktur HTML5 lengkap dengan penanda slot gadget (Breaking News,
                      Header, Navigasi, Banner Atas, Feed, Sidebar, dan Footer 3 kolom) yang terhubung
                      ke file CSS dan JS.
                    </>
                  )}
                  {exportFileKey === 'ticker-patch' && (
                    <>
                      Potongan variabel, CSS, dan HTML khusus untuk dipasang ke template Blogspot lama
                      dengan warna{' '}
                      <span className="font-mono-tabular font-semibold">{config.backgroundColor}</span>{' '}
                      ({config.duration}s).
                    </>
                  )}
                </p>

                <div className="text-[11px] text-zinc-600 dark:text-zinc-300 pt-1.5 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
                  <div>
                    <strong>Desainer Tema:</strong> Warna, font, lebar portal &amp; ticker dapat diubah langsung di <em>Tema → Sesuaikan → Lanjutan</em>.
                  </div>
                  <div>
                    <strong>Tata Letak:</strong> Semua bagian (<em>Breaking News, Logo, Menu Rubrik, Banner Atas, Atas/Bawah Berita, Sidebar, Footer 1-3</em>) mendukung <em>Tambah, Edit, Hapus &amp; Geser Gadget</em>.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyXml}
                  className="h-9 px-3 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedXml ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Kode Tersalin
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Salin Kode
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSelectedFile}
                  className="flex-1 h-9 px-3.5 rounded bg-[#16A085] hover:bg-[#138D75] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh {xmlFilename}</span>
                </button>
              </div>

              {/* Panduan Instalasi Blogspot (4-File & Alternatif Copy-Paste Edit HTML) */}
              <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setGuideOpen((prev) => !prev)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 bg-zinc-50 dark:bg-zinc-900/70 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    <BookOpen className="w-3.5 h-3.5 text-[#16A085]" />
                    Panduan Instalasi di Blogspot
                  </span>
                  {guideOpen ? (
                    <ChevronUp className="w-4 h-4 text-zinc-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  )}
                </button>

                {guideOpen && (
                  <div className="p-3.5 space-y-3 border-t border-zinc-200 dark:border-zinc-800 text-[11px] leading-relaxed text-zinc-700 dark:text-zinc-300">
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setGuideMode('files')}
                        className={`py-1.5 px-2.5 rounded border text-[11px] font-semibold transition-colors cursor-pointer ${
                          guideMode === 'files'
                            ? 'bg-[#0F2A44] border-[#0F2A44] text-white dark:bg-[#16A085] dark:border-[#16A085]'
                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-zinc-400'
                        }`}
                      >
                        1. File CSS, JS &amp; HTML
                      </button>
                      <button
                        type="button"
                        onClick={() => setGuideMode('copypaste')}
                        className={`py-1.5 px-2.5 rounded border text-[11px] font-semibold transition-colors cursor-pointer ${
                          guideMode === 'copypaste'
                            ? 'bg-[#0F2A44] border-[#0F2A44] text-white dark:bg-[#16A085] dark:border-[#16A085]'
                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-zinc-400'
                        }`}
                      >
                        2. Copy-Paste Edit HTML
                      </button>
                    </div>

                    {guideMode === 'files' ? (
                      <div className="space-y-2.5">
                        <p className="text-zinc-600 dark:text-zinc-400">
                          Blogspot tidak menyediakan folder hosting lokal untuk file terpisah. Anda dapat mengunggah{' '}
                          <code className="font-mono-tabular">keadilan-theme.css</code> &amp;{' '}
                          <code className="font-mono-tabular">keadilan-theme.js</code> ke repositori GitHub (lalu muat via CDN jsDelivr) atau langsung pasang melalui{' '}
                          <strong>Tema → Edit HTML</strong> &amp; <strong>Tata Letak</strong>.
                        </p>
                        <ol className="list-decimal pl-4 space-y-1.5">
                          <li>
                            <strong>Host File CSS &amp; JS:</strong> Unggah{' '}
                            <code className="font-mono-tabular">keadilan-theme.css</code> dan{' '}
                            <code className="font-mono-tabular">keadilan-theme.js</code> ke GitHub publik, lalu gunakan URL CDN{' '}
                            <code className="font-mono-tabular">cdn.jsdelivr.net/gh/USER/REPO@main/...</code>.
                          </li>
                          <li>
                            <strong>Tautkan CSS &amp; JS di Edit HTML:</strong> Buka{' '}
                            <em>Tema → Edit HTML</em>, tempel tag <code className="font-mono-tabular">&lt;link ... /&gt;</code> tepat di atas{' '}
                            <code className="font-mono-tabular">&lt;/head&gt;</code> dan{' '}
                            <code className="font-mono-tabular">&lt;script src=...&gt;&lt;/script&gt;</code> tepat di atas{' '}
                            <code className="font-mono-tabular">&lt;/body&gt;</code> (pastikan memakai penutup XHTML{' '}
                            <code className="font-mono-tabular">/&gt;</code>).
                          </li>
                          <li>
                            <strong>Pasang Struktur HTML:</strong> Salin blok slot dari{' '}
                            <code className="font-mono-tabular">keadilan-theme-structure.html</code> (mis. Breaking News, Kotak Redaksi, Footer) ke{' '}
                            <em>Tata Letak → Tambahkan Gadget → HTML/JavaScript</em> atau susun di dalam{' '}
                            <code className="font-mono-tabular">&lt;body&gt;</code>.
                          </li>
                          <li>
                            <strong>Atau Pakai File XML Lengkap:</strong> Jika ingin sekali klik tanpa hosting eksternal, unggah langsung{' '}
                            <code className="font-mono-tabular">keadilan-co-id-blogspot-theme.xml</code> via{' '}
                            <em>Tema → Pulihkan</em> (CSS, JS, HTML, &amp; slot gadget sudah menyatu).
                          </li>
                        </ol>
                        <button
                          type="button"
                          onClick={() => handleCopyWrapperSnippet('cdn')}
                          className="w-full h-8 px-2.5 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {copiedHelperKey === 'cdn' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#16A085]" />
                              <span>Tag CDN &lt;link&gt; &amp; &lt;script&gt; Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin Template Tag CDN (&lt;link&gt; &amp; &lt;script&gt;)</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                          <div className="font-bold text-zinc-900 dark:text-zinc-100">
                            Cara A — Copy-Paste Penuh (Direkomendasikan)
                          </div>
                          <ol className="list-decimal pl-4 space-y-1">
                            <li>
                              Buka <em>Tema → Cadangkan</em> untuk menyimpan tema lama.
                            </li>
                            <li>
                              Klik panah di samping <em>Sesuaikan → Edit HTML</em>, tekan{' '}
                              <code className="font-mono-tabular">Ctrl+A</code> lalu hapus seluruh kode lama.
                            </li>
                            <li>
                              Pilih tab <strong>XML Blogger</strong> di atas, klik <strong>Salin Kode</strong>, tempelkan ke editor Edit HTML, lalu klik ikon <strong>Simpan</strong> (disket).
                            </li>
                          </ol>
                        </div>

                        <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
                          <div className="font-bold text-zinc-900 dark:text-zinc-100">
                            Cara B — Copy-Paste Parsial (CSS, HTML, JS ke Tema Lama)
                          </div>
                          <ol className="list-decimal pl-4 space-y-1">
                            <li>
                              <strong>CSS:</strong> Tempel di <em>Tema → Sesuaikan → Lanjutan → Tambahkan CSS</em>, ATAU klik tombol salin <code className="font-mono-tabular">&lt;style&gt;</code> di bawah lalu tempel tepat di atas{' '}
                              <code className="font-mono-tabular">&lt;/head&gt;</code> (hindari menempel <code className="font-mono-tabular">--variabel</code> ke dalam <code className="font-mono-tabular">&lt;b:skin&gt;</code> agar tidak ditolak parser GSS).
                            </li>
                            <li>
                              <strong>HTML:</strong> Salin bagian komponen dari{' '}
                              <code className="font-mono-tabular">keadilan-theme-structure.html</code> ke gadget <em>HTML/JavaScript</em> di <em>Tata Letak</em> atau ke <code className="font-mono-tabular">&lt;body&gt;</code> (pastikan tag tunggal memakai <code className="font-mono-tabular">/&gt;</code> dan <code className="font-mono-tabular">&amp;</code> ditulis <code className="font-mono-tabular">&amp;amp;</code>).
                            </li>
                            <li>
                              <strong>JavaScript:</strong> Klik tombol salin <code className="font-mono-tabular">&lt;script&gt;</code> ber-CDATA di bawah lalu tempel tepat di atas <code className="font-mono-tabular">&lt;/body&gt;</code> di Edit HTML.
                            </li>
                          </ol>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyWrapperSnippet('style')}
                            className="h-8 px-2 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-[11px] font-semibold inline-flex items-center justify-center gap-1 cursor-pointer"
                          >
                            {copiedHelperKey === 'style' ? (
                              <>
                                <Check className="w-3 h-3 text-[#16A085]" />
                                <span>&lt;style&gt; Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Salin CSS &lt;style&gt;</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyWrapperSnippet('script')}
                            className="h-8 px-2 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-[11px] font-semibold inline-flex items-center justify-center gap-1 cursor-pointer"
                          >
                            {copiedHelperKey === 'script' ? (
                              <>
                                <Check className="w-3 h-3 text-[#16A085]" />
                                <span>&lt;script&gt; Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Salin JS &lt;script&gt;</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <pre className="p-3.5 rounded-md bg-zinc-950 text-zinc-100 border border-zinc-800 text-[11px] leading-relaxed font-mono-tabular overflow-x-auto max-h-[55vh]">
                <code>{xmlSnippet}</code>
              </pre>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
};
