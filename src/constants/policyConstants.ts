// Policy form constants
export const PROPERTY_TYPES = [
  "Residential House",
  "Apartment/Condo",
  "Commercial Building",
  "Industrial Facility",
  "Mixed Use",
] as const;

export const CONSTRUCTION_MATERIALS = [
  "Concrete Block",
  "Steel Frame",
  "Wood Frame",
  "Brick",
  "Stone",
  "Mixed Materials",
] as const;

export const COVERAGE_TYPES = [
  "Contract Works Coverage",
    "Public Liability Coverage",
    "Employers Liability Coverage",
    "Contractors Plant and Equipment Coverage",
    "Professional Indemnity",
] as const;

export const POLICY_DURATIONS = [
  "3 Months (Short-term Project)",
  "6 Months",
  "1 Year",
  "Project-Based (Until Completion)",
] as const;

export const ADDITIONAL_COVERAGE_OPTIONS = [
  "Flood and Storm Damage",
  "Theft or Vandalism at Site",
  "Collapse or Structural Failure",
  "Third-Party Property Damage",
  "Injury to Non-Employees (Public)",
  "Machinery Breakdown",
  "Temporary Structures (Scaffolding, Site Office)",
  "Fire and Explosion",
  "Debris Removal Costs",
  "Cross Liability (Between Contractors/Subcontractors)",
] as const;

// Policy status constants
export const POLICY_STATUSES = {
  SUBMITTED: 'submitted',
  ASSIGNED: 'assigned',
  SURVEYED: 'surveyed',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REQUIRES_MORE_INFO: 'requires_more_info',
  COMPLETED: 'completed',
  SENT_TO_USER: 'sent_to_user'
} as const;

// Priority levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;