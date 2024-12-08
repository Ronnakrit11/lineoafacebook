"use client";

import React, { useState } from 'react';

interface MessageInputProps {
  onSend: (message: string) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <div className="p-4 border-t flex">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') handleSend();
        }}
        placeholder="Send a message..."
        className="flex-grow p-2 border rounded-l"
      />
      <button
        onClick={handleSend}
        className="bg-blue-500 text-white p-2 rounded-r"
      >
        Send
      </button>
    </div>
  );
};