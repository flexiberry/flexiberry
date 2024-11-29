import {
  Decoration,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  type DecorationSet,
} from "@codemirror/view";
import { ApiSuggestionWidget } from "./ApiSuggestionWidget";
import { StateEffect } from "@codemirror/state";
import { StreamLanguage, syntaxHighlighting } from "@codemirror/language";
import { HighlightStyle } from "@codemirror/language";
import { themeAwareLanguageSupport } from "./CMTheme";

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
      if (lineText.includes("Api")) {
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

// export const myCustomLanguageSupport = new LanguageSupport(customLanguage);

// export const myCustomLanguageSupport = [
//   customLanguage,
//   syntaxHighlighting(customHighlightStyle),
// ];
