import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(frontendRoot, '..');
const sourceNextDir = path.join(frontendRoot, '.next');
const sourceStandaloneDir = path.join(sourceNextDir, 'standalone');
const sourcePublicDir = path.join(frontendRoot, 'public');
const sourceStaticDir = path.join(sourceNextDir, 'static');
const frontendDistDir = path.join(frontendRoot, 'dist');
const backendDistDir = path.join(repoRoot, 'backend', 'dist');

function removeDir(targetPath) {
  fs.rmSync(targetPath, { recursive: true, force: true });
}

function copyDir(sourcePath, targetPath) {
  fs.cpSync(sourcePath, targetPath, { recursive: true });
}

function ensureRuntimeAssets(standaloneDir) {
  const standaloneNextDir = path.join(standaloneDir, '.next');
  const staticTargetDir = path.join(standaloneNextDir, 'static');
  const publicTargetDir = path.join(standaloneDir, 'public');

  fs.mkdirSync(standaloneNextDir, { recursive: true });

  if (fs.existsSync(sourceStaticDir)) {
    removeDir(staticTargetDir);
    copyDir(sourceStaticDir, staticTargetDir);
  }

  if (fs.existsSync(sourcePublicDir)) {
    removeDir(publicTargetDir);
    copyDir(sourcePublicDir, publicTargetDir);
  }
}

removeDir(frontendDistDir);
removeDir(backendDistDir);

if (!fs.existsSync(sourceNextDir)) {
  throw new Error('Cannot find frontend/.next. Run next build before syncing the output.');
}

if (!fs.existsSync(sourceStandaloneDir)) {
  throw new Error('Cannot find frontend/.next/standalone. Run next build before syncing the output.');
}

copyDir(path.join(sourceStandaloneDir, 'frontend'), path.join(frontendDistDir, 'standalone'));
ensureRuntimeAssets(path.join(frontendDistDir, 'standalone'));
copyDir(frontendDistDir, backendDistDir);

console.log('Frontend build output copied to frontend/dist and backend/dist');