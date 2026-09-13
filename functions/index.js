const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");

setGlobalOptions({
  region: "us-central1"
});

/*
 * Rudra Bhakti
 * Facebook Reel Metadata Fetcher
 *
 * This endpoint:
 * - Accepts a Facebook Reel URL
 * - Fetches the page server-side
 * - Reads Open Graph metadata
 * - Returns title + thumbnail
 *
 * No Firestore is used.
 * Firebase Realtime Database remains the application's database.
 */

const ALLOWED_HOSTS = new Set([
  "facebook.com",
  "www.facebook.com",
  "m.facebook.com",
  "web.facebook.com",
  "fb.watch"
]);

function isAllowedFacebookUrl(value) {
  try {
    const url = new URL(value);

    if (url.protocol !== "https:") {
      return false;
    }

    const hostname = url.hostname.toLowerCase();

    return (
      ALLOWED_HOSTS.has(hostname) ||
      hostname.endsWith(".facebook.com")
    );
  } catch {
    return false;
  }
}

function decodeHtml(value) {
  if (!value) return "";

  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#47;/gi, "/");
}

function extractMeta(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${escaped}["'][^>]*>`,
      "i"
    )
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match && match[1]) {
      return decodeHtml(match[1].trim());
    }
  }

  return "";
}

function extractTitleTag(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

  if (!match) {
    return "";
  }

  return decodeHtml(
    match[1]
      .replace(/\s+/g, " ")
      .trim()
  );
}

function cleanFacebookTitle(title) {
  if (!title) return "";

  return title
    .replace(/\s+/g, " ")
    .replace(/\s*\|\s*Facebook\s*$/i, "")
    .replace(/\s*-\s*Facebook\s*$/i, "")
    .trim();
}

exports.fetchFacebookMetadata = onRequest(
  {
    cors: true,
    timeoutSeconds: 30,
    memory: "256MiB"
  },
  async (req, res) => {
    res.set("Cache-Control", "no-store");

    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    if (req.method !== "POST") {
      return res.status(405).json({
        ok: false,
        error: "POST method required."
      });
    }

    try {
      const facebookUrl =
        typeof req.body?.url === "string"
          ? req.body.url.trim()
          : "";

      if (!facebookUrl) {
        return res.status(400).json({
          ok: false,
          error: "Facebook Reel URL is required."
        });
      }

      if (!isAllowedFacebookUrl(facebookUrl)) {
        return res.status(400).json({
          ok: false,
          error: "Only valid Facebook Reel URLs are allowed."
        });
      }

      const response = await fetch(facebookUrl, {
        method: "GET",
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
          "Accept":
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language":
            "en-US,en;q=0.9"
        }
      });

      if (!response.ok) {
        return res.status(502).json({
          ok: false,
          error:
            "Facebook did not return the Reel page. Try again or enter the title and thumbnail manually."
        });
      }

      const html = await response.text();

      const ogTitle = extractMeta(html, "og:title");
      const ogImage = extractMeta(html, "og:image");

      const twitterTitle = extractMeta(html, "twitter:title");
      const twitterImage = extractMeta(html, "twitter:image");

      const pageTitle = extractTitleTag(html);

      const title = cleanFacebookTitle(
        ogTitle ||
        twitterTitle ||
        pageTitle
      );

      const thumbnail =
        ogImage ||
        twitterImage ||
        "";

      if (!title && !thumbnail) {
        return res.status(422).json({
          ok: false,
          error:
            "Facebook metadata could not be read. Facebook may be restricting automated access to this Reel."
        });
      }

      return res.status(200).json({
        ok: true,
        title: title || "Rudra Bhakti Facebook Reel",
        thumbnail,
        url: response.url || facebookUrl
      });

    } catch (error) {
      console.error(
        "Facebook metadata error:",
        error
      );

      return res.status(500).json({
        ok: false,
        error:
          "Unable to fetch Facebook Reel metadata right now."
      });
    }
  }
);
