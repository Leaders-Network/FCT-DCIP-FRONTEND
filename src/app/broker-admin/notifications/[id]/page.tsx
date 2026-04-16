'use client';

import React from 'react';
import NotificationDetailsPage from '@/components/shared/NotificationDetailsPage';

interface BrokerAdminNotificationDetailsProps {
    params: {
        id: string;
    };
}

export default function BrokerAdminNotificationDetails({ params }: BrokerAdminNotificationDetailsProps) {
    return <NotificationDetailsPage notificationId={params.id} />;
}
