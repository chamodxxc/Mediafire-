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
      return new Response(JSON.stringify({ error: "Missing ?url parameter" }), { headers });
    }

    if (!mediafire.includes("mediafire.com")) {
      return new Response(JSON.stringify({ error: "Invalid Mediafire URL" }), { headers });
    }

    try {
      const res = await fetch(`https://api.nekolabs.web.id/px?url=${encodeURIComponent(mediafire)}`);
      const data = await res.json();
      const $ = cheerio.load(data.result.content);

      const filename = $(".dl-btn-label").attr("title") || $("div.intro div.filename").text().trim() || null;
      const filesize = $("ul.details li:nth-child(1) span").text().trim();
      const uploaded = $("ul.details li:nth-child(2) span").text().trim();
      const download = $("a#downloadButton").attr("href");

      if (!download) throw new Error("File not found");

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
        JSON.stringify({ creator: "Chamod Nimsara", status: false, error: err.message }),
        { headers }
      );
    }
  },
};
