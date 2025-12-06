const fs = require('fs').promises;
const path = require('path');

const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist', 'build']);
const BINARY_EXTS = new Set(['.png','.jpg','.jpeg','.gif','.ico','.zip','.tar','.gz','.z','.exe','.dll','.so','.bin','.pdf','.woff','.woff','.ttf','.eot','.mp','.mp','.mov']);

const root = path.resolve(__dirname, '..');

const emojiRegex = /\p{Emoji}/gu;

async function isBinaryByExt(filePath) {
  return BINARY_EXTS.has(path.extname(filePath).toLowerCase());
}

async function walk(dir, cb) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      await walk(full, cb);
    } else if (e.isFile()) {
      if (await isBinaryByExt(full)) continue;
      await cb(full);
    }
  }
}

async function processFile(file) {
  try {
    const content = await fs.readFile(file, 'utf');
    if (emojiRegex.test(content)) {
      const cleaned = content.replace(emojiRegex, '');
      await fs.writeFile(file, cleaned, 'utf');
      console.log('Updated:', path.relative(root, file));
      return true;
    }
  } catch (err) {
    // skip files that can't be read as utf
  }
  return false;
}

(async () => {
  console.log('Scanning from root:', root);
  const changed = [];
  await walk(root, async (file) => {
    const updated = await processFile(file);
    if (updated) changed.push(file);
  });

  console.log('\nDone. Files changed:', changed.length);
  if (changed.length) console.log('Run `git status` to review and commit changes.');
})();
