import { useEffect, useState } from 'react';

export type FilterTopic = {
  id: string;
  name: string;
};

export type FilterEssay = {
  id: string;
  href: string;
  title: string;
  description: string;
  date: string;
  dateLabel: string;
  draft?: boolean;
  topics: { id: string; name: string; href: string }[];
};

interface Props {
  essays: FilterEssay[];
  topics: FilterTopic[];
}

/** Essays index island: filter Essays by Topic. The active Topic is mirrored in `?topic=`. */
export default function TopicFilter({ essays, topics }: Props) {
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  useEffect(() => {
    const syncFromUrl = () => {
      const param = new URLSearchParams(window.location.search).get('topic');
      if (param && topics.some((t) => t.id === param)) {
        setActiveTopicId(param);
      } else {
        setActiveTopicId(null);
      }
    };

    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, [topics]);

  const select = (id: string | null) => {
    setActiveTopicId(id);
    const url = new URL(window.location.href);
    if (id) {
      url.searchParams.set('topic', id);
    } else {
      url.searchParams.delete('topic');
    }
    history.replaceState(null, '', url);
  };

  const filteredEssays = activeTopicId
    ? essays.filter((e) => e.topics.some((t) => t.id === activeTopicId))
    : essays;

  const chipClass = (isSelected: boolean) =>
    `cursor-pointer rounded-full border px-3.5 py-1 text-sm font-medium transition ${
      isSelected
        ? 'border-ink bg-ink text-paper'
        : 'border-line bg-white/60 text-muted hover:border-accent hover:text-accent'
    }`;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by Topic">
        <button
          type="button"
          className={chipClass(activeTopicId === null)}
          aria-pressed={activeTopicId === null}
          onClick={() => select(null)}
        >
          All
        </button>
        {topics.map((t) => (
          <button
            type="button"
            key={t.id}
            className={chipClass(activeTopicId === t.id)}
            aria-pressed={activeTopicId === t.id}
            onClick={() => select(t.id)}
          >
            {t.name}
          </button>
        ))}
      </div>

      {filteredEssays.length === 0 ? (
        <p className="text-muted">
          {activeTopicId ? 'No Essays on this Topic yet.' : 'No Essays yet.'}
        </p>
      ) : (
        <ul>
          {filteredEssays.map((e) => (
            <li key={e.id}>
              <article className="group grid gap-2 border-t border-line py-6 sm:grid-cols-[8rem_1fr] sm:gap-6">
                <time dateTime={e.date} className="pt-1 text-sm text-muted tabular-nums">
                  {e.dateLabel}
                </time>
                <div className="flex flex-col gap-2">
                  <h3 className="font-display text-xl font-bold tracking-tight">
                    <a href={e.href} className="transition group-hover:text-accent">
                      {e.title}
                    </a>
                    {e.draft && (
                      <span className="ml-2 inline-block rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-xs font-semibold text-accent">
                        Draft
                      </span>
                    )}
                  </h3>
                  <p className="text-muted">{e.description}</p>
                  <ul className="flex flex-wrap gap-2">
                    {e.topics.map((t) => (
                      <li key={t.id}>
                        <a
                          href={t.href}
                          className="inline-block rounded-full border border-line bg-white/60 px-2.5 py-0.5 text-xs font-medium text-muted transition hover:border-accent hover:text-accent"
                        >
                          {t.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
