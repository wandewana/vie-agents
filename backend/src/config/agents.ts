// Agent workspace configuration
export const AGENT_WORKSPACES: Record<string, string> = {
  'agent1': 'C:\\Users\\muhammad.alvie\\Documents\\fin\\terra-trade-agents-workspace\\clone1',
  'agent2': 'C:\\Users\\muhammad.alvie\\Documents\\fin\\terra-trade-agents-workspace\\clone2',
  // Add more agents as needed
  // 'agent3': 'C:\\Users\\muhammad.alvie\\Documents\\fin\\terra-trade-agents-workspace\\clone3',
};

export const SUPERADMIN_USERNAME = 'superadmin';

export const AGENT_PASSWORD = process.env.AGENT_PASSWORD || 'password123';

export function isAgent(username: string): boolean {
  return username !== SUPERADMIN_USERNAME;
}

export function getAgentWorkspace(username: string): string | undefined {
  return AGENT_WORKSPACES[username];
}

