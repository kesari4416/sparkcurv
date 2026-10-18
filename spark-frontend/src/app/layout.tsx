import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import localFont from 'next/font/local';
import { Geist_Mono, Inter, Manrope } from 'next/font/google';
import { palette } from '@/lib/tokens';
import { DeferredChat } from '@/components/DeferredChat';
import { themeBootScript } from '@/lib/theme';
import './globals.css';

// New design: Clash Display (headlines) + Satoshi (body), both by Indian Type Foundry and
// self-hosted from src/fonts (licence in src/fonts/LICENSE.md). Variable fonts, so every
// weight comes from one file each; next/font preloads them and generates size-adjusted
// fallbacks so the swap doesn't shift layout.
const display = localFont({
  src: '../fonts/ClashDisplay-Variable.woff2',
  weight: '200 700',
  variable: '--font-display',
  display: 'swap',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});
const sans = localFont({
  src: '../fonts/Satoshi-Variable.woff2',
  weight: '300 900',
  variable: '--font-sans',
  display: 'swap',
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
});
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap', preload: false });

// Legacy pages. Not preloaded: they are not needed for the home page's first paint.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap', preload: false });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap', preload: false });

export const metadata: Metadata = {
  metadataBase: new URL('https://sparkcurv.com'),
  // Pages that set a plain title get the company name appended; service and company pages
  // set their full SEO title with `absolute`.
  title: { default: 'SparkCurv Technologies | We Engineer Digital Evolution', template: '%s | SparkCurv Technologies' },
  icons: { icon: '/images/logo/SPARKCURVEICON.png' },
};

export const viewport: Viewport = {
  themeColor: palette.ink.DEFAULT,
};

const GA_ID = 'G-QXDJMFR4Q7';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // sc-first-load: marks a hard page load; removed once the first page has rendered
    // (see the Preloader and components/FirstLoadDone).
    <html
      lang="en"
      className={`sc-first-load ${display.variable} ${sans.variable} ${mono.variable} ${inter.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Sets data-theme before first paint (see lib/theme.ts). */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>
        {children}

        {/* Google Analytics 4: loaded once the page is idle, so it never delays rendering. */}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
        <Script id="ga4" strategy="lazyOnload">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
        </Script>

        {/* Tawk.to live chat: injected on first interaction (see DeferredChat). */}
        <DeferredChat />
      </body>
    </html>
  );
}
