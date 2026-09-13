const { onRequest } = require("firebase-functions/v2/https");

const ALLOWED_HOSTS = [
  "facebook.com",
  "www.facebook.com",
  "m.facebook.com",
  "fb.watch"
];

function isAllowedFacebookHost(hostname) {
  const host = hostname.toLowerCase();

  return (
    ALLOWED_HOSTS.includes(host) ||
    host.endsWith(".facebook.com")
  );
}

function decodeHtmlEntities(value = "") {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) =>
      String.fromCharCode(Number(code))
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCharCode(parseInt(code, 16))
    );
}

function extractMetaContent(html, propertyName) {
  const metaTags = html.match(/<meta\b[^>]*>/gi) || [];

  for (const tag of metaTags) {
    const propertyMatch = tag.match(
      /\b(?:property|name)\s*=\s*["']([^"']+)["']/i
    );

    if (!propertyMatch) continue;

    if (
      propertyMatch[1].toLowerCase() !== propertyName.toLowerCase()
    ) {
      continue;
    }

    const contentMatch = tag.match(
      /\bcontent\s*=\s*["']([^"']*)["']/i
    );

    if (contentMatch) {
      return decodeHtmlEntities(contentMatch[1].trim());
    }
  }

  return "";
}

function extractPageTitle(html) {
  const match = html.match(
    /<title\b[^>]*>([\s\S]*?)<\/title>/i
  );

  if (!match) return "";

  return decodeHtmlEntities(
    match[1]
      .replace(/<[^>]+>/g, "")
      .trim()
  );
}

exports.fetchFacebookMetadata = onRequest(
  {
    region: "us-central1",
    timeoutSeconds: 30,
    memory: "256MiB"
  },
  async (req, res) => {
    // CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set(
      "Access-Control-Allow-Methods",
      "POST, OPTIONS"
    );
    res.set(
      "Access-Control-Allow-Headers",
      "Content-Type"
    );

    // Preflight
    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    // Only POST
    if (req.method !== "POST") {
      return res.status(405).json({
        ok: false,
        error: "Only POST requests are allowed."
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
          error: "Facebook URL is required."
        });
      }

      let parsedUrl;

      try {
        parsedUrl = new URL(facebookUrl);
      } catch {
        return res.status(400).json({
          ok: false,
          error: "Invalid URL."
        });
      }

      if (
        !["http:", "https:"].includes(parsedUrl.protocol)
      ) {
        return res.status(400).json({
          ok: false,
          error: "Only HTTP and HTTPS URLs are allowed."
        });
      }

      if (!isAllowedFacebookHost(parsedUrl.hostname)) {
        return res.status(400).json({
          ok: false,
          error: "Please provide a valid Facebook Reel URL."
        });
      }

      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 15000);

      let response;

      try {
        response = await fetch(parsedUrl.toString(), {
          method: "GET",
          redirect: "follow",
          signal: controller.signal,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36",
            "Accept":
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language":
              "en-US,en;q=0.9"
          }
        });
      } finally {
        clearTimeout(timeout);
      }

      if (!response.ok) {
        return res.status(422).json({
          ok: false,
          error:
            "Facebook did not return the Reel page metadata.",
          status: response.status
        });
      }

      const finalUrl = response.url || parsedUrl.toString();

      let finalParsedUrl;

      try {
        finalParsedUrl = new URL(finalUrl);
      } catch {
        finalParsedUrl = parsedUrl;
      }

      if (!isAllowedFacebookHost(finalParsedUrl.hostname)) {
        return res.status(422).json({
          ok: false,
          error:
            "The Facebook URL redirected to an unsupported destination."
        });
      }

      const html = await response.text();

      const ogTitle =
        extractMetaContent(html, "og:title");

      const ogImage =
        extractMetaContent(html, "og:image");

      const ogDescription =
        extractMetaContent(html, "og:description");

      const pageTitle =
        extractPageTitle(html);

      const title =
        ogTitle ||
        pageTitle ||
        "Rudra Bhakti Facebook Reel";

      const thumbnail =
        ogImage || "";

      if (!ogTitle && !pageTitle && !ogImage) {
        return res.status(422).json({
          ok: false,
          error:
            "Facebook metadata could not be read from this Reel. Facebook may be blocking automated metadata access."
        });
      }

      return res.status(200).json({
        ok: true,
        title,
        thumbnail,
        description: ogDescription,
        url: finalUrl
      });

    } catch (error) {
      console.error(
        "Facebook metadata error:",
        error
      );

      if (error.name === "AbortError") {
        return res.status(504).json({
          ok: false,
          error:
            "Facebook metadata request timed out."
        });
      }

      return res.status(500).json({
        ok: false,
        error:
          "Unable to fetch Facebook Reel metadata right now."
      });
    }
  }
);
