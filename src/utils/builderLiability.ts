import { getDistrictLabel, getLGALabel } from '@/constants/fctLocations';
import {
    TOTAL_ESTIMATE_SUM_BANDS,
    type BuilderIdentity,
    type ClientInfo,
    type OrganizationInfo,
    type ProjectInfo,
    type TotalEstimateSumBand
} from '@/types/builderLiabilityPolicy.types';

const NIOB_PROFESSIONAL_BODY = 'Nigerian Institute of Building (NIOB)';
const TOTAL_ESTIMATE_SUM_BAND_AMOUNTS: Record<TotalEstimateSumBand, number> = {
    '0 - 50 million': 50_000_000,
    '50 - 100 million': 100_000_000,
    '100 - 150 million': 150_000_000,
    '150 - 250 million': 250_000_000,
    '250 - 500 million': 500_000_000,
    '500 million and above': 500_000_001
};

const TOTAL_ESTIMATE_SUM_BAND_ALIASES: Record<string, TotalEstimateSumBand> = {
    '0 - 50 million': '0 - 50 million',
    '0-50 million': '0 - 50 million',
    '0 to 50 million': '0 - 50 million',
    '50 - 100 million': '50 - 100 million',
    '50-100 million': '50 - 100 million',
    '50 to 100 million': '50 - 100 million',
    '100 - 150 million': '100 - 150 million',
    '100-150 million': '100 - 150 million',
    '100 to 150 million': '100 - 150 million',
    '150 - 250 million': '150 - 250 million',
    '150-250 million': '150 - 250 million',
    '150 to 250 million': '150 - 250 million',
    '250 - 500 million': '250 - 500 million',
    '250-500 million': '250 - 500 million',
    '250 to 500 million': '250 - 500 million',
    '500 million and above': '500 million and above',
    '500 million above': '500 million and above',
    'above 500 million': '500 million and above'
};

const hasText = (value: unknown): value is string =>
    typeof value === 'string' && value.trim().length > 0;

export const getDisplayValue = (value: unknown, fallback = 'Not provided') => {
    if (value === null || value === undefined) {
        return fallback;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : fallback;
    }

    return String(value);
};

export const getProfessionalBody = (organization?: OrganizationInfo | null) => {
    if (!organization) {
        return null;
    }

    return organization.professionalBody || (hasText(organization.niobRegNo) ? NIOB_PROFESSIONAL_BODY : null);
};

export const getProfessionalRegistrationNumber = (organization?: OrganizationInfo | null) => {
    if (!organization) {
        return null;
    }

    return organization.professionalRegistrationNumber || organization.niobRegNo || null;
};

export const normalizeEstimateBand = (value: unknown): TotalEstimateSumBand | null => {
    if (!hasText(value)) {
        return null;
    }

    const normalizedValue = value.trim().toLowerCase().replace(/\s+/g, ' ');
    return TOTAL_ESTIMATE_SUM_BAND_ALIASES[normalizedValue] || null;
};

export const getEstimateAmountFromBand = (band?: string | null) => {
    const normalizedBand = normalizeEstimateBand(band);
    return normalizedBand ? TOTAL_ESTIMATE_SUM_BAND_AMOUNTS[normalizedBand] : null;
};

export const getEstimateBandFromAmount = (value?: number | string | null) => {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const amount = typeof value === 'string' ? Number(value.replace(/,/g, '').trim()) : Number(value);
    if (!Number.isFinite(amount) || amount < 0) {
        return null;
    }

    if (amount <= 50_000_000) {
        return '0 - 50 million';
    }

    if (amount <= 100_000_000) {
        return '50 - 100 million';
    }

    if (amount <= 150_000_000) {
        return '100 - 150 million';
    }

    if (amount <= 250_000_000) {
        return '150 - 250 million';
    }

    if (amount <= 500_000_000) {
        return '250 - 500 million';
    }

    return '500 million and above';
};

export const getProjectTitle = (project?: ProjectInfo | null) =>
    project?.projectTitle || project?.projectName || null;

export const getProjectAddress = (project?: ProjectInfo | null, builder?: BuilderIdentity | null) =>
    project?.address || project?.projectAddress || builder?.address || null;

export const getProjectLga = (project?: ProjectInfo | null) => {
    const rawLga = project?.lga || project?.projectLga || '';
    if (!rawLga) {
        return null;
    }

    return getLGALabel(rawLga) || rawLga;
};

export const getProjectDistrict = (project?: ProjectInfo | null) => {
    const lga = project?.lga || project?.projectLga || '';
    const district = project?.district || project?.projectDistrict || '';

    if (!district) {
        return null;
    }

    return getDistrictLabel(lga, district) || district;
};

export const getProjectEstimateBand = (project?: ProjectInfo | null) =>
    normalizeEstimateBand(project?.totalEstimateSumBand) ||
    getEstimateBandFromAmount(project?.totalEstimateSum ?? project?.totalEstimatedSum);

export const getClientName = (client?: ClientInfo | null) => client?.name || null;
export const getClientEmail = (client?: ClientInfo | null) => client?.email || null;
export const getClientPhone = (client?: ClientInfo | null) => client?.phoneNumber || null;

export const getPolicyDisplayTitle = (policy: any) => {
    if (!policy) return 'Unknown Policy';
    return getClientName(policy.client) || 'Builder Liability';
};
