'use client';

import React from 'react';
import NotificationDetailsPage from '@/components/shared/NotificationDetailsPage';

interface NIAAdminNotificationDetailsProps {
    params: {
        id: string;
    };
}

export default function NIAAdminNotificationDetails({ params }: NIAAdminNotificationDetailsProps) {
    return <NotificationDetailsPage notificationId={params.id} />;
}
