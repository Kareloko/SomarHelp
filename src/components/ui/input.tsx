'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm text-text-secondary mb-2 font-sans">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-white/[0.03] border border-border rounded-xl px-4 py-3
            text-text placeholder:text-text-muted font-sans text-sm
            focus:outline-none focus:border-border-active focus:bg-white/[0.05]
            transition-all duration-200
            ${className}
          `}
          {...props}
        />
      </div>
    )
  }
)

Input.displayName = 'Input'
