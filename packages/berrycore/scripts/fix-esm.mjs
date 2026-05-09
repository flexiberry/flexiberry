import fs from 'fs';
import path from 'path';

function walk(dir) {
    for (const file of fs.readdirSync(dir)) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
            walk(full);
        } else if (full.endsWith('.js') || full.endsWith('.d.ts')) {
            let content = fs.readFileSync(full, 'utf8');
            // replace from "./path" to "./path.js"
            // replace import "./path" to import "./path.js"
            const updated = content.replace(/(import|export)\s+(?:[^"']*?\s+from\s+)?["'](\.[^"']*)["']/g, (match, type, imp) => {
                if (!imp.endsWith('.js') && !imp.endsWith('.json')) {
                    // Check if it's a directory
                    const targetPath = path.join(path.dirname(full), imp);
                    let isDir = false;
                    try {
                        isDir = fs.statSync(targetPath).isDirectory();
                    } catch (e) {}
                    
                    if (isDir) {
                        imp += '/index.js';
                    } else {
                        imp += '.js';
                    }
                }
                return match.replace(/["']\.[^"']*["']/, `"${imp}"`);
            });
            if (content !== updated) {
                fs.writeFileSync(full, updated);
            }
        }
    }
}
walk('dist');
