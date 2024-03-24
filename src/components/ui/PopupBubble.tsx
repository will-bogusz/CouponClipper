import React, { useEffect, useState } from 'react';

interface PopupBubbleProps {
  id: number;
  message: string;
  type: 'success' | 'error';
  removeMessage: (id: number) => void;
}

const PopupBubble: React.FC<PopupBubbleProps> = ({ id, message, type, removeMessage }) => {
  useEffect(() => {
    const timer = setTimeout(() => removeMessage(id), 5000); // Adjust time as needed
    return () => clearTimeout(timer);
  }, [id, removeMessage]);

  return (
    <div
      className={`p-4 mb-2 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}
      style={{ opacity: 1, transition: 'opacity 0.5s ease-out' }}
    >
      {message}
    </div>
  );
};

export default PopupBubble;
