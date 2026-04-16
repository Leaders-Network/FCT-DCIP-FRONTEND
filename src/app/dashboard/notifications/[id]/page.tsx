'use client';

import React from 'react';
import NotificationDetailsPage from '@/components/shared/NotificationDetailsPage';

interface DashboardNotificationDetailsProps {
    params: {
        id: string;
    };
}

export default function DashboardNotificationDetails({ params }: DashboardNotificationDetailsProps) {
    return <NotificationDetailsPage notificationId={params.id} />;
}
