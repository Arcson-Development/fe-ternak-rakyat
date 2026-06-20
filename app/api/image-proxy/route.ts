import { NextRequest, NextResponse } from "next/server";
import { DOMAIN_API } from "../../../utils/contants/env";

/**
 * Image proxy: fetches an image from the backend (or any allowed
 * host) and streams it back as a same-origin response. This
 * sidesteps the browser's `Cross-Origin-Resource-Policy:
 * same-origin` block that ImageKit (or any storage layer) sets on
 * image responses — we serve the bytes from the Next.js origin
 * (port 6091) so the embedder check passes.
 *
 * Whitelist: only the configured `DOMAIN_API` host (e.g.
 * `http://103.245.39.75:6090/v1`) plus its image-CDN sibling
 * (`http://103.245.39.75:6090/image`) are allowed. Everything else
 * is 403'd to avoid an open proxy.
 *
 * Usage from the client:
 *   <img src={`/api/image-proxy?url=${encodeURIComponent(remoteUrl)}`} />
 *
 * Or, from the adapter, simply set
 *   preview: `/api/image-proxy?url=${encodeURIComponent(fullUrl)}`
 *   on a PhotoRef — no per-call changes needed in the rendering
 *   components.
 *
 * Caching: 1h browser cache + 1h shared cache, immutable for the
 * duration. The image bytes never change after upload.
 */
const ALLOWED_HOSTS = new Set<string>([
  // API host (and its image CDN sibling on the same port)
  new URL(DOMAIN_API).host,
  // The hardcoded image base from the env file
  "103.245.39.75:6090",
  // Add more hosts here if the backend ever moves
]);

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (!ALLOWED_HOSTS.has(parsed.host)) {
    return NextResponse.json(
      { error: `Host ${parsed.host} not in allowlist` },
      { status: 403 }
    );
  }

  try {
    const upstream = await fetch(parsed.toString(), {
      // Pass through any upstream caching hints if present
      headers: { Accept: "image/*" },
    });
    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream ${upstream.status}` },
        { status: upstream.status }
      );
    }
    const contentType = upstream.headers.get("Content-Type") ?? "image/jpeg";
    const body = await upstream.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, immutable",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Fetch failed: ${(err as Error).message}` },
      { status: 502 }
    );
  }
}
