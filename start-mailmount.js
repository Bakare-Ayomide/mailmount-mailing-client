#!/usr/bin/env node

import concurrently from 'concurrently';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting MailMount Development Environment...');

concurrently([
  {
    command: 'npm run dev',
    name: 'backend',
    cwd: path.join(__dirname, 'server'),
    prefixColor: 'blue',
  },
  {
    command: 'npm run dev',
    name: 'frontend', 
    cwd: __dirname,
    prefixColor: 'green',
  }
], {
  prefix: 'name',
  killOthers: ['failure', 'success'],
  restartTries: 3,
}).then(
  () => {
    console.log('✅ All servers started successfully!');
  },
  (error) => {
    console.error('❌ Error starting servers:', error);
    process.exit(1);
  }
);