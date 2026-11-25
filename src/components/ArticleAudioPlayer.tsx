import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Headphones,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Square,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { NewsArticle } from '../data/newsData';

interface ArticleAudioPlayerProps {
  article: NewsArticle;
  onActiveParagraphChange?: (paragraphIndex: number | null) => void;
}

interface SpeechSegment {
  label: string;
  text: string;
  paragraphIndex: number | null;
}

const PLAYBACK_SPEEDS = [0.9, 1, 1.25, 1.5] as const;
const VOLUME_STORAGE_KEY = 'keadilan_tts_volume';

function loadSavedVolume(): number {
  try {
    const raw = localStorage.getItem(VOLUME_STORAGE_KEY);
    if (raw !== null) {
      const parsed = Number(raw);
      if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage error
  }
  return 1;
}

export const ArticleAudioPlayer: React.FC<ArticleAudioPlayerProps> = ({
  article,
  onActiveParagraphChange,
}) => {
  const isSpeechSupported =
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof SpeechSynthesisUtterance !== 'undefined';

  const segments = useMemo<SpeechSegment[]>(() => {
    const list: SpeechSegment[] = [
      {
        label: 'Pembuka & Judul',
        text: `${article.title}. Rubrik ${article.category}, ditulis oleh ${article.author}.`,
        paragraphIndex: null,
      },
      ...article.content.map((paragraph, idx) => ({
        label: `Paragraf ${idx + 1} dari ${article.content.length}`,
        text: paragraph,
        paragraphIndex: idx,
      })),
    ];

    if (article.pullQuote) {
      list.push({
        label: 'Kutipan Sorotan',
        text: `Kutipan redaksi: ${article.pullQuote}.`,
        paragraphIndex: null,
      });
    }

    return list;
  }, [article]);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [charOffsetInSegment, setCharOffsetInSegment] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(1); // 1x default
  const [volume, setVolume] = useState<number>(() => loadSavedVolume());
  const [speechError, setSpeechError] = useState<string | null>(null);

  const sessionIdRef = useRef(0);
  const currentCharRef = useRef(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const volumeRef = useRef(volume);
  const lastNonZeroVolumeRef = useRef(volume > 0 ? volume : 0.8);
  const volumeRestartTimerRef = useRef<number | null>(null);

  volumeRef.current = volume;
  if (volume > 0) {
    lastNonZeroVolumeRef.current = volume;
  }

  const playbackSpeed = PLAYBACK_SPEEDS[speedIndex];

  useEffect(() => {
    try {
      localStorage.setItem(VOLUME_STORAGE_KEY, String(volume));
    } catch {
      // Ignore storage error
    }
  }, [volume]);

  // Notify parent which paragraph is currently highlighted by Read-Aloud
  useEffect(() => {
    if (!onActiveParagraphChange) return;
    if (!isPlaying && !isPaused) {
      onActiveParagraphChange(null);
      return;
    }
    const activeSegment = segments[currentSegmentIndex];
    onActiveParagraphChange(activeSegment?.paragraphIndex ?? null);
  }, [
    isPlaying,
    isPaused,
    currentSegmentIndex,
    segments,
    onActiveParagraphChange,
  ]);

  // Load available SpeechSynthesis voices (prefer Indonesian id-ID)
  useEffect(() => {
    if (!isSpeechSupported) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length === 0) return;

      const sorted = [...available].sort((a, b) => {
        const aId = a.lang.toLowerCase().startsWith('id') ? 0 : 1;
        const bId = b.lang.toLowerCase().startsWith('id') ? 0 : 1;
        if (aId !== bId) return aId - bId;
        return a.name.localeCompare(b.name);
      });

      setVoices(sorted);
      setSelectedVoiceURI((prev) => {
        if (prev && sorted.some((v) => v.voiceURI === prev)) return prev;
        const indonesianVoice = sorted.find((v) =>
          v.lang.toLowerCase().startsWith('id')
        );
        return indonesianVoice?.voiceURI ?? sorted[0]?.voiceURI ?? '';
      });
    };

    loadVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', loadVoices);
    };
  }, [isSpeechSupported]);

  const clearPendingVolumeRestart = useCallback(() => {
    if (volumeRestartTimerRef.current !== null) {
      window.clearTimeout(volumeRestartTimerRef.current);
      volumeRestartTimerRef.current = null;
    }
  }, []);

  const stopSpeechEngine = useCallback(() => {
    clearPendingVolumeRestart();
    sessionIdRef.current += 1;
    utteranceRef.current = null;
    if (isSpeechSupported) {
      window.speechSynthesis.cancel();
    }
  }, [clearPendingVolumeRestart, isSpeechSupported]);

  // Reset and cancel any ongoing synthesis when switching articles or unmounting
  useEffect(() => {
    stopSpeechEngine();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSegmentIndex(0);
    setCharOffsetInSegment(0);
    currentCharRef.current = 0;
    setSpeechError(null);

    return () => {
      stopSpeechEngine();
      onActiveParagraphChange?.(null);
    };
  }, [article.id, stopSpeechEngine, onActiveParagraphChange]);

  const speakFromSegment = useCallback(
    (
      startIndex: number,
      startCharOffset = 0,
      rateOverride?: number,
      volumeOverride?: number
    ) => {
      if (!isSpeechSupported) {
        setSpeechError(
          'Peramban Anda tidak mendukung fitur pembaca suara (Web Speech API).'
        );
        return;
      }

      if (startIndex < 0 || startIndex >= segments.length) {
        stopSpeechEngine();
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentSegmentIndex(0);
        setCharOffsetInSegment(0);
        currentCharRef.current = 0;
        return;
      }

      stopSpeechEngine();
      const activeSession = sessionIdRef.current;
      const segment = segments[startIndex];
      const safeOffset =
        startCharOffset > 0 && startCharOffset < segment.text.length - 4
          ? startCharOffset
          : 0;
      const textToSpeak = segment.text.slice(safeOffset);

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const chosenVoice = voices.find((v) => v.voiceURI === selectedVoiceURI);
      if (chosenVoice) {
        utterance.voice = chosenVoice;
        utterance.lang = chosenVoice.lang;
      } else {
        utterance.lang = 'id-ID';
      }
      utterance.rate = rateOverride ?? playbackSpeed;
      utterance.volume = volumeOverride ?? volumeRef.current;
      utterance.pitch = 1;

      utterance.onstart = () => {
        if (sessionIdRef.current !== activeSession) return;
        setSpeechError(null);
        setIsPlaying(true);
        setIsPaused(false);
        setCurrentSegmentIndex(startIndex);
      };

      utterance.onboundary = (event) => {
        if (sessionIdRef.current !== activeSession) return;
        if (typeof event.charIndex === 'number') {
          const absoluteOffset = safeOffset + event.charIndex;
          currentCharRef.current = absoluteOffset;
          setCharOffsetInSegment(absoluteOffset);
        }
      };

      utterance.onend = () => {
        if (sessionIdRef.current !== activeSession) return;
        currentCharRef.current = 0;
        setCharOffsetInSegment(0);

        const nextIndex = startIndex + 1;
        if (nextIndex < segments.length) {
          speakFromSegment(nextIndex, 0, rateOverride, volumeOverride);
        } else {
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentSegmentIndex(0);
        }
      };

      utterance.onerror = (event) => {
        if (sessionIdRef.current !== activeSession) return;
        // 'canceled' and 'interrupted' occur during normal user seeks/stops
        if (event.error === 'canceled' || event.error === 'interrupted') {
          return;
        }
        setIsPlaying(false);
        setIsPaused(false);
        setSpeechError(
          'Gagal memutar suara artikel pada perangkat ini. Coba pilih suara lain atau ulangi.'
        );
      };

      utteranceRef.current = utterance;
      setCurrentSegmentIndex(startIndex);
      setCharOffsetInSegment(safeOffset);
      currentCharRef.current = safeOffset;
      setIsPlaying(true);
      setIsPaused(false);
      setSpeechError(null);

      window.speechSynthesis.speak(utterance);
    },
    [
      isSpeechSupported,
      playbackSpeed,
      segments,
      selectedVoiceURI,
      stopSpeechEngine,
      voices,
    ]
  );

  const handlePlay = () => {
    if (!isSpeechSupported || isPlaying) return;
    if (isPaused) {
      speakFromSegment(currentSegmentIndex, charOffsetInSegment);
      return;
    }
    speakFromSegment(currentSegmentIndex, 0);
  };

  const handlePause = () => {
    if (!isSpeechSupported || !isPlaying) return;
    // Cancel & save exact character offset so resuming never stalls on browser pause bugs
    const resumeOffset = currentCharRef.current;
    stopSpeechEngine();
    setIsPlaying(false);
    setIsPaused(true);
    setCharOffsetInSegment(resumeOffset);
  };

  const handleStop = () => {
    stopSpeechEngine();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSegmentIndex(0);
    setCharOffsetInSegment(0);
    currentCharRef.current = 0;
    setSpeechError(null);
  };

  const handlePrevSegment = () => {
    const target = Math.max(0, currentSegmentIndex - 1);
    currentCharRef.current = 0;
    setCharOffsetInSegment(0);
    setCurrentSegmentIndex(target);
    if (isPlaying) {
      speakFromSegment(target, 0);
    }
  };

  const handleNextSegment = () => {
    const target = Math.min(segments.length - 1, currentSegmentIndex + 1);
    currentCharRef.current = 0;
    setCharOffsetInSegment(0);
    setCurrentSegmentIndex(target);
    if (isPlaying) {
      speakFromSegment(target, 0);
    }
  };

  const handleSeekSegment = (index: number) => {
    const clamped = Math.min(segments.length - 1, Math.max(0, index));
    currentCharRef.current = 0;
    setCharOffsetInSegment(0);
    setCurrentSegmentIndex(clamped);
    if (isPlaying) {
      speakFromSegment(clamped, 0);
    }
  };

  const handleCycleSpeed = () => {
    const nextIdx = (speedIndex + 1) % PLAYBACK_SPEEDS.length;
    const nextRate = PLAYBACK_SPEEDS[nextIdx];
    setSpeedIndex(nextIdx);
    if (isPlaying) {
      speakFromSegment(currentSegmentIndex, currentCharRef.current, nextRate);
    }
  };

  const applyVolumeChange = (nextVolume: number, immediate = false) => {
    const clamped = Math.min(1, Math.max(0, Number(nextVolume.toFixed(2))));
    volumeRef.current = clamped;
    setVolume(clamped);

    if (!isPlaying) return;

    clearPendingVolumeRestart();
    const resumeOffset = currentCharRef.current;
    if (immediate) {
      speakFromSegment(currentSegmentIndex, resumeOffset, playbackSpeed, clamped);
      return;
    }

    volumeRestartTimerRef.current = window.setTimeout(() => {
      volumeRestartTimerRef.current = null;
      speakFromSegment(
        currentSegmentIndex,
        currentCharRef.current,
        playbackSpeed,
        clamped
      );
    }, 140);
  };

  const handleToggleMute = () => {
    if (volume > 0) {
      lastNonZeroVolumeRef.current = volume;
      applyVolumeChange(0, true);
    } else {
      applyVolumeChange(lastNonZeroVolumeRef.current || 0.8, true);
    }
  };

  const handleVoiceChange = (voiceUri: string) => {
    setSelectedVoiceURI(voiceUri);
    if (isPlaying) {
      // Restart current offset cleanly with newly selected voice
      const offset = currentCharRef.current;
      window.setTimeout(() => {
        speakFromSegment(currentSegmentIndex, offset);
      }, 20);
    }
  };

  const currentSegment = segments[currentSegmentIndex] ?? segments[0];
  const segmentFraction =
    currentSegment && currentSegment.text.length > 0
      ? Math.min(1, charOffsetInSegment / currentSegment.text.length)
      : 0;
  const overallProgressPercent =
    segments.length > 0
      ? Math.min(
          100,
          ((currentSegmentIndex + segmentFraction) / segments.length) * 100
        )
      : 0;

  const volumePercent = Math.round(volume * 100);
  const canStop = isPlaying || isPaused || currentSegmentIndex > 0;

  const VolumeIcon =
    volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <section
      aria-label="Kontrol Baca Lantang Artikel"
      className="print-hidden rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/70 p-4 space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded bg-[#0F2A44] text-white flex items-center justify-center shrink-0">
            <Headphones className="w-3.5 h-3.5 text-[#5EEAD4]" aria-hidden="true" />
          </span>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#16A085]">
              Baca Lantang · Read-Aloud
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Putar, jeda, hentikan, dan atur volume pembacaan artikel otomatis.
            </p>
          </div>
        </div>

        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-1.5 text-[11px] font-mono-tabular text-zinc-500 dark:text-zinc-400"
        >
          {isSpeechSupported ? (
            <VolumeIcon
              className={`w-3.5 h-3.5 ${
                volume === 0 ? 'text-zinc-400' : 'text-[#16A085]'
              }`}
              aria-hidden="true"
            />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
          )}
          <span>
            {!isSpeechSupported
              ? 'Tidak didukung'
              : isPlaying
                ? `Membacakan (${currentSegmentIndex + 1}/${segments.length})`
                : isPaused
                  ? 'Dijeda'
                  : 'Siap didengar'}
          </span>
        </div>
      </div>

      {speechError && (
        <div
          role="alert"
          className="text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded px-3 py-2"
        >
          {speechError}
        </div>
      )}

      {/* Primary Read-Aloud Transport Controls + Volume Slider */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
        {/* Dedicated Play, Pause, Stop Cluster */}
        <div
          role="group"
          aria-label="Kontrol pemutaran baca lantang"
          className="flex flex-wrap items-center gap-1.5"
        >
          <button
            type="button"
            onClick={handlePlay}
            disabled={!isSpeechSupported || isPlaying}
            aria-pressed={isPlaying}
            aria-label={isPaused ? 'Lanjutkan baca lantang' : 'Putar baca lantang'}
            title={isPaused ? 'Lanjutkan pembacaan' : 'Putar pembacaan artikel'}
            className={`h-8 px-3 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed ${
              isPlaying
                ? 'bg-[#16A085]/15 text-[#16A085] border border-[#16A085]/40'
                : 'bg-[#16A085] hover:bg-[#138D75] text-white disabled:opacity-45'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
            <span>{isPaused ? 'Lanjut' : 'Putar'}</span>
          </button>

          <button
            type="button"
            onClick={handlePause}
            disabled={!isSpeechSupported || !isPlaying}
            aria-pressed={isPaused}
            aria-label="Jeda baca lantang"
            title="Jeda pembacaan"
            className={`h-8 px-2.5 rounded-md border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
              isPaused
                ? 'border-[#16A085] bg-[#16A085]/10 text-[#16A085]'
                : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-200 hover:border-[#16A085] hover:text-[#16A085]'
            }`}
          >
            <Pause className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
            <span>Jeda</span>
          </button>

          <button
            type="button"
            onClick={handleStop}
            disabled={!isSpeechSupported || !canStop}
            aria-label="Hentikan baca lantang dan kembali ke awal"
            title="Hentikan pembacaan"
            className="h-8 px-2.5 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-200 hover:border-red-500 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-40 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Square className="w-3 h-3 fill-current" aria-hidden="true" />
            <span>Berhenti</span>
          </button>
        </div>

        {/* Dedicated Accessible Volume Slider */}
        <div
          role="group"
          aria-label="Kontrol volume baca lantang"
          className="flex items-center gap-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md px-2.5 h-8"
        >
          <button
            type="button"
            onClick={handleToggleMute}
            disabled={!isSpeechSupported}
            aria-pressed={volume === 0}
            aria-label={volume === 0 ? 'Aktifkan suara pembaca' : 'Bisukan suara pembaca'}
            title={volume === 0 ? 'Aktifkan suara' : 'Bisukan suara'}
            className="text-zinc-600 dark:text-zinc-300 hover:text-[#16A085] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center"
          >
            <VolumeIcon className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          <label className="flex items-center gap-2 cursor-pointer">
            <span className="sr-only">Volume suara pembaca</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              disabled={!isSpeechSupported}
              onChange={(e) => applyVolumeChange(Number(e.target.value))}
              aria-label="Volume baca lantang"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={volumePercent}
              aria-valuetext={`${volumePercent} persen`}
              className="w-20 sm:w-24 h-1.5 accent-[#16A085] cursor-pointer disabled:cursor-not-allowed"
            />
          </label>

          <span className="font-mono-tabular text-[11px] font-medium text-zinc-600 dark:text-zinc-300 w-8 text-right">
            {volumePercent}%
          </span>
        </div>
      </div>

      {/* Segment Navigation, Progress Scrubber & Speed */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handlePrevSegment}
            disabled={!isSpeechSupported || currentSegmentIndex === 0}
            aria-label="Bagian sebelumnya"
            title="Bagian sebelumnya"
            className="w-8 h-8 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300 hover:border-[#16A085] hover:text-[#16A085] disabled:opacity-40 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <SkipBack className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleNextSegment}
            disabled={!isSpeechSupported || currentSegmentIndex >= segments.length - 1}
            aria-label="Bagian berikutnya"
            title="Bagian berikutnya"
            className="w-8 h-8 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300 hover:border-[#16A085] hover:text-[#16A085] disabled:opacity-40 flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <SkipForward className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 min-w-[160px] space-y-1">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="truncate font-medium text-zinc-700 dark:text-zinc-300">
              {currentSegment.label}
            </span>
            <span className="font-mono-tabular text-zinc-500 dark:text-zinc-400 shrink-0">
              {currentSegmentIndex + 1} / {segments.length}
            </span>
          </div>

          <div className="relative flex items-center">
            <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-[#16A085] transition-[width] duration-200"
                style={{ width: `${overallProgressPercent}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(0, segments.length - 1)}
              step={1}
              value={currentSegmentIndex}
              disabled={!isSpeechSupported}
              onChange={(e) => handleSeekSegment(Number(e.target.value))}
              aria-label="Pilih bagian bacaan artikel"
              className="absolute inset-0 w-full h-4 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Subtle Equalizer Bars */}
        <div
          className="hidden sm:flex items-end gap-0.5 h-4 px-1 shrink-0"
          aria-hidden="true"
        >
          {[0, 1, 2, 3].map((bar) => (
            <span
              key={bar}
              className={`w-0.5 rounded-full bg-[#16A085] transition-all duration-300 ${
                isPlaying
                  ? bar % 2 === 0
                    ? 'h-3.5 motion-safe:animate-pulse'
                    : 'h-2.5 motion-safe:animate-pulse'
                  : 'h-1.5 opacity-40'
              }`}
              style={{
                animationDelay: `${bar * 120}ms`,
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleCycleSpeed}
          disabled={!isSpeechSupported}
          aria-label={`Kecepatan suara ${playbackSpeed}x. Klik untuk mengubah`}
          title="Ubah kecepatan suara"
          className="h-8 px-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 font-mono-tabular text-[11px] font-semibold text-zinc-700 dark:text-zinc-200 hover:border-[#16A085] hover:text-[#16A085] disabled:opacity-40 transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed"
        >
          {playbackSpeed}x
        </button>

        {currentSegmentIndex > 0 && !isPlaying && (
          <button
            type="button"
            onClick={handleStop}
            aria-label="Ulangi dari awal"
            title="Ulangi dari awal"
            className="w-8 h-8 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300 hover:border-[#16A085] hover:text-[#16A085] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Active Segment Preview & Optional Voice Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-zinc-200/70 dark:border-zinc-800/80 text-[11px] text-zinc-500 dark:text-zinc-400">
        <p className="truncate flex-1 min-w-0 italic">
          “{currentSegment.text}”
        </p>

        {voices.length > 0 && (
          <label className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Suara:
            </span>
            <select
              value={selectedVoiceURI}
              onChange={(e) => handleVoiceChange(e.target.value)}
              aria-label="Pilih suara pembaca"
              className="h-7 max-w-[190px] px-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-[11px] text-zinc-700 dark:text-zinc-200 focus:outline-none focus:border-[#16A085] cursor-pointer"
            >
              {voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </section>
  );
};

