export type BlockType = 'Env' | 'Var' | 'Task' | 'Api' | 'Step' | 'Code';

export interface BerryBlock {
  id: string;
  type: BlockType;
  content: string;
  viewMode?: 'code' | 'wizard';
  collapsed?: boolean;
}

export function parseBerryBlocks(code: string): BerryBlock[] {
  const blocks: BerryBlock[] = [];
  const lines = code.split('\n');
  
  let currentBlock: BerryBlock | null = null;
  let pendingLines: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    const isComment = trimmed.startsWith('##');
    const isBlank = trimmed === '';
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
                   
      const content = pendingLines.length > 0
        ? pendingLines.join('\n') + '\n' + line
        : line;
        
      currentBlock = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        content,
        collapsed: false
      };
      pendingLines = [];
    } else if (isComment || isBlank) {
      pendingLines.push(line);
    } else {
      if (currentBlock) {
        if (pendingLines.length > 0) {
          currentBlock.content += '\n' + pendingLines.join('\n');
          pendingLines = [];
        }
        currentBlock.content += '\n' + line;
      } else {
        const content = pendingLines.length > 0
          ? pendingLines.join('\n') + '\n' + line
          : line;
          
        currentBlock = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'Code',
          content
        };
        pendingLines = [];
      }
    }
  }
  
  if (currentBlock) {
    if (pendingLines.length > 0) {
      currentBlock.content += '\n' + pendingLines.join('\n');
    }
    currentBlock.content = currentBlock.content.trimEnd();
    blocks.push(currentBlock);
  } else if (pendingLines.length > 0) {
    blocks.push({
      id: Math.random().toString(36).substr(2, 9),
      type: 'Code',
      content: pendingLines.join('\n').trimEnd()
    });
  }
  
  if (blocks.length === 0) {
    blocks.push({ id: Math.random().toString(36).substr(2, 9), type: 'Code', content: '' });
  }
  
  return blocks;
}

export function stringifyBerryBlocks(blocks: BerryBlock[]): string {
  return blocks.map(b => b.content.trim()).filter(Boolean).join('\n\n');
}
