import React, { createContext, useContext, useState, ReactNode } from 'react';
import PopupBubble from '../ui/PopupBubble';

interface PopupMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface PopupContextType {
  showMessage: (message: string, type: 'success' | 'error') => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

let messageId = 0;

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};

export const PopupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<PopupMessage[]>([]);

  const showMessage = (newMessage: string, newType: 'success' | 'error') => {
    const id = ++messageId;
    setMessages(prevMessages => [...prevMessages, { id, message: newMessage, type: newType }]);
  };

  const removeMessage = (id: number) => {
    setMessages(prevMessages => prevMessages.filter(message => message.id !== id));
  };

  return (
    <PopupContext.Provider value={{ showMessage }}>
      {children}
      <div className="popup-stack">
        {messages.map(({ id, message, type }) => (
          <PopupBubble key={id} id={id} message={message} type={type} removeMessage={removeMessage} />
        ))}
      </div>
    </PopupContext.Provider>
  );
};
