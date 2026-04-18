export const onRequest: PagesFunction = async (context) => {
  const accept = context.request.headers.get('Accept') || '';
  if (!accept.includes('text/markdown')) {
    return context.next();
  }

  const url = new URL(context.request.url);
  let path = url.pathname;

  // Normalize: /blog/foo/ -> /blog/foo
  if (path.endsWith('/') && path !== '/') {
    path = path.slice(0, -1);
  }

  // Map to markdown cache path
  const mdPath = path === '/' ? '/_markdown-cache/index.md' : `/_markdown-cache${path}/index.md`;

  const mdUrl = new URL(mdPath, url.origin);
  const mdResponse = await context.env.ASSETS.fetch(mdUrl);

  if (mdResponse.ok) {
    return new Response(mdResponse.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        Vary: 'Accept',
      },
    });
  }

  return context.next();
};
