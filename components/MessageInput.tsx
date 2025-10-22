
import React, { useState, useRef } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string, file?: File) => void;
  isSending: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isSending }) => {
  const [content, setContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() || fileInputRef.current?.files?.[0]) {
      onSendMessage(content, fileInputRef.current?.files?.[0]);
      setContent('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-800 border-t border-gray-700">
      <div className="flex items-center bg-gray-700 rounded-full px-2 py-1">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow bg-transparent text-gray-100 placeholder-gray-400 focus:outline-none px-4"
          disabled={isSending}
        />
        <input type="file" ref={fileInputRef} className="hidden" />
        <button
          type="button"
          onClick={handleFileClick}
          className="p-2 text-gray-400 hover:text-indigo-400"
          disabled={isSending}
          title="Attach file"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        <button
          type="submit"
          className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed"
          disabled={isSending || (!content.trim() && !fileInputRef.current?.files?.length)}
        >
          {isSending ? (
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
