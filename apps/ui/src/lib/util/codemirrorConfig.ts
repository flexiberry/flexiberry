import {
  Decoration,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { ApiSuggestionWidget } from "./ApiSuggestionWidget";
import { StateEffect } from "@codemirror/state";
import { StreamLanguage, syntaxHighlighting } from "@codemirror/language";
import { Tag, tags } from "@lezer/highlight";
import { HighlightStyle } from "@codemirror/language";
import { LanguageSupport } from "@codemirror/language"; // Import your custom language

export const clearSuggestionEffect = StateEffect.define<boolean>();

// Plugin to detect "api" text
export const apiDetectorPlugin = ViewPlugin.fromClass(
  class {
    decorations: any;

    constructor(view: EditorView) {
      this.decorations = this.checkForApi(view);
    }

    checkForApi(view: EditorView) {
      const doc = view.state.doc;
      const cursorPos = view.state.selection.main.head;
      const line = doc.lineAt(cursorPos);
      const lineText = line.text;

      if (lineText.includes("api")) {
        return Decoration.set([
          Decoration.widget({
            widget: new ApiSuggestionWidget(view),
            side: 1,
          }).range(line.from + lineText.indexOf("api") + 3),
        ]);
      }
      return Decoration.none;
    }

    update(update: ViewUpdate) {
      // Check for clear effect
      for (let tr of update.transactions) {
        for (let effect of tr.effects) {
          if (effect.is(clearSuggestionEffect)) {
            this.decorations = Decoration.none;
            return;
          }
        }
      }

      if (update.docChanged || update.selectionSet) {
        this.decorations = this.checkForApi(update.view);
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

// Dark Theme Colors
const darkThemeHighlightStyle = HighlightStyle.define([
  { tag: tags.comment, color: "#6a9955" },
  { tag: tags.number, color: "#b5cea8" },
  { tag: tags.variableName, color: "#9cdcfe" },
  { tag: tags.keyword, color: "#c678dd" },
  { tag: tags.string, color: "#ce9178" },
  { tag: tags.bool, color: "#569cd6" },
]);

// Light Theme Colors
const lightThemeHighlightStyle = HighlightStyle.define([
  { tag: tags.comment, color: "#008000" },
  { tag: tags.number, color: "#098658" },
  { tag: tags.variableName, color: "#0000ff" },
  { tag: tags.keyword, color: "#0000ff" },
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
  startState() {
    return {};
  },

  token(stream: { match: (arg0: RegExp) => any; next: () => void }) {
    if (stream.match(/^#[a-zA-Z0-9]+/)) {
      return "variableName"; // Format as a keyword
    } else if (stream.match(/^\d+/)) {
      return "number"; // Format as a number
    } else if (stream.match(/^[a-zA-Z]+/)) {
      return "variableName"; // Format as a variable name
    } else {
      stream.next();
      return null; // No specific formatting
    }
  },
});

// export const myCustomLanguageSupport = new LanguageSupport(customLanguage);

// export const myCustomLanguageSupport = [
//   customLanguage,
//   syntaxHighlighting(customHighlightStyle),
// ];
