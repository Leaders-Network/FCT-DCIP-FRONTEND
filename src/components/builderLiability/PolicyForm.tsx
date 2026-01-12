"use client";

import React, { useState } from 'react';
import { useCreateBuilderLiabilityPolicy } from '@/hooks/useBuilderLiabilityPolicy';
import {
    BuilderLiabilityPolicyFormData,
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
import { AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FCT_LOCATIONS, getDistrictsByLGA } from '@/constants/fctLocations';

interface PolicyFormProps {
    onSuccess?: (policyId: string) => void;
    onCancel?: () => void;
}

export const BuilderLiabilityPolicyForm: React.FC<PolicyFormProps> = ({
    onSuccess,
    onCancel
}) => {
    const { createPolicy, loading, error, validationErrors } = useCreateBuilderLiabilityPolicy();

    const [formData, setFormData] = useState<BuilderLiabilityPolicyFormData>({
        // Builder Identity
        builderEmail: '',
        builderName: '',
        rcNumber: '',
        identificationType: 1,
        identificationNumber: '',
        builderAddress: '',
        builderPhone: '',

        // Organization Info
        niobRegNumber: '',
        yearOfIncorporation: '',
        areaOfSpecialization: '',
        permanentStaffCount: 0,
        numberOfFloors: 0,

        // Membership Info
        membershipStatusId: 1,
        membershipName: '',
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
        coverTypeDetails: 'Statutory',
        contractorCategoryId: 1,
        extraHazardous: false,
        totalEstimateSum: 0,
        workDetails: '',

        // Meta Info
        productId: 1,
        salesOutlet: '',
        brokerAgentName: '',

        // Optional fields
        priority: 'medium'
    });

    const [activeTab, setActiveTab] = useState<string>('builder');

    // Builder location fields
    const [builderLga, setBuilderLga] = useState<string>('');
    const [builderDistrict, setBuilderDistrict] = useState<string>('');

    // Project location fields (kept separate to avoid Type issues if types were reverted)
    const [projectAddress, setProjectAddress] = useState<string>('');
    const [projectLga, setProjectLga] = useState<string>('');
    const [projectDistrict, setProjectDistrict] = useState<string>('');

    const handleInputChange = (field: keyof BuilderLiabilityPolicyFormData, value: string | number | boolean | CategoryOfWorkmen[] | Professional[]) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Client-side validation: if insurance is checked, ensure details provided
        if (formData.hasInsurance && !formData.insuranceDetails) {
            // Show a client-side validation message (could be improved to use UI alert)
            alert('Insurance details are required when insurance is available');
            return;
        }

        // Convert form data to API format
        const policyData = {
            builder: {
                customerEmail: formData.builderEmail,
                nameOfBuilder: formData.builderName,
                rcNumber: formData.rcNumber,
                lga: builderLga,
                district: builderDistrict,
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
                noOfFloors: formData.numberOfFloors
            },
            membership: {
                MembershipStatusId: formData.membershipStatusId,
                MembershipName: formData.membershipName,
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
                coverTypeIdxDetails: formData.coverTypeDetails,
                categoryOfContractorId: formData.contractorCategoryId,
                extraHazardous: formData.extraHazardous,
                totalEstimateSum: formData.totalEstimateSum,
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
        <div className="max-w-4xl mx-auto p-6">
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

                    <form onSubmit={handleSubmit}>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-6">
                                <TabsTrigger value="builder">Builder</TabsTrigger>
                                <TabsTrigger value="organization">Organization</TabsTrigger>
                                <TabsTrigger value="membership">Membership</TabsTrigger>
                                <TabsTrigger value="workforce">Workforce</TabsTrigger>
                                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                                <TabsTrigger value="project">Project</TabsTrigger>
                            </TabsList>

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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="builderLga">Builder LGA *</Label>
                                        <Select value={builderLga} onValueChange={setBuilderLga}>
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
                                        <Label htmlFor="builderDistrict">Builder District *</Label>
                                        <Select value={builderDistrict} onValueChange={setBuilderDistrict} disabled={!builderLga}>
                                            <SelectTrigger disabled={!builderLga}>
                                                <SelectValue placeholder={builderLga ? "Select District" : "Select LGA first"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {builderLga && getDistrictsByLGA(builderLga).map((district) => (
                                                    <SelectItem key={district.value} value={district.value}>
                                                        {district.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
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
                                            onChange={(e) => handleInputChange('permanentStaffCount', parseInt(e.target.value) || 0)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="numberOfFloors">Number of Floors *</Label>
                                        <Input
                                            id="numberOfFloors"
                                            type="number"
                                            min="0"
                                            value={formData.numberOfFloors}
                                            onChange={(e) => handleInputChange('numberOfFloors', parseInt(e.target.value) || 0)}
                                            required
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="membership" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="membershipStatusId">Membership Status *</Label>
                                        <Select
                                            value={formData.membershipStatusId.toString()}
                                            onValueChange={(value) => handleInputChange('membershipStatusId', parseInt(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Active Member</SelectItem>
                                                <SelectItem value="2">Inactive Member</SelectItem>
                                                <SelectItem value="3">Suspended Member</SelectItem>
                                                <SelectItem value="4">Non-Member</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="workforce" className="space-y-6">
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
                                            <Label htmlFor="hasInsurance">Do you currently have insurance coverage?</Label>
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
                            </TabsContent>

                            <TabsContent value="project" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="coverTypeDetails">Coverage Type *</Label>
                                        <Select
                                            value={formData.coverTypeDetails}
                                            onValueChange={(value) => handleInputChange('coverTypeDetails', value as 'Statutory' | 'All-Project')}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Statutory">Statutory</SelectItem>
                                                <SelectItem value="All-Project">All-Project</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="totalEstimateSum">Total Estimate Sum (₦) *</Label>
                                        <Input
                                            id="totalEstimateSum"
                                            type="number"
                                            min="0"
                                            value={formData.totalEstimateSum}
                                            onChange={(e) => handleInputChange('totalEstimateSum', parseFloat(e.target.value) || 0)}
                                            required
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

                        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700"
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
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default BuilderLiabilityPolicyForm;