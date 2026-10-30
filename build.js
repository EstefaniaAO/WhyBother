const fs = require('fs');

const files = [
  'js/math/noise.js',
  'js/systems/flowField.js',
  'js/systems/colorGrid.js',
  'js/systems/brushAgent.js',
  'js/systems/lightWaves.js',
  'js/systems/bookTunnel.js',
  'js/systems/movieTunnel.js',
  'js/systems/gameTunnel.js',
  'js/systems/aliceController.js',
  'js/systems/pocketWatch.js',
  'js/systems/createStage.js',
  'js/transitionManager.js',
  'js/main.js'
];

let bundle = '(() => {\n"use strict";\n\n';

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // Strip import statements
  content = content.replace(/^import\s+.*?;?\s*$/gm, '');
  // Strip export statements like 'export class', 'export const', 'export function'
  content = content.replace(/^export\s+(class|const|let|var|function)\s+/gm, '$1 ');
  bundle += '// --- ' + file + ' ---\n' + content + '\n\n';
}

bundle += '})();\n';

fs.writeFileSync('js/bundle.js', bundle);
console.log('Bundle created successfully: js/bundle.js (' + bundle.length + ' bytes)');
