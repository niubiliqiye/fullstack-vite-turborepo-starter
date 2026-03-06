const { execSync } = require('node:child_process');

const args = process.argv.slice(2);

if (args.includes('--clean')) {
  execSync('npm run clean', { stdio: 'inherit' });
}

execSync('tsc', { stdio: 'inherit' });
