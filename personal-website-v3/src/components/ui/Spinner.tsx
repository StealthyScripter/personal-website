import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'currentColor',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const classes = `
    ${sizeClasses[size]}
    border-2 border-transparent border-t-current
    rounded-full
    animate-spin
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div 
      className={classes}
      style={{ borderTopColor: color }}
    />
  );
};

export default Spinner;
