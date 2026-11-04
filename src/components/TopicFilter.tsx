import { useEffect, useState } from 'react';

export type FilterEssay = {
  id: string;
  href: string;
  title: string;
  description: string;
  date: string;
  dateLabel: string;
  topics: string[];
};
export type FilterTopic = { id: string; name: string };

type Props = { essays: FilterEssay[]; topics: FilterTopic[] };

/** Essays index island: filter Essays by Topic. The active Topic is mirrored in `?topic=`. */
export default function TopicFilter({ essays, topics }: Props) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('topic');
    if (t && topics.some((x) => x.id === t)) setActive(t);
  }, [topics]);

  const select = (id: string | null) => {
    setActive(id);
    const u = new URL(window.location.href);
    if (id) u.searchParams.set('topic', id);
    else u.searchParams.delete('topic');
    history.replaceState(null, '', u);
  };

  const names = new Map(topics.map((t) => [t.id, t.name]));
  const shown = active ? essays.filter((e) => e.topics.includes(active)) : essays;
  const chip = (on: boolean) =>
    `rounded-full border px-3.5 py-1 text-sm font-medium transition ${
      on ? 'border-ink bg-ink text-paper' : 'border-line bg-white/60 text-muted hover:border-accent hover:text-accent'
    }`;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by Topic">
        <button type="button" className={chip(active === null)} aria-pressed={active === null} onClick={() => select(null)}>
          All
        </button>
        {topics.map((t) => (
          <button type="button" key={t.id} className={chip(active === t.id)} aria-pressed={active === t.id} onClick={() => select(t.id)}>
            {t.name}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="text-muted">No Essays on this Topic yet.</p>
      ) : (
        <ul>
          {shown.map((e) => (
            <li key={e.id} className="group grid gap-2 border-t border-line py-6 sm:grid-cols-[8rem_1fr] sm:gap-6">
              <time dateTime={e.date} className="pt-1 text-sm text-muted tabular-nums">
                {e.dateLabel}
              </time>
              <div className="flex flex-col gap-2">
                <a href={e.href} className="font-display text-xl font-bold tracking-tight transition group-hover:text-accent">
                  {e.title}
                </a>
                <p className="text-muted">{e.description}</p>
                <p className="text-xs font-medium text-muted">{e.topics.map((id) => names.get(id)).join(' · ')}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
