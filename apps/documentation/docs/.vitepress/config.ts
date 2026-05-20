import { defineConfig } from "vitepress";

export default defineConfig({
  title: "FlexiBerry",
  description: "FlexiBerry Documentation",
  head: [
    ["link", { rel: "icon", href: "/logo.png" }],
    [
      "script",
      {
        async: "true",
        src: "https://www.googletagmanager.com/gtag/js?id=G-7KCF2JGTV5",
      },
    ],
    [
      "script",
      {},
      `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-7KCF2JGTV5');
      `,
    ],
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
