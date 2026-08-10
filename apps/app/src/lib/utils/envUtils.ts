import {
  LexerEngine,
  AstEngine,
  NodeType,
  type EnvStatementNode,
  type VarDeclarationNode,
} from "@flexiberry/berrycore";

/**
 * Extracts declared and referenced environments from a .berry script text
 * using BerryCore AST nodes (AstEngine).
 */
export function extractEnvironments(code: string): string[] {
  if (!code || !code.trim()) return [];
  const envs = new Set<string>();

  try {
    const tokens = new LexerEngine(code).tokenize();
    const ast = new AstEngine(tokens).build();

    for (const node of ast.body) {
      if (node.type === NodeType.EnvStatement) {
        const envNode = node as EnvStatementNode;
        if (Array.isArray(envNode.environments)) {
          envNode.environments.forEach((e: string) => {
            if (e && e.trim()) envs.add(e.trim());
          });
        }
      }
    }
  } catch {
    // Gracefully handle partial/incomplete AST syntax during live typing
  }

  return Array.from(envs);
}
