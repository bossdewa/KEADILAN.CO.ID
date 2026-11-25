import React from 'react';
import { ArrowUpRight, Facebook, Instagram, Twitter } from 'lucide-react';

interface SocialChannel {
  name: string;
  handle: string;
  href: string;
  icon: React.ReactNode;
  hoverAccentClass: string;
}

const SOCIAL_CHANNELS: SocialChannel[] = [
  {
    name: 'Twitter',
    handle: '@keadilancoid',
    href: 'https://twitter.com/keadilancoid',
    icon: <Twitter className="w-4 h-4" aria-hidden="true" />,
    hoverAccentClass: 'group-hover:text-sky-600 dark:group-hover:text-sky-400',
  },
  {
    name: 'Instagram',
    handle: '@keadilan.co.id',
    href: 'https://instagram.com/keadilancoid',
    icon: <Instagram className="w-4 h-4" aria-hidden="true" />,
    hoverAccentClass: 'group-hover:text-rose-600 dark:group-hover:text-rose-400',
  },
  {
    name: 'Facebook',
    handle: 'KEADILAN.CO.ID Official',
    href: 'https://facebook.com/keadilancoid',
    icon: <Facebook className="w-4 h-4" aria-hidden="true" />,
    hoverAccentClass: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
  },
];

export const FollowUsSection: React.FC = () => {
  return (
    <section
      aria-label="Ikuti Kami di Media Sosial"
      className="p-5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3.5"
    >
      <div className="space-y-1 border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
        <div className="text-[10px] font-bold uppercase tracking-widest text-[#16A085]">
          Kanal Resmi
        </div>
        <h2 className="font-editorial text-lg font-bold text-zinc-900 dark:text-zinc-50">
          Ikuti Kami
        </h2>
      </div>

      <div className="space-y-2">
        {SOCIAL_CHANNELS.map((channel) => (
          <a
            key={channel.name}
            href={channel.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ikuti KEADILAN.CO.ID di ${channel.name} (${channel.handle})`}
            className="group flex items-center justify-between gap-3 p-2.5 rounded-md border border-zinc-200 dark:border-zinc-800 hover:border-[#16A085] hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-all duration-150"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`w-9 h-9 rounded flex items-center justify-center shrink-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-transform duration-150 group-hover:scale-105 ${channel.hoverAccentClass}`}
              >
                {channel.icon}
              </span>
              <div className="min-w-0">
                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#16A085] transition-colors">
                  {channel.name}
                </div>
                <div className="font-mono-tabular text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                  {channel.handle}
                </div>
              </div>
            </div>

            <ArrowUpRight
              className="w-4 h-4 shrink-0 text-zinc-400 group-hover:text-[#16A085] transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </a>
        ))}
      </div>
    </section>
  );
};
