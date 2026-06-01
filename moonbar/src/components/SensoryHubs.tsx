import { useMemo, useState, type KeyboardEvent } from 'react';
import type { WeeklyEvent } from '../lib/fetch-content';

interface SensoryHubsProps {
  events: WeeklyEvent[];
}

interface EnrichedEvent extends WeeklyEvent {
  theme: string;
  tagline: string;
  pairing: string;
  curator: string;
  experience: string;
  illustration: string;
}

const ILLUSTRATIONS = [
  '/images/blog/best-bars-with-views-vizag-2026.jpg',
  '/images/our-story.jpg',
  '/images/blog/old-fashioned-visakhapatnam-guide.jpg',
];

const THEMES: Record<string, string> = {
  'House Friday': 'Chic deep house & organic tech',
  'Bollytech Saturday': 'Bollywood × tech house fusion',
  'Sunday Brunch': 'Lazy brunch & bottomless mimosas',
  'Live Band Night': 'Acoustic sets under the stars',
  'Sunday Live Band': 'Live music & craft cocktails',
};

const PAIRINGS: Record<string, string> = {
  'House Friday': 'Truffle arancini, wagyu sliders & signature negronis',
  'Bollytech Saturday': 'Paneer tikka bites, dynamite prawns & house shots',
  'Sunday Brunch': 'Eggs benedict, tempura prawns & mimosa flights',
  'Live Band Night': 'Charcuterie boards, tempura & old fashioneds',
  'Sunday Live Band': 'Chef specials, small plates & harvest moon cocktails',
};

function pickFeaturedEvents(events: WeeklyEvent[]): WeeklyEvent[] {
  const priority = ['Friday', 'Saturday', 'Sunday'];
  const picked = priority
    .map((day) => events.find((event) => event.day === day))
    .filter((event): event is WeeklyEvent => Boolean(event));

  if (picked.length >= 3) return picked.slice(0, 3);
  return events.slice(0, 3);
}

function enrichEvent(event: WeeklyEvent, index: number): EnrichedEvent {
  return {
    ...event,
    theme: THEMES[event.title] ?? event.title,
    tagline: event.description,
    pairing: PAIRINGS[event.title] ?? "Chef's tasting plates & signature cocktails",
    curator: event.artist || 'Moon Bar curators',
    experience: event.description,
    illustration: ILLUSTRATIONS[index % ILLUSTRATIONS.length],
  };
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default function SensoryHubs({ events }: SensoryHubsProps) {
  const featured = useMemo(
    () => pickFeaturedEvents(events).map((event, index) => enrichEvent(event, index)),
    [events],
  );
  const [expandedIdx, setExpandedIdx] = useState(0);

  const toggle = (index: number) => {
    setExpandedIdx((current) => (current === index ? -1 : index));
  };

  const onKeyDown = (index: number, event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle(index);
    }
  };

  if (featured.length === 0) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#0a0806] via-[#010101] to-black py-16 sm:py-20 lg:py-24">
      <div
        className="pointer-events-none absolute top-1/4 left-1/4 h-[350px] w-[350px] animate-pulse rounded-full bg-moon-gold/[0.04] blur-[100px]"
        style={{ animationDuration: '6s' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-1/4 bottom-1/4 h-[450px] w-[450px] animate-pulse rounded-full bg-stone-100/[0.015] blur-[120px]"
        style={{ animationDuration: '10s' }}
        aria-hidden="true"
      />

      <div className="container-moon relative z-10 space-y-10 sm:space-y-12">
        <div className="reveal flex flex-col items-start justify-between gap-6 border-b border-stone-800/60 pb-6 md:flex-row md:items-end">
          <div>
            <span className="font-accent text-xs font-bold tracking-[0.2em] text-moon-gold uppercase">
              Tactile HUD Interface
            </span>
            <h2 className="mt-1 font-display text-3xl tracking-wide text-stone-100 uppercase sm:text-4xl">
              Sensory <span className="text-moon-gold italic">Hubs</span>
            </h2>
          </div>
          <p className="max-w-sm font-body text-xs font-light tracking-wide text-stone-400">
            Expanding interactive panels with sonic curators, menu pairings, and nightly rituals.
            Tap any card below to expand details.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {featured.map((event, idx) => {
            const isExpanded = expandedIdx === idx;

            return (
              <div
                key={event.id}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                onClick={() => toggle(idx)}
                onKeyDown={(e) => onKeyDown(idx, e)}
                className={`relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border px-6 py-8 text-left shadow-2xl backdrop-blur-2xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isExpanded
                    ? 'border-zinc-700/80 bg-zinc-950/75 shadow-black/80 shadow-[0_0_30px_rgba(255,218,127,0.06)]'
                    : 'border-stone-900/50 bg-zinc-950/30 text-stone-300 hover:border-stone-800/90'
                }`}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-moon-gold/20 to-transparent transition-opacity duration-500 ${
                    isExpanded ? 'opacity-100' : 'opacity-0'
                  }`}
                  aria-hidden="true"
                />

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="font-accent text-[10px] tracking-[0.15em] text-stone-400 uppercase">
                      Moon Code: MBK-0{idx + 1}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 font-accent text-[10px] ${
                        isExpanded
                          ? 'border-moon-gold/30 bg-moon-gold/10 text-moon-gold'
                          : 'border-stone-800 bg-stone-900/40 text-stone-400'
                      }`}
                    >
                      {event.day}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-2xl font-medium tracking-tight text-white italic sm:text-3xl">
                      {event.title}
                    </h3>
                    <p className="mt-1 font-accent text-[11px] tracking-widest text-moon-gold uppercase">
                      {event.theme}
                    </p>
                  </div>

                  <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-stone-900 shadow-inner">
                    <img
                      src={event.illustration}
                      alt=""
                      className="h-full w-full object-cover brightness-75 transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="space-y-4 pt-2">
                    <p className="font-body text-xs leading-relaxed text-stone-300">{event.tagline}</p>

                    <div
                      className={`grid transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="space-y-3.5 border-t border-stone-900/80 pt-4">
                          <div>
                            <span className="block font-accent text-[9px] tracking-wider text-zinc-500 uppercase">
                              Gastronomy Flight
                            </span>
                            <span className="mt-0.5 block font-display text-xs leading-normal text-moon-gold/90 italic">
                              {event.pairing}
                            </span>
                          </div>

                          <div>
                            <span className="block font-accent text-[9px] tracking-wider text-zinc-500 uppercase">
                              Sound Pattern
                            </span>
                            <span className="mt-0.5 block font-accent text-xs text-stone-300">
                              {event.curator} ({event.time})
                            </span>
                          </div>

                          <div className="rounded-xl border border-stone-800/50 bg-stone-900/40 p-3">
                            <span className="mb-1 block font-accent text-[9px] tracking-wider text-white/50 uppercase">
                              Ritual Summary
                            </span>
                            <p className="font-body text-[11px] leading-normal text-stone-400">
                              {event.experience}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-stone-900 pt-6 font-accent text-xs">
                  <span className="text-stone-500">{isExpanded ? 'Fully Accredited' : 'Locked'}</span>
                  {isExpanded ? (
                    <a
                      href="/#wheel"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-white uppercase transition-colors hover:text-moon-gold"
                    >
                      Book Table <ChevronRight className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-stone-400 uppercase transition-colors hover:text-white">
                      Expand Details <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-station-800/40 pt-4 font-accent text-[10px] text-stone-500 sm:flex-row">
          <div className="flex flex-wrap gap-4">
            <span>Station: MBK-Vizag</span>
            <span aria-hidden="true">•</span>
            <span>Latitude: 17.6868° N</span>
          </div>
          <span>Live Events Directory // Secure</span>
        </div>
      </div>
    </div>
  );
}
