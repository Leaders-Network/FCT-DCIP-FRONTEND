'use client';

import React, { use } from 'react';
import NotificationDetailsPage from '@/components/shared/NotificationDetailsPage';

interface DashboardNotificationDetailsProps {
    params: Promise<{
        id: string;
    }>;
}

export default function DashboardNotificationDetails({ params }: DashboardNotificationDetailsProps) {
    const { id } = use(params);
    return <NotificationDetailsPage notificationId={id} />;
}
