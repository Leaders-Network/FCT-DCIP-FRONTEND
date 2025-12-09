'use client';

import React from 'react';
import NotificationsPage from '@/components/shared/NotificationsPage';
import { NotificationProvider } from '@/context/NotificationContext';

export default function Notifications() {
    return (
        <NotificationProvider>
            <NotificationsPage />
        </NotificationProvider>
    );
}
