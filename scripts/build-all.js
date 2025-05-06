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

function buildAll() {
  DIRS.forEach(dir => {
    const pkgs = findPackages(dir);
    pkgs.forEach(pkg => {
      console.log(`\nBuilding ${pkg} ...`);
      try {
        execSync('pnpm run build', { stdio: 'inherit', cwd: pkg });
      } catch (e) {
        console.error(`Failed to build ${pkg}`);
        process.exit(1);
      }
    });
  });
}

buildAll();
