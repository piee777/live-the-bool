import React, { useState, useEffect } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export const Typewriter: React.FC<TypewriterProps> = ({ text, speed = 35, className, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText(''); // Reset on new text
    if (text.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    const timeoutId = setTimeout(() => {
        let i = 0;
        const intervalId = setInterval(() => {
          setDisplayedText(text.substring(0, i + 1));
          i++;
          if (i >= text.length) {
            clearInterval(intervalId);
            if (onComplete) onComplete();
          }
        }, speed);
    
        return () => clearInterval(intervalId);
    }, 100); // Small delay before starting

    return () => clearTimeout(timeoutId);

  }, [text, speed, onComplete]);

  // Add a blinking cursor effect while typing
  const cursor = displayedText.length < text.length ? '▋' : '';

  return <p className={className}>{displayedText}{cursor}</p>;
};