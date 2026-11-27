'use client';

import React, { use } from 'react';
import NotificationDetailsPage from '@/components/shared/NotificationDetailsPage';

interface NIAAdminNotificationDetailsProps {
    params: Promise<{
        id: string;
    }>;
}

export default function NIAAdminNotificationDetails({ params }: NIAAdminNotificationDetailsProps) {
    const { id } = use(params);
    return <NotificationDetailsPage notificationId={id} />;
}
