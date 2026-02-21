import * as cheerio from "cheerio";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const mediafire = url.searchParams.get("url");

    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    if (!mediafire) {
      return new Response(
        JSON.stringify({ status: false, error: "Missing ?url parameter" }),
        { headers }
      );
    }

    if (!mediafire.includes("mediafire.com")) {
      return new Response(
        JSON.stringify({ status: false, error: "Invalid Mediafire URL" }),
        { headers }
      );
    }

    try {
      const res = await fetch(mediafire, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36",
          "Referer": "https://www.mediafire.com/",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      let download =
        $("#downloadButton").attr("href") ||
        $("a.download_link").attr("href") ||
        $("a:contains('Download')").attr("href") ||
        null;

      if (!download) {
        throw new Error(
          "Download link not found. MediaFire layout may have changed."
        );
      }

      const filename =
        $(".filename").text().trim() ||
        $(".dl-btn-label").text().trim() ||
        null;

      const filesize =
        $(".dl-btn-label")
          .text()
          .match(/\(([^)]+)\)/)?.[1] || "Unknown";

      const uploaded =
        $(".details li:contains('Uploaded') span").text().trim() ||
        "Unknown";

      return new Response(
        JSON.stringify(
          {
            creator: "Chamod Nimsara",
            status: true,
            result: {
              filename,
              filesize,
              uploaded,
              download_url: download,
            },
          },
          null,
          2
        ),
        { headers }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({
          creator: "Chamod Nimsara",
          status: false,
          error: err.message,
        }),
        { headers }
      );
    }
  },
};
