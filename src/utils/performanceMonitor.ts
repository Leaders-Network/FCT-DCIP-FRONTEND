/**
 * Performance monitoring utilities
 * Helps track and optimize application performance
 */

interface PerformanceMetric {
    name: string;
    duration: number;
    timestamp: number;
}

class PerformanceMonitor {
    private metrics: PerformanceMetric[] = [];
    private timers: Map<string, number> = new Map();

    /**
     * Start timing an operation
     */
    startTimer(name: string): void {
        this.timers.set(name, performance.now());
    }

    /**
     * End timing an operation and record the metric
     */
    endTimer(name: string): number {
        const startTime = this.timers.get(name);

        if (!startTime) {
            console.warn(`⚠️ Timer "${name}" was not started`);
            return 0;
        }

        const duration = performance.now() - startTime;
        this.timers.delete(name);

        this.metrics.push({
            name,
            duration,
            timestamp: Date.now()
        });

        // Log slow operations
        if (duration > 1000) {
            console.warn(`🐌 Slow operation: ${name} took ${duration.toFixed(2)}ms`);
        } else if (duration > 100) {
            console.log(`⏱️ ${name} took ${duration.toFixed(2)}ms`);
        }

        return duration;
    }

    /**
     * Measure a function execution time
     */
    async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
        this.startTimer(name);
        try {
            const result = await fn();
            this.endTimer(name);
            return result;
        } catch (error) {
            this.endTimer(name);
            throw error;
        }
    }

    /**
     * Get performance metrics
     */
    getMetrics(): PerformanceMetric[] {
        return [...this.metrics];
    }

    /**
     * Get average duration for a specific operation
     */
    getAverageDuration(name: string): number {
        const relevantMetrics = this.metrics.filter(m => m.name === name);

        if (relevantMetrics.length === 0) return 0;

        const total = relevantMetrics.reduce((sum, m) => sum + m.duration, 0);
        return total / relevantMetrics.length;
    }

    /**
     * Clear old metrics (keep only last 100)
     */
    cleanup(): void {
        if (this.metrics.length > 100) {
            this.metrics = this.metrics.slice(-100);
        }
    }

    /**
     * Get performance summary
     */
    getSummary(): Record<string, { count: number; avgDuration: number; maxDuration: number }> {
        const summary: Record<string, { count: number; avgDuration: number; maxDuration: number }> = {};

        this.metrics.forEach(metric => {
            if (!summary[metric.name]) {
                summary[metric.name] = {
                    count: 0,
                    avgDuration: 0,
                    maxDuration: 0
                };
            }

            const s = summary[metric.name];
            s.count++;
            s.maxDuration = Math.max(s.maxDuration, metric.duration);
        });

        // Calculate averages
        Object.keys(summary).forEach(name => {
            summary[name].avgDuration = this.getAverageDuration(name);
        });

        return summary;
    }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Cleanup old metrics every 5 minutes
if (typeof window !== 'undefined') {
    setInterval(() => {
        performanceMonitor.cleanup();
    }, 5 * 60 * 1000);
}

// Global performance monitoring
if (typeof window !== 'undefined') {
    // Monitor page load time
    window.addEventListener('load', () => {
        const timing = performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log(`📊 Page load time: ${loadTime}ms`);
    });

    // Monitor largest contentful paint
    if ('PerformanceObserver' in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log(`🎨 Largest Contentful Paint: ${lastEntry.startTime.toFixed(2)}ms`);
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            // Silently fail if not supported
        }
    }
}
