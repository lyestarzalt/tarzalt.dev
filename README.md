# tarzalt.dev

Source code for my personal blog.

**Live site:** [tarzalt.dev](https://tarzalt.dev)

## Stack

- [Hugo](https://gohugo.io/) - Static site generator
- [FixIt](https://github.com/hugo-fixit/FixIt) - Theme
- Firebase - Hosting

## Local Development

```bash
# Run dev server
hugo server

# Run dev server (production mode)
hugo server -e production

# Build for production
hugo --gc --minify
```

## Maintenance

```bash
# Update theme
hugo mod get -u github.com/hugo-fixit/FixIt@latest
hugo mod tidy
```

## License

Content is my own. Theme is [FixIt](https://github.com/hugo-fixit/FixIt).
