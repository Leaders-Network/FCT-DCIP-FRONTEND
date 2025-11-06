import React from 'react';

interface BadgeProps {
    variant: 'available' | 'busy' | 'unavailable' | 'urgent' | 'high' | 'medium' | 'low' | 'default';
    children: React.ReactNode;
    className?: string;
}

const Badge: React.FC<BadgeProps> = ({ variant, children, className = '' }) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";

    const variantClasses = {
        available: "bg-green-100 text-green-800",
        busy: "bg-yellow-100 text-yellow-800",
        unavailable: "bg-red-100 text-red-800",
        urgent: "bg-red-100 text-red-800",
        high: "bg-orange-100 text-orange-800",
        medium: "bg-yellow-100 text-yellow-800",
        low: "bg-green-100 text-green-800",
        default: "bg-gray-100 text-gray-800"
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

    return (
        <span className={classes}>
            {children}
        </span>
    );
};

export default Badge;