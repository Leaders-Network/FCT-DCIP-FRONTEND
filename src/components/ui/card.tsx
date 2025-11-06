import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className = '', children }) => {
  return (
    <div className={`bg-white shadow-sm border border-gray-200 rounded-lg ${className}`}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<CardContentProps> = ({ className = '', children }) => {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};