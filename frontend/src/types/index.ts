export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  content: string;
  sender_id: number;
  recipient_id?: number;
  group_id?: number;
  created_at: string;
  sender_username: string;
  sender_email: string;
  is_optimistic?: boolean;
}

export interface Conversation {
  other_user_id: number;
  other_username: string;
  other_email: string;
  last_message_at: string;
  type: 'direct' | 'group';
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface SocketContextType {
  socket: any;
  isConnected: boolean;
  joinGroup: (groupId: number) => void;
  leaveGroup: (groupId: number) => void;
  sendDirectMessage: (recipientId: number, content: string) => void;
  sendGroupMessage: (groupId: number, content: string) => void;
}