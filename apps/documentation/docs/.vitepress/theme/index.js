// Custom VitePress theme for Flexiberry Documentation
import DefaultTheme from "vitepress/theme";
import "./index.css";

export default {
  ...DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    // You can register global components or perform other setup here
    // Example: app.component('MyGlobalComponent', MyGlobalComponent)
  },
  // Optionally override Layout or other components here
};
