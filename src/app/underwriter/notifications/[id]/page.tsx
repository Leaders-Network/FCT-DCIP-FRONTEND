'use client';

import React, { use } from 'react';
import NotificationDetailsPage from '@/components/shared/NotificationDetailsPage';

interface UnderwriterAdminNotificationDetailsProps {
    params: Promise<{
        id: string;
    }>;
}

export default function UnderwriterAdminNotificationDetails({ params }: UnderwriterAdminNotificationDetailsProps) {
    const { id } = use(params);
    return <NotificationDetailsPage notificationId={id} />;
}
