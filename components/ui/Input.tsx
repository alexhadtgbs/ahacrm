import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Input({
  label,
  error,
  helperText,
  className,
  id,
  name,
  type = 'text',
  ...props
}: InputProps) {
  // Use provided id, or name, or generate a stable id based on type and name
  const inputId = id || name || `${type}-${name || 'input'}`
  
  return (
    <>
      {label && (
        <label htmlFor={inputId} className="block text-label font-medium text-text-primary mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        className={cn(
          'input-field',
          error && 'border-alert-error focus:ring-alert-error',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-alert-error">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-text-secondary">{helperText}</p>
      )}
    </>
  )
} 