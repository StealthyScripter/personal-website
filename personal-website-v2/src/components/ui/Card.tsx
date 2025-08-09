import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Card: React.FC<CardProps> = ({
  children,
  hover = false,
  variant = 'default',
  padding = 'lg',
  className = '',
  ...props
}) => {
  const baseClasses = `
    rounded-xl
    backdrop-blur-sm
    transition-all duration-300
    ${hover ? 'cursor-pointer hover:transform hover:-translate-y-2 hover:border-primary hover:shadow-primary' : ''}
  `;

  const variantClasses = {
    default: 'bg-card-bg border border-primary/10',
    outlined: 'bg-transparent border-2 border-primary/20',
    elevated: 'bg-card-bg border border-primary/10 shadow-lg',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
