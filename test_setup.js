// AI Chatter Setup Test
// This script tests the basic setup of the application

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing AI Chatter Setup...\n');

// Check if required directories exist
const requiredDirs = [
  'backend',
  'frontend',
  'backend/src',
  'backend/src/models',
  'backend/src/routes',
  'backend/src/middleware',
  'backend/src/utils',
  'frontend/src',
  'frontend/src/components',
  'frontend/src/pages',
  'frontend/src/context',
  'frontend/src/types',
  'frontend/src/utils',
  'examples'
];

console.log('📁 Checking directory structure...');
let allDirsExist = true;

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`  ✅ ${dir}`);
  } else {
    console.log(`  ❌ ${dir} - MISSING`);
    allDirsExist = false;
  }
});

console.log('');

// Check if required files exist
const requiredFiles = [
  'backend/package.json',
  'backend/tsconfig.json',
  'backend/.env',
  'backend/src/index.ts',
  'backend/src/database.ts',
  'backend/src/initDb.ts',
  'backend/src/socket.ts',
  'frontend/package.json',
  'frontend/tsconfig.json',
  'frontend/vite.config.ts',
  'frontend/index.html',
  'frontend/src/main.tsx',
  'frontend/src/App.tsx',
  'frontend/src/index.css',
  'package.json',
  'README.md',
  'API_AUTOMATION_GUIDE.md'
];

console.log('📄 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

console.log('');

// Check package.json files
console.log('📦 Checking package.json files...');
try {
  const rootPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('  ✅ Root package.json - Valid');

  const backendPackage = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
  console.log('  ✅ Backend package.json - Valid');

  const frontendPackage = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  console.log('  ✅ Frontend package.json - Valid');

  console.log('');

  // Check for required dependencies
  console.log('🔍 Checking for required dependencies...');

  const backendDeps = Object.keys(backendPackage.dependencies || {});
  const requiredBackendDeps = ['express', 'socket.io', 'jsonwebtoken', 'bcryptjs', 'pg'];

  requiredBackendDeps.forEach(dep => {
    if (backendDeps.includes(dep)) {
      console.log(`  ✅ Backend: ${dep}`);
    } else {
      console.log(`  ❌ Backend: ${dep} - MISSING`);
      allFilesExist = false;
    }
  });

  const frontendDeps = Object.keys(frontendPackage.dependencies || {});
  const requiredFrontendDeps = ['react', 'react-dom', 'socket.io-client', 'axios'];

  requiredFrontendDeps.forEach(dep => {
    if (frontendDeps.includes(dep)) {
      console.log(`  ✅ Frontend: ${dep}`);
    } else {
      console.log(`  ❌ Frontend: ${dep} - MISSING`);
      allFilesExist = false;
    }
  });

} catch (error) {
  console.log('  ❌ Error reading package.json files:', error.message);
  allFilesExist = false;
}

console.log('');

// Check environment configuration
console.log('⚙️  Checking environment configuration...');
try {
  const envContent = fs.readFileSync('backend/.env', 'utf8');
  const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

  const requiredEnvVars = [
    'PORT',
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'JWT_SECRET'
  ];

  const envVars = {};
  envLines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });

  requiredEnvVars.forEach(envVar => {
    if (envVars[envVar]) {
      console.log(`  ✅ ${envVar} = ${envVars[envVar]}`);
    } else {
      console.log(`  ❌ ${envVar} - MISSING`);
      allFilesExist = false;
    }
  });

} catch (error) {
  console.log('  ❌ Error reading .env file:', error.message);
  allFilesExist = false;
}

console.log('');

// Summary
console.log('📊 Setup Test Summary:');
console.log(`  Directory Structure: ${allDirsExist ? '✅ PASS' : '❌ FAIL'}`);
console.log(`  Required Files: ${allFilesExist ? '✅ PASS' : '❌ FAIL'}`);

if (allDirsExist && allFilesExist) {
  console.log('\n🎉 Setup test PASSED! The project structure is correct.');
  console.log('\nNext steps:');
  console.log('1. Run "npm run install:all" to install dependencies');
  console.log('2. Make sure PostgreSQL is running on port 5433');
  console.log('3. Run "npm run dev" to start the application');
  console.log('4. Access the app at http://localhost:5173');
} else {
  console.log('\n💥 Setup test FAILED! Please check the missing items above.');
  process.exit(1);
}