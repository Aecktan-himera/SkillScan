import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`
    bg-white dark:bg-gray-800
    rounded-lg shadow
    border border-gray-100 dark:border-gray-700
    overflow-hidden
    text-gray-900 dark:text-gray-100
    transition-colors duration-200
    ${className}
  `}>
    {children}
  </div>
);

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = "" }) => (
  <div className={`
    p-4 
    border-b border-gray-100 dark:border-gray-700
    transition-colors duration-200
    ${className}
  `}>
    {children}
  </div>
);

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = "" }) => (
  <h3 className={`
    text-lg font-semibold
    text-gray-900 dark:text-white
    transition-colors duration-200
    ${className}
  `}>
    {children}
  </h3>
);

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = "" }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);
