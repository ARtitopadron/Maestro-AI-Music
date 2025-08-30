import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-[#161B22] border border-[#30363D] rounded-xl shadow-lg overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export default Card;