import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Message } from '../types';
import { messagesAPI } from '../utils/api';
import { Send, Users } from 'lucide-react';

interface ChatWindowProps {
  conversation: {
    type: 'direct' | 'group';
    id: number;
    name: string;
  };
  messages: Message[];
  onNewMessage: (message: Message) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  onNewMessage,
}) => {
  const { user } = useAuth();
  const { socket, sendDirectMessage, sendGroupMessage } = useSocket();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (socket && conversation.type === 'group') {
      socket.emit('join_group', { group_id: conversation.id });

      return () => {
        socket.emit('leave_group', { group_id: conversation.id });
      };
    }
  }, [socket, conversation]);

  useEffect(() => {
    if (socket) {
      const handleUserTyping = (data: { user_id: number; username: string }) => {
        if (data.user_id !== user?.id) {
          setTypingUsers(prev => {
            if (!prev.includes(data.username)) {
              return [...prev, data.username];
            }
            return prev;
          });
        }
      };

      const handleUserStopTyping = (data: { user_id: number }) => {
        if (data.user_id !== user?.id) {
          setTypingUsers(prev => prev.filter(username => {
            // We don't have the username here, so we'll clear all
            // In a real app, you'd want to track by user_id
            return false;
          }));
        }
      };

      socket.on('user_typing', handleUserTyping);
      socket.on('user_stop_typing', handleUserStopTyping);

      return () => {
        socket.off('user_typing', handleUserTyping);
        socket.off('user_stop_typing', handleUserStopTyping);
      };
    }
  }, [socket, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);

    try {
      if (conversation.type === 'direct') {
        sendDirectMessage(conversation.id, newMessage.trim());
      } else {
        sendGroupMessage(conversation.id, newMessage.trim());
      }

      // Clear typing indicator
      if (socket) {
        socket.emit('typing_stop', {
          conversation_id: conversation.id,
          type: conversation.type,
          ...(conversation.type === 'direct' && { recipient_id: conversation.id }),
          ...(conversation.type === 'group' && { group_id: conversation.id }),
        });
      }

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (socket) {
      socket.emit('typing_start', {
        conversation_id: conversation.id,
        type: conversation.type,
        ...(conversation.type === 'direct' && { recipient_id: conversation.id }),
        ...(conversation.type === 'group' && { group_id: conversation.id }),
      });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', {
          conversation_id: conversation.id,
          type: conversation.type,
          ...(conversation.type === 'direct' && { recipient_id: conversation.id }),
          ...(conversation.type === 'group' && { group_id: conversation.id }),
        });
      }, 1000);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              conversation.type === 'direct'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-green-100 text-green-600'
            }`}
          >
            {conversation.type === 'direct' ? (
              <Users size={20} />
            ) : (
              <Users size={20} />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {conversation.name}
            </h2>
            <p className="text-sm text-gray-500">
              {conversation.type === 'direct' ? 'Direct message' : 'Group chat'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No messages yet
              </h3>
              <p className="text-gray-500">
                Send a message to start the conversation
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === user?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender_id === user?.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                {conversation.type === 'group' && message.sender_id !== user?.id && (
                  <div className="text-xs font-medium mb-1 opacity-75">
                    {message.sender_username}
                  </div>
                )}
                <div className="text-sm">{message.content}</div>
                <div
                  className={`text-xs mt-1 ${
                    message.sender_id === user?.id
                      ? 'text-blue-100'
                      : 'text-gray-500'
                  }`}
                >
                  {formatMessageTime(message.created_at)}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
              <div className="text-sm text-gray-600">
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
              <div className="flex space-x-1 mt-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder={`Message ${conversation.name}...`}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send size={18} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;