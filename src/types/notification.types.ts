export interface Notification {
    _id: string;
    recipientId: string;
    recipientType: 'user' | 'employee' | 'surveyor' | 'admin' | 'nia-admin' | 'broker-admin';
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    read: boolean;
    readAt?: string;
    actionUrl?: string;
    actionLabel?: string;
    expiresAt?: string;
    metadata?: {
        policyId?: string;
        assignmentId?: string;
        reportId?: string;
        surveyorId?: string;
        icon?: string;
        color?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export type NotificationType =
    | 'policy_created'
    | 'policy_assigned'
    | 'policy_surveyed'
    | 'policy_approved'
    | 'policy_rejected'
    | 'policy_requires_revision'
    | 'assignment_created'
    | 'assignment_reassigned'
    | 'assignment_deadline_approaching'
    | 'assignment_overdue'
    | 'survey_submitted'
    | 'survey_reviewed'
    | 'report_ready'
    | 'report_released'
    | 'payment_required'
    | 'payment_received'
    | 'conflict_detected'
    | 'system_alert'
    | 'message_received';

export interface NotificationResponse {
    success: boolean;
    notifications: Notification[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    unreadCount: number;
}

export interface UnreadCountResponse {
    success: boolean;
    count: number;
}
