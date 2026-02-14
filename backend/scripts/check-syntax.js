const { execSync } = require('child_process');
const { readdirSync, statSync } = require('fs');
const path = require('path');

function findJsFiles(dir) {
  let results = [];
  for (const file of readdirSync(dir)) {
    const full = path.join(dir, file);
    const stat = statSync(full);
    if (stat.isDirectory()) results = results.concat(findJsFiles(full));
    else if (full.endsWith('.js')) results.push(full);
  }
  return results;
}

const root = path.join(__dirname, '..', 'src');
const files = findJsFiles(root);
let exitCode = 0;
for (const f of files) {
  try {
    console.log('Checking', f);
    execSync(`node --check "${f}"`, { stdio: 'inherit' });
  } catch (err) {
    console.error('Syntax error in', f);
    exitCode = 1;
  }
}
process.exit(exitCode);
