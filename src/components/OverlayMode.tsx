import React, { useState, useEffect, ReactNode } from 'react';
import { Maximize2, Minimize2, Eye } from 'lucide-react';

interface OverlayModeProps {
  children: ReactNode;
}

const OverlayMode: React.FC<OverlayModeProps> = ({ children }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - (isMinimized ? 200 : 800), e.clientX - dragStart.x)),
          y: Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragStart.y))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, isMinimized]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  return (
    <div
      className="fixed z-[9999] shadow-2xl"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: isMinimized ? '200px' : '800px',
        transition: 'width 0.3s ease'
      }}
    >
      <div 
        className="bg-gray-800 text-white p-2 rounded-t-lg cursor-move flex items-center justify-between"
        onMouseDown={handleMouseDown}
      >
        <span className="text-sm font-medium font-['Press_Start_2P']">FocuzStreak</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
        </div>
      </div>
      
      <div 
        className={`bg-white rounded-b-lg shadow-xl transition-all duration-300 overflow-hidden ${
          isMinimized ? 'h-[200px]' : 'h-[600px]'
        }`}
      >
        <div className="h-full overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default OverlayMode;