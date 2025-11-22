import { spawn } from 'child_process';
import axios from 'axios';
import path from 'path';
import { getAgentWorkspace, AGENT_PASSWORD } from '../config/agents';

// In-memory tracking of busy agents
const busyAgents = new Set<string>();

export function isAgentBusy(username: string): boolean {
  return busyAgents.has(username);
}

export function setAgentBusy(username: string, busy: boolean): void {
  if (busy) {
    busyAgents.add(username);
  } else {
    busyAgents.delete(username);
  }
}

interface AgentTaskParams {
  agentUsername: string;
  prompt: string;
  superadminId: number;
}

export async function executeAgentTask(params: AgentTaskParams): Promise<void> {
  const { agentUsername, prompt, superadminId } = params;
  
  const workspacePath = getAgentWorkspace(agentUsername);
  
  if (!workspacePath) {
    console.error(`No workspace configured for agent: ${agentUsername}`);
    return;
  }

  // Mark agent as busy
  setAgentBusy(agentUsername, true);

  try {
    // Step 1: Login as agent and send "starting task" message
    const token = await loginAsAgent(agentUsername);
    await sendMessage(token, superadminId, `🤖 Starting task: "${prompt}"`);

    // Step 2: Execute task script
    const timestamp = Date.now();
    const branchName = `feature/task-${timestamp}`;
    
    // Path to the task execution script
    const scriptPath = path.join(__dirname, '../../scripts/execute-task.ps1');
    
    console.log(`[${agentUsername}] Executing task in workspace: ${workspacePath}`);
    console.log(`[${agentUsername}] Branch: ${branchName}`);
    console.log(`[${agentUsername}] Prompt: ${prompt}`);

    // Spawn PowerShell process
    const child = spawn('powershell.exe', [
      '-ExecutionPolicy', 'Bypass',
      '-File', scriptPath,
      '-WorkspacePath', workspacePath,
      '-BranchName', branchName,
      '-Prompt', prompt
    ], {
      detached: false,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      console.log(`[${agentUsername}] ${output.trim()}`);
    });

    child.stderr?.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      console.error(`[${agentUsername}] ERROR: ${output.trim()}`);
    });

    child.on('exit', async (code) => {
      console.log(`[${agentUsername}] Task completed with exit code: ${code}`);
      
      try {
        if (code === 0) {
          // Success - extract PR URL from stdout
          const prUrlMatch = stdout.match(/PR_URL:(https:\/\/[^\s]+)/);
          const prUrl = prUrlMatch ? prUrlMatch[1] : 'PR creation may have failed';
          
          await sendMessage(token, superadminId, 
            `✅ Task completed!\nBranch: ${branchName}\nPR: ${prUrl}`
          );
        } else {
          // Error
          const errorMsg = stderr || 'Unknown error occurred';
          await sendMessage(token, superadminId, 
            `❌ Task failed with error code ${code}\n\nError: ${errorMsg.substring(0, 500)}`
          );
        }
      } catch (error) {
        console.error(`[${agentUsername}] Failed to send completion message:`, error);
      } finally {
        // Mark agent as idle
        setAgentBusy(agentUsername, false);
      }
    });

    child.on('error', async (error) => {
      console.error(`[${agentUsername}] Failed to spawn process:`, error);
      try {
        await sendMessage(token, superadminId, 
          `❌ Failed to start task: ${error.message}`
        );
      } catch (e) {
        console.error(`[${agentUsername}] Failed to send error message:`, e);
      }
      setAgentBusy(agentUsername, false);
    });

  } catch (error) {
    console.error(`[${agentUsername}] Agent task error:`, error);
    setAgentBusy(agentUsername, false);
  }
}

async function loginAsAgent(username: string): Promise<string> {
  const apiUrl = process.env.API_URL || 'http://localhost:3001';
  const response = await axios.post(`${apiUrl}/api/auth/login`, {
    username,
    password: AGENT_PASSWORD
  });
  return response.data.token;
}

async function sendMessage(token: string, recipientId: number, content: string): Promise<void> {
  const apiUrl = process.env.API_URL || 'http://localhost:3001';
  await axios.post(`${apiUrl}/api/automation/messages`, {
    recipient_id: recipientId,
    content
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

