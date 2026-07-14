import { writable } from "svelte/store";

// Read default value from localStorage if available
const storedIntensity = typeof window !== "undefined" ? window.localStorage.getItem("theme-intensity") : null;
const initialIntensity = storedIntensity ? parseInt(storedIntensity, 10) : 50;

/** Tracks the theme lightness/darkness intensity (0 to 100). */
export const themeIntensity = writable<number>(initialIntensity);

if (typeof window !== "undefined") {
  themeIntensity.subscribe((value) => {
    window.localStorage.setItem("theme-intensity", value.toString());
  });
}
