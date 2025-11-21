# AI Chatter - API Automation Guide

This guide explains how to use the AI Chatter API for automation and programmatic access.

## Base URL
```
http://localhost:3001/api/automation
```

## Authentication
All automation endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Health Check
**GET** `/health`

Check if the automation API is running.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "OK",
    "service": "AI Chatter Automation API",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "version": "1.0.0"
  }
}
```

### 2. Send Message
**POST** `/messages`

Send a message to a user or group.

**Body Parameters:**
- `content` (string, required): The message content
- `recipient_id` (number, optional): User ID for direct message
- `group_id` (number, optional): Group ID for group message

*Note: Provide either `recipient_id` OR `group_id`, but not both.*

**Example - Direct Message:**
```json
{
  "content": "Hello from automation!",
  "recipient_id": 2
}
```

**Example - Group Message:**
```json
{
  "content": "Hello group from automation!",
  "group_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "id": 123,
    "content": "Hello from automation!",
    "sender_id": 1,
    "recipient_id": 2,
    "group_id": null,
    "created_at": "2024-01-01T12:00:00.000Z",
    "sender_username": "your_username",
    "sender_email": "your_email@example.com"
  }
}
```

### 3. Create Group
**POST** `/groups`

Create a new group and optionally add members.

**Body Parameters:**
- `name` (string, required): Group name
- `description` (string, optional): Group description
- `member_ids` (array of numbers, optional): Array of user IDs to add as members

**Example:**
```json
{
  "name": "Automation Group",
  "description": "Group created via API",
  "member_ids": [2, 3, 4]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Group created successfully",
  "data": {
    "group": {
      "id": 5,
      "name": "Automation Group",
      "description": "Group created via API",
      "created_by": 1,
      "created_at": "2024-01-01T12:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z"
    },
    "members": [
      {
        "id": 1,
        "username": "your_username",
        "email": "your_email@example.com",
        "joined_at": "2024-01-01T12:00:00.000Z"
      },
      {
        "id": 2,
        "username": "user2",
        "email": "user2@example.com",
        "joined_at": "2024-01-01T12:00:00.000Z"
      }
    ]
  }
}
```

### 4. Get Conversations
**GET** `/conversations`

Get all conversations for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "other_user_id": 2,
        "other_username": "user2",
        "other_email": "user2@example.com",
        "last_message_at": "2024-01-01T12:00:00.000Z",
        "type": "direct"
      },
      {
        "other_user_id": 1,
        "other_username": "Test Group",
        "other_email": "Group description",
        "last_message_at": "2024-01-01T11:00:00.000Z",
        "type": "group"
      }
    ],
    "total": 2
  }
}
```

### 5. Get Conversation Messages
**GET** `/conversations/:id/messages`

Get messages from a specific conversation.

**URL Parameters:**
- `id` (number): Conversation ID (user ID for direct, group ID for group)

**Query Parameters:**
- `type` (string): "direct" or "group" (default: "direct")
- `limit` (number): Number of messages to return (default: 50)

**Example - Direct Messages:**
```
GET /api/automation/conversations/2/messages?type=direct&limit=10
```

**Example - Group Messages:**
```
GET /api/automation/conversations/1/messages?type=group&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": 123,
        "content": "Hello!",
        "sender_id": 1,
        "recipient_id": 2,
        "group_id": null,
        "created_at": "2024-01-01T12:00:00.000Z",
        "sender_username": "your_username",
        "sender_email": "your_email@example.com"
      }
    ],
    "metadata": {
      "type": "direct",
      "other_user_id": 2
    },
    "total": 1
  }
}
```

### 6. Get User Information
**GET** `/users/me`

Get information about the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "your_email@example.com",
      "username": "your_username",
      "created_at": "2024-01-01T10:00:00.000Z"
    }
  }
}
```

## Example Usage

### Using cURL

**Send a direct message:**
```bash
curl -X POST http://localhost:3001/api/automation/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello from automation!",
    "recipient_id": 2
  }'
```

**Create a group:**
```bash
curl -X POST http://localhost:3001/api/automation/groups \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Created Group",
    "description": "Created via automation API",
    "member_ids": [2, 3]
  }'
```

### Using JavaScript/Node.js

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/automation';
const TOKEN = 'YOUR_JWT_TOKEN';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Send a message
async function sendMessage(content, recipientId) {
  try {
    const response = await api.post('/messages', {
      content,
      recipient_id: recipientId
    });
    console.log('Message sent:', response.data);
  } catch (error) {
    console.error('Failed to send message:', error.response?.data);
  }
}

// Get conversations
async function getConversations() {
  try {
    const response = await api.get('/conversations');
    console.log('Conversations:', response.data);
  } catch (error) {
    console.error('Failed to get conversations:', error.response?.data);
  }
}

// Usage
sendMessage('Hello from Node.js!', 2);
getConversations();
```

### Using Python

```python
import requests

API_BASE = "http://localhost:3001/api/automation"
TOKEN = "YOUR_JWT_TOKEN"

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

def send_message(content, recipient_id):
    data = {
        "content": content,
        "recipient_id": recipient_id
    }

    response = requests.post(f"{API_BASE}/messages", json=data, headers=headers)

    if response.status_code == 201:
        print("Message sent successfully:", response.json())
    else:
        print("Failed to send message:", response.json())

def get_conversations():
    response = requests.get(f"{API_BASE}/conversations", headers=headers)

    if response.status_code == 200:
        print("Conversations:", response.json())
    else:
        print("Failed to get conversations:", response.json())

# Usage
send_message("Hello from Python!", 2)
get_conversations()
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (no access to resource)
- `404`: Not Found
- `500`: Internal Server Error

## Getting Your JWT Token

1. Register or login using the web interface
2. The token is automatically stored in localStorage
3. For automation, you can also get a token via the auth API:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your_email@example.com",
    "password": "your_password"
  }'
```

The response will include a `token` field that you can use for automation.