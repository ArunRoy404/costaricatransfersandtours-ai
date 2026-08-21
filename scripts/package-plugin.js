import { execSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const AdmZip = require('adm-zip');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

console.log('📦 Step 1: Building standalone widget bundle with Vite...');
execSync('npx vite build --config vite.config.widget.js', { cwd: rootDir, stdio: 'inherit' });

console.log('\n📦 Step 2: Creating Linux/WordPress-compliant .zip package...');
const zipFile = resolve(rootDir, 'neo-ai-chatbot.zip');
const pluginFolder = resolve(rootDir, 'wordpress-plugin', 'neo-ai-chatbot');

if (existsSync(zipFile)) {
  unlinkSync(zipFile);
}

const zip = new AdmZip();
zip.addLocalFolder(pluginFolder, 'neo-ai-chatbot');
zip.writeZip(zipFile);

console.log(`\n✅ Successfully generated WordPress Plugin: ${zipFile}\n`);
console.log('Entries:');
zip.getEntries().forEach((entry) => {
  console.log(`  - ${entry.entryName}`);
});
console.log('');
