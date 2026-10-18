'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { site } from '@/lib/content';
import { useUI } from '@/lib/store';
import { ease } from '@/lib/tokens';

/**
 * Floating WhatsApp button (bottom left; the live chat bubble sits bottom right), as on the
 * live site. Opens a chat with a pre-filled greeting. Hidden on the thank-you page.
 */
export function WhatsAppButton() {
  const pathname = usePathname();
  const introDone = useUI((s) => s.introDone);
  if (pathname === '/thank-you') return null;

  const href = `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(site.whatsapp.message)}`;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${site.name} on WhatsApp`}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={introDone ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 0.7, ease: ease.out, delay: 1.2 }}
      className="group fixed bottom-5 left-5 z-cta grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-10px_rgba(37,211,102,0.7)] transition-transform duration-500 ease-expo-out hover:-translate-y-1 md:bottom-6 md:left-6"
    >
      {/* WhatsApp glyph */}
      <svg aria-hidden viewBox="0 0 32 32" className="h-7 w-7 fill-current">
        <path d="M16.04 3C8.88 3 3.06 8.8 3.06 15.95c0 2.29.6 4.52 1.74 6.49L3 29l6.73-1.76a12.97 12.97 0 0 0 6.31 1.61h.01c7.16 0 12.98-5.8 12.98-12.95C29.03 8.8 23.2 3 16.04 3Zm0 23.67h-.01a10.8 10.8 0 0 1-5.5-1.5l-.4-.24-4 1.04 1.07-3.89-.26-.4a10.7 10.7 0 0 1-1.65-5.73c0-5.95 4.85-10.78 10.81-10.78 5.95 0 10.8 4.83 10.8 10.78 0 5.95-4.85 10.72-10.86 10.72Zm5.92-8.05c-.32-.16-1.92-.95-2.22-1.05-.3-.11-.51-.16-.73.16-.22.32-.84 1.05-1.03 1.27-.19.21-.38.24-.7.08-.32-.16-1.37-.5-2.6-1.6-.96-.85-1.61-1.9-1.8-2.22-.19-.32-.02-.5.14-.66.15-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.73-1.75-1-2.4-.26-.63-.53-.54-.73-.55h-.62c-.21 0-.56.08-.86.4-.3.32-1.13 1.1-1.13 2.69 0 1.58 1.16 3.12 1.32 3.33.16.21 2.28 3.47 5.52 4.87.77.33 1.37.53 1.84.68.77.24 1.48.21 2.03.13.62-.09 1.92-.78 2.19-1.54.27-.75.27-1.4.19-1.54-.08-.13-.29-.21-.61-.37Z" />
      </svg>
    </motion.a>
  );
}
