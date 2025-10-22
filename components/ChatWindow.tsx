import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Message, Profile } from '../types';
import { DB_TABLE, STORAGE_BUCKET } from '../constants';
import ChatMessage from './ChatMessage';
import MessageInput from './MessageInput';

interface ChatWindowProps {
  currentUser: Profile;
  selectedUser: Profile;
  onToggleSidebar: () => void;
  onToggleInfoPanel: () => void;
}

// Debounce utility to prevent firing function too rapidly
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>): void => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };
};

const ChatWindow: React.FC<ChatWindowProps> = ({ currentUser, selectedUser, onToggleSidebar, onToggleInfoPanel }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  };
  
  const fetchMessages = useCallback(async () => {
    if (!selectedUser) return;
    try {
      const { data, error: fetchError } = await supabase
        .from(DB_TABLE)
        .select('*, file_metadata, profile:profiles!user_id(id, username, avatar_url)') // FIX: Explicitly define the join relationship
        .or(
          `and(user_id.eq.${currentUser.id},recipient_id.eq.${selectedUser.id}),and(user_id.eq.${selectedUser.id},recipient_id.eq.${currentUser.id})`
        )
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      
      setMessages(data as Message[] || []);
      setError(null);
    } catch (error: unknown) {
      console.error('Error fetching messages:', error);
      const errorMessage = (error instanceof Error) ? error.message : 
        (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') ? error.message :
        'An unknown error occurred';
      setError(`Could not fetch messages: ${errorMessage}`);
    }
  }, [currentUser.id, selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;

    fetchMessages();

    // Create a unique channel for the conversation
    const channel = supabase
      .channel(`conversation:${[currentUser.id, selectedUser.id].sort().join(':')}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: DB_TABLE,
          // Filter real-time events on the server for this specific conversation
          filter: `or=(and(user_id.eq.${currentUser.id},recipient_id.eq.${selectedUser.id}),and(user_id.eq.${selectedUser.id},recipient_id.eq.${currentUser.id}))`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Only process if the message is from the other user
            if ((payload.new as Message).user_id === currentUser.id) return;
            
            const { data: newMessage, error } = await supabase
              .from(DB_TABLE)
              .select('*, file_metadata, profile:profiles!user_id(id, username, avatar_url)') // FIX: Explicitly define the join relationship
              .eq('id', (payload.new as Message).id)
              .single();

            if (error) {
              console.error('Error fetching new message with profile:', error);
              return;
            }

            setMessages((prevMessages) => [...prevMessages, newMessage as Message]);
            
            if (document.hidden && notificationPermission === 'granted') {
              new Notification(`New message from ${newMessage.profile?.username || 'Unknown User'}`, {
                body: newMessage.content || `Sent: ${newMessage.file_metadata?.name || 'a file'}.`,
                tag: 'new-message',
              });
            }

          } else if (payload.eventType === 'UPDATE') {
             const { data: updatedMessage, error } = await supabase
             .from(DB_TABLE)
             .select('*, file_metadata, profile:profiles!user_id(id, username, avatar_url)') // FIX: Explicitly define the join relationship
             .eq('id', (payload.new as Message).id)
             .single();
            
            if(error) return;

            setMessages((prevMessages) =>
              prevMessages.map(msg => msg.id === updatedMessage.id ? updatedMessage as Message : msg)
            );
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR' || err) {
          setError(`Real-time connection failed: ${err?.message || 'A channel error occurred.'}`);
        }
      });
    
    return () => {
        supabase.removeChannel(channel);
    };
  }, [currentUser.id, selectedUser, fetchMessages, notificationPermission]);

  const handleMarkAsRead = async (messageId: number) => {
    const message = messages.find(m => m.id === messageId);
    if (message && message.user_id !== currentUser.id && message.status !== 'read') {
        const { error } = await supabase
          .from(DB_TABLE)
          .update({ status: 'read' })
          .eq('id', messageId);
        if (error) console.error('Error marking message as read:', error);
    }
  };
  
  const debouncedMarkAsRead = useCallback(debounce(handleMarkAsRead, 500), [messages, currentUser.id]);

  const handleSendMessage = async (content: string, file?: File) => {
    if (!selectedUser) return;
    setIsSending(true);
    setError(null);

    try {
      let fileUrl: string | null = null;
      let fileMetadata: { name: string, type: string, size: number } | null = null;
      
      if (file) {
        fileMetadata = { name: file.name, type: file.type, size: file.size };
        const fileExt = file.name.split('.').pop();
        const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(fileName, 31536000); // 31536000 seconds = 1 year

        if (signedUrlError) throw signedUrlError;
        fileUrl = signedUrlData.signedUrl;
      }

      if (content.trim() || fileUrl) {
        const { data: newMessage, error: insertError } = await supabase
          .from(DB_TABLE)
          .insert([
            {
              content: content.trim() ? content : null,
              user_id: currentUser.id,
              recipient_id: selectedUser.id,
              image_url: fileUrl,
              file_metadata: fileMetadata,
            },
          ])
          .select()
          .single();

        if (insertError) throw insertError;
        
        if (newMessage) {
          // Manually append the sender's profile for an immediate UI update,
          // providing a better user experience than waiting for the subscription.
          const messageWithProfile: Message = {
            ...(newMessage as Message),
            profile: currentUser,
          };
          setMessages((prevMessages) => [...prevMessages, messageWithProfile]);
        }
      }
    } catch (error: any) {
      setError(`Error sending message: ${error.message}`);
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900 h-full">
      <header className="p-4 bg-gray-800 border-b border-gray-700 shadow-md flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white"
          aria-label="Open user list"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button onClick={onToggleInfoPanel} className="flex-grow flex items-center gap-4 text-left rounded-md p-1 -ml-1 hover:bg-gray-700">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white flex-shrink-0">
            {selectedUser.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">{selectedUser.username}</h1>
            <p className="text-xs text-green-400">Active now</p>
          </div>
        </button>
      </header>
      
      {error && <div className="bg-red-500 text-white p-3 text-center flex-shrink-0"><p>{error}</p></div>}
      
      {notificationPermission === 'default' && (
        <div className="bg-indigo-700 text-white p-2 text-center text-sm flex-shrink-0">
          <span>Get notified of new messages. </span>
          <button onClick={requestNotificationPermission} className="font-bold underline hover:text-indigo-200">
            Enable notifications
          </button>
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <ChatMessage 
              key={msg.id} 
              message={msg} 
              isCurrentUser={msg.user_id === currentUser.id}
              onMarkAsRead={debouncedMarkAsRead}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 mt-8">No messages in this conversation yet. Say hello!</div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <div className="flex-shrink-0">
        <MessageInput onSendMessage={handleSendMessage} isSending={isSending} />
      </div>
    </div>
  );
};

export default ChatWindow;