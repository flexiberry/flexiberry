import { LanguageSupport, StreamLanguage } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

const berryLanguage = StreamLanguage.define({
  token: (stream) => {
    // Comments
    if (stream.match(/\*\*.*/)) return "comment";

    // Keywords
    if (
      stream.match(
        /Env|Var|Api|Url|Body|Header|Testcase|Step|Capture|Status|If|Break|Continue|Jump to/
      )
    )
      return "keyword";

    // HTTP Methods
    if (stream.match(/GET|POST|PUT|DELETE|PATCH/)) return "function";

    // Environment pointers
    if (stream.match(/@\w+/)) return "variable-2";
    if (stream.match(/#\w+/)) return "variable-2";

    // Property names (with or without values)
    if (stream.match(/^[\s]*-\s*[a-zA-Z_][a-zA-Z0-9_]*(?=:)/))
      return "property";

    // Colon after property names
    if (stream.match(/:/)) return "punctuation";

    // Numbers
    if (stream.match(/\d+/)) return "number";

    // Multiline strings in backticks
    if (stream.match(/`[^`]*(?:\n\s*[^`]*)*`/)) return "string";

    // Single-line strings
    if (stream.match(/'[^']*'/)) return "string";

    // Operators
    if (stream.match(/==|!=|>|<|>=|<=|Equal/)) return "operator";

    // Punctuation
    if (stream.match(/[\(\)\[\]\{\}:,\-]/)) return "punctuation";

    // Skip whitespace
    if (stream.match(/\s+/)) return null;

    stream.next();
    return null;
  },
});

export function berryLanguageSupport() {
  return new LanguageSupport(berryLanguage);
}
