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

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** Clamps an index to the valid 0-based range [0, count - 1]. */
function clampIndex(i: number, count: number): number {
  if (count <= 0) return 0;
  return Math.min(Math.max(i, 0), count - 1);
}

/** Read the 1-based Slide number from `#n`; returns a 0-based index. */
function indexFromHash(count: number): number {
  if (typeof window === 'undefined') return 0;
  const hash = window.location.hash.slice(1);
  const n = Number.parseInt(hash, 10);
  return Number.isFinite(n) ? clampIndex(n - 1, count) : 0;
}

/** Computes which Slide is currently closest to the center of the viewport in stacked mode. */
function findActiveSlideIndex(slides: HTMLElement[]): number {
  if (typeof window === 'undefined' || slides.length === 0) return 0;
  const viewportCenter = window.innerHeight / 2;
  let closestDist = Infinity;
  let closestIndex = 0;
  slides.forEach((slide, i) => {
    const rect = slide.getBoundingClientRect();
    const slideCenter = rect.top + rect.height / 2;
    const dist = Math.abs(slideCenter - viewportCenter);
    if (dist < closestDist) {
      closestDist = dist;
      closestIndex = i;
    }
  });
  return closestIndex;
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
  useIsomorphicLayoutEffect(() => {
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
  const stackedRef = useRef(stacked);
  stackedRef.current = stacked;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(STACKED_QUERY);
    const update = () => {
      const nextStacked = mq.matches;
      if (!nextStacked && stackedRef.current && slidesRef.current.length > 0) {
        const active = findActiveSlideIndex(slidesRef.current);
        setIndex(active);
        history.replaceState(null, '', `#${active + 1}`);
      }
      setStacked(nextStacked);
    };
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Scale the 1280×720 canvas to the available space.
  useIsomorphicLayoutEffect(() => {
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
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(resize);
      ro.observe(stage);
      return () => ro.disconnect();
    }
  }, [stacked]);

  // Show only the current Slide on the stage; show all of them when stacked.
  useEffect(() => {
    slidesRef.current.forEach((el, i) => {
      el.hidden = !stacked && i !== index;
    });
  }, [index, stacked, count]);

  const goToSlide = useCallback(
    (next: number) => {
      if (count === 0) return;
      const clamped = clampIndex(next, count);
      setIndex(clamped);
      history.replaceState(null, '', `#${clamped + 1}`);
    },
    [count],
  );

  // Keep state in sync with manual hash edits and back/forward.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onHash = () => setIndex(indexFromHash(count));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [count]);

  const indexRef = useRef(index);
  indexRef.current = index;
  const isProgrammaticScrollRef = useRef(false);

  // When switching between modes:
  // - Entering stacked mode: scroll the current Slide into view.
  // - Exiting stacked mode: reset window scroll so desktop stage isn't offset.
  useEffect(() => {
    if (stacked) {
      let cancelled = false;
      isProgrammaticScrollRef.current = true;
      requestAnimationFrame(() => {
        if (!cancelled) {
          slidesRef.current[indexRef.current]?.scrollIntoView({ block: 'start' });
        }
        requestAnimationFrame(() => {
          isProgrammaticScrollRef.current = false;
        });
      });
      return () => {
        cancelled = true;
        isProgrammaticScrollRef.current = false;
      };
    } else {
      if (typeof window !== 'undefined') {
        window.scrollTo(0, 0);
      }
    }
  }, [stacked]);

  // When in stacked mode, track the visible Slide as the reader scrolls.
  useEffect(() => {
    if (!stacked || typeof window === 'undefined') return;
    const slides = slidesRef.current;
    if (slides.length === 0) return;

    let ticking = false;

    const onScroll = () => {
      if (isProgrammaticScrollRef.current) return;
      if (!ticking) {
        requestAnimationFrame(() => {
          if (!isProgrammaticScrollRef.current) {
            const closestIndex = findActiveSlideIndex(slides);
            setIndex((prev) => {
              if (prev !== closestIndex) {
                history.replaceState(null, '', `#${closestIndex + 1}`);
                return closestIndex;
              }
              return prev;
            });
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [stacked]);

  // Keyboard navigation (stage mode only; stacked mode scrolls natively).
  useEffect(() => {
    if (stacked || typeof window === 'undefined') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const isInteractive =
        target && ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      if (isInteractive && (e.key === ' ' || e.key === 'Enter')) return;

      if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) {
        goToSlide(index + 1);
      } else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) {
        goToSlide(index - 1);
      } else if (e.key === 'Home') {
        goToSlide(0);
      } else if (e.key === 'End') {
        goToSlide(count - 1);
      } else {
        return;
      }
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stacked, index, count, goToSlide]);

  // Swipe navigation on touch screens (stage mode).
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: TouchEvent) => {
    touchX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (stacked || touchX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current;
    if (Math.abs(dx) > 50) goToSlide(index + (dx < 0 ? 1 : -1));
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
            onClick={() => goToSlide(index - 1)}
            disabled={index === 0}
            className="rounded-full px-3 py-1.5 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
            aria-label="Previous slide"
          >
            ←
          </button>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-accent transition-[width] duration-300" style={{ width: `${progress}%` }} />
          </div>
          <span
            className="tabular-nums"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`Slide ${index + 1} of ${count}`}
          >
            {index + 1} / {count}
          </span>
          <button
            type="button"
            onClick={() => goToSlide(index + 1)}
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
