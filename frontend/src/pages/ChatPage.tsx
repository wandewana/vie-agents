import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Message, Conversation, User, Group } from '../types';
import { messagesAPI, groupsAPI, usersAPI } from '../utils/api';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import GroupManager from '../components/GroupManager';
import UserSearch from '../components/UserSearch';
import { LogOut, MessageCircle, Users, Search } from 'lucide-react';

const ChatPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { socket, isConnected } = useSocket();

  const [activeTab, setActiveTab] = useState<'chats' | 'groups' | 'search'>('chats');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<{
    type: 'direct' | 'group';
    id: number;
    name: string;
  } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
    loadGroups();
  }, []);

  useEffect(() => {
    if (socket) {
      // Listen for new direct messages
      socket.on('new_direct_message', (message: Message) => {
        if (activeConversation?.type === 'direct' && activeConversation.id === message.sender_id) {
          setMessages(prev => [...prev, message]);
        }
        loadConversations(); // Refresh conversation list
      });

      // Listen for new group messages
      socket.on('new_group_message', (message: Message) => {
        if (activeConversation?.type === 'group' && activeConversation.id === message.group_id) {
          setMessages(prev => [...prev, message]);
        }
        loadConversations(); // Refresh conversation list
      });

      return () => {
        socket.off('new_direct_message');
        socket.off('new_group_message');
      };
    }
  }, [socket, activeConversation]);

  const loadConversations = async () => {
    try {
      const response = await messagesAPI.getConversations();
      setConversations(response.conversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const response = await groupsAPI.getMy();
      setGroups(response.groups);
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    setActiveConversation({
      type: conversation.type,
      id: conversation.other_user_id,
      name: conversation.other_username,
    });

    try {
      let response;
      if (conversation.type === 'direct') {
        response = await messagesAPI.getDirectMessages(conversation.other_user_id);
      } else {
        response = await messagesAPI.getGroupMessages(conversation.other_user_id);
      }
      setMessages(response.messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Chatter</h1>
              <div className="flex items-center mt-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
                <span className="text-sm text-gray-600">{user?.username}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 ${
                activeTab === 'chats'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageCircle size={16} />
              Chats
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 ${
                activeTab === 'groups'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users size={16} />
              Groups
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 ${
                activeTab === 'search'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Search size={16} />
              Search
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'chats' && (
            <ConversationList
              conversations={conversations}
              activeConversation={activeConversation}
              onSelectConversation={selectConversation}
            />
          )}
          {activeTab === 'groups' && (
            <GroupManager
              groups={groups}
              onGroupSelect={(group) => {
                setActiveConversation({
                  type: 'group',
                  id: group.id,
                  name: group.name,
                });
                messagesAPI.getGroupMessages(group.id).then(response => {
                  setMessages(response.messages);
                });
              }}
              onGroupsUpdate={loadGroups}
            />
          )}
          {activeTab === 'search' && (
            <UserSearch onUserSelect={(user) => {
              setActiveConversation({
                type: 'direct',
                id: user.id,
                name: user.username,
              });
              messagesAPI.getDirectMessages(user.id).then(response => {
                setMessages(response.messages);
              });
            }} />
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            messages={messages}
            onNewMessage={(message) => setMessages(prev => [...prev, message])}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Welcome to AI Chatter
              </h3>
              <p className="text-gray-500 max-w-sm">
                Select a conversation from the sidebar or search for users to start chatting.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;