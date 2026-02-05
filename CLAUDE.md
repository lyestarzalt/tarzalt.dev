# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog for tarzalt.dev built with Hugo static site generator and the FixIt theme. Hosted on Firebase.

## Commands

```bash
# Development server
hugo server

# Development server (production mode)
hugo server -e production

# Build for production
hugo --gc --minify

# Update theme
hugo mod get -u github.com/hugo-fixit/FixIt@latest
hugo mod tidy

# Create new post (page bundle)
hugo new content posts/my-post/index.md
```

## Architecture

- **Hugo Modules**: Theme (FixIt) is loaded via Go modules, not git submodules. See `config/_default/module.toml`
- **Config**: Split TOML configuration in `config/_default/` - main settings in `hugo.toml`, theme params in `params.toml`
- **Content**: Posts use page bundles (directory with `index.md` + images) in `content/posts/`
- **Deployment**: GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and deploys to Firebase on push to main

## Content Structure

Posts are organized as page bundles:
```
content/posts/my-post/
  index.md      # Post content with front matter
  image.png     # Co-located images referenced as `image.png` in markdown
```

## Front Matter

Standard front matter for posts (see `archetypes/default.md`):
```yaml
---
title: "Post Title"
subtitle: ""
date: 2024-01-01
description: ""
keywords: ""
comment: false
---
```
