const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

/**
 * Register a single user with the given credentials
 */
async function registerUser(email, password, username) {
  try {
    console.log(`👤 Registering user: ${username} (${email})`);

    const response = await axios.post(`${API_BASE}/auth/register`, {
      email,
      password,
      username
    });

    console.log(`✅ Registration successful for ${username}`);
    console.log(`   User ID: ${response.data.user.id}`);
    console.log(`   Token: ${response.data.token.substring(0, 20)}...`);

    return response.data;
  } catch (error) {
    console.error(`❌ Registration failed for ${username}:`, error.response?.data?.error || error.message);
    throw error;
  }
}

/**
 * Register users 3 through 10 with sequential credentials
 */
async function registerMultipleUsers() {
  console.log('🚀 Starting bulk user registration...\n');

  const users = [];

  // Generate user data for users 3-10
  for (let i = 3; i <= 10; i++) {
    users.push({
      username: `username${i}`,
      email: `username${i}@gmail.com`,
      password: 'password123'
    });
  }

  const results = {
    successful: [],
    failed: []
  };

  // Register users sequentially
  for (const user of users) {
    try {
      const result = await registerUser(user.email, user.password, user.username);
      results.successful.push({
        username: user.username,
        userId: result.user.id,
        email: user.email
      });
    } catch (error) {
      results.failed.push({
        username: user.username,
        error: error.response?.data?.error || error.message
      });
    }

    // Small delay between registrations to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Print summary
  console.log('\n📊 Registration Summary:');
  console.log(`✅ Successful: ${results.successful.length} users`);
  console.log(`❌ Failed: ${results.failed.length} users`);

  if (results.successful.length > 0) {
    console.log('\n✅ Successfully registered:');
    results.successful.forEach(user => {
      console.log(`   - ${user.username} (ID: ${user.userId})`);
    });
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed registrations:');
    results.failed.forEach(user => {
      console.log(`   - ${user.username}: ${user.error}`);
    });
  }
}

// Main execution
async function main() {
  try {
    await registerMultipleUsers();
    console.log('\n🎉 Bulk registration process completed!');
  } catch (error) {
    console.error('💥 Script execution failed:', error.message);
    process.exit(1);
  }
}

// Check if axios is available
if (typeof axios === 'undefined') {
  console.error('❌ axios is not available. Please install it with:');
  console.error('   npm install axios');
  process.exit(1);
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { registerUser, registerMultipleUsers };