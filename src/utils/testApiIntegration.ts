/**
 * Test utility to verify API integration is working
 */

import { userConflictInquiriesService } from '@/services/userConflictInquiries';
import { processingMonitorService } from '@/services/processingMonitor';

export const testApiIntegration = async () => {
    console.log('🧪 Testing API Integration...');
    
    try {
        // Test user conflict inquiries API
        console.log('📋 Testing User Conflict Inquiries API...');
        const inquiriesResponse = await userConflictInquiriesService.getInquiries({
            organization: 'AMMC',
            page: 1,
            limit: 5
        });
        
        if (inquiriesResponse.success) {
            console.log('✅ User Conflict Inquiries API working');
            console.log(`   - Found ${inquiriesResponse.data.inquiries.length} inquiries`);
        } else {
            console.log('❌ User Conflict Inquiries API failed:', inquiriesResponse.error);
        }

        // Test processing monitor API
        console.log('📊 Testing Processing Monitor API...');
        const overviewResponse = await processingMonitorService.getOverview('AMMC', '24h');
        
        if (overviewResponse.success) {
            console.log('✅ Processing Monitor API working');
            console.log(`   - Total assignments: ${overviewResponse.data.overview.totalDualAssignments}`);
            console.log(`   - Total reports: ${overviewResponse.data.overview.totalMergedReports}`);
        } else {
            console.log('❌ Processing Monitor API failed:', overviewResponse.error);
        }

        // Test system health
        console.log('🏥 Testing System Health API...');
        const healthResponse = await processingMonitorService.getSystemHealth();
        
        if (healthResponse.success) {
            console.log('✅ System Health API working');
            console.log(`   - System status: ${healthResponse.data.systemStatus}`);
            console.log(`   - Alerts: ${healthResponse.data.alerts.length}`);
        } else {
            console.log('❌ System Health API failed:', healthResponse.error);
        }

        console.log('🎉 API Integration test completed!');
        
        return {
            userInquiries: inquiriesResponse.success,
            processingMonitor: overviewResponse.success,
            systemHealth: healthResponse.success,
            allWorking: inquiriesResponse.success && overviewResponse.success && healthResponse.success
        };

    } catch (error) {
        console.error('❌ API Integration test failed:', error);
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