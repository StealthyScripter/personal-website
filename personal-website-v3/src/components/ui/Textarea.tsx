import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helper,
  resize = 'vertical',
  rows = 4,
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
    px-4 py-3 text-base
    ${error ? 'border-error focus:border-error' : 'border-primary/20 focus:border-primary'}
    ${resize === 'none' ? 'resize-none' : 
      resize === 'vertical' ? 'resize-y' : 
      resize === 'horizontal' ? 'resize-x' : 'resize'}
  `;

  const classes = `
    ${baseClasses}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className="mb-4">
      {label && (
        <label className="block mb-2 text-white font-medium text-sm">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={classes}
        style={{ minHeight: `${rows * 1.5}rem` }}
        {...props}
      />
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

Textarea.displayName = 'Textarea';

export default Textarea;
