import { Providers } from '@/components/Providers';
import { HomeHeader } from '@/components/HomeHeader';
import { Grain } from '@/components/Grain';
import { ThemeMarker } from '@/components/ThemeMarker';
import { FirstLoadDone } from '@/components/FirstLoadDone';
import { Preloader } from '@/sections/Preloader';
import { Footer } from '@/sections/Footer';

/**
 * Shell of every public page: dark theme, smooth scroll, header, footer and grain.
 * Only the home page plays the preloader; every other page marks the intro as done
 * on mount so the header appears straight away.
 */
export function SiteFrame({ children, preloader = false }: { children: React.ReactNode; preloader?: boolean }) {
  return (
    <div className="theme-ink">
      <ThemeMarker theme="ink" />
      <a
        href="#main"
        className="fixed left-4 top-4 z-preloader -translate-y-24 rounded-full bg-bone px-4 py-2 text-sm text-ink focus:translate-y-0"
      >
        Skip to content
      </a>
      <Providers>
        {preloader ? <Preloader /> : <FirstLoadDone />}
        <HomeHeader />
        <main id="main">{children}</main>
        <Footer />
        <Grain />
      </Providers>
    </div>
  );
}
