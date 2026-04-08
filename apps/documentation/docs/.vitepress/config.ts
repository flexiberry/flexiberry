import { defineConfig } from "vitepress";

export default defineConfig({
  title: "FlexiBerry",
  description: "FlexiBerry Documentation",
  head: [["link", { rel: "icon", href: "/logo.png" }]],
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
