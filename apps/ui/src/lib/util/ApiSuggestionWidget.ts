import { StateEffect } from "@codemirror/state";
import { EditorView, WidgetType } from "@codemirror/view";
import SuggestionWidget from "../ui/SuggestionWidget.svelte";
import { clearSuggestionEffect } from "./codemirrorConfig";

// Define the clear effect

export class ApiSuggestionWidget extends WidgetType {
  constructor(private view: EditorView) {
    super();
  }

  toDOM() {
    const wrapper = document.createElement("div");
    wrapper.className = "api-suggestion-widget";

    new SuggestionWidget({
      target: wrapper,
      props: {
        onInsert: (template: string) => {
          const transaction = this.view.state.update({
            changes: {
              from: this.view.state.selection.main.head,
              insert: template,
            },
          });
          this.view.dispatch(transaction);
        },
        onClose: () => {
          const transaction = this.view.state.update({
            effects: clearSuggestionEffect.of(true),
          });
          this.view.dispatch(transaction);
        },
      },
    });

    return wrapper;
  }
}
