# AI Chatter - Real-time Chat Application

A full-stack real-time chat application with user authentication, direct messaging, group chats, and API automation capabilities.

## Features

- **🔐 User Authentication**: JWT-based authentication with secure login/registration
- **💬 Real-time Messaging**: Instant messaging using WebSockets (Socket.io)
- **👥 Direct Messages**: One-on-one private conversations
- **👪 Group Chats**: Create and join group conversations
- **🤖 API Automation**: Programmatic access for bots and automation
- **📱 Modern UI**: Clean, responsive React frontend
- **🗄️ PostgreSQL**: Reliable data storage
- **🔧 TypeScript**: Full-stack TypeScript development

## Tech Stack

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** database
- **Socket.io** for real-time communication
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **React** with TypeScript
- **Vite** for fast development
- **React Router** for navigation
- **Socket.io Client** for real-time updates
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Database Setup

1. **Create PostgreSQL Database**
   ```sql
   CREATE DATABASE ai_chatter;
   ```

2. **Update Database Configuration**
   Update the database connection in `backend/.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=5433
   DB_NAME=ai_chatter
   DB_USER=postgres
   DB_PASSWORD=postgres
   ```

### Installation

1. **Clone and Install Dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install all dependencies (backend + frontend)
   npm run install:all
   ```

2. **Start the Application**
   ```bash
   # Start both backend and frontend
   npm run dev
   ```

   Or start them separately:
   ```bash
   # Backend only (port 3001)
   npm run dev:backend

   # Frontend only (port 5173)
   npm run dev:frontend
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api
   - Automation API: http://localhost:3001/api/automation

## Project Structure

```
ai-chatter/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Utility functions
│   │   └── index.ts        # Server entry point
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   └── package.json
├── examples/              # API automation examples
└── README.md
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Messaging Endpoints
- `POST /api/messages/direct` - Send direct message
- `POST /api/messages/group` - Send group message
- `GET /api/messages/direct/:userId` - Get direct messages
- `GET /api/messages/group/:groupId` - Get group messages
- `GET /api/messages/conversations` - Get user conversations

### Group Endpoints
- `POST /api/groups` - Create group
- `GET /api/groups` - Get all groups
- `GET /api/groups/my` - Get user's groups
- `POST /api/groups/:id/join` - Join group
- `POST /api/groups/:id/leave` - Leave group

### Automation API
See [API_AUTOMATION_GUIDE.md](./API_AUTOMATION_GUIDE.md) for detailed automation API documentation.

## Real-time Features

The application uses Socket.io for real-time functionality:

- **Instant Message Delivery**: Messages appear immediately for all participants
- **Typing Indicators**: See when someone is typing
- **Online Status**: Real-time connection status
- **Group Management**: Automatic group membership updates

## Automation & Bots

The automation API allows programmatic access to all chat features:

```javascript
// Example: Send a message via API
const response = await fetch('http://localhost:3001/api/automation/messages', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: 'Hello from automation!',
    recipient_id: 2
  })
});
```

See the [examples](./examples/) directory for complete automation examples.

## Development

### Backend Development
```bash
cd backend
npm run dev        # Development with hot reload
npm run build      # Build for production
npm start          # Run production build
```

### Frontend Development
```bash
cd frontend
npm run dev        # Development server
npm run build      # Build for production
npm run preview    # Preview production build
```

### Database Schema

The application uses the following database schema:

- **users**: User accounts and authentication
- **groups**: Group information and metadata
- **group_members**: Group membership relationships
- **messages**: All messages (both direct and group)

## Environment Variables

### Backend (.env)
```env
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5433
DB_NAME=ai_chatter
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the documentation
2. Look at existing issues
3. Create a new issue with details

---

**Built with ❤️ using modern web technologies**