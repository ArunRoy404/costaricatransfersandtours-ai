import { execSync } from 'child_process';
import { existsSync, unlinkSync, cpSync } from 'fs';
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

console.log('\n📦 Step 2: Creating Linux/WordPress-compliant .zip packages...');

// Package crtt-neo-ai-chatbot.zip
const zipFile1 = resolve(rootDir, 'crtt-neo-ai-chatbot.zip');
const pluginFolder1 = resolve(rootDir, 'wordpress-plugin', 'crtt-neo-ai-chatbot');

if (existsSync(zipFile1)) unlinkSync(zipFile1);
const zip1 = new AdmZip();
zip1.addLocalFolder(pluginFolder1, 'crtt-neo-ai-chatbot');
zip1.writeZip(zipFile1);
console.log(`\n✅ Generated: ${zipFile1}`);

// Also synchronize and package neo-ai-chatbot.zip for convenience
const zipFile2 = resolve(rootDir, 'neo-ai-chatbot.zip');
const pluginFolder2 = resolve(rootDir, 'wordpress-plugin', 'neo-ai-chatbot');
cpSync(resolve(pluginFolder1, 'assets'), resolve(pluginFolder2, 'assets'), { recursive: true });
cpSync(resolve(pluginFolder1, 'crtt-neo-ai-chatbot.php'), resolve(pluginFolder2, 'neo-ai-chatbot.php'));

if (existsSync(zipFile2)) unlinkSync(zipFile2);
const zip2 = new AdmZip();
zip2.addLocalFolder(pluginFolder2, 'neo-ai-chatbot');
zip2.writeZip(zipFile2);
console.log(`✅ Generated: ${zipFile2}\n`);

console.log('Package entries (crtt-neo-ai-chatbot.zip):');
zip1.getEntries().forEach((entry) => {
  console.log(`  - ${entry.entryName}`);
});
console.log('');
