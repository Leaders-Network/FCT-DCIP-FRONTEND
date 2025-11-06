import React from 'react';

interface NIATokenProviderProps {
    children: React.ReactNode;
}

export const NIATokenProvider: React.FC<NIATokenProviderProps> = ({ children }) => {
    // This component can be used to provide NIA admin token context
    // For now, it just renders children as-is
    return <>{children}</>;
};