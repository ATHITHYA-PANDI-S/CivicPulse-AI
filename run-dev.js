const { spawn } = require('child_process');
const path = require('path');

const root = __dirname;
const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('================================================================');
console.log('🚀 Starting CivicPulse AI MERN Stack Development Servers...');
console.log('📡 Backend API:  http://localhost:5000');
console.log('💻 Frontend UI:   http://localhost:5173');
console.log('================================================================\n');

// 1. Start Server on port 5000
const serverProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(root, 'NULL-POINTERS-', 'server'),
  stdio: 'inherit',
  shell: true
});

// 2. Start Vite Client on port 5173
const clientProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(root, 'NULL-POINTERS-', 'client'),
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  console.log('\n🛑 Shutting down CivicPulse AI development servers...');
  serverProcess.kill();
  clientProcess.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
