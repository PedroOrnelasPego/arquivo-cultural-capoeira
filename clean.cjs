const fs = require('fs');
const path = require('path');

function removeDarkClasses(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/dark:[a-z0-9\-/\\[\]]+/g, '');
  content = content.replace(/\s+/g, ' '); // Normalize spaces to single space so that multiple spaces don't remain.
  // Wait, collapsing spacing kills formatting. Better replace with empty string + trim extra space inside quotes.
  // Or just write `content = content.replace(/\s+dark:[^\s"']+/g, '');`
  // let's do that:
  content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/\s+dark:[^\s"'>]+/gi, '');
  fs.writeFileSync(filePath, content, 'utf8');
}

removeDarkClasses(path.join(__dirname, '../src/pages/Dashboard.tsx'));
removeDarkClasses(path.join(__dirname, '../src/pages/Home.tsx'));
