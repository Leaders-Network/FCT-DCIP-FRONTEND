'use client';

import React, { use } from 'react';
import NotificationDetailsPage from '@/components/shared/NotificationDetailsPage';

interface SurveyorNotificationDetailsProps {
    params: Promise<{
        id: string;
    }>;
}

export default function SurveyorNotificationDetails({ params }: SurveyorNotificationDetailsProps) {
    const { id } = use(params);
    return <NotificationDetailsPage notificationId={id} />;
}
