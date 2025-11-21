import React from 'react';
import { Conversation } from '../types';
import { MessageCircle, Users } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: {
    type: 'direct' | 'group';
    id: number;
    name: string;
  } | null;
  onSelectConversation: (conversation: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversation,
  onSelectConversation,
}) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <MessageCircle size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm">No conversations yet</p>
          <p className="text-gray-400 text-xs mt-1">
            Start a new conversation by searching for users
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      {conversations.map((conversation) => (
        <div
          key={`${conversation.type}-${conversation.other_user_id}`}
          className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
            activeConversation?.type === conversation.type &&
            activeConversation?.id === conversation.other_user_id
              ? 'bg-blue-50 border-blue-200'
              : ''
          }`}
          onClick={() => onSelectConversation(conversation)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  conversation.type === 'direct'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-green-100 text-green-600'
                }`}
              >
                {conversation.type === 'direct' ? (
                  <MessageCircle size={18} />
                ) : (
                  <Users size={18} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {conversation.other_username}
                </h3>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {conversation.type === 'direct'
                    ? conversation.other_email
                    : conversation.other_email || 'Group chat'}
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 text-xs text-gray-400">
              {formatTime(conversation.last_message_at)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationList;