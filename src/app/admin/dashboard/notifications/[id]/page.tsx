'use client';

import React from 'react';
import NotificationDetailsPage from '@/components/shared/NotificationDetailsPage';

interface AdminNotificationDetailsProps {
    params: {
        id: string;
    };
}

export default function AdminNotificationDetails({ params }: AdminNotificationDetailsProps) {
    return <NotificationDetailsPage notificationId={params.id} />;
}
