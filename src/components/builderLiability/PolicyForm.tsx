"use client";

import React, { useState } from 'react';
import { useCreateBuilderLiabilityPolicy } from '@/hooks/useBuilderLiabilityPolicy';
import {
    BuilderLiabilityPolicyFormData,
    BuilderLiabilityPolicyData,
    BuilderLiabilityCoverageType,
    BUILDER_LIABILITY_COVERAGE_TYPES,
    CategoryOfWorkmen,
    Professional
} from '@/types/builderLiabilityPolicy.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FCT_LOCATIONS, getDistrictsByLGA } from '@/constants/fctLocations';
import { toast } from "sonner";

interface PolicyFormProps {
    onSuccess?: (policyId: string) => void;
    onCancel?: () => void;
}

const FORM_TABS = ['builder', 'organization', 'membership', 'workforce', 'compliance', 'project'] as const;
type FormTab = (typeof FORM_TABS)[number];

// Display labels use contractor/consultant terminology even when internal names remain backward-compatible.

export const BuilderLiabilityPolicyForm: React.FC<PolicyFormProps> = ({
    onSuccess,
    onCancel
}) => {
    const { createPolicy, loading, error, validationErrors } = useCreateBuilderLiabilityPolicy();
    const allowedProductIds = [537, 556] as const;
    const getRandomAllowedProductId = () => {
        const randomIndex = Math.floor(Math.random() * allowedProductIds.length);
        return allowedProductIds[randomIndex];
    };

    const [formData, setFormData] = useState<BuilderLiabilityPolicyFormData>(() => ({
        // Builder Identity
        builderEmail: '',
        builderName: '',
        rcNumber: '',
        identificationType: 1,
        identificationNumber: '',
        builderAddress: '',
        builderPhone: '',

        // Consultant Info
        niobRegNumber: '',
        yearOfIncorporation: '',
        areaOfSpecialization: '',
        permanentStaffCount: 0,

        // Membership Info
        membershipStatusId: 1,
        membershipName: '',
        memberId: '',
        membershipNumber: '',
        professionalBodyName: '',

        // Workforce Info
        workmenCategories: [],
        professionals: [],
        contractStaffCount: 0,
        bloodRelationsCount: 0,

        // Compliance Info
        hasInsurance: false,
        insuranceDetails: '',
        underInvestigation: false,
        investigationDetails: '',
        disciplinaryAction: false,
        disciplinaryDetails: '',
        legalSuitDetails: '',
        preEmploymentCheck: false,
        preEmploymentDetails: '',
        practiceOutsideNigeria: 'No',

        // Project Info
        coverTypeIndex: false,
        coverTypeDetails: 'Public Liability',
        contractorCategoryId: 1,
        extraHazardous: false,
        totalEstimateSum: 0,
        agisNo: '',
        workDetails: '',

        // Meta Info
        // Randomly select between approved insurer product IDs:
        // 537 -> Consolidated Hallmark Insurance Plc
        // 556 -> NSIA Insurance Company Ltd
        productId: getRandomAllowedProductId(),
        salesOutlet: '',
        brokerAgentName: '',

        // Optional fields
        priority: 'medium'
    }));

    const [activeTab, setActiveTab] = useState<FormTab>('builder');
    const [tabErrors, setTabErrors] = useState<Partial<Record<FormTab, string[]>>>({});

    // Project location fields (kept separate to avoid Type issues if types were reverted)
    const [projectAddress, setProjectAddress] = useState<string>('');
    const [projectLga, setProjectLga] = useState<string>('');
    const [projectDistrict, setProjectDistrict] = useState<string>('');

    const isLastTab = activeTab === FORM_TABS[FORM_TABS.length - 1];

    const isBlank = (value: unknown) => String(value ?? '').trim().length === 0;
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const isValidNumber = (value: unknown) => {
        if (typeof value === 'string' && value.trim() === '') {
            return false;
        }
        return Number.isFinite(Number(value));
    };

    const getTabValidationErrors = (tab: FormTab): string[] => {
        const errors: string[] = [];

        if (tab === 'builder') {
            if (isBlank(formData.builderName)) errors.push('Contractor/Company Name is required.');
            if (isBlank(formData.builderEmail) || !isValidEmail(formData.builderEmail)) {
                errors.push('A valid Email Address is required.');
            }
            if (isBlank(formData.rcNumber)) errors.push('RC Number is required.');
            if (isBlank(formData.builderPhone)) errors.push('Phone Number is required.');
            if (isBlank(formData.identificationNumber)) errors.push('Identification Number is required.');
            if (isBlank(formData.builderAddress) || String(formData.builderAddress).trim().length < 10) {
                errors.push('Address is required and should be at least 10 characters.');
            }
        }

        if (tab === 'organization') {
            if (isBlank(formData.yearOfIncorporation)) errors.push('Year of Incorporation is required.');
            if (!isValidNumber(formData.permanentStaffCount) || Number(formData.permanentStaffCount) < 0) {
                errors.push('Number of Permanent Staff must be 0 or greater.');
            }
        }

        if (tab === 'membership') {
            if (!isValidNumber(formData.membershipStatusId) || Number(formData.membershipStatusId) <= 0) {
                errors.push('Please indicate whether the applicant is a Nigerian Insurers Association (NIA) member.');
            }
        }

        if (tab === 'workforce') {
            if (!isValidNumber(formData.contractStaffCount) || Number(formData.contractStaffCount) < 0) {
                errors.push('Contract Staff Count must be 0 or greater.');
            }
            if (!isValidNumber(formData.bloodRelationsCount) || Number(formData.bloodRelationsCount) < 0) {
                errors.push('Blood Relations Count must be 0 or greater.');
            }

            if (!Array.isArray(formData.workmenCategories) || formData.workmenCategories.length === 0) {
                errors.push('Add at least one Category of Workmen.');
            } else {
                formData.workmenCategories.forEach((category, index) => {
                    if (isBlank(category.categoryOfWorkmen)) {
                        errors.push(`Category of Workmen is required for item ${index + 1}.`);
                    }
                    if (isBlank(category.numberOfEmployment)) {
                        errors.push(`Number of Employment is required for workmen item ${index + 1}.`);
                    }
                    if (isBlank(category.yearsOfEmployment)) {
                        errors.push(`Years of Employment is required for workmen item ${index + 1}.`);
                    }
                });
            }

            if (!Array.isArray(formData.professionals) || formData.professionals.length === 0) {
                errors.push('Add at least one Professional.');
            } else {
                formData.professionals.forEach((professional, index) => {
                    if (isBlank(professional.surname)) errors.push(`Professional ${index + 1} Surname is required.`);
                    if (isBlank(professional.otherName)) errors.push(`Professional ${index + 1} Other Names is required.`);
                    if (!isValidNumber(professional.age) || professional.age < 18 || professional.age > 100) {
                        errors.push(`Professional ${index + 1} Age must be between 18 and 100.`);
                    }
                    if (isBlank(professional.nationality)) errors.push(`Professional ${index + 1} Nationality is required.`);
                    if (isBlank(professional.profession)) errors.push(`Professional ${index + 1} Profession is required.`);
                    if (isBlank(professional.qualification)) errors.push(`Professional ${index + 1} Qualification is required.`);
                    if (!isValidNumber(professional.yearsInEmployment) || professional.yearsInEmployment < 0) {
                        errors.push(`Professional ${index + 1} Years in Employment must be 0 or greater.`);
                    }
                });
            }
        }

        if (tab === 'compliance') {
            if (formData.hasInsurance && String(formData.insuranceDetails || '').trim().length < 5) {
                errors.push('Insurance Details are required when insurance coverage is selected.');
            }
            if (formData.underInvestigation && String(formData.investigationDetails || '').trim().length < 5) {
                errors.push('Investigation Details are required when under investigation is selected.');
            }
            if (formData.disciplinaryAction && String(formData.disciplinaryDetails || '').trim().length < 5) {
                errors.push('Disciplinary Action Details are required when disciplinary action is selected.');
            }
            if (formData.preEmploymentCheck && String(formData.preEmploymentDetails || '').trim().length < 5) {
                errors.push('Pre-Employment Check Details are required when pre-employment check is selected.');
            }
            if (!['Yes', 'No'].includes(formData.practiceOutsideNigeria)) {
                errors.push('Practice Outside Nigeria must be Yes or No.');
            }
        }

        if (tab === 'project') {
            if (typeof formData.coverTypeIndex !== 'boolean') {
                errors.push('Please indicate whether this project is applying for statutory cover.');
            }
            if (isBlank(formData.coverTypeDetails)) errors.push('Coverage Type is required.');
            if (!isValidNumber(formData.contractorCategoryId) || Number(formData.contractorCategoryId) <= 0) {
                errors.push('Contractor Category is required.');
            }
            if (!isValidNumber(formData.totalEstimateSum) || Number(formData.totalEstimateSum) < 0) {
                errors.push('Total Estimate Sum must be 0 or greater.');
            }
            if (isBlank(formData.workDetails)) errors.push('Work Details are required.');
            if (isBlank(projectAddress)) errors.push('Project Address is required.');
            if (isBlank(projectLga)) errors.push('Project LGA is required.');
            if (isBlank(projectDistrict)) errors.push('Project District is required.');
        }

        return errors;
    };

    const validateSingleTab = (tab: FormTab, showToast = true) => {
        const errors = getTabValidationErrors(tab);
        setTabErrors((prev) => ({
            ...prev,
            [tab]: errors
        }));

        if (showToast && errors.length > 0) {
            toast.error(errors[0]);
        }

        return errors.length === 0;
    };

    const validateAllTabs = () => {
        const nextErrors: Partial<Record<FormTab, string[]>> = {};
        let firstInvalidTab: FormTab | null = null;

        for (const tab of FORM_TABS) {
            const errors = getTabValidationErrors(tab);
            nextErrors[tab] = errors;
            if (!firstInvalidTab && errors.length > 0) {
                firstInvalidTab = tab;
            }
        }

        setTabErrors(nextErrors);

        return {
            isValid: firstInvalidTab === null,
            firstInvalidTab
        };
    };

    const formIsComplete = React.useMemo(
        () => FORM_TABS.every((tab) => getTabValidationErrors(tab).length === 0),
        [formData, projectAddress, projectLga, projectDistrict]
    );
    const isNiaMember = Number(formData.membershipStatusId) === 1;

    const handleInputChange = (field: keyof BuilderLiabilityPolicyFormData, value: string | number | boolean | CategoryOfWorkmen[] | Professional[]) => {
        setFormData(prev => {
            // When applicant is not an NIA member, clear all membership-only fields.
            if (field === 'membershipStatusId' && Number(value) === 2) {
                return {
                    ...prev,
                    membershipStatusId: Number(value),
                    membershipName: '',
                    memberId: '',
                    membershipNumber: '',
                    professionalBodyName: ''
                };
            }

            return {
                ...prev,
                [field]: value
            };
        });
    };

    const addWorkmenCategory = () => {
        setFormData(prev => ({
            ...prev,
            workmenCategories: [
                ...prev.workmenCategories,
                {
                    categoryOfWorkmen: '',
                    numberOfEmployment: '',
                    yearsOfEmployment: ''
                }
            ]
        }));
    };

    const removeWorkmenCategory = (index: number) => {
        setFormData(prev => ({
            ...prev,
            workmenCategories: prev.workmenCategories.filter((_, i) => i !== index)
        }));
    };

    const addProfessional = () => {
        setFormData(prev => ({
            ...prev,
            professionals: [
                ...prev.professionals,
                {
                    surname: '',
                    otherName: '',
                    age: 0,
                    gender: 'Male',
                    nationality: 'Nigerian',
                    profession: '',
                    qualification: '',
                    yearsInEmployment: 0
                }
            ]
        }));
    };

    const removeProfessional = (index: number) => {
        setFormData(prev => ({
            ...prev,
            professionals: prev.professionals.filter((_, i) => i !== index)
        }));
    };

    const handleNext = () => {
        if (!validateSingleTab(activeTab)) return;

        const currentIndex = FORM_TABS.indexOf(activeTab);
        const nextTab = FORM_TABS[currentIndex + 1];
        if (nextTab) {
            setActiveTab(nextTab);
        }
    };

    const handleBack = () => {
        const currentIndex = FORM_TABS.indexOf(activeTab);
        const previousTab = FORM_TABS[currentIndex - 1];
        if (previousTab) {
            setActiveTab(previousTab);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validation = validateAllTabs();
        if (!validation.isValid && validation.firstInvalidTab) {
            setActiveTab(validation.firstInvalidTab);
            toast.error(`Please complete the required fields in the ${validation.firstInvalidTab} section.`);
            return;
        }

        // Convert form data to API format
        const policyData: BuilderLiabilityPolicyData = {
            status: 'submitted',
            builder: {
                customerEmail: formData.builderEmail,
                nameOfBuilder: formData.builderName,
                rcNumber: formData.rcNumber,
                identification: {
                    identificationTypeId: formData.identificationType,
                    identityNo: formData.identificationNumber
                },
                address: formData.builderAddress,
                telNo: formData.builderPhone
            },
            organization: {
                niobRegNo: formData.niobRegNumber,
                yearOfIncorporation: new Date(formData.yearOfIncorporation),
                areaOfSpecialization: formData.areaOfSpecialization,
                noOfPermanentStaff: formData.permanentStaffCount,
            },
            membership: {
                MembershipStatusId: formData.membershipStatusId,
                MembershipName: formData.membershipName,
                MemberId: formData.memberId,
                MembershipNo: formData.membershipNumber,
                ProfessionalBodyName: formData.professionalBodyName
            },
            workforce: {
                categoryOfWorkmen: formData.workmenCategories,
                professionals: formData.professionals,
                contractStaffCount: formData.contractStaffCount,
                bloodRelationsCount: formData.bloodRelationsCount
            },
            compliance: {
                HasInsurance: formData.hasInsurance,
                HasInsuranceDetails: formData.insuranceDetails,
                investigation: formData.underInvestigation,
                investigationDetails: formData.investigationDetails,
                disciplinaryCommittee: formData.disciplinaryAction,
                disciplinaryCommitteeDetails: formData.disciplinaryDetails,
                legalSuitDetails: formData.legalSuitDetails,
                preEmploymentCheck: formData.preEmploymentCheck,
                preEmploymentCheckDetails: formData.preEmploymentDetails,
                PracticeOutsideNigeria: formData.practiceOutsideNigeria
            },
            project: {
                coverTypeIdx: formData.coverTypeIndex,
                isStatutory: formData.coverTypeIndex,
                coverTypeIdxDetails: formData.coverTypeDetails,
                categoryOfContractorId: formData.contractorCategoryId,
                extraHazardous: formData.extraHazardous,
                totalEstimateSum: formData.totalEstimateSum,
                agisNo: formData.agisNo,
                workDetails: formData.workDetails,
                address: projectAddress,
                lga: projectLga,
                district: projectDistrict
            },
            meta: {
                ProductId: formData.productId,
                date: new Date(),
                salesOutlet: formData.salesOutlet,
                brokerOrAgentName: formData.brokerAgentName
            },
            priority: formData.priority
        };

        const result = await createPolicy(policyData);
        if (result && onSuccess) {
            onSuccess(result.data.policyId);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Builder Liability Policy Application</CardTitle>
                    <CardDescription>
                        Complete all sections to submit your Builder Liability Policy application
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert className="mb-6" variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {validationErrors && !validationErrors.isValid && (
                        <Alert className="mb-6" variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Please fix the following errors:
                                <ul className="mt-2 list-disc list-inside">
                                    {validationErrors.errors.map((err, index) => (
                                        <li key={index}>{err.message}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    <p className="mb-4 text-sm text-gray-600">
                        Fields marked with <span className="font-semibold text-red-600">*</span> are required.
                    </p>

                    {tabErrors[activeTab]?.length ? (
                        <Alert className="mb-6" variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <p className="font-medium mb-1">Please resolve the following in this section:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    {tabErrors[activeTab]?.map((err, index) => (
                                        <li key={`${activeTab}-err-${index}`}>{err}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    ) : null}

                    <form onSubmit={handleSubmit}>
                        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FormTab)}>
                            <div className="w-full overflow-x-auto">
                                <TabsList className="flex md:grid md:grid-cols-6 w-max md:w-full min-w-max md:min-w-0">
                                    <TabsTrigger value="builder" className="whitespace-nowrap text-xs sm:text-sm">
                                        Contractor
                                    </TabsTrigger>
                                    <TabsTrigger value="organization" className="whitespace-nowrap text-xs sm:text-sm">
                                        Consultant
                                    </TabsTrigger>
                                    <TabsTrigger value="membership" className="whitespace-nowrap text-xs sm:text-sm">
                                        Membership
                                    </TabsTrigger>
                                    <TabsTrigger value="workforce" className="whitespace-nowrap text-xs sm:text-sm">
                                        Workforce
                                    </TabsTrigger>
                                    <TabsTrigger value="compliance" className="whitespace-nowrap text-xs sm:text-sm">
                                        Compliance
                                    </TabsTrigger>
                                    <TabsTrigger value="project" className="whitespace-nowrap text-xs sm:text-sm">
                                        Project
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="builder" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="builderName">Builder/Company Name *</Label>
                                        <Input
                                            id="builderName"
                                            value={formData.builderName}
                                            onChange={(e) => handleInputChange('builderName', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="builderEmail">Email Address *</Label>
                                        <Input
                                            id="builderEmail"
                                            type="email"
                                            value={formData.builderEmail}
                                            onChange={(e) => handleInputChange('builderEmail', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="rcNumber">RC Number *</Label>
                                        <Input
                                            id="rcNumber"
                                            value={formData.rcNumber}
                                            onChange={(e) => handleInputChange('rcNumber', e.target.value)}
                                            required
                                        />
                                                                                   <p className="mt-1 text-sm text-gray-500">
                                            Input the Organizations RC number (Registered Company Number)                                        
                                            </p>
                                    </div>
                                    <div>
                                        <Label htmlFor="builderPhone">Phone Number *</Label>
                                        <Input
                                            id="builderPhone"
                                            value={formData.builderPhone}
                                            onChange={(e) => handleInputChange('builderPhone', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="identificationType">Identification Type *</Label>
                                        <Select
                                            value={formData.identificationType.toString()}
                                            onValueChange={(value) => handleInputChange('identificationType', parseInt(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">National ID</SelectItem>
                                                <SelectItem value="2">Driver's License</SelectItem>
                                                <SelectItem value="3">Passport</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="identificationNumber">Identification Number *</Label>
                                        <Input
                                            id="identificationNumber"
                                            value={formData.identificationNumber}
                                            onChange={(e) => handleInputChange('identificationNumber', e.target.value)}
                                            required
                                            placeholder="Enter identification number"
                                        />
                                        {!formData.identificationNumber && (
                                            <p className="text-sm text-red-600 mt-1">Identity number is required</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="builderAddress">Address *</Label>
                                    <Textarea
                                        id="builderAddress"
                                        value={formData.builderAddress}
                                        onChange={(e) => handleInputChange('builderAddress', e.target.value)}
                                        required
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="organization" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="niobRegNumber">NIOB Registration Number</Label>
                                        <Input
                                            id="niobRegNumber"
                                            value={formData.niobRegNumber}
                                            onChange={(e) => handleInputChange('niobRegNumber', e.target.value)}
                                        />
                                                                                <p className="mt-1 text-sm text-gray-500">
                                            Input the Consultant's Nigerian Institute of Building (NIOB) registration number.
                                        </p>
                                    </div>
                                    <div>
                                        <Label htmlFor="yearOfIncorporation">Year of Incorporation *</Label>
                                        <Input
                                            id="yearOfIncorporation"
                                            type="date"
                                            value={formData.yearOfIncorporation}
                                            onChange={(e) => handleInputChange('yearOfIncorporation', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="areaOfSpecialization">Area of Specialization</Label>
                                        <Input
                                            id="areaOfSpecialization"
                                            value={formData.areaOfSpecialization}
                                            onChange={(e) => handleInputChange('areaOfSpecialization', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="permanentStaffCount">Number of Permanent Staff *</Label>
                                        <Input
                                            id="permanentStaffCount"
                                            type="number"
                                            min="0"
                                            value={formData.permanentStaffCount}
                                            onChange={(e) => handleInputChange('permanentStaffCount', parseInt(e.target.value) || "")}
                                            required
                                        />
                                    </div>

                                </div>
                            </TabsContent>

                            <TabsContent value="membership" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="membershipStatusId">Is the Applicant a Nigerian Insurers Association (NIA) Member? *</Label>
                                        <Select
                                            value={formData.membershipStatusId.toString()}
                                            onValueChange={(value) => handleInputChange('membershipStatusId', parseInt(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Yes, applicant is a Nigerian Insurers Association member</SelectItem>
                                                <SelectItem value="2">No, applicant is not a Nigerian Insurers Association member</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Select whether the contractor or firm currently holds active membership with the Nigerian Insurers Association (NIA).
                                        </p>
                                    </div>
                                    <div>
                                        <Label htmlFor="memberId">Nigerian Insurers Association (NIA) Member ID</Label>
                                        <Input
                                            id="memberId"
                                            value={formData.memberId}
                                            onChange={(e) => {
                                                handleInputChange('memberId', e.target.value);
                                                handleInputChange('membershipNumber', e.target.value);
                                            }}
                                            placeholder="Enter the applicant's NIA member ID"
                                            required={isNiaMember}
                                            disabled={!isNiaMember}
                                        />
                                        <p className="mt-1 text-sm text-gray-500">
                                            Provide the member ID issued by the Nigerian Insurers Association (NIA). Leave blank if the applicant is not a Nigerian Insurers Association (NIA) member.
                                        </p>
                                    </div>
                                    <div>
                                        <Label htmlFor="professionalBodyName">Professional Body Name</Label>
                                        <Input
                                            id="professionalBodyName"
                                            value={formData.professionalBodyName}
                                            onChange={(e) => handleInputChange('professionalBodyName', e.target.value)}
                                            placeholder="e.g. NIA"
                                            disabled={!isNiaMember}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="membershipName">Membership Description</Label>
                                        <Input
                                            id="membershipName"
                                            value={formData.membershipName}
                                            onChange={(e) => handleInputChange('membershipName', e.target.value)}
                                            placeholder="e.g. Corporate Member"
                                            disabled={!isNiaMember}
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="workforce" className="space-y-6">
                                <Card className="p-4">
                                    <h3 className="text-lg font-semibold mb-4">Workforce Summary</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="contractStaffCount">Contract Staff Count *</Label>
                                            <Input
                                                id="contractStaffCount"
                                                type="number"
                                                min="0"
                                                value={formData.contractStaffCount}
                                                onChange={(e) => handleInputChange('contractStaffCount', parseInt(e.target.value, 10) || 0)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="bloodRelationsCount">Blood Relations Count *</Label>
                                            <Input
                                                id="bloodRelationsCount"
                                                type="number"
                                                min="0"
                                                value={formData.bloodRelationsCount}
                                                onChange={(e) => handleInputChange('bloodRelationsCount', parseInt(e.target.value, 10) || 0)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </Card>

                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold">Categories of Workmen</h3>
                                        <Button type="button" onClick={addWorkmenCategory} size="sm">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Category
                                        </Button>
                                    </div>
                                    {formData.workmenCategories.map((category, index) => (
                                        <Card key={index} className="p-4">
                                            <div className="flex items-start justify-between mb-4">
                                                <h4 className="font-medium">Category {index + 1}</h4>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeWorkmenCategory(index)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <Label>Category of Workmen *</Label>
                                                    <Input
                                                        value={category.categoryOfWorkmen}
                                                        onChange={(e) => {
                                                            const updated = [...formData.workmenCategories];
                                                            updated[index].categoryOfWorkmen = e.target.value;
                                                            handleInputChange('workmenCategories', updated);
                                                        }}
                                                        placeholder="e.g., Skilled Labor, Unskilled Labor"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Number of Employment *</Label>
                                                    <Input
                                                        value={category.numberOfEmployment}
                                                        onChange={(e) => {
                                                            const updated = [...formData.workmenCategories];
                                                            updated[index].numberOfEmployment = e.target.value;
                                                            handleInputChange('workmenCategories', updated);
                                                        }}
                                                        placeholder="e.g., 10-20"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Years of Employment *</Label>
                                                    <Input
                                                        value={category.yearsOfEmployment}
                                                        onChange={(e) => {
                                                            const updated = [...formData.workmenCategories];
                                                            updated[index].yearsOfEmployment = e.target.value;
                                                            handleInputChange('workmenCategories', updated);
                                                        }}
                                                        placeholder="e.g., 2-5 years"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold">Professional Staff</h3>
                                        <Button type="button" onClick={addProfessional} size="sm">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Professional
                                        </Button>
                                    </div>
                                    {formData.professionals.map((professional, index) => (
                                        <Card key={index} className="p-4">
                                            <div className="flex items-start justify-between mb-4">
                                                <h4 className="font-medium">Professional {index + 1}</h4>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => removeProfessional(index)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div>
                                                    <Label>Surname *</Label>
                                                    <Input
                                                        value={professional.surname}
                                                        onChange={(e) => {
                                                            const updated = [...formData.professionals];
                                                            updated[index].surname = e.target.value;
                                                            handleInputChange('professionals', updated);
                                                        }}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Other Names *</Label>
                                                    <Input
                                                        value={professional.otherName}
                                                        onChange={(e) => {
                                                            const updated = [...formData.professionals];
                                                            updated[index].otherName = e.target.value;
                                                            handleInputChange('professionals', updated);
                                                        }}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Age *</Label>
                                                    <Input
                                                        type="number"
                                                        min="18"
                                                        max="100"
                                                        value={professional.age}
                                                        onChange={(e) => {
                                                            const updated = [...formData.professionals];
                                                            updated[index].age = parseInt(e.target.value) || 0;
                                                            handleInputChange('professionals', updated);
                                                        }}
                                                        required
                                                    />
                                                    {professional.age > 0 && (professional.age < 18 || professional.age > 100) && (
                                                        <p className="text-sm text-red-600 mt-1">Age must be between 18 and 100</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <Label>Gender *</Label>
                                                    <Select
                                                        value={professional.gender}
                                                        onValueChange={(value) => {
                                                            const updated = [...formData.professionals];
                                                            updated[index].gender = value as 'Male' | 'Female' | 'Other';
                                                            handleInputChange('professionals', updated);
                                                        }}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Male">Male</SelectItem>
                                                            <SelectItem value="Female">Female</SelectItem>
                                                            <SelectItem value="Other">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label>Nationality *</Label>
                                                    <Input
                                                        value={professional.nationality}
                                                        onChange={(e) => {
                                                            const updated = [...formData.professionals];
                                                            updated[index].nationality = e.target.value;
                                                            handleInputChange('professionals', updated);
                                                        }}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Profession *</Label>
                                                    <Input
                                                        value={professional.profession}
                                                        onChange={(e) => {
                                                            const updated = [...formData.professionals];
                                                            updated[index].profession = e.target.value;
                                                            handleInputChange('professionals', updated);
                                                        }}
                                                        placeholder="e.g., Architect, Engineer"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Qualification *</Label>
                                                    <Input
                                                        value={professional.qualification}
                                                        onChange={(e) => {
                                                            const updated = [...formData.professionals];
                                                            updated[index].qualification = e.target.value;
                                                            handleInputChange('professionals', updated);
                                                        }}
                                                        placeholder="e.g., B.Sc, M.Sc, PhD"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Years in Employment *</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        value={professional.yearsInEmployment}
                                                        onChange={(e) => {
                                                            const updated = [...formData.professionals];
                                                            updated[index].yearsInEmployment = parseInt(e.target.value) || 0;
                                                            handleInputChange('professionals', updated);
                                                        }}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="compliance" className="space-y-6">
                                <Card className="p-4">
                                    <h3 className="text-lg font-semibold mb-4">Insurance Information</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="hasInsurance"
                                                checked={formData.hasInsurance}
                                                onChange={(e) => handleInputChange('hasInsurance', e.target.checked)}
                                            />
                                            <Label htmlFor="hasInsurance">Do you currently have insurance coverage? *</Label>
                                        </div>
                                        {formData.hasInsurance && (
                                            <div className="mt-4">
                                                <Label htmlFor="insuranceDetails">Insurance Details *</Label>
                                                <Textarea
                                                    id="insuranceDetails"
                                                    value={formData.insuranceDetails}
                                                    onChange={(e) => handleInputChange('insuranceDetails', e.target.value)}
                                                    placeholder="Provide insurer name, policy number and coverage details"
                                                    required={formData.hasInsurance}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                <Card className="p-4">
                                    <h3 className="text-lg font-semibold mb-4">Investigation & Disciplinary Status</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="underInvestigation"
                                                checked={formData.underInvestigation}
                                                onChange={(e) => handleInputChange('underInvestigation', e.target.checked)}
                                            />
                                            <Label htmlFor="underInvestigation">Currently under investigation? *</Label>
                                        </div>
                                        {formData.underInvestigation && (
                                            <div className="mt-4">
                                                <Label htmlFor="investigationDetails">Investigation Details *</Label>
                                                <Textarea
                                                    id="investigationDetails"
                                                    value={formData.investigationDetails}
                                                    onChange={(e) => handleInputChange('investigationDetails', e.target.value)}
                                                    placeholder="Provide details about the investigation"
                                                    required={formData.underInvestigation}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                <Card className="p-4">
                                    <h3 className="text-lg font-semibold mb-4">Disciplinary Action</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="disciplinaryAction"
                                                checked={formData.disciplinaryAction}
                                                onChange={(e) => handleInputChange('disciplinaryAction', e.target.checked)}
                                            />
                                            <Label htmlFor="disciplinaryAction">Subject to disciplinary action? *</Label>
                                        </div>
                                        {formData.disciplinaryAction && (
                                            <div className="mt-4">
                                                <Label htmlFor="disciplinaryDetails">Disciplinary Action Details *</Label>
                                                <Textarea
                                                    id="disciplinaryDetails"
                                                    value={formData.disciplinaryDetails}
                                                    onChange={(e) => handleInputChange('disciplinaryDetails', e.target.value)}
                                                    placeholder="Provide details about the disciplinary action"
                                                    required={formData.disciplinaryAction}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                <Card className="p-4">
                                    <h3 className="text-lg font-semibold mb-4">Pre-Employment Checks</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                id="preEmploymentCheck"
                                                checked={formData.preEmploymentCheck}
                                                onChange={(e) => handleInputChange('preEmploymentCheck', e.target.checked)}
                                            />
                                            <Label htmlFor="preEmploymentCheck">Pre-employment checks conducted? *</Label>
                                        </div>
                                        {formData.preEmploymentCheck && (
                                            <div className="mt-4">
                                                <Label htmlFor="preEmploymentDetails">Pre-Employment Check Details *</Label>
                                                <Textarea
                                                    id="preEmploymentDetails"
                                                    value={formData.preEmploymentDetails}
                                                    onChange={(e) => handleInputChange('preEmploymentDetails', e.target.value)}
                                                    placeholder="Describe the pre-employment checks conducted"
                                                    required={formData.preEmploymentCheck}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                <Card className="p-4">
                                    <h3 className="text-lg font-semibold mb-4">Legal Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="legalSuitDetails">Legal Suit Details (if any)</Label>
                                            <Textarea
                                                id="legalSuitDetails"
                                                value={formData.legalSuitDetails}
                                                onChange={(e) => handleInputChange('legalSuitDetails', e.target.value)}
                                                placeholder="Provide details of any legal suits or claims"
                                            />
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-4">
                                    <h3 className="text-lg font-semibold mb-4">Practice Outside Nigeria</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="practiceOutsideNigeria">Do you practice outside Nigeria? *</Label>
                                            <Select
                                                value={formData.practiceOutsideNigeria}
                                                onValueChange={(value) => handleInputChange('practiceOutsideNigeria', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Yes">Yes</SelectItem>
                                                    <SelectItem value="No">No</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>

                            <TabsContent value="project" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="coverTypeIndex">Is this Project Seeking Statutory Cover? *</Label>
                                        <Select
                                            value={String(formData.coverTypeIndex)}
                                            onValueChange={(value) => handleInputChange('coverTypeIndex', value === 'true')}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">Yes, statutory cover is required</SelectItem>
                                                <SelectItem value="false">No, this is not statutory</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Choose yes when the policy is being obtained to satisfy a statutory or regulatory requirement for the project.
                                        </p>
                                    </div>
                                    <div>
                                        <Label htmlFor="coverTypeDetails">Coverage Type *</Label>
                                        <Select
                                            value={formData.coverTypeDetails}
                                            onValueChange={(value) => handleInputChange('coverTypeDetails', value as BuilderLiabilityCoverageType)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {BUILDER_LIABILITY_COVERAGE_TYPES.map((coverageType) => (
                                                    <SelectItem key={coverageType} value={coverageType}>
                                                        {coverageType}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="contractorCategoryId">Contractor Category *</Label>
                                        <Select
                                            value={formData.contractorCategoryId.toString()}
                                            onValueChange={(value) => handleInputChange('contractorCategoryId', parseInt(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Category 1 - Small Scale</SelectItem>
                                                <SelectItem value="2">Category 2 - Medium Scale</SelectItem>
                                                <SelectItem value="3">Category 3 - Large Scale</SelectItem>
                                                <SelectItem value="4">Category 4 - Specialized</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="totalEstimateSum">Total Estimate Sum (₦) *</Label>
                                        <Input
                                            id="totalEstimateSum"
                                            type="number"
                                            min="0"
                                            value={formData.totalEstimateSum}
                                            onChange={(e) => handleInputChange('totalEstimateSum', parseFloat(e.target.value) || "")}
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="extraHazardous"
                                            checked={formData.extraHazardous}
                                            onChange={(e) => handleInputChange('extraHazardous', e.target.checked)}
                                        />
                                        <Label htmlFor="extraHazardous">Extra Hazardous Work? *</Label>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="agisNo">Plot Number</Label>
                                        <Input
                                            id="agisNo"
                                            value={formData.agisNo}
                                            onChange={(e) => handleInputChange('agisNo', e.target.value)}
                                            placeholder="Enter plot number"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="workDetails">Work Details *</Label>
                                    <Textarea
                                        id="workDetails"
                                        value={formData.workDetails}
                                        onChange={(e) => handleInputChange('workDetails', e.target.value)}
                                        placeholder="Describe the construction work to be covered..."
                                        required
                                    />
                                </div>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="projectAddress">Project Address *</Label>
                                        <Textarea
                                            id="projectAddress"
                                            value={projectAddress}
                                            onChange={(e) => setProjectAddress(e.target.value)}
                                            placeholder="Full project/site address"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="projectLga">Project LGA *</Label>
                                        <Select value={projectLga} onValueChange={setProjectLga}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select LGA" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {FCT_LOCATIONS.map((lga) => (
                                                    <SelectItem key={lga.value} value={lga.value}>
                                                        {lga.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="projectDistrict">Project District *</Label>
                                        <Select value={projectDistrict} onValueChange={setProjectDistrict} disabled={!projectLga}>
                                            <SelectTrigger disabled={!projectLga}>
                                                <SelectValue placeholder={projectLga ? "Select District" : "Select LGA first"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {projectLga && getDistrictsByLGA(projectLga).map((district) => (
                                                    <SelectItem key={district.value} value={district.value}>
                                                        {district.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={loading}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>

                            <div className="flex w-full sm:w-auto gap-2 sm:justify-end">
                                {FORM_TABS.indexOf(activeTab) > 0 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleBack}
                                        disabled={loading}
                                        className="flex-1 sm:flex-none"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                )}

                                {!isLastTab ? (
                                    <Button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={loading || !formIsComplete}
                                        className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Submit Application
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {isLastTab && !formIsComplete && (
                            <p className="mt-3 text-sm text-amber-700">
                                Complete all required fields in each section before submitting.
                            </p>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default BuilderLiabilityPolicyForm;
