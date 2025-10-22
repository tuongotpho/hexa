import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './services/supabase';
import { Message, Profile } from './types';
import { DB_TABLE } from './constants';
import AuthComponent from './components/Auth';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ChatInfoPanel from './components/ChatInfoPanel';
import type { Session, User } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfiles = useCallback(async () => {
    if (!session?.user) return;
    try {
      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;
      setProfiles(profilesData || []);

      // Find the current user's profile
      const userProfile = profilesData?.find(p => p.id === session.user.id) || null;
      setCurrentUserProfile(userProfile);
      
      // The app will now wait for the user to select a conversation.

    } catch (error: any) {
      setError('Could not fetch user profiles: ' + error.message);
      console.error('Error fetching profiles:', error);
    }
  }, [session?.user]); // Dependency changed to only session.user

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);
  
  const handleSignOut = async () => {
    setSelectedUser(null);
    setCurrentUserProfile(null);
    setIsSidebarOpen(false);
    setIsInfoPanelOpen(false);
    await supabase.auth.signOut();
  };

  const handleSelectUser = (user: Profile) => {
    setSelectedUser(user);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };
  
  const handleUpdateUsername = (newUsername: string) => {
    if (currentUserProfile) {
      // Optimistically update the current user's profile in the state
      const updatedProfile = { ...currentUserProfile, username: newUsername };
      setCurrentUserProfile(updatedProfile);
  
      // Also update this user's profile in the main profiles list
      setProfiles(prevProfiles => 
        prevProfiles.map(p => p.id === currentUserProfile.id ? updatedProfile : p)
      );
    }
  };
  
  if (!session) {
    return <AuthComponent />;
  }

  return (
    <div className="relative flex h-dvh w-full bg-gray-900 text-gray-100 font-sans overflow-hidden">
      {/* Backdrop for mobile overlays */}
      {(isSidebarOpen || isInfoPanelOpen) && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-60 z-20"
          onClick={() => {
            setIsSidebarOpen(false);
            setIsInfoPanelOpen(false);
          }}
          aria-hidden="true"
        />
      )}
      
      {currentUserProfile && (
        <Sidebar
          currentUser={currentUserProfile}
          profiles={profiles.filter(p => p.id !== currentUserProfile.id)}
          onSelectUser={handleSelectUser}
          onSignOut={handleSignOut}
          onUpdateUsername={handleUpdateUsername}
          selectedUserId={selectedUser?.id}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}
      
      <main className="flex-1 flex flex-col min-w-0">
        {selectedUser && currentUserProfile ? (
          <ChatWindow
            key={selectedUser.id} // Re-mount component when user changes
            currentUser={currentUserProfile}
            selectedUser={selectedUser}
            onToggleSidebar={() => setIsSidebarOpen(true)}
            onToggleInfoPanel={() => setIsInfoPanelOpen(true)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 relative">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden absolute top-4 left-4 p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
              aria-label="Open user list"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h2 className="mt-2 text-lg font-medium">Welcome to Supabase Chat</h2>
              <p>Select a user from the list to start a conversation.</p>
            </div>
          </div>
        )}
      </main>

      {selectedUser && (
        <ChatInfoPanel
          selectedUser={selectedUser}
          isOpen={isInfoPanelOpen}
          onClose={() => setIsInfoPanelOpen(false)}
        />
      )}
    </div>
  );
};

export default App;