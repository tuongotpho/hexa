import React, { useState } from 'react';
import { Profile } from '../types';
import { supabase } from '../services/supabase';

interface SidebarProps {
  currentUser: Profile;
  profiles: Profile[];
  onSelectUser: (user: Profile) => void;
  onSignOut: () => void;
  onUpdateUsername: (newUsername: string) => void;
  selectedUserId?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserAvatar: React.FC<{ username: string }> = ({ username }) => {
  const initial = username ? username.charAt(0).toUpperCase() : '?';
  return (
    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white flex-shrink-0">
      {initial}
    </div>
  );
};

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
  </svg>
);

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CancelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ currentUser, profiles, onSelectUser, onSignOut, onUpdateUsername, selectedUserId, isOpen, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(currentUser.username);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const sidebarClasses = `
    w-80 bg-gray-800 flex flex-col border-r border-gray-700
    transform transition-transform duration-300 ease-in-out
    fixed md:static md:translate-x-0
    inset-y-0 left-0 z-30
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  const handleSave = async () => {
    const trimmedUsername = newUsername.trim();
    if (!trimmedUsername || trimmedUsername === currentUser.username) {
      setIsEditing(false);
      setUpdateStatus('idle');
      return;
    }

    setUpdateStatus('loading');
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ username: trimmedUsername })
      .eq('id', currentUser.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating username:', error);
      setUpdateStatus('error');
    } else if (data) {
      onUpdateUsername(data.username);
      setIsEditing(false);
      setUpdateStatus('idle');
    }
  };
  
  return (
    <aside className={sidebarClasses}>
      <header className="p-4 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar username={currentUser.username} />
          <div className="min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  className="bg-gray-700 border border-gray-600 text-white text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block w-full p-1.5"
                  autoFocus
                />
                <button onClick={handleSave} disabled={updateStatus === 'loading'} className="p-1 text-green-400 hover:text-green-300 disabled:text-gray-500">
                  <SaveIcon />
                </button>
                <button onClick={() => setIsEditing(false)} className="p-1 text-red-400 hover:text-red-300">
                  <CancelIcon />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h2 className="font-bold text-white text-lg truncate">{currentUser.username}</h2>
                <button onClick={() => setIsEditing(true)} className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-white transition-opacity">
                  <EditIcon />
                </button>
              </div>
            )}
            <p className="text-xs text-gray-400">
              {updateStatus === 'error' ? <span className="text-red-400">Update failed!</span> : 'Online'}
            </p>
          </div>
        </div>
        <div className="flex items-center">
            <button onClick={onSignOut} title="Sign Out" className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            </button>
            <button onClick={onClose} className="md:hidden p-1 -mr-2 text-gray-400 hover:text-white" aria-label="Close sidebar">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        <h3 className="px-2 py-2 text-sm font-semibold text-gray-400">DIRECT MESSAGES</h3>
        <ul>
          {profiles.map(profile => (
            <li key={profile.id}>
              <button
                onClick={() => onSelectUser(profile)}
                className={`w-full text-left flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 ${selectedUserId === profile.id ? 'bg-gray-700' : ''}`}
              >
                <UserAvatar username={profile.username} />
                <span className="font-medium text-gray-200">{profile.username}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;