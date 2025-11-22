import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { usersAPI } from '../utils/api';
import { Search, User as UserIcon, MessageCircle } from 'lucide-react';

interface UserSearchProps {
  onUserSelect: (user: User) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ onUserSelect }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Search users when debounced query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedQuery.trim()) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const response = await usersAPI.search(debouncedQuery);
        setUsers(response.users);
      } catch (error) {
        console.error('Failed to search users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    searchUsers();
  }, [debouncedQuery]);

  const handleUserSelect = (user: User) => {
    onUserSelect(user);
    setQuery('');
    setUsers([]);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users by name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-500 text-sm mt-2">Searching...</p>
            </div>
          </div>
        ) : users.length > 0 ? (
          <div className="p-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleUserSelect(user)}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <UserIcon size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {user.username}
                    </h3>
                  </div>
                </div>
                <button
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Start chat"
                >
                  <MessageCircle size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : debouncedQuery ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <Search size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">No users found</p>
              <p className="text-gray-400 text-xs mt-1">
                Try searching with a different name
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <Search size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">Search for users</p>
              <p className="text-gray-400 text-xs mt-1">
                Enter a name to find users
              </p>
            </div>
          </div>
        )}
      </div>

      {/* All Users (for testing) */}
      <div className="p-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">All Users</h4>
        <AllUsersList onUserSelect={handleUserSelect} />
      </div>
    </div>
  );
};

// Component to show all users (for testing/development)
const AllUsersList: React.FC<{ onUserSelect: (user: User) => void }> = ({ onUserSelect }) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAllUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setAllUsers(response.users);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadAllUsers();
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading users...</div>;
  }

  return (
    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
      {allUsers.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          onClick={() => onUserSelect(user)}
        >
          <div className="flex items-center space-x-2">
            <UserIcon size={14} className="text-gray-400" />
            <span className="text-sm text-gray-700">{user.username}</span>
          </div>
          <MessageCircle size={14} className="text-gray-400" />
        </div>
      ))}
    </div>
  );
};

export default UserSearch;