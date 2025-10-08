
import React from 'react';

// FIX: Extend React.HTMLAttributes<HTMLDivElement> to allow passing standard div props like onClick.
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    // FIX: Spread the rest of the props (`...props`) onto the div to apply them.
    <div className={`bg-gray-800 rounded-lg shadow-lg p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
