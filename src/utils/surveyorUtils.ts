/**
 * Shared utility functions for surveyor management
 * Eliminates code duplication across AMMC and NIA assignment components
 */

export interface Surveyor {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber: string;
    specialization: string[];
    experience: number;
    availability: 'available' | 'busy' | 'unavailable';
    currentAssignments: number;
    maxAssignments: number;
    rating: number;
    completedSurveys: number;
}

export interface SurveyorFilters {
    availability: string;
    specialization: string;
    experience: string;
}

/**
 * Generate availability badge component
 */
export const getAvailabilityBadge = (availability: string) => {
    const badgeClasses = {
        available: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800",
        busy: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800",
        unavailable: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800",
        default: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
    };

    const className = badgeClasses[availability as keyof typeof badgeClasses] || badgeClasses.default;
    const displayText = availability.charAt(0).toUpperCase() + availability.slice(1);

    return { className, displayText };
};

/**
 * Calculate workload percentage
 */
export const getWorkloadPercentage = (current: number, max: number): number => {
    return Math.round((current / max) * 100);
};

/**
 * Filter surveyors based on search query and filters
 */
export const filterSurveyors = (
    surveyors: Surveyor[],
    searchQuery: string,
    filters: SurveyorFilters
): Surveyor[] => {
    let filtered = [...surveyors];

    // Search filter
    if (searchQuery) {
        filtered = filtered.filter(surveyor =>
            `${surveyor.firstname} ${surveyor.lastname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            surveyor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            surveyor.specialization.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }

    // Availability filter
    if (filters.availability !== 'all') {
        filtered = filtered.filter(surveyor => surveyor.availability === filters.availability);
    }

    // Specialization filter
    if (filters.specialization !== 'all') {
        filtered = filtered.filter(surveyor =>
            surveyor.specialization.includes(filters.specialization)
        );
    }

    // Experience filter
    if (filters.experience !== 'all') {
        const expLevel = parseInt(filters.experience);
        filtered = filtered.filter(surveyor => surveyor.experience >= expLevel);
    }

    // Sort by availability and rating
    filtered.sort((a, b) => {
        if (a.availability === 'available' && b.availability !== 'available') return -1;
        if (b.availability === 'available' && a.availability !== 'available') return 1;
        return b.rating - a.rating;
    });

    return filtered;
};

/**
 * Get priority badge styling
 */
export const getPriorityBadge = (priority: string) => {
    const priorityClasses = {
        urgent: "bg-red-100 text-red-800",
        high: "bg-orange-100 text-orange-800",
        medium: "bg-yellow-100 text-yellow-800",
        low: "bg-green-100 text-green-800",
        default: "bg-gray-100 text-gray-800"
    };

    return priorityClasses[priority as keyof typeof priorityClasses] || priorityClasses.default;
};

/**
 * Transform API surveyor data to component format
 */
export const transformSurveyorData = (apiSurveyor: any): Surveyor => {
    return {
        _id: apiSurveyor.userId?._id || apiSurveyor._id,
        firstname: apiSurveyor.userId?.firstname || apiSurveyor.firstname,
        lastname: apiSurveyor.userId?.lastname || apiSurveyor.lastname,
        email: apiSurveyor.userId?.email || apiSurveyor.email,
        phoneNumber: apiSurveyor.userId?.phonenumber || apiSurveyor.phoneNumber,
        specialization: apiSurveyor.profile?.specialization || apiSurveyor.specialization || ['residential'],
        experience: apiSurveyor.profile?.experience || apiSurveyor.experience || 0,
        availability: apiSurveyor.profile?.availability || apiSurveyor.availability || 'available',
        currentAssignments: apiSurveyor.currentAssignments || 0,
        maxAssignments: apiSurveyor.maxAssignments || 3,
        rating: apiSurveyor.rating || 4.0,
        completedSurveys: apiSurveyor.statistics?.completedSurveys || apiSurveyor.completedSurveys || 0
    };
};