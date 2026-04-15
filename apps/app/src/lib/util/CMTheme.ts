import {
  HighlightStyle,
  syntaxHighlighting,
  StreamLanguage,
} from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { Tag, tags } from "@lezer/highlight";

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
});

// Dark Theme Colors
const darkThemeHighlightStyle = HighlightStyle.define([
  { tag: tags.comment, color: "#adb3bf" },
  { tag: tags.number, color: "#b5cea8" },
  { tag: tags.attributeName, color: "#81d490" },
  { tag: tags.variableName, color: "#b5ef02" },
  { tag: tags.keyword, color: "#c678dd" },
  { tag: tags.string, color: "#6abfff" },
  { tag: tags.bool, color: "#569cd6" },
]);

// Light Theme Colors
const lightThemeHighlightStyle = HighlightStyle.define([
  { tag: tags.comment, color: "#5c6370" },
  { tag: tags.number, color: "#098658" },
  { tag: tags.attributeName, color: "#0a8002" },
  { tag: tags.variableName, color: "#398400" },
  { tag: tags.string, color: "#ff8f5d" },
  { tag: tags.keyword, color: "#0068f3" },
  { tag: tags.string, color: "#a31515" },
  { tag: tags.bool, color: "#0000ff" },
]);

// Theme Configuration
export const themeAwareLanguageSupport = (isDarkMode: any) => {
  const highlightStyle = isDarkMode
    ? darkThemeHighlightStyle
    : lightThemeHighlightStyle;

  return [customLanguage, syntaxHighlighting(highlightStyle)];
};

export const customLanguage = StreamLanguage.define({
  startState: () => ({ multiLine: false }),

  token(stream, state) {
    // if (state.multiLine) {
    //   if (stream.match(/`\s/g)) {
    //     state.multiLine = false;
    //   } else {
    //     stream.eatWhile(/`\s/g);
    //   }
    //   return "comment";
    // }

    // if (stream.match(/`/g)) {
    //   state.multiLine = true;
    //   return "comment";
    // }
    if (stream.match(/^(\*\*\s*.+)$/g)) {
      return "lineComment"; // Format as a keyword
    } else if (stream.match(/^\d+/)) {
      return "number"; // Format as a number
    } else if (stream.match(/@\w*/s)) {
      return "identifier";
    } else if (stream.match(/-\s*(\S+)/)) {
      return "attributeName";
    } else if (stream.match(/^Var\s+/)) {
      return "keyword";
    } else if (
      stream.match(/^Env\s+/) ||
      stream.match(/^Api\s+/) ||
      stream.match(/^Body\s+/) ||
      stream.match(/^Header+/) ||
      stream.match(/^Url\s+/)
    ) {
      return "keyword";
    } else if (stream.match(/^[a-zA-Z]+/)) {
      return "variableName"; // Format as a variable name
    } else if (stream.match(/'([^']*)'/)) {
      return "string"; // Format as a variable name
    } else {
      stream.next();
      return null;
    }
  },
});
