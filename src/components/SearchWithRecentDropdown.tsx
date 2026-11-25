import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Clock, CornerDownLeft, Search, Trash2, User, X } from 'lucide-react';

interface SearchWithRecentDropdownProps {
  value: string;
  onChange: (nextValue: string) => void;
  recentSearches: string[];
  knownAuthors?: string[];
  onCommitSearch: (query: string) => void;
  onSelectRecentSearch: (query: string) => void;
  onRemoveRecentSearch: (query: string) => void;
  onClearRecentSearches: () => void;
}

export const SearchWithRecentDropdown: React.FC<SearchWithRecentDropdownProps> = ({
  value,
  onChange,
  recentSearches,
  knownAuthors = [],
  onCommitSearch,
  onSelectRecentSearch,
  onRemoveRecentSearch,
  onClearRecentSearches,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownId = useId();

  const normalizedAuthorSet = useMemo(
    () => new Set(knownAuthors.map((author) => author.trim().toLowerCase())),
    [knownAuthors]
  );

  const trimmedValue = value.trim();

  const visibleRecentSearches = useMemo(() => {
    if (!trimmedValue) return recentSearches;
    const q = trimmedValue.toLowerCase();
    const matching = recentSearches.filter((item) => item.toLowerCase().includes(q));
    return matching.length > 0 ? matching : recentSearches;
  }, [recentSearches, trimmedValue]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [trimmedValue, isOpen]);

  useEffect(() => {
    const handleOutsideMouseDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        if (trimmedValue.length >= 2) {
          onCommitSearch(trimmedValue);
        }
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideMouseDown);
    return () => document.removeEventListener('mousedown', handleOutsideMouseDown);
  }, [trimmedValue, onCommitSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (highlightedIndex >= 0 && highlightedIndex < visibleRecentSearches.length) {
      const selected = visibleRecentSearches[highlightedIndex];
      onSelectRecentSearch(selected);
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (trimmedValue.length >= 2) {
      onCommitSearch(trimmedValue);
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (!isOpen || visibleRecentSearches.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < visibleRecentSearches.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : visibleRecentSearches.length - 1
      );
    }
  };

  const handleContainerBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.relatedTarget as Node | null)
    ) {
      if (trimmedValue.length >= 2) {
        onCommitSearch(trimmedValue);
      }
      setIsOpen(false);
    }
  };

  const isExactRecentMatch =
    trimmedValue.length >= 2 &&
    recentSearches.some((item) => item.toLowerCase() === trimmedValue.toLowerCase());

  return (
    <div
      ref={containerRef}
      onBlur={handleContainerBlur}
      className="relative flex-1 min-w-[160px] sm:w-56 lg:w-64"
    >
      <form onSubmit={handleSubmit} role="search" className="relative">
        <Search
          className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Cari berita, topik, penulis..."
          aria-label="Cari berita"
          aria-expanded={isOpen}
          aria-controls={isOpen ? dropdownId : undefined}
          aria-autocomplete="list"
          role="combobox"
          autoComplete="off"
          className="w-full h-9 pl-8 pr-8 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#16A085] [&::-webkit-search-cancel-button]:hidden"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setIsOpen(true);
              inputRef.current?.focus();
            }}
            aria-label="Hapus pencarian"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </form>

      {isOpen && (
        <div
          id={dropdownId}
          aria-label="Pencarian Terakhir"
          className="absolute left-0 top-full mt-1.5 w-[min(18rem,calc(100vw-2rem))] sm:w-72 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg z-30 overflow-hidden"
        >
          {trimmedValue.length >= 2 && !isExactRecentMatch && (
            <button
              type="button"
              onClick={() => {
                onCommitSearch(trimmedValue);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-xs flex items-center justify-between gap-2 bg-zinc-50 dark:bg-zinc-800/70 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 cursor-pointer transition-colors"
            >
              <span className="truncate">
                Simpan &amp; cari{' '}
                <strong className="font-semibold text-[#16A085]">“{trimmedValue}”</strong>
              </span>
              <CornerDownLeft
                className="w-3.5 h-3.5 text-zinc-400 shrink-0"
                aria-hidden="true"
              />
            </button>
          )}

          <div className="px-3 py-2 flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Pencarian Terakhir
            </span>
            {recentSearches.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onClearRecentSearches();
                  inputRef.current?.focus();
                }}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" aria-hidden="true" />
                <span>Hapus Semua</span>
              </button>
            )}
          </div>

          {recentSearches.length === 0 ? (
            <div className="px-3 py-4 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Belum ada pencarian terakhir. Ketik topik atau nama penulis lalu tekan Enter untuk
              menyimpannya.
            </div>
          ) : (
            <ul role="listbox" aria-label="Daftar pencarian terakhir" className="max-h-60 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {visibleRecentSearches.map((term, index) => {
                const isAuthor = normalizedAuthorSet.has(term.toLowerCase());
                const isHighlighted = index === highlightedIndex;
                return (
                  <li
                    key={term}
                    role="option"
                    aria-selected={isHighlighted}
                    className={`flex items-center justify-between gap-1 transition-colors ${
                      isHighlighted
                        ? 'bg-zinc-100 dark:bg-zinc-800'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectRecentSearch(term);
                        setIsOpen(false);
                      }}
                      className="flex-1 min-w-0 px-3 py-2 text-left flex items-center gap-2.5 cursor-pointer"
                    >
                      {isAuthor ? (
                        <User
                          className="w-3.5 h-3.5 text-[#16A085] shrink-0"
                          aria-hidden="true"
                        />
                      ) : (
                        <Clock
                          className="w-3.5 h-3.5 text-zinc-400 shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      <span className="text-xs text-zinc-800 dark:text-zinc-100 truncate">
                        {term}
                      </span>
                      {isAuthor && (
                        <span className="ml-auto text-[10px] font-medium text-zinc-400 dark:text-zinc-500 shrink-0">
                          Penulis
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveRecentSearch(term);
                        inputRef.current?.focus();
                      }}
                      aria-label={`Hapus ${term} dari pencarian terakhir`}
                      title="Hapus dari riwayat pencarian"
                      className="mr-1.5 w-7 h-7 rounded flex items-center justify-center text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 shrink-0 cursor-pointer transition-colors"
                    >
                      <X className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
