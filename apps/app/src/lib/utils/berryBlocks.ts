export type BlockType = 'Env' | 'Var' | 'Task' | 'Api' | 'Step' | 'Code';

export interface BerryBlock {
  id: string;
  type: BlockType;
  content: string;
  viewMode?: 'code' | 'wizard';
}

export function parseBerryBlocks(code: string): BerryBlock[] {
  const blocks: BerryBlock[] = [];
  const lines = code.split('\n');
  
  let currentBlock: BerryBlock | null = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    const typeMatch = trimmed.match(/^(Env|Api|Var|Task|Step)\b/i);
    
    if (typeMatch) {
      if (currentBlock) {
        currentBlock.content = currentBlock.content.trimEnd();
        blocks.push(currentBlock);
      }
      const typeStr = typeMatch[1].toLowerCase();
      const type = typeStr === 'api' ? 'Api' : 
                   typeStr === 'var' ? 'Var' : 
                   typeStr === 'env' ? 'Env' :
                   typeStr === 'step' ? 'Step' : 'Task';
      currentBlock = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        content: line
      };
    } else {
      if (!currentBlock) {
        // If there's content before any keyword (e.g. comments or unknown syntax)
        if (trimmed === '') continue; // skip leading empty lines
        currentBlock = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'Code',
          content: line
        };
      } else {
        currentBlock.content += '\n' + line;
      }
    }
  }
  
  if (currentBlock) {
    currentBlock.content = currentBlock.content.trimEnd();
    blocks.push(currentBlock);
  }
  
  if (blocks.length === 0) {
    blocks.push({ id: Math.random().toString(36).substr(2, 9), type: 'Code', content: '' });
  }
  
  return blocks;
}

export function stringifyBerryBlocks(blocks: BerryBlock[]): string {
  return blocks.map(b => b.content.trim()).filter(Boolean).join('\n\n');
}
