import React, { createContext, useContext, useState, ReactNode } from 'react';
import PopupBubble from '../ui/PopupBubble';

interface PopupContextType {
  showMessage: (message: string, type: 'success' | 'error') => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (context === undefined) {
    throw new Error('usePopup must be used within a PopupProvider');
  }
  return context;
};

export const PopupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error'>('success');
  const [key, setKey] = useState(0); // adding a key state

  const showMessage = (newMessage: string, newType: 'success' | 'error') => {
    setMessage(newMessage);
    setType(newType);
    setKey(prevKey => prevKey + 1); // increment key to force re-render
  };

  return (
    <PopupContext.Provider value={{ showMessage }}>
      {children}
      <PopupBubble key={key} message={message} type={type} /> {/* using key to force re-render */}
    </PopupContext.Provider>
  );
};