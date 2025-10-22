import React from 'react';
import { Profile } from '../types';

interface ChatInfoPanelProps {
  selectedUser: Profile;
  isOpen: boolean;
  onClose: () => void;
}

const ChatInfoPanel: React.FC<ChatInfoPanelProps> = ({ selectedUser, isOpen, onClose }) => {
  const panelClasses = `
    w-80 bg-gray-800 border-l border-gray-700 flex flex-col
    transform transition-transform duration-300 ease-in-out
    fixed lg:static lg:translate-x-0
    inset-y-0 right-0 z-30
    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
  `;
  
  return (
    <aside className={panelClasses}>
      <header className="p-4 border-b border-gray-700 text-center relative">
        <button onClick={onClose} className="lg:hidden absolute top-3 right-3 p-2 text-gray-400 hover:text-white" aria-label="Close info panel">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
           </svg>
        </button>
        <div className="w-24 h-24 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white text-4xl mx-auto">
          {selectedUser.username.charAt(0).toUpperCase()}
        </div>
        <h2 className="mt-4 text-xl font-bold text-white">{selectedUser.username}</h2>
        <p className="text-sm text-gray-400">{selectedUser.id}</p>
      </header>
      
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">User Information</h3>
            <div className="space-y-2 text-gray-300">
                <p><span className="font-medium">Username:</span> {selectedUser.username}</p>
                {/* In a real app, you might have more fields like Full Name, etc. */}
            </div>
        </div>

        <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Shared Media</h3>
            <div className="text-center text-gray-500 p-4 border-2 border-dashed border-gray-700 rounded-lg">
                <p>No media shared yet.</p>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default ChatInfoPanel;