import { defineConfig } from "vitepress";

const GA_ID = process.env.VITE_GA_ID;

export default defineConfig({
  title: "FlexiBerry",
  description: "FlexiBerry Documentation",
  head: [
    ["link", { rel: "icon", href: "/logo.png" }],
    [
      "script",
      { type: "application/ld+json" },
      `{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Flexiberry Documentation",
        "url": "https://docs.flexiberry.dev",
        "description": "Official documentation, installation guides, CLI command manuals, and language reference specifications for the Flexiberry sequential API workflow runner."
      }`
    ],
    ...([
      [
        "script",
        {
          async: "true",
          src: `https://www.googletagmanager.com/gtag/js?id=G-7KCF2JGTV5`,
        },
      ] as any,
      [
        "script",
        {},
        `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-7KCF2JGTV5');
            `,
      ] as any,
    ]),
  ],
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Quick Start", link: "/quick-start" },
      { text: "CLI", link: "/cli" },
      { text: ".berry Language", link: "/berry-language" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Quick Start", link: "/quick-start" },
          { text: "CI / CD Integration", link: "/ci-cd" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "CLI Commands", link: "/cli" },
          { text: ".berry Language", link: "/berry-language" },
        ],
      },
    ],
  },
});
