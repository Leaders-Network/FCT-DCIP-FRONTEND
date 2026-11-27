'use client';

import React, { use } from 'react';
import NotificationDetailsPage from '@/components/shared/NotificationDetailsPage';

interface AdminNotificationDetailsProps {
    params: Promise<{
        id: string;
    }>;
}

export default function AdminNotificationDetails({ params }: AdminNotificationDetailsProps) {
    const { id } = use(params);
    return <NotificationDetailsPage notificationId={id} />;
}
