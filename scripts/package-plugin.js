import { execSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import process from 'process';

const require = createRequire(import.meta.url);
const AdmZip = require('adm-zip');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

console.log('📦 Step 1: Building standalone widget bundle with Vite...');
const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
execSync(`${npxCmd} vite build --config vite.config.widget.js`, { cwd: rootDir, stdio: 'inherit', shell: true });

console.log('\n📦 Step 2: Creating Linux/WordPress-compliant .zip package...');

// Package wordpress/crtt-neo-ai-chatbot into wordpress/crtt-neo-ai-chatbot.zip
const zipFile = resolve(rootDir, 'wordpress', 'crtt-neo-ai-chatbot.zip');
const pluginFolder = resolve(rootDir, 'wordpress', 'crtt-neo-ai-chatbot');

if (existsSync(zipFile)) unlinkSync(zipFile);

const zip = new AdmZip();
zip.addLocalFolder(pluginFolder, 'crtt-neo-ai-chatbot');
zip.writeZip(zipFile);

console.log(`\n✅ Generated: ${zipFile}\n`);

console.log('Package entries (crtt-neo-ai-chatbot.zip):');
zip.getEntries().forEach((entry) => {
  console.log(`  - ${entry.entryName}`);
});
console.log('');

