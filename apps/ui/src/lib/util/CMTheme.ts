import { EditorView } from "@codemirror/view";

// Custom theme extension for grid lines
export const gridTheme = EditorView.theme({
  "&": {
    backgroundColor: "hsl(var(--primary) / 0.2)",
  },
  ".cm-content": {
    backgroundImage: `
          linear-gradient(to right, hsl(var(--primary) / 0.095) 1px, transparent 1px),
          linear-gradient(to bottom, hsl(var(--primary) / 0.095) 1px, transparent 1px)
          `,
    backgroundSize: "10px 10px",
  },
  ".cm-line": {
    padding: "0 4px",
  },
  ".cm-gutters": {
    backgroundColor: "hsl(var(--primary) / 1.0)",
  },
  ".cm-comment": {
    color: "#6a9955", // Color for comments
    fontStyle: "italic", // Italic style for comments
  },
  ".cm-number": {
    color: "#b5cea8", // Color for numbers
  },
  ".cm-variableName": {
    color: "#d69d85", // Color for variable names
  },
});
