import { create } from 'zustand';
import type Lenis from 'lenis';

type UIState = {
  /** True once the preloader curtain starts lifting; sections wait for it before animating in. */
  introDone: boolean;
  finishIntro: () => void;
  /** The smooth-scroll instance, or null when reduced motion keeps native scrolling. */
  lenis: Lenis | null;
  setLenis: (lenis: Lenis | null) => void;
};

export const useUI = create<UIState>((set) => ({
  introDone: false,
  finishIntro: () => set({ introDone: true }),
  lenis: null,
  setLenis: (lenis) => set({ lenis }),
}));
