
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick, hoverEffect = false }) => {
  const baseClasses = "bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden";
  const hoverClasses = hoverEffect ? "transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-[1.02]" : "";
  const clickableClasses = onClick ? "cursor-pointer" : "";

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
