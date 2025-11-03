"use client";
import { useEffect, useState } from 'react';
import { setupNIAAdminToken } from '@/utils/niaTokenSetup';

interface NIATokenProviderProps {
    children: React.ReactNode;
}

export const NIATokenProvider: React.FC<NIATokenProviderProps> = ({ children }) => {
    const [tokenReady, setTokenReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initializeToken = async () => {
            try {
                // Check if we already have a NIA admin token
                const existingToken = localStorage.getItem('niaAdminToken');
                if (existingToken) {
                    console.log('NIA admin token already exists');
                    setTokenReady(true);
                    return;
                }

                // If no token, set up a new one
                console.log('Setting up NIA admin token...');
                await setupNIAAdminToken();
                setTokenReady(true);
            } catch (error) {
                console.error('Failed to initialize NIA admin token:', error);
                setError(error instanceof Error ? error.message : 'Token setup failed');
                setTokenReady(true); // Still render the page, but with error state
            }
        };

        initializeToken();
    }, []);

    if (!tokenReady) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Setting up NIA admin access...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <div className="text-red-600 mb-4">
                        <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-red-800 mb-2">Authentication Setup Failed</h3>
                    <p className="text-sm text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};