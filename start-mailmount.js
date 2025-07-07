import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting MailMount...');

// Start backend
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'pipe',
  shell: true
});

backend.stdout.on('data', (data) => {
  console.log(`[Backend] ${data.toString().trim()}`);
});

backend.stderr.on('data', (data) => {
  console.error(`[Backend Error] ${data.toString().trim()}`);
});

// Start frontend
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  stdio: 'pipe',
  shell: true
});

frontend.stdout.on('data', (data) => {
  console.log(`[Frontend] ${data.toString().trim()}`);
});

frontend.stderr.on('data', (data) => {
  console.error(`[Frontend Error] ${data.toString().trim()}`);
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down MailMount...');
  backend.kill();
  frontend.kill();
  process.exit(0);
});

console.log('✅ MailMount started! Backend on :3001, Frontend on :5173');