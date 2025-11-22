# AI Agent Management System

> **Transform your development workflow with autonomous AI agents that execute tasks and create pull requests automatically.**

This is not just a chat application - it's an **AI-powered development team management system** where you (the superadmin) orchestrate multiple AI agents to work on your codebase in parallel.

---

## 🎯 What Is This?

A real-time agent management platform that allows you to:
- **Send tasks** to AI agents via chat interface
- **Monitor agent activity** in real-time
- **Review pull requests** created by agents
- **Scale your development** with multiple parallel agents

### The Real Purpose

While it appears to be a chat application, the **true purpose** is:
- **Agent Orchestration**: Manage multiple AI coding agents
- **Task Distribution**: Assign development tasks to agents
- **Automated Development**: Agents analyze code, make changes, and create PRs
- **Progress Monitoring**: Track agent status and task completion

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        SUPERADMIN (You)                      │
│                     Web Chat Interface                       │
└────────────┬────────────────────────────────────────────────┘
             │
             │ Send Tasks via Chat
             │
┌────────────▼────────────────────────────────────────────────┐
│                    Backend (Node.js/Express)                 │
│  - Receives messages from superadmin                         │
│  - Detects if recipient is an agent                          │
│  - Triggers agent task execution                             │
│  - Sends status updates back to superadmin                   │
└────────────┬────────────────────────────────────────────────┘
             │
             │ Spawns PowerShell Process
             │
┌────────────▼────────────────────────────────────────────────┐
│              PowerShell Execution Script                     │
│  1. Checkout master branch                                   │
│  2. Create feature branch                                    │
│  3. Run Claude Code CLI                                      │
│  4. Commit changes                                           │
│  5. Push to GitHub                                           │
│  6. Create Pull Request                                      │
└────────────┬────────────────────────────────────────────────┘
             │
             │ Executes in Agent Workspace
             │
┌────────────▼────────────────────────────────────────────────┐
│                    Agent Workspaces                          │
│  clone1/ ─── agent1 workspace (separate git clone)          │
│  clone2/ ─── agent2 workspace (separate git clone)          │
│  clone3/ ─── agent3 workspace (separate git clone)          │
│  clone4/ ─── agent4 workspace (separate git clone)          │
│  clone5/ ─── agent5 workspace (separate git clone)          │
└──────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 🤖 Autonomous AI Agents
- Each agent has its own isolated workspace (git clone)
- Agents execute tasks using **Claude Code CLI**
- Automatic code analysis, editing, and testing
- Creates pull requests with detailed descriptions

### 💬 Real-Time Communication
- Chat interface for task assignment
- Live status updates from agents
- WebSocket-based real-time messaging
- Task completion notifications with PR links

### 🔄 Parallel Execution
- Run multiple agents simultaneously
- Each agent works independently
- No conflicts between agent workspaces
- Scale to as many agents as needed

### 🛡️ Safety & Control
- Agents can't run concurrent tasks (one task at a time per agent)
- All changes go through pull requests (you review before merging)
- Automatic branch management and cleanup
- Error reporting back to superadmin

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Git
- GitHub CLI (`gh`)
- Claude Code CLI (`claude`)

### 1. Setup Backend

```bash
cd backend
npm install
```

Create `.env` file:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/ai_chatter
JWT_SECRET=your-secret-key
PORT=3001
```

Initialize database:
```bash
npm run db:init
```

### 2. Setup Frontend

```bash
cd frontend
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

### 3. Configure Agent Workspaces

Edit `backend/src/config/agents.ts`:
```typescript
export const AGENT_WORKSPACES: Record<string, string> = {
  'agent1': 'C:\\path\\to\\your-project\\clone1',
  'agent2': 'C:\\path\\to\\your-project\\clone2',
  'agent3': 'C:\\path\\to\\your-project\\clone3',
  // Add more agents as needed
};
```

Clone your target repository for each agent:
```bash
mkdir agent-workspaces
cd agent-workspaces
git clone https://github.com/your-org/your-project.git clone1
git clone https://github.com/your-org/your-project.git clone2
git clone https://github.com/your-org/your-project.git clone3
```

### 4. Run the Application

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Open http://localhost:5173 and login as `superadmin`.

---

## 📖 How to Use

### 1. Send a Task to an Agent

In the chat interface, send a direct message to any agent (e.g., `agent1`):

```
Implement user authentication API with JWT tokens

Requirements:
- Create POST /api/auth/login endpoint
- Accept username and password
- Return JWT token on success
- Add password hashing with bcrypt
- Write integration tests

Acceptance Criteria:
- Invalid credentials return 401
- Valid credentials return token
- Tests pass successfully
```

### 2. Monitor Agent Progress

The agent will respond with status updates:
- 🤖 **Starting task**: Agent begins working
- ✅ **Task completed**: Agent finished with PR link
- ❌ **Task failed**: Error occurred (with details)

### 3. Review Pull Request

Click the PR link in the agent's response to review the changes on GitHub.

### 4. Merge or Request Changes

- **Merge** if the implementation is correct
- **Comment** on the PR if changes are needed
- **Send another task** to the agent to fix issues

---

## 📋 Best Practices

### ✅ Writing Good Task Prompts

See **[AGENT_PROMPT_TEMPLATES.md](./AGENT_PROMPT_TEMPLATES.md)** for detailed templates.

**Good Prompt:**
```
Create Land CRUD API

Requirements:
- POST /api/lands - create land with title, price, area, location
- GET /api/lands/:id - get land by ID
- PUT /api/lands/:id - update land
- DELETE /api/lands/:id - delete land
- Add validation (price > 0, area > 0)
- Write integration tests

Acceptance Criteria:
- All endpoints work correctly
- Validation prevents invalid data
- Tests pass
```

**Bad Prompt:**
```
Add land feature
```

### 🎯 Task Distribution Strategy

1. **Break down large features** into smaller tasks
2. **Assign tasks to different agents** for parallel execution
3. **Keep tasks focused** on one specific feature/module
4. **Always request tests** to ensure quality

**Example - Building a Land Marketplace:**
```
agent1: "Create database schema for lands table with migration"
agent2: "Implement Land CRUD API endpoints"
agent3: "Add land search API with geospatial filtering"
agent4: "Create React components for land listing page"
agent5: "Write end-to-end tests for land management flow"
```

All 5 agents work **simultaneously**! 🚀

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** - REST API server
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **Socket.io** - Real-time WebSocket communication
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **React** + **TypeScript** - UI framework
- **Vite** - Build tool
- **Socket.io Client** - Real-time updates
- **CSS** - Styling

### Agent Execution
- **PowerShell** - Task execution script
- **Claude Code CLI** - AI-powered code editing
- **Git** - Version control
- **GitHub CLI** - Pull request creation

---

## 📁 Project Structure

```
ai-chatter/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── agents.ts          # Agent workspace configuration
│   │   ├── routes/
│   │   │   └── messages.ts        # Message handling + agent triggering
│   │   ├── services/
│   │   │   └── agentExecutor.ts   # Agent task execution logic
│   │   └── server.ts              # Express server + Socket.io
│   ├── scripts/
│   │   └── execute-task.ps1       # PowerShell script for git + claude
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Chat.tsx           # Chat interface
│   │   └── App.tsx
│   └── package.json
├── AGENT_PROMPT_TEMPLATES.md      # Task prompt templates
└── README.md                       # This file
```

---

## 🔧 Configuration

### Adding More Agents

1. **Clone repository** to new workspace:
   ```bash
   git clone https://github.com/your-org/your-project.git clone6
   ```

2. **Add to agent config** (`backend/src/config/agents.ts`):
   ```typescript
   'agent6': 'C:\\path\\to\\clone6',
   ```

3. **Create user in database**:
   ```sql
   INSERT INTO users (username, password_hash) 
   VALUES ('agent6', '$2b$10$...');
   ```

4. **Restart backend** - agent6 is now ready!

### Customizing Agent Behavior

Edit `backend/scripts/execute-task.ps1` to customize:
- Branch naming convention
- Commit message format
- PR title/description template
- Git workflow (rebase vs merge)

---

## 🐛 Troubleshooting

### Agent not responding?
- Check backend logs for errors
- Verify agent workspace path exists
- Ensure Claude CLI is installed and authenticated

### PR creation fails?
- Verify GitHub CLI (`gh`) is installed
- Run `gh auth login` to authenticate
- Check repository permissions

### Claude CLI hangs?
- Ensure `--dangerously-skip-permissions` flag is used
- Check Claude CLI is up to date: `claude update`
- Verify workspace has no uncommitted changes

---

## 📊 Monitoring

### Check Agent Status
Agents report their status via chat:
- **Available**: No active tasks
- **Busy**: Currently executing a task
- **Error**: Last task failed

### View Agent Activity
- Check GitHub for recent PRs from agents
- Monitor backend logs for task execution details
- Review chat history for task assignments

---

## 🎓 Learn More

- **[AGENT_PROMPT_TEMPLATES.md](./AGENT_PROMPT_TEMPLATES.md)** - Comprehensive task prompt templates
- **[Claude Code Documentation](https://docs.anthropic.com/claude/docs)** - Learn about Claude Code CLI
- **[GitHub CLI Documentation](https://cli.github.com/)** - GitHub CLI reference

---

## 🤝 Contributing

This is a personal development tool, but feel free to fork and customize for your needs!

---

## 📝 License

MIT License - Use freely for personal or commercial projects.

---

## 🎉 Success Story

> "I can now architect a feature, split it into tasks, send them to 5 agents, and get 5 PRs back in minutes. It's like having a team of junior developers working 24/7!" - You, probably 😄

---

**Built with ❤️ to supercharge development workflows**

