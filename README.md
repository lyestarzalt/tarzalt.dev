# tarzalt.dev

[![Astro](https://img.shields.io/badge/astro-v6-bc52ee?logo=astro&logoColor=white)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/tailwind-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![React](https://img.shields.io/badge/react-19-61dafb?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/typescript-strict-3178c6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Cloudflare](https://img.shields.io/badge/cloudflare-f38020?logo=cloudflare&logoColor=white)](https://tarzalt.dev)
[![Hits](https://hits.sh/github.com/lyestarzalt/tarzalt.dev.svg)](https://hits.sh/github.com/lyestarzalt/tarzalt.dev/)

Source code for **[tarzalt.dev](https://tarzalt.dev)**. A blog nobody subscribed to and a portfolio nobody asked for.

---

## Stack

| Tech                                      | What it does                           |
| :---------------------------------------- | :------------------------------------- |
| [Astro](https://astro.build) 6            | Generates the static site              |
| [Tailwind CSS](https://tailwindcss.com) 4 | Styling                                |
| [React](https://react.dev) 19             | The few parts that actually need JS    |
| [MDX](https://mdxjs.com)                  | Markdown that got promoted             |
| [KaTeX](https://katex.org)                | Math nobody will read                  |
| [Mermaid](https://mermaid.js.org)         | Diagrams                               |
| [Shiki](https://shiki.style)              | Syntax highlighting, GitHub light/dark |
| [Cloudflare](https://www.cloudflare.com)  | Hosting                                |

## Setup

Node.js >= 22.12

```bash
npm install
npm run dev       # localhost:4321
```

## Scripts

| Command                | Description                      |
| :--------------------- | :------------------------------- |
| `npm run dev`          | Dev server                       |
| `npm run build`        | Production build to `./dist/`    |
| `npm run preview`      | Preview production build locally |
| `npm run lint`         | Find problems                    |
| `npm run format`       | Fix formatting                   |
| `npm run format:check` | Find formatting problems         |
| `npm run typecheck`    | `astro check`                    |

## Structure

```
src/
├── components/       # Astro and React components
├── config/           # Navigation, social links
├── content.config.ts # Blog collection schema
├── data/blog/        # Posts as page bundles
│   └── my-post/
│       ├── index.md
│       └── cover.png
├── layouts/          # Base and BlogPost layouts
├── lib/              # Shared utilities
├── pages/
│   ├── blog/         # Listing + dynamic [slug] route
│   ├── projects/     # Project pages
│   ├── about.astro
│   └── index.astro
└── styles/           # Global CSS
public/               # Static assets
```

## Writing posts

Create a directory under `src/data/blog/`:

```
src/data/blog/my-new-post/
  index.md      # or .mdx if markdown wasn't enough
  cover.png
```

```yaml
---
title: 'Post Title'
date: 2024-01-01
description: 'Short description'
tags: ['tag1', 'tag2']
featuredImage: './cover.png'
draft: false
---
```

Images use relative paths: `![alt](./image.png)`

## Code quality

Husky + lint-staged run Prettier and ESLint on staged files before each commit. You'll know when you forgot a semicolon.

## License

[MIT](LICENSE)
