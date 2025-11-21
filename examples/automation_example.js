// AI Chatter Automation Example
// This script demonstrates how to use the AI Chatter API for automation

const axios = require('axios');

// Configuration
const API_BASE = 'http://localhost:3001/api';
const AUTOMATION_BASE = 'http://localhost:3001/api/automation';

// Replace with your actual credentials
const USER_EMAIL = 'test@example.com';
const USER_PASSWORD = 'password123';

let authToken = '';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

const automationApi = axios.create({
  baseURL: AUTOMATION_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication
async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await api.post('/auth/login', {
      email: USER_EMAIL,
      password: USER_PASSWORD,
    });

    authToken = response.data.token;

    // Update headers with token
    automationApi.defaults.headers.Authorization = `Bearer ${authToken}`;

    console.log('✅ Login successful');
    console.log(`👤 User: ${response.data.user.username}`);
    return response.data.user;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.error || error.message);
    throw error;
  }
}

// Health check
async function healthCheck() {
  try {
    console.log('🏥 Checking API health...');
    const response = await automationApi.get('/health');
    console.log('✅ API is healthy:', response.data.data.status);
    return response.data;
  } catch (error) {
    console.error('❌ Health check failed:', error.response?.data?.error || error.message);
    throw error;
  }
}

// Get user info
async function getUserInfo() {
  try {
    console.log('👤 Getting user information...');
    const response = await automationApi.get('/users/me');
    console.log('✅ User info:', response.data.data.user);
    return response.data.data.user;
  } catch (error) {
    console.error('❌ Failed to get user info:', error.response?.data?.error || error.message);
    throw error;
  }
}

// Get conversations
async function getConversations() {
  try {
    console.log('💬 Getting conversations...');
    const response = await automationApi.get('/conversations');
    console.log(`✅ Found ${response.data.data.total} conversations`);

    response.data.data.conversations.forEach((conv, index) => {
      console.log(`  ${index + 1}. ${conv.other_username} (${conv.type}) - Last: ${new Date(conv.last_message_at).toLocaleString()}`);
    });

    return response.data.data.conversations;
  } catch (error) {
    console.error('❌ Failed to get conversations:', error.response?.data?.error || error.message);
    throw error;
  }
}

// Send a direct message
async function sendDirectMessage(recipientId, content) {
  try {
    console.log(`📤 Sending direct message to user ${recipientId}...`);
    const response = await automationApi.post('/messages', {
      content,
      recipient_id: recipientId,
    });

    console.log('✅ Message sent successfully');
    console.log(`   Message ID: ${response.data.data.id}`);
    console.log(`   Content: "${response.data.data.content}"`);
    console.log(`   Sent at: ${new Date(response.data.data.created_at).toLocaleString()}`);

    return response.data.data;
  } catch (error) {
    console.error('❌ Failed to send message:', error.response?.data?.error || error.message);
    throw error;
  }
}

// Send a group message
async function sendGroupMessage(groupId, content) {
  try {
    console.log(`📤 Sending group message to group ${groupId}...`);
    const response = await automationApi.post('/messages', {
      content,
      group_id: groupId,
    });

    console.log('✅ Group message sent successfully');
    console.log(`   Message ID: ${response.data.data.id}`);
    console.log(`   Content: "${response.data.data.content}"`);

    return response.data.data;
  } catch (error) {
    console.error('❌ Failed to send group message:', error.response?.data?.error || error.message);
    throw error;
  }
}

// Create a group
async function createGroup(name, description, memberIds = []) {
  try {
    console.log(`👥 Creating group "${name}"...`);
    const response = await automationApi.post('/groups', {
      name,
      description,
      member_ids: memberIds,
    });

    console.log('✅ Group created successfully');
    console.log(`   Group ID: ${response.data.data.group.id}`);
    console.log(`   Members: ${response.data.data.members.length}`);

    return response.data.data;
  } catch (error) {
    console.error('❌ Failed to create group:', error.response?.data?.error || error.message);
    throw error;
  }
}

// Get conversation messages
async function getConversationMessages(conversationId, type = 'direct', limit = 10) {
  try {
    console.log(`📨 Getting ${type} messages for ${conversationId}...`);
    const response = await automationApi.get(`/conversations/${conversationId}/messages?type=${type}&limit=${limit}`);

    console.log(`✅ Found ${response.data.data.total} messages`);

    response.data.data.messages.forEach((msg, index) => {
      console.log(`  ${index + 1}. [${msg.sender_username}] ${msg.content} (${new Date(msg.created_at).toLocaleString()})`);
    });

    return response.data.data.messages;
  } catch (error) {
    console.error('❌ Failed to get messages:', error.response?.data?.error || error.message);
    throw error;
  }
}

// Main automation example
async function runAutomationExample() {
  try {
    console.log('🚀 Starting AI Chatter Automation Example\n');

    // 1. Login
    const user = await login();
    console.log('');

    // 2. Health check
    await healthCheck();
    console.log('');

    // 3. Get user info
    await getUserInfo();
    console.log('');

    // 4. Get conversations
    const conversations = await getConversations();
    console.log('');

    // 5. Send a test message to first direct conversation
    const directConversations = conversations.filter(c => c.type === 'direct');
    if (directConversations.length > 0) {
      const firstDirect = directConversations[0];
      await sendDirectMessage(firstDirect.other_user_id, 'Hello from automation! This message was sent programmatically.');
      console.log('');
    }

    // 6. Create a test group
    const newGroup = await createGroup(
      'Automation Test Group',
      'This group was created via the automation API',
      [] // Add member IDs here if you want to add members
    );
    console.log('');

    // 7. Send a message to the new group
    await sendGroupMessage(newGroup.group.id, 'Welcome to our automation test group!');
    console.log('');

    // 8. Get messages from the first conversation
    if (directConversations.length > 0) {
      await getConversationMessages(directConversations[0].other_user_id, 'direct', 5);
      console.log('');
    }

    console.log('🎉 Automation example completed successfully!');
    console.log('📚 Check the API_AUTOMATION_GUIDE.md for more details on available endpoints.');

  } catch (error) {
    console.error('\n💥 Automation example failed:', error.message);
    process.exit(1);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  runAutomationExample();
}

module.exports = {
  login,
  healthCheck,
  getUserInfo,
  getConversations,
  sendDirectMessage,
  sendGroupMessage,
  createGroup,
  getConversationMessages,
  runAutomationExample,
};