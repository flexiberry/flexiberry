import { StreamLanguage, LanguageSupport, HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

export interface BerryState {
  inBacktickString: boolean;
  inInterpolation: boolean;
  lineType: 'Api' | 'Var' | 'Step' | 'Task' | 'Url' | null;
  apiHasName: boolean;
  varHasHeader: boolean;
}

const streamLanguage = StreamLanguage.define<BerryState>({
  name: "berry",
  
  startState() {
    return {
      inBacktickString: false,
      inInterpolation: false,
      lineType: null,
      apiHasName: false,
      varHasHeader: false
    };
  },
  
  token(stream, state) {
    // 1. Handle spaces
    if (stream.eatSpace()) {
      return null;
    }
    
    // Reset line state at sol
    if (stream.sol()) {
      state.lineType = null;
      state.apiHasName = false;
      state.varHasHeader = false;
      
      // Peek ahead to detect line type
      if (stream.match(/^\s*(Api)\b/i, false)) {
        state.lineType = 'Api';
      } else if (stream.match(/^\s*(Var)\b/i, false)) {
        state.lineType = 'Var';
      } else if (stream.match(/^\s*(Step)\b/i, false)) {
        state.lineType = 'Step';
      } else if (stream.match(/^\s*(Task)\b/i, false)) {
        state.lineType = 'Task';
      } else if (stream.match(/^\s*(Url)\b/i, false)) {
        state.lineType = 'Url';
      }
    }
    
    // 2. Handle backtick multiline strings
    if (state.inBacktickString) {
      while (!stream.eol()) {
        if (stream.next() === '`') {
          state.inBacktickString = false;
          break;
        }
      }
      return "string";
    }
    
    if (stream.peek() === '`') {
      stream.next();
      state.inBacktickString = true;
      return "string";
    }
    
    // 3. Handle interpolation {{ ... }}
    if (state.inInterpolation) {
      if (stream.match(/^}}/)) {
        state.inInterpolation = false;
        return "punctuation";
      }
      // Highlight variables inside {{ }}
      if (stream.match(/^\$[a-zA-Z0-9_$.-]+/) || stream.match(/^[a-zA-Z_][a-zA-Z0-9_$.-]*/)) {
        return "variable";
      }
      stream.next();
      return "meta";
    }
    
    if (stream.match(/^{{/)) {
      state.inInterpolation = true;
      return "punctuation";
    }
    
    // 4. Handle comments starting with ##
    if (stream.match(/^##/)) {
      stream.skipToEnd();
      return "comment";
    }
    
    // 5. Handle strings
    // Double-quoted strings
    if (stream.match(/^"([^"\\]|\\.)*"/)) {
      return "string";
    }
    if (stream.peek() === '"') {
      stream.next();
      return "string";
    }
    // Single-quoted strings
    if (stream.match(/^'([^'\\]|\\.)*'/)) {
      return "string";
    }
    if (stream.peek() === "'") {
      stream.next();
      return "string";
    }
    
    // 6. Line type parsing
    if (state.lineType === 'Api') {
      if (stream.match(/^Api\b/i)) {
        return "keyword";
      }
      // Method (GET/POST/etc.)
      if (stream.match(/^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\b/i)) {
        return "keyword";
      }
      // Name identifier e.g. #authenticateUser
      if (stream.match(/^#[a-zA-Z0-9_\-]+/)) {
        state.apiHasName = true;
        return "def";
      }
      // Title
      if (state.apiHasName) {
        stream.skipToEnd();
        return "string";
      }
    }
    
    if (state.lineType === 'Var') {
      if (stream.match(/^Var\b/i)) {
        state.varHasHeader = true;
        return "keyword";
      }
      if (stream.match(/^@[a-zA-Z0-9_\-]+/)) {
        return "variable-2";
      }
      // Title or rest of declaration
      if (state.varHasHeader) {
        stream.skipToEnd();
        return "string";
      }
    }
    
    if (state.lineType === 'Url') {
      if (stream.match(/^Url\b/i)) {
        return "keyword";
      }
      if (stream.match(/^{{/)) {
        state.inInterpolation = true;
        return "punctuation";
      }
      if (stream.match(/^[^{}\s]+/)) {
        return "url";
      }
      stream.next();
      return "url";
    }
    
    // 7. General Keywords and Types
    const keywords = /^(Var|Api|Env|Task|Step|Link|Input|Skip|Body|Url|Header|Params|Capture|Check)\b/i;
    if (stream.match(keywords)) {
      return "keyword";
    }
    
    if (stream.match(/^(Call|CALL)\b/)) {
      return "keyword";
    }
    
    // 8. Operators and Constants
    const operators = /^(==|!=|<=|>=|<|>|OR|Or|or|AND|And|and)\b/;
    if (stream.match(operators) || stream.match(/^[\+\-\*\/=<>!]+/)) {
      return "operator";
    }
    
    const constants = /^(null|true|false)\b/i;
    if (stream.match(constants)) {
      return "atom";
    }
    
    // 9. Pointers and variables
    if (stream.match(/^@[a-zA-Z0-9_\-]+/)) {
      return "variable-2";
    }
    if (stream.match(/^\$[a-zA-Z0-9_$.-]+/) || stream.match(/^[a-zA-Z_][a-zA-Z0-9_$.-]*/)) {
      return "variable";
    }
    
    // 10. List-item hyphen and Key-value/Check properties
    if (stream.sol() && stream.match(/^\s*-\s*/)) {
      return "punctuation";
    }
    
    // Check if we are at a key-value property name (e.g. `key:` or `"key":` or `'key':`)
    if (stream.match(/^(['"][^'"]+['"]|[a-zA-Z0-9_\-]+)\s*:/, false)) {
      stream.match(/^(['"][^'"]+['"]|[a-zA-Z0-9_\-]+)/);
      return "property";
    }
    
    if (stream.match(/^:/)) {
      return "punctuation";
    }
    
    // 11. Numbers
    if (stream.match(/^\d+(\.\d+)?\b/)) {
      return "number";
    }
    
    // 12. Fallback
    stream.next();
    return null;
  }
});

export const berryLanguage = new LanguageSupport(streamLanguage);

// Custom Highlight Styles matching VS Code Extension (Catppuccin Macchiato colors for Dark mode)
export const berryDarkHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "#cba6f7" },
  { tag: tags.comment, color: "#6c7086", fontStyle: "italic" },
  { tag: tags.string, color: "#ffb86c" },
  { tag: tags.number, color: "#eed49f" },
  { tag: tags.bool, color: "#89b4fa" },
  { tag: tags.atom, color: "#f38ba8" },
  { tag: tags.variableName, color: "#cdd6f4" },
  { tag: tags.definition(tags.variableName), color: "#f38ba8" },
  { tag: [tags.special(tags.variableName), tags.typeName, tags.className], color: "#f38ba8" }, // pointers @target
  { tag: tags.propertyName, color: "#89b4fa" }, // keys in key-value pairs
  { tag: tags.operator, color: "#89dceb" },
  { tag: tags.punctuation, color: "#f38ba8" }, // hyphen, colon, braces
  { tag: tags.meta, color: "#cba6f7" },
  { tag: tags.url, color: "#78ca70", fontStyle: "italic bold underline" }
]);

// Custom Highlight Styles matching VS Code Extension (Catppuccin Latte colors for Light mode)
export const berryLightHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "#8839ef" },
  { tag: tags.comment, color: "#7c7f93", fontStyle: "italic" },
  { tag: tags.string, color: "#fe640b" },
  { tag: tags.number, color: "#df8e1d" },
  { tag: tags.bool, color: "#1e66f5" },
  { tag: tags.atom, color: "#d20f39" },
  { tag: tags.variableName, color: "#4c4f69" },
  { tag: tags.definition(tags.variableName), color: "#d20f39" },
  { tag: [tags.special(tags.variableName), tags.typeName, tags.className], color: "#d20f39" },
  { tag: tags.propertyName, color: "#1e66f5" },
  { tag: tags.operator, color: "#179287" },
  { tag: tags.punctuation, color: "#d20f39" },
  { tag: tags.meta, color: "#8839ef" },
  { tag: tags.url, color: "#40a02b", fontStyle: "italic bold underline" }
]);

export const berryDarkTheme = syntaxHighlighting(berryDarkHighlightStyle);
export const berryLightTheme = syntaxHighlighting(berryLightHighlightStyle);
