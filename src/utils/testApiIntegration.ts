/**
 * Test utility to verify API integration is working
 */

import { getConflictInquiries } from '@/services/userConflictInquiries';
import { processingMonitorService } from '@/services/processingMonitor';

export const testApiIntegration = async () => {
    
    try {
        const inquiriesResponse = await getConflictInquiries({
            organization: 'AMMC',
            page: 1,
            limit: 5
        });
        const overviewResponse = await processingMonitorService.getOverview('AMMC', '24h');
        
        if (overviewResponse.success) {
        } else {
        }
        const healthResponse = await processingMonitorService.getSystemHealth();
        
        if (healthResponse.success) {
        } else {
        }
        
        return {
            userInquiries: true,
            processingMonitor: overviewResponse.success,
            systemHealth: healthResponse.success,
            allWorking: overviewResponse.success && healthResponse.success
        };

    } catch (error) {
        return {
            userInquiries: false,
            processingMonitor: false,
            systemHealth: false,
            allWorking: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

// Auto-run test in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Run test after a short delay to allow token setup
    setTimeout(() => {
        testApiIntegration();
    }, 1000);
}