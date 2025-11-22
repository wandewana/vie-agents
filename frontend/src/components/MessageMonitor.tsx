import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { messagesAPI } from '../utils/api';
import { Message } from '../types';
import { Eye, Users, User } from 'lucide-react';

const MessageMonitor: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [monitoredMessages, setMonitoredMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [monitoredMessages]);

  useEffect(() => {
    const loadAllMessages = async () => {
      try {
        setLoading(true);
        const response = await messagesAPI.getAllMessages(100);
        setMonitoredMessages(response.messages);
      } catch (error) {
        console.error('Failed to load monitored messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllMessages();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleMonitorMessage = (message: Message) => {
        setMonitoredMessages(prev => [message, ...prev]);
      };

      socket.on('monitor_message', handleMonitorMessage);

      return () => {
        socket.off('monitor_message', handleMonitorMessage);
      };
    }
  }, [socket]);

  const getMessageType = (message: Message): string => {
    if (message.group_id) {
      return `Group: ${message.group_name || 'Unknown Group'}`;
    } else if (message.recipient_id) {
      return `Direct to: ${message.recipient_username || 'Unknown User'}`;
    }
    return 'Unknown';
  };

  const getMessageIcon = (message: Message) => {
    if (message.group_id) {
      return <Users size={16} className="text-green-600" />;
    } else {
      return <User size={16} className="text-blue-600" />;
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatMessageDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (user?.username !== 'superadmin') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Eye size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Superadmin Access Required
          </h3>
          <p className="text-gray-500">
            This feature is only available for superadmin users.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
            <Eye size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Message Monitor
            </h2>
            <p className="text-sm text-gray-500">
              Real-time monitoring of all messages
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading monitored messages...</p>
            </div>
          </div>
        ) : monitoredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Eye size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No messages yet
              </h3>
              <p className="text-gray-500">
                Messages will appear here as users communicate
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {monitoredMessages.map((message) => (
              <div
                key={message.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getMessageIcon(message)}
                    <span className="text-sm font-medium text-gray-900">
                      {message.sender_username}
                    </span>
                    <span className="text-xs text-gray-500">→</span>
                    <span className="text-sm text-gray-600">
                      {getMessageType(message)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatMessageDate(message.created_at)} {formatMessageTime(message.created_at)}
                  </div>
                </div>

                <div className="text-sm text-gray-800 bg-gray-50 rounded px-3 py-2">
                  {message.content}
                </div>

                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>ID: {message.id}</span>
                  <span>
                    {message.group_id ? `Group ID: ${message.group_id}` : `Recipient ID: ${message.recipient_id}`}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageMonitor;