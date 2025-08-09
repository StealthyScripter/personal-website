import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'filled';
  inputSize?: 'sm' | 'md' | 'lg';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helper,
  icon,
  variant = 'default',
  inputSize = 'md',
  className = '',
  ...props
}, ref) => {
  const baseClasses = `
    w-full
    bg-white/5
    border rounded-lg
    text-white
    transition-colors duration-300
    font-inherit
    outline-none
    placeholder:text-text-muted
    ${error ? 'border-error focus:border-error' : 'border-primary/20 focus:border-primary'}
    ${icon ? 'pl-10' : ''}
  `;

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg',
  };

  const classes = `
    ${baseClasses}
    ${sizeClasses[inputSize]}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className="mb-4">
      {label && (
        <label className="block mb-2 text-white font-medium text-sm">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={classes}
          {...props}
        />
      </div>
      {error && (
        <span className="block mt-1 text-xs text-error">
          {error}
        </span>
      )}
      {helper && !error && (
        <span className="block mt-1 text-xs text-text-secondary">
          {helper}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
