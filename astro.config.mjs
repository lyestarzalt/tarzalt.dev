// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkCallout from 'remark-github-blockquote-alert';
import mermaid from 'astro-mermaid';
import markdownForAgents from 'astro-markdown-for-agents';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://tarzalt.dev',
  integrations: [
    mermaid({ autoTheme: true }),
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/wtf'),
      serialize(item) {
        item.lastmod = new Date().toISOString();
        return item;
      },
    }),
    react(),
    markdownForAgents(),
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
