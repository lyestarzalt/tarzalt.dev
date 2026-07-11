// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkCallout from 'remark-github-blockquote-alert';
import mermaid from 'astro-mermaid';
import { agentmarkup } from '@agentmarkup/astro';
import agentFooter from './src/integrations/agent-footer.ts';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://tarzalt.dev',
  integrations: [
    mermaid({ autoTheme: true }),
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/wtf') && !page.includes('/definitely-not-a-secret'),
      serialize(item) {
        item.lastmod = new Date().toISOString();
        return item;
      },
    }),
    react(),
    agentmarkup({
      site: 'https://tarzalt.dev',
      name: 'Lyes Tarzalt',
      description: 'Personal site and blog of Lyes Tarzalt.',
      markdownPages: { enabled: true },
      contentSignalHeaders: {
        enabled: true,
        // Match /public/robots.txt policy: search allowed, AI training blocked.
        search: 'yes',
        aiTrain: 'no',
        aiInput: 'no',
      },
    }),
    agentFooter(),
  ],

  markdown: {
    remarkPlugins: [remarkMath, remarkCallout],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
