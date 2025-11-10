import React from 'react';

interface HapticTabProps {
  children: React.ReactNode;
  isActive?: boolean;
}

export function HapticTab({ children, isActive }: HapticTabProps) {
  const handleClick = () => {
    // Simple vibration if supported (for mobile browsers)
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.(5);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`flex flex-col items-center justify-center p-2 ${
        isActive ? 'opacity-100' : 'opacity-60'
      } transition-opacity hover:opacity-100`}
    >
      {children}
    </div>
  );
}