import { execSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

console.log('📦 Step 1: Building standalone widget bundle with Vite...');
execSync('npx vite build --config vite.config.widget.js', { cwd: rootDir, stdio: 'inherit' });

console.log('\n📦 Step 2: Creating WordPress Plugin .zip package...');
const zipFile = resolve(rootDir, 'neo-ai-chatbot.zip');
const pluginFolder = resolve(rootDir, 'wordpress-plugin', 'neo-ai-chatbot');

if (existsSync(zipFile)) {
  unlinkSync(zipFile);
}

try {
  execSync(`powershell -ExecutionPolicy Bypass -Command "Compress-Archive -Path '${pluginFolder}' -DestinationPath '${zipFile}' -Force"`, { cwd: rootDir, stdio: 'inherit' });
  console.log(`\n✅ Successfully generated WordPress Plugin: ${zipFile}\n`);
} catch (error) {
  console.error('Error creating zip package:', error);
  process.exit(1);
}
