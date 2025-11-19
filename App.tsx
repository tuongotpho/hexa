
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/firebase';
import Auth from './components/Auth';
import ChatLayout from './components/ChatLayout';
import { LoaderIcon } from './components/Icons';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <LoaderIcon className="w-12 h-12 animate-spin-slow text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen antialiased">
      {user ? <ChatLayout user={user} /> : <Auth />}
    </div>
  );
};

export default App;
