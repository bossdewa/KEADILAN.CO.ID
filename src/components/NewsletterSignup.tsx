import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import { NewsCategory } from '../data/newsData';

interface NewsletterSubscription {
  email: string;
  topics: NewsCategory[];
  edition: 'pagi' | 'sore';
  subscribedAt: string;
}

const STORAGE_KEY = 'keadilan_newsletter_subscription';

const BRIEFING_TOPICS: NewsCategory[] = [
  'Sorot',
  'Hukum',
  'Politik',
  'Daerah',
  'Ekonomi',
  'Teknologi',
  'Umum',
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const NewsletterSignup: React.FC = () => {
  const [subscription, setSubscription] = useState<NewsletterSubscription | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.email === 'string') {
          return parsed;
        }
      }
    } catch {
      // Ignore storage read error
    }
    return null;
  });

  const [email, setEmail] = useState('');
  const [edition, setEdition] = useState<'pagi' | 'sore'>('pagi');
  const [selectedTopics, setSelectedTopics] = useState<NewsCategory[]>([
    'Sorot',
    'Hukum',
    'Daerah',
  ]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    try {
      if (subscription) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(subscription));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage write error
    }
  }, [subscription]);

  const toggleTopic = (topic: NewsCategory) => {
    setErrorMessage(null);
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage('Masukkan alamat surel Anda terlebih dahulu.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setErrorMessage('Format surel tidak valid. Contoh: nama@domain.com');
      return;
    }

    if (selectedTopics.length === 0) {
      setErrorMessage('Pilih minimal satu topik buletin harian.');
      return;
    }

    setErrorMessage(null);
    setSubscription({
      email: trimmedEmail,
      topics: selectedTopics,
      edition,
      subscribedAt: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    });
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    if (!subscription) return;
    setEmail(subscription.email);
    setEdition(subscription.edition);
    setSelectedTopics(subscription.topics);
    setErrorMessage(null);
    setIsEditing(true);
  };

  const handleUnsubscribe = () => {
    setSubscription(null);
    setEmail('');
    setEdition('pagi');
    setSelectedTopics(['Sorot', 'Hukum', 'Daerah']);
    setErrorMessage(null);
    setIsEditing(false);
  };

  if (subscription && !isEditing) {
    return (
      <section
        aria-label="Status Langganan Buletin Harian"
        className="p-5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2
            className="w-5 h-5 text-[#16A085] shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="space-y-1 min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#16A085]">
              Langganan Aktif
            </div>
            <h2 className="font-editorial text-lg font-bold leading-snug text-zinc-900 dark:text-zinc-50">
              Buletin Harian Terdaftar
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed break-all">
              Ringkasan dikirim setiap{' '}
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {subscription.edition === 'pagi' ? '06:30 WIB (Edisi Pagi)' : '17:30 WIB (Edisi Sore)'}
              </span>{' '}
              ke <span className="font-mono-tabular font-semibold">{subscription.email}</span>.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
          <div>
            Topik:{' '}
            <span className="text-zinc-800 dark:text-zinc-200 font-medium">
              {subscription.topics.join(' · ')}
            </span>
          </div>
          <div className="font-mono-tabular text-[11px]">
            Terdaftar sejak {subscription.subscribedAt}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleStartEdit}
            className="flex-1 h-10 px-3 rounded border border-zinc-300 dark:border-zinc-700 hover:border-[#16A085] text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A085]"
          >
            Ubah Preferensi
          </button>
          <button
            type="button"
            onClick={handleUnsubscribe}
            className="h-10 px-3 rounded text-xs font-semibold text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
          >
            Berhenti
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Berlangganan Buletin Harian"
      className="p-5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4"
    >
      <div className="space-y-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#16A085]">
            Ringkasan Harian
          </span>
          <Mail className="w-4 h-4 text-[#16A085]" aria-hidden="true" />
        </div>
        <h2 className="font-editorial text-lg font-bold leading-snug text-zinc-900 dark:text-zinc-50">
          Buletin Pagi Sobat Keadilan
        </h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Dapatkan intisari berita hukum, kebijakan publik, dan kabar daerah terverifikasi langsung
          di kotak masuk Anda setiap hari.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
        {/* Edition Timing Segmented Toggle */}
        <div className="space-y-1.5">
          <span className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
            Jadwal Pengiriman
          </span>
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-md bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setEdition('pagi')}
              className={`h-8 rounded text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                edition === 'pagi'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Pagi · 06:30 WIB
            </button>
            <button
              type="button"
              onClick={() => setEdition('sore')}
              className={`h-8 rounded text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                edition === 'sore'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              Sore · 17:30 WIB
            </button>
          </div>
        </div>

        {/* Topic Selector Buttons */}
        <div className="space-y-1.5">
          <span className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
            Pilih Rubrik ({selectedTopics.length} dipilih)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {BRIEFING_TOPICS.map((topic) => {
              const active = selectedTopics.includes(topic);
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => toggleTopic(topic)}
                  aria-pressed={active}
                  className={`h-8 px-2.5 rounded text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#0F2A44] border-[#0F2A44] text-white dark:bg-[#16A085] dark:border-[#16A085]'
                      : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600'
                  }`}
                >
                  {topic}
                </button>
              );
            })}
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="newsletter-email-input"
            className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300"
          >
            Alamat Surel
          </label>
          <input
            id="newsletter-email-input"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="nama@email.com"
            aria-invalid={Boolean(errorMessage)}
            aria-describedby={errorMessage ? 'newsletter-error-msg' : undefined}
            className={`w-full h-10 px-3 rounded-md border bg-white dark:bg-zinc-950 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none ${
              errorMessage
                ? 'border-red-500 focus:border-red-600'
                : 'border-zinc-300 dark:border-zinc-700 focus:border-[#16A085]'
            }`}
          />
          {errorMessage && (
            <p
              id="newsletter-error-msg"
              role="alert"
              className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 pt-0.5"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 pt-0.5">
          <button
            type="submit"
            className="flex-1 h-10 px-4 rounded-md bg-[#16A085] hover:bg-[#138D75] text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A085]"
          >
            {isEditing ? 'Simpan Preferensi' : 'Langganan Gratis'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setIsEditing(false);
              }}
              className="h-10 px-3 rounded-md border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Batal
            </button>
          )}
        </div>

        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
          Tanpa spam. Anda dapat berhenti berlangganan kapan saja.
        </p>
      </form>
    </section>
  );
};
