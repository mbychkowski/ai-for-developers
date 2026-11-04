import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type TouchEvent,
} from 'react';

const CANVAS_W = 1280;
const CANVAS_H = 720;
/** Portrait phones get a vertical scroll of Slides instead of one letterboxed Slide. */
const STACKED_QUERY = '(orientation: portrait) and (max-width: 820px)';

type Props = {
  title: string;
  /** The rendered Deck: a sequence of <Slide> sections (static HTML from Astro). */
  children?: ReactNode;
};

/** Read the 1-based Slide number from `#n`; returns a 0-based index. */
function indexFromHash(count: number): number {
  const n = Number.parseInt(window.location.hash.slice(1), 10);
  return Number.isFinite(n) ? Math.min(Math.max(n - 1, 0), count - 1) : 0;
}

/**
 * The Deck player island. It drives the statically rendered Slides via the DOM,
 * so Slides stay plain HTML (and can contain their own islands).
 */
export default function DeckPlayer({ title, children }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<HTMLElement[]>([]);
  const [count, setCount] = useState(0);
  const [index, setIndex] = useState(0);
  const [stacked, setStacked] = useState(false);

  // Collect Slides and give each one an id matching its hash (#1, #2, …).
  useLayoutEffect(() => {
    const slides = Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[data-slide]') ?? []);
    slides.forEach((el, i) => {
      el.id = String(i + 1);
      el.setAttribute('aria-label', `Slide ${i + 1} of ${slides.length}`);
    });
    slidesRef.current = slides;
    setCount(slides.length);
    setIndex(indexFromHash(slides.length));
  }, []);

  // Track which mode we're in.
  useEffect(() => {
    const mq = window.matchMedia(STACKED_QUERY);
    const update = () => setStacked(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Scale the 1280×720 canvas to the available space.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const resize = () => {
      const cs = getComputedStyle(stage);
      const width = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const height = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const scale = stacked ? width / CANVAS_W : Math.min(width / CANVAS_W, height / CANVAS_H);
      rootRef.current?.style.setProperty('--deck-scale', String(scale));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [stacked]);

  // Show only the current Slide on the stage; show all of them when stacked.
  useEffect(() => {
    slidesRef.current.forEach((el, i) => {
      el.hidden = !stacked && i !== index;
    });
  }, [index, stacked, count]);

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      const clamped = Math.min(Math.max(next, 0), count - 1);
      setIndex(clamped);
      history.replaceState(null, '', `#${clamped + 1}`);
    },
    [count],
  );

  // Keep state in sync with manual hash edits and back/forward.
  useEffect(() => {
    const onHash = () => setIndex(indexFromHash(count));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [count]);

  // When switching to stacked mode, scroll the current Slide into view.
  useEffect(() => {
    if (stacked) slidesRef.current[index]?.scrollIntoView({ block: 'start' });
  }, [stacked]);

  // Keyboard navigation (stage mode only; stacked mode scrolls natively).
  useEffect(() => {
    if (stacked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) go(index + 1);
      else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) go(index - 1);
      else if (e.key === 'Home') go(0);
      else if (e.key === 'End') go(count - 1);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stacked, index, count, go]);

  // Swipe navigation on touch screens (stage mode).
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: TouchEvent) => {
    touchX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (stacked || touchX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
    if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
    touchX.current = null;
  };

  const progress = count > 0 ? ((index + 1) / count) * 100 : 0;

  return (
    <div
      ref={rootRef}
      className={`deck-root ${count > 0 ? 'is-ready' : ''} ${stacked ? 'flex flex-col' : 'flex min-h-0 flex-1 flex-col'}`}
      aria-roledescription="slide deck"
      aria-label={title}
    >
      <div
        ref={stageRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className={
          stacked
            ? 'flex w-full flex-col items-center gap-4 px-3 py-4'
            : 'relative flex min-h-0 flex-1 items-center justify-center'
        }
        style={stacked ? undefined : { padding: 'clamp(12px, 3vw, 40px)' }}
      >
        {children}
      </div>

      {!stacked && count > 0 && (
        <div className="flex items-center gap-4 px-4 pb-4 text-sm text-white/70 sm:px-8 sm:pb-6">
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            className="rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
            aria-label="Previous slide"
          >
            ←
          </button>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${progress}%` }} />
          </div>
          <span className="tabular-nums" aria-live="polite">
            {index + 1} / {count}
          </span>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === count - 1}
            className="rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
            aria-label="Next slide"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
