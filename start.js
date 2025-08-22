const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting ShiftManager2 with PM2...');
console.log('📁 Working directory:', process.cwd());

// Spawn npm run dev
const child = spawn('npm', ['run', 'dev'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true,
  cwd: process.cwd()
});

// Forward stdout and stderr to PM2 logs
child.stdout.on('data', (data) => {
  console.log(data.toString().trim());
});

child.stderr.on('data', (data) => {
  console.error(data.toString().trim());
});

child.on('error', (error) => {
  console.error('❌ Failed to start npm:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`📤 npm process exited with code ${code}`);
  if (code !== 0) {
    process.exit(code);
  }
});

// Keep the process alive
process.stdin.resume();

// Handle process termination
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down...');
  child.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down...');
  child.kill('SIGTERM');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  child.kill();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  child.kill();
  process.exit(1);
});
