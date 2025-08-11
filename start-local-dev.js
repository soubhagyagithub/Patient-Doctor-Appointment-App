#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');

// Set environment variable for local API
process.env.NEXT_PUBLIC_API_BASE = 'http://localhost:3001';

console.log('🚀 Starting local development environment...');
console.log('📊 API Base set to:', process.env.NEXT_PUBLIC_API_BASE);

// Check if db.json exists
if (!fs.existsSync('./db.json')) {
  console.error('❌ db.json not found. Please ensure the database file exists.');
  process.exit(1);
}

// Start JSON server
console.log('🗃️  Starting JSON Server...');
const jsonServer = spawn('npm', ['run', 'json-server'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env }
});

// Handle JSON server errors
jsonServer.on('error', (err) => {
  console.error('❌ Failed to start JSON server:', err);
  process.exit(1);
});

// Wait a bit for JSON server to start, then start Next.js
setTimeout(() => {
  console.log('🌐 Starting Next.js development server...');
  const nextServer = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env }
  });

  nextServer.on('error', (err) => {
    console.error('❌ Failed to start Next.js server:', err);
    process.exit(1);
  });
}, 3000);

// Handle termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  jsonServer.kill();
  process.exit(0);
});

console.log('✅ Both servers starting...');
console.log('📋 JSON Server: http://localhost:3001');
console.log('🌐 Next.js App: http://localhost:3000');
console.log('Press Ctrl+C to stop both servers');
