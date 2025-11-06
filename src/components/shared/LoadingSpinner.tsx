import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'white' | 'primary' | 'gray';
    className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    color = 'primary',
    className = ''
}) => {
    const sizeClasses = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-6 w-6'
    };

    const colorClasses = {
        white: 'border-white',
        primary: 'border-blue-600',
        gray: 'border-gray-600'
    };

    const classes = `animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]} ${className}`;

    return <div className={classes}></div>;
};

export default LoadingSpinner;