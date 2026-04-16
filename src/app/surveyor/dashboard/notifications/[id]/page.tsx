'use client';

import React from 'react';
import NotificationDetailsPage from '@/components/shared/NotificationDetailsPage';

interface SurveyorNotificationDetailsProps {
    params: {
        id: string;
    };
}

export default function SurveyorNotificationDetails({ params }: SurveyorNotificationDetailsProps) {
    return <NotificationDetailsPage notificationId={params.id} />;
}
