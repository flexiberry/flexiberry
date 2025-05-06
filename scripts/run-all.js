#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIRS = ['apps', 'packages'];

function findPackages(dir) {
  const absDir = path.join(ROOT, dir);
  return fs.readdirSync(absDir)
    .map(name => path.join(absDir, name))
    .filter(p => fs.existsSync(path.join(p, 'package.json')));
}

function runAll() {
  DIRS.forEach(dir => {
    const pkgs = findPackages(dir);
    pkgs.forEach(pkg => {
      console.log(`\nRunning dev in ${pkg} ...`);
      try {
        execSync('pnpm run dev', { stdio: 'inherit', cwd: pkg });
      } catch (e) {
        console.error(`Failed to run dev in ${pkg}`);
        process.exit(1);
      }
    });
  });
}

runAll();
