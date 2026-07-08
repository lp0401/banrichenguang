const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.resolve(__dirname, '..', 'packages', 'miniapp', 'src', 'pages');

function walk(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, callback);
    } else {
      callback(fullPath);
    }
  }
}

let updated = 0;
walk(PAGES_DIR, (filePath) => {
  if (!filePath.endsWith('.tsx')) return;
  const base = path.basename(filePath, '.tsx');
  const importLine = `import './${base}.css';\n`;
  const cssPath = filePath.replace(/\.tsx$/, '.css');

  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(importLine.trim())) return;

  // Insert after any leading comments but before the first real import
  const lines = content.split('\n');
  let insertIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('//') || line.startsWith('/*') || line.startsWith('*') || line === '') {
      insertIndex = i + 1;
      continue;
    }
    break;
  }
  lines.splice(insertIndex, 0, importLine.trim());
  fs.writeFileSync(filePath, lines.join('\n'));
  updated++;

  if (!fs.existsSync(cssPath)) {
    fs.writeFileSync(
      cssPath,
      '/* placeholder to force Taro to emit the per-page .wxss */\npage { background-color: transparent; }\n'
    );
  }
});

console.log(`Updated ${updated} page .tsx files with page CSS imports.`);
