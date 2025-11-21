import React, { useState } from 'react';
import { Group } from '../types';
import { groupsAPI } from '../utils/api';
import { Users, Plus, LogOut, UserPlus } from 'lucide-react';

interface GroupManagerProps {
  groups: Group[];
  onGroupSelect: (group: Group) => void;
  onGroupsUpdate: () => void;
}

const GroupManager: React.FC<GroupManagerProps> = ({
  groups,
  onGroupSelect,
  onGroupsUpdate,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    setLoading(true);
    setError('');

    try {
      await groupsAPI.create(newGroupName.trim(), newGroupDescription.trim() || undefined);
      setNewGroupName('');
      setNewGroupDescription('');
      setShowCreateForm(false);
      onGroupsUpdate();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };


  const handleLeaveGroup = async (groupId: number) => {
    try {
      await groupsAPI.leave(groupId);
      onGroupsUpdate();
    } catch (error) {
      console.error('Failed to leave group:', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Groups</h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus size={16} />
            <span>Create Group</span>
          </button>
        </div>
      </div>

      {/* Create Group Form */}
      {showCreateForm && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleCreateGroup} className="space-y-3">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">
                Group Name
              </label>
              <input
                id="groupName"
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter group name"
                required
              />
            </div>
            <div>
              <label htmlFor="groupDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                id="groupDescription"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter group description"
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading || !newGroupName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Group'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {groups.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <Users size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">No groups yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Create a group or join existing ones
              </p>
            </div>
          </div>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <Users size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {group.name}
                    </h3>
                    {group.description && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {group.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Created {new Date(group.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onGroupSelect(group)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Chat
                  </button>
                  <button
                    onClick={() => handleLeaveGroup(group.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Leave group"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Available Groups to Join */}
      <div className="p-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Available Groups</h4>
        <JoinableGroups onJoin={onGroupsUpdate} />
      </div>
    </div>
  );
};

// Component to show groups that the user can join
const JoinableGroups: React.FC<{ onJoin: () => void }> = ({ onJoin }) => {
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAvailableGroups = async () => {
    try {
      const response = await groupsAPI.getAll();
      const myGroupsResponse = await groupsAPI.getMy();
      const myGroupIds = new Set(myGroupsResponse.groups.map(g => g.id));

      const available = response.groups.filter(group => !myGroupIds.has(group.id));
      setAvailableGroups(available);
    } catch (error) {
      console.error('Failed to load available groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: number) => {
    try {
      await groupsAPI.join(groupId);
      onJoin();
      loadAvailableGroups(); // Refresh the list
    } catch (error) {
      console.error('Failed to join group:', error);
    }
  };

  React.useEffect(() => {
    loadAvailableGroups();
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-500">Loading groups...</div>;
  }

  if (availableGroups.length === 0) {
    return <div className="text-sm text-gray-500">No groups available to join</div>;
  }

  return (
    <div className="space-y-2">
      {availableGroups.map((group) => (
        <div
          key={group.id}
          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
        >
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {group.name}
            </div>
            {group.description && (
              <div className="text-xs text-gray-500 truncate">
                {group.description}
              </div>
            )}
          </div>
          <button
            onClick={() => handleJoinGroup(group.id)}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <UserPlus size={12} />
            <span>Join</span>
          </button>
        </div>
      ))}
    </div>
  );
};

export default GroupManager;