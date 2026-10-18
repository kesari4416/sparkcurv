'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Gauge } from 'lucide-react';
import type { Tool } from '@/lib/services';
import { ease } from '@/lib/tokens';
import { SectionIntro } from '@/components/SectionIntro';

/**
 * Technologies used for a service. Vendor logos are drawn for light backgrounds, so each
 * sits on a small light tile; the name runs underneath in mono. A tool without a logo file
 * gets a neutral gauge icon on the same tile.
 */
export function ToolGrid({ tools }: { tools: Tool[] }) {
  return (
    <section aria-labelledby="tools-title" className="py-24 md:py-32 [content-visibility:auto] [contain-intrinsic-size:auto_700px]">
      <div className="mx-auto max-w-site px-gutter">
        <SectionIntro
          id="tools-title"
          eyebrow="Technologies we use"
          lead="The tools"
          accent="we trust."
          dot="silver"
          aside={
            <p className="tabular font-mono text-eyebrow uppercase text-bone/50">
              {String(tools.length).padStart(2, '0')} technologies
            </p>
          }
          className="mb-12 md:mb-16"
        />

        <ul className="grid grid-cols-2 border-l border-t sm:grid-cols-3 lg:grid-cols-6">
          {tools.map((tool, i) => (
            <motion.li
              key={tool.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: '0px 0px -5% 0px' }}
              transition={{ duration: 0.8, ease: ease.out, delay: (i % 6) * 0.05 }}
              className="group flex flex-col items-center justify-center gap-4 border-b border-r px-4 py-8 transition-colors duration-500 hover:bg-bone/[0.03] md:py-10"
            >
              <span className="grid h-16 w-16 place-items-center rounded-2xl border bg-[#F4F2ED] p-3 transition-transform duration-500 ease-expo-out group-hover:-translate-y-1 md:h-[4.5rem] md:w-[4.5rem]">
                {tool.logo ? (
                  <Image src={tool.logo} alt="" width={48} height={48} className="h-full w-full object-contain" />
                ) : (
                  <Gauge aria-hidden strokeWidth={1.5} className="h-7 w-7 text-[#0E0E10]" />
                )}
              </span>
              <span className="text-center font-mono text-[0.7rem] uppercase tracking-[0.14em] text-bone/70 transition-colors group-hover:text-bone">
                {tool.name}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
