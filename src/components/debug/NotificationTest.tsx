'use client';

import React from 'react';

interface NotificationTestProps {
    className?: string;
}

const NotificationTest: React.FC<NotificationTestProps> = ({ className }) => {
    return (
        <div className={className}>
            {/* Notification test component - currently empty */}
        </div>
    );
};

export default NotificationTest;