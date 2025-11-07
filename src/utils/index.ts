/**
 * Central export point for utility functions
 */

// Re-export all validation utilities
export * from './typeValidation';

// Re-export auth utilities
export * from './auth';

// Commonly used validators for convenience
export {
    // API validators
    isSuccessResponse,
    isErrorResponse,
    extractApiData,
    safeExtractApiData,

    // Type validators
    isNonEmptyString,
    isValidEmail,
    isValidPhone,
    isPositiveNumber,
    isNonNegativeNumber,
    isValidDate,
    isValidISODate,
    isValidUrl,

    // Null/undefined validators
    isNullish,
    isDefined,
    assertDefined,
    getOrDefault,

    // Form validators
    validateRequired,
    validateEmail,
    validatePhone,
    validateMinLength,
    validateMaxLength,
    validateRange,

    // Composite validators
    combineValidators,
    conditionalValidator,

    // Type assertions
    assertType,
    safeCast,
    strictCast,

    // Default export
    validators,
} from './typeValidation';

// Re-export auth utilities
export {
    getAuthToken,
    getUserRole,
    isAuthenticated,
    setAuthToken,
    removeAuthToken,
    clearAuthTokens,
    getApiHeaders,
    getCurrentTokenType,
    hasAccessLevel,
    decodeToken,
} from './auth';
