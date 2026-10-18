'use client';

import { useCallback, useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/device';

/** Pixels the mouse must travel before a press counts as a drag (keeps plain clicks working). */
const DRAG_THRESHOLD = 5;
/** Velocity is carried into momentum only if the pointer was still moving this recently (ms). */
const RELEASE_WINDOW = 90;
/** Share of velocity kept per 60 fps frame during momentum (scaled for other frame rates). */
const FRICTION = 0.94;
/** Momentum stops below this speed (px/ms). */
const MIN_SPEED = 0.02;

type DragState = {
  pointerId: number;
  startX: number;
  startScroll: number;
  lastX: number;
  lastT: number;
  /** Smoothed pointer velocity in px/ms (positive = pointer moving right). */
  velocity: number;
  dragging: boolean;
};

/**
 * Mouse drag + momentum for a native horizontal scroll-snap track.
 *
 * Touch and pen are left alone: the browser already scrolls (and snaps) them natively.
 * For the mouse:
 *  1. pointerdown records the start; nothing changes until the pointer moves past
 *     DRAG_THRESHOLD, so a plain click still reaches whatever was clicked.
 *  2. Past the threshold we capture the pointer, switch scroll-snap OFF (otherwise the
 *     browser fights every scrollLeft write by snapping back) and map pointer x to scrollLeft.
 *  3. On release the measured velocity keeps scrolling the track, decaying each rAF frame.
 *  4. When momentum dies (or immediately under reduced motion) snap is switched back ON
 *     and we glide to the nearest card, so the track always rests on a card edge.
 * A click that ends a drag is swallowed in the capture phase so links inside cards don't fire.
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const state = useRef<DragState | null>(null);
  const momentumRaf = useRef(0);
  const suppressClick = useRef(false);

  /** Scroll positions at which each direct child's start edge meets the scroll-padding line. */
  const snapPoints = useCallback(() => {
    const el = ref.current;
    if (!el) return [] as number[];
    const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
    const max = el.scrollWidth - el.clientWidth;
    const trackLeft = el.getBoundingClientRect().left;
    return Array.from(el.children).map((child) => {
      // getBoundingClientRect is relative to the viewport, so add the current scroll back in.
      const left = (child as HTMLElement).getBoundingClientRect().left - trackLeft + el.scrollLeft;
      return Math.min(max, Math.max(0, left - pad));
    });
  }, []);

  const nearestIndex = useCallback(() => {
    const el = ref.current;
    const points = snapPoints();
    if (!el || !points.length) return 0;
    let best = 0;
    points.forEach((p, i) => {
      if (Math.abs(p - el.scrollLeft) < Math.abs(points[best] - el.scrollLeft)) best = i;
    });
    return best;
  }, [snapPoints]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = ref.current;
      const points = snapPoints();
      if (!el || !points.length) return;
      const i = Math.max(0, Math.min(points.length - 1, index));
      el.scrollTo({ left: points[i], behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    },
    [snapPoints],
  );

  /** Turn snapping back on and settle on the closest card. */
  const settle = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.scrollSnapType = '';
    scrollToIndex(nearestIndex());
  }, [nearestIndex, scrollToIndex]);

  const stopMomentum = useCallback(() => {
    if (momentumRaf.current) cancelAnimationFrame(momentumRaf.current);
    momentumRaf.current = 0;
  }, []);

  const startMomentum = useCallback(
    (velocity: number) => {
      const el = ref.current;
      if (!el) return;
      let v = velocity;
      let last = performance.now();
      const step = (now: number) => {
        // Clamp dt so a backgrounded tab doesn't fling the track on its first frame back.
        const dt = Math.min(now - last, 40);
        last = now;
        const max = el.scrollWidth - el.clientWidth;
        const before = el.scrollLeft;
        // Pointer moving right means content follows it, i.e. scrollLeft goes down.
        el.scrollLeft = before - v * dt;
        // Frame-rate independent exponential decay: FRICTION per 16.67 ms.
        v *= Math.pow(FRICTION, dt / 16.67);
        const hitEdge = (el.scrollLeft <= 0 && v > 0) || (el.scrollLeft >= max - 1 && v < 0);
        if (Math.abs(v) < MIN_SPEED || hitEdge) {
          momentumRaf.current = 0;
          settle();
          return;
        }
        momentumRaf.current = requestAnimationFrame(step);
      };
      momentumRaf.current = requestAnimationFrame(step);
    },
    [settle],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<T>) => {
      if (e.pointerType !== 'mouse' || e.button !== 0 || !ref.current) return;
      // Grabbing a gliding track stops it dead, like catching a spinning wheel.
      if (momentumRaf.current) {
        stopMomentum();
        ref.current.style.scrollSnapType = '';
      }
      suppressClick.current = false;
      state.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startScroll: ref.current.scrollLeft,
        lastX: e.clientX,
        lastT: performance.now(),
        velocity: 0,
        dragging: false,
      };
    },
    [stopMomentum],
  );

  const onPointerMove = useCallback((e: React.PointerEvent<T>) => {
    const s = state.current;
    const el = ref.current;
    if (!s || !el || e.pointerId !== s.pointerId) return;

    if (!s.dragging) {
      if (Math.abs(e.clientX - s.startX) < DRAG_THRESHOLD) return;
      s.dragging = true;
      // Capture only now: capturing on pointerdown would retarget ordinary clicks to the track.
      el.setPointerCapture(e.pointerId);
      el.style.scrollSnapType = 'none';
      el.style.userSelect = 'none';
      window.getSelection()?.removeAllRanges();
    }

    const now = performance.now();
    const dt = Math.max(now - s.lastT, 1);
    // Low-pass the instantaneous velocity so one jittery sample doesn't decide the fling.
    s.velocity = 0.8 * ((e.clientX - s.lastX) / dt) + 0.2 * s.velocity;
    s.lastX = e.clientX;
    s.lastT = now;
    el.scrollLeft = s.startScroll - (e.clientX - s.startX);
  }, []);

  const endDrag = useCallback(
    (e: React.PointerEvent<T>) => {
      const s = state.current;
      const el = ref.current;
      if (!s || !el || e.pointerId !== s.pointerId) return;
      state.current = null;
      if (!s.dragging) return; // a plain click: nothing to undo

      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      el.style.userSelect = '';
      // The click that follows this pointerup must not activate anything under the pointer.
      suppressClick.current = true;
      window.setTimeout(() => (suppressClick.current = false), 0);

      // If the pointer paused before release, there is no fling.
      const stale = performance.now() - s.lastT > RELEASE_WINDOW;
      const velocity = stale || e.type === 'pointercancel' ? 0 : s.velocity;
      if (prefersReducedMotion() || Math.abs(velocity) < MIN_SPEED) settle();
      else startMomentum(velocity);
    },
    [settle, startMomentum],
  );

  const onClickCapture = useCallback((e: React.MouseEvent<T>) => {
    if (!suppressClick.current) return;
    e.preventDefault();
    e.stopPropagation();
    suppressClick.current = false;
  }, []);

  // A wheel/trackpad gesture takes over from momentum instead of fighting it.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = () => {
      if (!momentumRaf.current) return;
      stopMomentum();
      el.style.scrollSnapType = '';
    };
    el.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      el.removeEventListener('wheel', onWheel);
      stopMomentum();
    };
  }, [stopMomentum]);

  return {
    ref,
    nearestIndex,
    scrollToIndex,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onClickCapture,
      // Stops the browser's native image/link drag ghost from hijacking the gesture.
      onDragStart: (e: React.DragEvent<T>) => e.preventDefault(),
    },
  };
}
