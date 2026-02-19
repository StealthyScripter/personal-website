import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  disabled = false,
  loading = false,
  icon,
  className = '',
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    border-none rounded-full font-semibold
    cursor-pointer transition-all duration-300
    no-underline font-inherit relative overflow-hidden
    ${disabled || loading ? 'opacity-60 cursor-not-allowed' : 'hover:transform hover:-translate-y-1'}
  `;

  const variantClasses = {
    primary: `
      bg-gradient-to-br from-primary to-accent
      text-dark-bg
      hover:shadow-primary
    `,
    secondary: `
      bg-transparent text-white border-2 border-primary
      hover:bg-primary/10
    `,
    ghost: `
      bg-transparent text-primary
      hover:bg-primary/10
    `,
    danger: `
      bg-gradient-to-br from-red-500 to-red-600
      text-white
    `,
    success: `
      bg-gradient-to-br from-green-500 to-green-600
      text-white
    `,
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-transparent border-t-current rounded-full animate-spin" />
      )}
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
