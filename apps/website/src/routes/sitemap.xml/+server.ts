export const prerender = true;

export async function GET() {
  const pages = [
    "https://docs.flexiberry.dev/",
    "https://app.flexiberry.dev/",
    "",
    "features",
    "example",
    "playground",
    "changelog",
    "about",
    "contact",
    "privacy",
    "terms",
    "blog",
    "blog/quick-start",
    "blog/writing-berry-dsl",
    "blog/ci-cd-integration"
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(
      (page) => {
        const loc = page.startsWith("http") ? page : `https://flexiberry.dev/${page}`;
        return `
  <url>
    <loc>${loc}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === "" || page.startsWith("http") ? "1.0" : "0.8"}</priority>
  </url>`;
      }
    )
    .join("")}
</urlset>`;

  return new Response(sitemap.trim(), {
    headers: {
      "Content-Type": "application/xml"
    }
  });
}
