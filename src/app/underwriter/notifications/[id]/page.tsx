'use client';

import React from 'react';
import NotificationDetailsPage from '@/components/shared/NotificationDetailsPage';

interface UnderwriterAdminNotificationDetailsProps {
    params: {
        id: string;
    };
}

export default function UnderwriterAdminNotificationDetails({ params }: UnderwriterAdminNotificationDetailsProps) {
    return <NotificationDetailsPage notificationId={params.id} />;
}
