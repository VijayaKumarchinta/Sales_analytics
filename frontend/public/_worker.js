/**
 * Cloudflare Workers + Assets SPA fallback handler.
 *
 * This file is copied to the build output by Vite (from public/ to dist/)
 * and is automatically picked up by `wrangler deploy` as the Worker entry point.
 *
 * For any non-API request that doesn't match a static asset, we serve
 * index.html so Vue Router's createWebHistory() works correctly (SPA mode).
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const pathname = url.pathname

    // ── Static assets ─────────────────────────────────────────────
    // Let Cloudflare's asset system handle these directly.
    const extensions = /\.(css|js|mjs|json|ico|png|jpg|jpeg|gif|svg|webp|avif|woff2?|ttf|eot|map|txt)$/i
    if (extensions.test(pathname)) {
      return env.ASSETS.fetch(request)
    }

    // ── API requests ──────────────────────────────────────────────
    // Pass through to the backend — don't rewrite these.
    if (pathname.startsWith('/api')) {
      return env.ASSETS.fetch(request)
    }

    // ── SPA fallback ──────────────────────────────────────────────
    // For all other paths (/, /login, /dashboard/*, etc.):
    // First try the exact asset path. If it 404s, serve index.html.
    try {
      const response = await env.ASSETS.fetch(request)
      if (response.status === 404) {
        return await env.ASSETS.fetch(new URL('/index.html', url.origin), request)
      }
      return response
    } catch {
      try {
        return await env.ASSETS.fetch(new URL('/index.html', url.origin), request)
      } catch {
        return new Response('Application unavailable', { status: 503 })
      }
    }
  },
}
