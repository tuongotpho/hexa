import React, { useEffect, useRef } from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  onMarkAsRead: (messageId: number) => void;
}

const SentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const ReadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const formatBytes = (bytes: number, decimals = 1) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


const ChatMessage: React.FC<ChatMessageProps> = ({ message, isCurrentUser, onMarkAsRead }) => {
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isCurrentUser && messageRef.current && message.status !== 'read') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            onMarkAsRead(message.id);
            observer.disconnect();
          }
        },
        { threshold: 0.8 }
      );

      observer.observe(messageRef.current);

      return () => observer.disconnect();
    }
  }, [isCurrentUser, message.id, message.status, onMarkAsRead]);


  const alignment = isCurrentUser ? 'justify-end' : 'justify-start';
  const bgColor = isCurrentUser ? 'bg-indigo-600' : 'bg-gray-700';
  const formattedTime = new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Use username from the joined profile data
  const username = message.profile?.username || 'Unknown User';
  const isImage = message.file_metadata?.type.startsWith('image/');

  return (
    <div ref={messageRef} className={`flex ${alignment} mb-4`}>
      <div className="flex flex-col max-w-xs lg:max-w-md">
        <div className={`px-4 py-3 rounded-xl ${bgColor}`}>
          {!isCurrentUser && (
            <p className="text-sm font-bold text-indigo-300 mb-1">{username}</p>
          )}
          {message.content && <p className="text-gray-50 break-words">{message.content}</p>}
          {message.image_url && (
            isImage ? (
              <a href={message.image_url} target="_blank" rel="noopener noreferrer">
                <img
                  src={message.image_url}
                  alt={message.file_metadata?.name || 'chat image'}
                  className="mt-2 rounded-lg max-w-full h-auto cursor-pointer"
                  style={{ maxHeight: '250px' }}
                />
              </a>
            ) : (
              <a
                href={message.image_url}
                download={message.file_metadata?.name}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 p-3 bg-gray-600 rounded-lg flex items-center gap-3 hover:bg-gray-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="flex flex-col overflow-hidden">
                  <p className="text-sm font-medium text-gray-50 truncate">{message.file_metadata?.name}</p>
                  <p className="text-xs text-gray-400">
                    {message.file_metadata?.size ? formatBytes(message.file_metadata.size) : 'File'}
                  </p>
                </div>
              </a>
            )
          )}
        </div>
        <div className={`text-xs text-gray-400 mt-1 px-1 flex items-center gap-1.5 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
          <span>{formattedTime}</span>
          {isCurrentUser && (
            <span>
              {message.status === 'read' ? <ReadIcon /> : <SentIcon />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
