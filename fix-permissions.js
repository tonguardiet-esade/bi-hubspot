const fs = require('fs');
const path = require('path');

function chmodRecursive(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const stats = fs.statSync(dirPath);
  
  if (stats.isDirectory()) {
    try {
      fs.chmodSync(dirPath, 0o755);
    } catch (e) {
      console.warn(`Could not chmod directory ${dirPath}:`, e.message);
    }
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      chmodRecursive(path.join(dirPath, file));
    });
  } else {
    try {
      fs.chmodSync(dirPath, 0o644);
    } catch (e) {
      console.warn(`Could not chmod file ${dirPath}:`, e.message);
    }
  }
}

console.log("Fixing permissions recursively for 'src' and 'prisma'...");
chmodRecursive(path.resolve(__dirname, 'src'));
chmodRecursive(path.resolve(__dirname, 'prisma'));
console.log("Permissions fixed successfully!");
