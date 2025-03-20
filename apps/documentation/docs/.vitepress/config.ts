import { defineConfig } from "vitepress";

export default defineConfig({
  title: "FlexiBerry",
  description: "FlexiBerry Documentation",
  head: [["link", { rel: "icon", href: "/logo.png" }]],
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Commands", link: "/guide/" },
      { text: "App", link: "/guide/" },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "Guide",
          items: [{ text: "Getting Started", link: "/guide/getting-started" }],
        },
      ],
    },
  },
});
