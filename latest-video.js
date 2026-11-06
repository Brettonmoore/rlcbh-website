// latest-video — Netlify Function
// Proxies the Real Life Church YouTube channel feed server-side (browsers can
// be blocked by CORS) and returns the raw Atom XML, exactly as index.html's
// Watch-page script expects: it fetches /.netlify/functions/latest-video,
// parses the XML itself, and falls back to the built-in "Made To Rule"
// graphic if this function or the feed fails.
//
// Channel: @RealLifeOnline — UCcQ6BTdOPS78nbcLEii16Sw
// Spec: launch note inside index.html ("LAUNCH STEP: add a Netlify Function
// named \"latest-video\" ... caches it about 5 minutes, and returns the XML").

const CHANNEL_ID = "UCcQ6BTdOPS78nbcLEii16Sw";
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

export default async () => {
  try {
    const upstream = await fetch(FEED_URL, {
      headers: { "User-Agent": "rlcbh-latest-video/1.0" },
    });
    if (!upstream.ok) {
      return new Response(`YouTube feed returned ${upstream.status}`, {
        status: 502,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    const xml = await upstream.text();
    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/atom+xml; charset=utf-8",
        // ~5 minute cache at the CDN edge, per the launch spec.
        "Cache-Control": "public, max-age=300, s-maxage=300",
        "Netlify-CDN-Cache-Control": "public, s-maxage=300, durable",
      },
    });
  } catch (err) {
    return new Response(`Feed fetch failed: ${err && err.message ? err.message : err}`, {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
};

export const config = { path: "/.netlify/functions/latest-video" };
