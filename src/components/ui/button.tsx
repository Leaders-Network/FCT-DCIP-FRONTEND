import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-blue-500',
        destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
      },
      size: {
        default: 'px-4 py-2 text-sm',
        sm: 'px-3 py-1.5 text-xs',
        lg: 'px-6 py-3 text-base',
        icon: 'h-8 w-8 p-0 flex items-center justify-center'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      {...props}
    >
      {children}
    </button>
  );
};