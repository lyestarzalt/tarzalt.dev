import { useEffect, useState } from 'react';

interface Props {
  owner: string;
  repo: string;
  /** Number shown on first paint and if the fetch fails. */
  fallback: string;
  /** Append to the formatted number — e.g. "+ downloads". */
  suffix?: string;
  className?: string;
}

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface Cached {
  total: number;
  ts: number;
}

function readCache(key: string): Cached | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Cached;
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(key: string, total: number) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ total, ts: Date.now() }));
  } catch {
    // Ignore quota / private mode failures.
  }
}

function formatDownloads(n: number): string {
  if (n < 1_000) return n.toString();
  if (n < 10_000) {
    const k = n / 1_000;
    return `${k.toFixed(1).replace(/\.0$/, '')}k`;
  }
  if (n < 1_000_000) {
    return `${Math.round(n / 1_000)}k`;
  }
  const m = n / 1_000_000;
  return `${m.toFixed(1).replace(/\.0$/, '')}M`;
}

interface Asset {
  download_count: number;
}
interface Release {
  assets: Asset[];
}

/**
 * Live GitHub release download count. Renders the `fallback` first, then
 * fetches `api.github.com` on mount and replaces if successful. Caches
 * the result for an hour in sessionStorage so navigation between pages
 * doesn't re-fetch.
 *
 * Unauth GitHub API: 60 requests / hour. The cache keeps us well under that.
 */
export function GithubDownloadCount({ owner, repo, fallback, suffix = '', className }: Props) {
  const [display, setDisplay] = useState(fallback);

  useEffect(() => {
    const cacheKey = `gh-downloads:${owner}/${repo}`;
    let cancelled = false;

    const cached = readCache(cacheKey);
    if (cached) {
      setDisplay(`${formatDownloads(cached.total)}${suffix}`);
    }

    // Always refresh in the background — gives quicker feedback if number changed
    // while the cache was still warm but stale.
    fetch(`https://api.github.com/repos/${owner}/${repo}/releases?per_page=100`, {
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((res) => (res.ok ? (res.json() as Promise<Release[]>) : null))
      .then((releases) => {
        if (cancelled || !releases) return;
        const total = releases.reduce(
          (sum, r) => sum + r.assets.reduce((s, a) => s + (a.download_count ?? 0), 0),
          0,
        );
        if (total > 0) {
          writeCache(cacheKey, total);
          setDisplay(`${formatDownloads(total)}${suffix}`);
        }
      })
      .catch(() => {
        // Silent — fallback stays.
      });

    return () => {
      cancelled = true;
    };
  }, [owner, repo, suffix]);

  return <span className={className}>{display}</span>;
}
