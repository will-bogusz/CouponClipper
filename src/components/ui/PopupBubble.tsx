import React, { useEffect, useState, useRef } from 'react';

interface PopupBubbleProps {
  message: string;
  type: 'success' | 'error';
}

const PopupBubble: React.FC<PopupBubbleProps> = ({ message, type }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const messageRef = useRef(message);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setOpacity(1); // reset opacity to full whenever a new message is received
      messageRef.current = message;
    }

    let fadeOutInterval: string | number | NodeJS.Timeout | undefined;
    const startFadeOut = () => {
      fadeOutInterval = setInterval(() => {
        setOpacity((prevOpacity) => {
          if (prevOpacity <= 0) {
            clearInterval(fadeOutInterval);
            setIsVisible(false);
            return 0;
          }
          return prevOpacity - 0.05; // decrease opacity gradually
        });
      }, 100); // adjust opacity every 100ms for a smoother fade
    };
    const fadeOutTimer = setTimeout(startFadeOut, 3000); // start fading out after 3 seconds

    return () => {
      clearTimeout(fadeOutTimer);
      clearInterval(fadeOutInterval); // ensure interval is cleared on component unmount
    };
  }, [message]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg transition-opacity duration-6000 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}
      style={{ opacity: opacity }}
    >
      {message}
    </div>
  );
};

export default PopupBubble;