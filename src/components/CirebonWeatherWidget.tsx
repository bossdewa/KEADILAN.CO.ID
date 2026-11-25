import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Cloud, CloudRain, CloudSun, RefreshCw, Sun } from 'lucide-react';

type WeatherConditionType = 'partly-cloudy' | 'sunny' | 'cloudy' | 'light-rain';

interface CirebonWeatherData {
  city: string;
  region: string;
  temperatureC: number;
  condition: string;
  conditionType: WeatherConditionType;
  humidity: number;
  windKmh: number;
  updatedAt: string;
}

const CIREBON_WEATHER_SNAPSHOTS: Array<Omit<CirebonWeatherData, 'city' | 'region' | 'updatedAt'>> = [
  {
    temperatureC: 31,
    condition: 'Cerah Berawan',
    conditionType: 'partly-cloudy',
    humidity: 72,
    windKmh: 16,
  },
  {
    temperatureC: 33,
    condition: 'Cerah Terik',
    conditionType: 'sunny',
    humidity: 64,
    windKmh: 14,
  },
  {
    temperatureC: 29,
    condition: 'Berawan',
    conditionType: 'cloudy',
    humidity: 78,
    windKmh: 19,
  },
  {
    temperatureC: 27,
    condition: 'Hujan Ringan',
    conditionType: 'light-rain',
    humidity: 86,
    windKmh: 22,
  },
];

function fetchCirebonWeather(snapshotIndex: number): Promise<CirebonWeatherData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const template =
        CIREBON_WEATHER_SNAPSHOTS[snapshotIndex % CIREBON_WEATHER_SNAPSHOTS.length];
      const timeLabel = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
      resolve({
        city: 'Cirebon',
        region: 'Jawa Barat',
        ...template,
        updatedAt: `${timeLabel} WIB`,
      });
    }, 450);
  });
}

function renderWeatherIcon(conditionType: WeatherConditionType) {
  switch (conditionType) {
    case 'sunny':
      return <Sun className="w-7 h-7 text-amber-500" aria-hidden="true" />;
    case 'cloudy':
      return <Cloud className="w-7 h-7 text-zinc-500 dark:text-zinc-400" aria-hidden="true" />;
    case 'light-rain':
      return <CloudRain className="w-7 h-7 text-sky-600 dark:text-sky-400" aria-hidden="true" />;
    case 'partly-cloudy':
    default:
      return <CloudSun className="w-7 h-7 text-[#16A085]" aria-hidden="true" />;
  }
}

export const CirebonWeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<CirebonWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const snapshotIdxRef = useRef(0);
  const mountedRef = useRef(true);

  const loadWeather = useCallback(async (advanceSnapshot: boolean) => {
    setLoading(true);
    if (advanceSnapshot) {
      snapshotIdxRef.current += 1;
    }
    const data = await fetchCirebonWeather(snapshotIdxRef.current);
    if (mountedRef.current) {
      setWeather(data);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadWeather(false);
    return () => {
      mountedRef.current = false;
    };
  }, [loadWeather]);

  return (
    <section
      aria-label="Informasi Cuaca Cirebon"
      className="p-4 sm:p-5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#16A085]">
            Cuaca Lokal
          </div>
          <h2 className="font-editorial text-base font-bold text-zinc-900 dark:text-zinc-50 truncate">
            Cirebon, Jawa Barat
          </h2>
        </div>

        <button
          type="button"
          onClick={() => loadWeather(true)}
          disabled={loading}
          aria-label="Perbarui prakiraan cuaca Cirebon"
          title="Perbarui cuaca"
          className="w-8 h-8 shrink-0 rounded-md border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-[#16A085] hover:border-[#16A085] transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {loading && !weather ? (
        <div className="py-2 flex items-center justify-between animate-pulse">
          <div className="space-y-2">
            <div className="h-7 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        </div>
      ) : weather ? (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-2.5">
              <span className="font-mono-tabular text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {weather.temperatureC}°C
              </span>
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {weather.condition}
              </span>
            </div>
            <div className="shrink-0">{renderWeatherIcon(weather.conditionType)}</div>
          </div>

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono-tabular text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>Kelembapan {weather.humidity}%</span>
            <span aria-hidden="true">·</span>
            <span>Angin {weather.windKmh} km/j</span>
            <span aria-hidden="true">·</span>
            <span>{weather.updatedAt}</span>
          </div>
        </div>
      ) : null}
    </section>
  );
};
