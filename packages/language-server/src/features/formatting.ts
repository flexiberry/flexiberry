import { DocumentFormattingParams, TextEdit, Range, Position } from 'vscode-languageserver/node.js';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { LexerEngine, AstEngine, BerryFormatter } from '@flexiberry/berrycore';

/**
 * Formats a text document using the BerryFormatter and returns the appropriate replacement TextEdit[].
 */
export function formatTextDocument(
  document: TextDocument,
  params: DocumentFormattingParams
): TextEdit[] {
  const text = document.getText();
  try {
    const tokens = new LexerEngine(text).tokenize();
    const ast = new AstEngine(tokens).build();
    const formatter = new BerryFormatter({
      indentSize: params.options.tabSize ?? 4,
    });
    const formattedText = formatter.format(ast);

    // Full document range replacement
    const fullRange = Range.create(
      Position.create(0, 0),
      document.positionAt(text.length)
    );

    return [TextEdit.replace(fullRange, formattedText)];
  } catch (e: any) {
    throw new Error(`Berry formatting skipped due to error: ${e.message}`);
  }
}
