"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useCreateBuilderLiabilityPolicy } from "@/hooks/useBuilderLiabilityPolicy";
import {
  BuilderLiabilityPolicyFormData,
  BuilderLiabilityPolicyData,
  BuilderLiabilityCoverageType,
  BUILDER_LIABILITY_COVERAGE_TYPES,
  CLIENT_IDENTIFICATION_TYPES,
  CategoryOfWorkmen,
  CONTRACTOR_TYPES,
  PROFESSIONAL_BODY_OPTIONS,
  PROJECT_TYPES,
  Professional,
  STAFF_STRENGTH_OPTIONS,
  TOTAL_ESTIMATE_SUM_BANDS,
} from "@/types/builderLiabilityPolicy.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Save,
  Trash2,
  Shield,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FCT_LOCATIONS, getDistrictsByLGA } from "@/constants/fctLocations";
import { CADASTRAL_ZONES } from "@/constants/policyConstants";
import { toast } from "sonner";
import { getEstimateAmountFromBand } from "@/utils/builderLiability";

interface PolicyFormProps {
  onSuccess?: (policyId: string) => void;
  onCancel?: () => void;
}

type AssessorConsultantFormState = Pick<
  BuilderLiabilityPolicyFormData,
  | "assessorName"
  | "professionalBody"
  | "professionalRegistrationNumber"
  | "otherProfessionalBodyName"
  | "practiceLicenseNumber"
  | "yearOfRegistration"
  | "areaOfSpecialization"
  | "staffStrength"
>;

const DEFAULT_ASSESSOR_CONSULTANT_STATE: AssessorConsultantFormState = {
  assessorName: "",
  professionalBody: "COREN - Council for regulation of engineering in Nigeria",
  professionalRegistrationNumber: "",
  otherProfessionalBodyName: "",
  practiceLicenseNumber: "",
  yearOfRegistration: "",
  areaOfSpecialization: "",
  staffStrength: "Permanent",
};

const FORM_TABS = [
  "client",
  "builder",
  "organization",
  "membership",
  "workforce",
  "compliance",
  "project",
] as const;
type FormTab = (typeof FORM_TABS)[number];

const CONTRACTOR_CATEGORY_OPTIONS = [
  {
    value: 1,
    label: "Large / Class A & B",
    description:
      "Multimillion-naira heavy infrastructure, multi-story structural building, and major road construction.",
  },
  {
    value: 2,
    label: "Medium / Class C & D",
    description:
      "Medium-cost rehabilitation, township roads, and moderate public building construction.",
  },
  {
    value: 3,
    label: "Small / Class E",
    description:
      "Low-cost minor renovations, basic supplies, and localized maintenance tasks.",
  },
] as const;

// Display labels use contractor and assessor/consultant terminology.

export const BuilderLiabilityPolicyForm: React.FC<PolicyFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { createPolicy, loading, error, validationErrors } =
    useCreateBuilderLiabilityPolicy();

  const DRAFT_KEY = "builder_liability_policy_draft";
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [hasAssessorConsultant, setHasAssessorConsultant] = useState(true);
  const assessorConsultantSnapshotRef = useRef<AssessorConsultantFormState>(
    DEFAULT_ASSESSOR_CONSULTANT_STATE,
  );

  const [formData, setFormData] = useState<BuilderLiabilityPolicyFormData>({
    // Builder Identity
    builderEmail: "",
    builderName: "",
    rcNumber: "",
    directorOfCompany: "",
    identificationType: 1,
    identificationNumber: "",
    builderAddress: "",
    builderPhone: "",

    // Direct labor flag
    isDirectLabor: false,

    // Client Info
    clientName: "",
    clientEmail: "",
    clientPhoneNumber: "",
    clientIdentificationType: "National ID",
    clientIdentificationNumber: "",
    clientAddress: "",
    clientRcNumber: "",

    // Assessor / Consultant Info
    ...DEFAULT_ASSESSOR_CONSULTANT_STATE,

    // Membership Info
    membershipStatusId: 1,
    membershipName: "",
    memberId: "",
    membershipNumber: "",
    professionalBodyName: "",

    // Workforce Info
    workmenCategories: [],
    professionals: [],
    contractStaffCount: 0,
    bloodRelationsCount: 0,

    // Compliance Info
    hasInsurance: false,
    insuranceDetails: "",
    underInvestigation: false,
    investigationDetails: "",
    disciplinaryAction: false,
    disciplinaryDetails: "",
    legalSuitDetails: "",
    preEmploymentCheck: false,
    preEmploymentDetails: "",
    practiceOutsideNigeria: "No",

    // Project Info
    coverTypeIndex: false,
    coverTypeDetails: "Public Liability",
    contractorCategoryId: 1,
    contractorType: "Local",
    projectType: "Residential",
    extraHazardous: false,
    totalEstimateSum: 0,
    totalEstimateSumBand: "",
    agisNo: "",
    projectTitle: "",
    workDetails: "",
    projectAddress: "",
    projectLga: "",
    projectDistrict: "",
    cadastralZone: "",

    // Meta Info
    // NIIP Builder's Liability product
    productId: 556,
    salesOutlet: "",
    brokerAgentName: "NSIA - Nigeria Sovereign Investment Authority",

    // Optional fields
    priority: "medium",
  });

  const [activeTab, setActiveTab] = useState<FormTab>("client");
  const [tabErrors, setTabErrors] = useState<
    Partial<Record<FormTab, string[]>>
  >({});
  const [customZoneMode, setCustomZoneMode] = useState(false);

  // ─── Draft persistence ──────────────────────────────────────────────────────
  const saveDraft = useCallback(
    (data?: typeof formData) => {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            ...(data ?? formData),
            hasAssessorConsultant,
          }),
        );
        setLastSaved(new Date());
      } catch {
        /* ignore quota errors */
      }
    },
    [formData, hasAssessorConsultant],
  );

  // Restore draft on first mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const {
          hasAssessorConsultant: savedAssessorConsultantState,
          ...savedFormData
        } = parsed;
        setFormData((prev) => ({ ...prev, ...savedFormData }));
        if (typeof savedAssessorConsultantState === "boolean") {
          setHasAssessorConsultant(savedAssessorConsultantState);
        }
        setDraftRestored(true);
        // Hide banner after 5 s
        setTimeout(() => setDraftRestored(false), 5000);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Auto-save every 30 s
  useEffect(() => {
    autoSaveTimerRef.current = setInterval(() => saveDraft(), 30_000);

    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [saveDraft]);

  const isLastTab = activeTab === FORM_TABS[FORM_TABS.length - 1];
  const selectedContractorCategory =
    CONTRACTOR_CATEGORY_OPTIONS.find(
      (option) => option.value === formData.contractorCategoryId,
    ) ?? CONTRACTOR_CATEGORY_OPTIONS[0];

  const isBlank = (value: unknown) => String(value ?? "").trim().length === 0;
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isValidPhoneNumber = (phone: string) => {
    const normalizedPhone = phone.replace(/[\s()-]/g, "");
    return /^(?:\+?\d{10,15}|0\d{10}|234\d{10})$/.test(normalizedPhone);
  };
  const isValidNumber = (value: unknown) => {
    if (typeof value === "string" && value.trim() === "") {
      return false;
    }
    return Number.isFinite(Number(value));
  };

  const getTabValidationErrors = (tab: FormTab): string[] => {
    const errors: string[] = [];

    if (tab === "builder") {
      // When direct labor, skip all contractor field validations
      if (formData.isDirectLabor) {
        return errors;
      }
      if (isBlank(formData.builderName))
        errors.push("Contractor/Company Name is required.");
      if (
        isBlank(formData.directorOfCompany) ||
        formData.directorOfCompany.trim().length < 2
      ) {
        errors.push(
          "Director of the company must be at least 2 characters long.",
        );
      }
      if (
        isBlank(formData.builderEmail) ||
        !isValidEmail(formData.builderEmail)
      ) {
        errors.push("A valid Email Address is required.");
      }
      if (isBlank(formData.rcNumber)) errors.push("RC Number is required.");
      if (
        isBlank(formData.builderPhone) ||
        !isValidPhoneNumber(formData.builderPhone)
      ) {
        errors.push("A valid phone number is required.");
      }
      if (isBlank(formData.identificationNumber))
        errors.push("Director's Identification Number is required.");
      if (
        isBlank(formData.builderAddress) ||
        String(formData.builderAddress).trim().length < 10
      ) {
        errors.push(
          "Address is required and should be at least 10 characters.",
        );
      }
      if (
        !isValidNumber(formData.contractorCategoryId) ||
        Number(formData.contractorCategoryId) <= 0
      ) {
        errors.push("Contractor Category is required.");
      }
      if (isBlank(formData.contractorType)) {
        errors.push("Contractor Type is required.");
      }
    }

    if (tab === "client") {
      if (isBlank(formData.clientName)) errors.push("Client name is required.");
      if (
        isBlank(formData.clientEmail) ||
        !isValidEmail(formData.clientEmail)
      ) {
        errors.push("A valid client email address is required.");
      }
      if (
        isBlank(formData.clientPhoneNumber) ||
        !isValidPhoneNumber(formData.clientPhoneNumber)
      ) {
        errors.push("A valid client phone number is required.");
      }
      if (isBlank(formData.clientIdentificationType)) {
        errors.push("Client identification type is required.");
      }
      if (isBlank(formData.clientIdentificationNumber)) {
        errors.push("Client identification number is required.");
      }
      if (
        isBlank(formData.clientAddress) ||
        String(formData.clientAddress).trim().length < 10
      ) {
        errors.push(
          "Client address is required and should be at least 10 characters.",
        );
      }
    }

    if (tab === "organization") {
      if (!hasAssessorConsultant) {
        return errors;
      }

      if (isBlank(formData.assessorName))
        errors.push("Assessors / Consultants Name is required.");
      if (isBlank(formData.professionalRegistrationNumber)) {
        errors.push("Professional Registration Number is required.");
      }
      if (
        formData.professionalBody === "Other" &&
        isBlank(formData.otherProfessionalBodyName)
      ) {
        errors.push(
          "Other Regulatory Body Name is required when Regulatory Body is Other.",
        );
      }
      if (isBlank(formData.yearOfRegistration))
        errors.push("Year of Registration is required.");
      if (isBlank(formData.staffStrength)) {
        errors.push("Staff Strength is required.");
      }
    }

    if (tab === "membership") {
      if (
        !isValidNumber(formData.membershipStatusId) ||
        Number(formData.membershipStatusId) <= 0
      ) {
        errors.push(
          "Please indicate whether the applicant is a Nigerian Insurers Association (NIA) member.",
        );
      }
    }

    if (tab === "workforce") {
      if (
        !isValidNumber(formData.contractStaffCount) ||
        Number(formData.contractStaffCount) < 0
      ) {
        errors.push("Contract Staff Count must be 0 or greater.");
      }
      if (
        !isValidNumber(formData.bloodRelationsCount) ||
        Number(formData.bloodRelationsCount) < 0
      ) {
        errors.push("Blood Relations Count must be 0 or greater.");
      }

      if (
        !Array.isArray(formData.workmenCategories) ||
        formData.workmenCategories.length === 0
      ) {
        errors.push("Add at least one Category of Workmen.");
      } else {
        formData.workmenCategories.forEach((category, index) => {
          if (isBlank(category.categoryOfWorkmen)) {
            errors.push(
              `Category of Workmen is required for item ${index + 1}.`,
            );
          }
          if (isBlank(category.numberOfEmployment)) {
            errors.push(
              `Number of Employment is required for workmen item ${index + 1}.`,
            );
          }
          if (isBlank(category.yearsOfEmployment)) {
            errors.push(
              `Years of Employment is required for workmen item ${index + 1}.`,
            );
          }
        });
      }

      if (
        !Array.isArray(formData.professionals) ||
        formData.professionals.length === 0
      ) {
        errors.push("Add at least one Professional.");
      } else {
        formData.professionals.forEach((professional, index) => {
          if (isBlank(professional.surname))
            errors.push(`Professional ${index + 1} Surname is required.`);
          if (isBlank(professional.otherName))
            errors.push(`Professional ${index + 1} Other Names is required.`);
          if (
            !isValidNumber(professional.age) ||
            professional.age < 18 ||
            professional.age > 100
          ) {
            errors.push(
              `Professional ${index + 1} Age must be between 18 and 100.`,
            );
          }
          if (isBlank(professional.nationality))
            errors.push(`Professional ${index + 1} Nationality is required.`);
          if (isBlank(professional.profession))
            errors.push(`Professional ${index + 1} Profession is required.`);
          if (isBlank(professional.qualification))
            errors.push(`Professional ${index + 1} Qualification is required.`);
          if (
            !isValidNumber(professional.yearsInEmployment) ||
            professional.yearsInEmployment < 0
          ) {
            errors.push(
              `Professional ${index + 1} Years in Employment must be 0 or greater.`,
            );
          }
        });
      }
    }

    if (tab === "compliance") {
      if (
        formData.hasInsurance &&
        String(formData.insuranceDetails || "").trim().length < 5
      ) {
        errors.push(
          "Insurance Details are required when insurance coverage is selected.",
        );
      }
      if (
        formData.underInvestigation &&
        String(formData.investigationDetails || "").trim().length < 5
      ) {
        errors.push(
          "Investigation Details are required when under investigation is selected.",
        );
      }
      if (
        formData.disciplinaryAction &&
        String(formData.disciplinaryDetails || "").trim().length < 5
      ) {
        errors.push(
          "Disciplinary Action Details are required when disciplinary action is selected.",
        );
      }
      if (
        formData.preEmploymentCheck &&
        String(formData.preEmploymentDetails || "").trim().length < 5
      ) {
        errors.push(
          "Pre-Employment Check Details are required when pre-employment check is selected.",
        );
      }
      if (!["Yes", "No"].includes(formData.practiceOutsideNigeria)) {
        errors.push("Practice Outside Nigeria must be Yes or No.");
      }
    }

    if (tab === "project") {
      if (typeof formData.coverTypeIndex !== "boolean") {
        errors.push(
          "Please indicate whether this project is applying for statutory cover.",
        );
      }
      if (isBlank(formData.coverTypeDetails))
        errors.push("Coverage Type is required.");
      if (isBlank(formData.projectType)) {
        errors.push("Project Type is required.");
      }
      if (isBlank(formData.totalEstimateSumBand)) {
        errors.push("Estimated Sum Range is required.");
      }
      if (isBlank(formData.projectTitle))
        errors.push("Property Title is required.");
      if (isBlank(formData.workDetails))
        errors.push("Work Details are required.");
      if (isBlank(formData.projectAddress))
        errors.push("Project Address is required.");
      if (isBlank(formData.projectLga)) errors.push("Project LGA is required.");
      if (isBlank(formData.projectDistrict))
        errors.push("Project District is required.");
      if (isBlank(formData.cadastralZone))
        errors.push("Cadastral Zone is required.");
    }

    return errors;
  };

  const validateSingleTab = (tab: FormTab, showToast = true) => {
    const errors = getTabValidationErrors(tab);
    setTabErrors((prev) => ({
      ...prev,
      [tab]: errors,
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
      firstInvalidTab,
    };
  };

  const formIsComplete = React.useMemo(
    () => FORM_TABS.every((tab) => getTabValidationErrors(tab).length === 0),
    [formData, hasAssessorConsultant],
  );

  const handleInputChange = (
    field: keyof BuilderLiabilityPolicyFormData,
    value: string | number | boolean | CategoryOfWorkmen[] | Professional[],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEstimateBandChange = (value: string) => {
    const amount = getEstimateAmountFromBand(value);

    setFormData((prev) => ({
      ...prev,
      totalEstimateSumBand:
        value as BuilderLiabilityPolicyFormData["totalEstimateSumBand"],
      totalEstimateSum: amount ?? prev.totalEstimateSum,
    }));
  };

  // Handler for direct labor toggle
  const handleDirectLaborChange = (value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isDirectLabor: value,
      // When toggling to direct labor, clear all contractor fields
      ...(value
        ? {
            builderName: "",
            builderEmail: "",
            rcNumber: "",
            directorOfCompany: "",
            identificationNumber: "",
            builderPhone: "",
            builderAddress: "",
            contractorCategoryId: 1,
            contractorType: "" as const,
            identificationType: 1,
          }
        : {}),
    }));
    // Clear builder tab errors when toggling
    setTabErrors((prev) => ({ ...prev, builder: [] }));
  };

  const getAssessorConsultantState = (
    data: BuilderLiabilityPolicyFormData,
  ): AssessorConsultantFormState => ({
    assessorName: data.assessorName,
    professionalBody: data.professionalBody,
    professionalRegistrationNumber: data.professionalRegistrationNumber,
    otherProfessionalBodyName: data.otherProfessionalBodyName,
    practiceLicenseNumber: data.practiceLicenseNumber,
    yearOfRegistration: data.yearOfRegistration,
    areaOfSpecialization: data.areaOfSpecialization,
    staffStrength: data.staffStrength,
  });

  const handleAssessorConsultantEngagementChange = (value: boolean) => {
    setHasAssessorConsultant(value);
    setTabErrors((prev) => ({ ...prev, organization: [] }));

    setFormData((prev) => {
      if (value) {
        return {
          ...prev,
          ...assessorConsultantSnapshotRef.current,
        };
      }

      assessorConsultantSnapshotRef.current = getAssessorConsultantState(prev);
      return {
        ...prev,
        ...DEFAULT_ASSESSOR_CONSULTANT_STATE,
        assessorName: "",
        professionalBody: "",
        professionalRegistrationNumber: "",
        otherProfessionalBodyName: "",
        practiceLicenseNumber: "",
        yearOfRegistration: "",
        areaOfSpecialization: "",
        staffStrength: "",
      };
    });
  };

  const addWorkmenCategory = () => {
    setFormData((prev) => ({
      ...prev,
      workmenCategories: [
        ...prev.workmenCategories,
        {
          categoryOfWorkmen: "",
          numberOfEmployment: "",
          yearsOfEmployment: "",
        },
      ],
    }));
  };

  const removeWorkmenCategory = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      workmenCategories: prev.workmenCategories.filter((_, i) => i !== index),
    }));
  };

  const addProfessional = () => {
    setFormData((prev) => ({
      ...prev,
      professionals: [
        ...prev.professionals,
        {
          surname: "",
          otherName: "",
          age: 0,
          gender: "Male",
          nationality: "Nigerian",
          profession: "",
          qualification: "",
          yearsInEmployment: 0,
        },
      ],
    }));
  };

  const removeProfessional = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      professionals: prev.professionals.filter((_, i) => i !== index),
    }));
  };

  const handleNext = () => {
    if (!validateSingleTab(activeTab)) return;
    saveDraft();
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
      toast.error(
        `Please complete the required fields in the ${validation.firstInvalidTab} section.`,
      );
      return;
    }

    // Convert form data to API format
    const policyData = {
      status: "submitted",
      isDirectLabor: formData.isDirectLabor,
      builder: formData.isDirectLabor
        ? {
            customerEmail: "",
            nameOfBuilder: "",
            rcNumber: "",
            directorOfCompany: "",
            identification: {
              identificationTypeId: 0,
              identityNo: "",
            },
            address: "",
            telNo: "",
          }
        : {
            customerEmail: formData.builderEmail,
            nameOfBuilder: formData.builderName,
            rcNumber: formData.rcNumber,
            directorOfCompany: formData.directorOfCompany,
            identification: {
              identificationTypeId: formData.identificationType,
              identityNo: formData.identificationNumber,
            },
            address: formData.builderAddress,
            telNo: formData.builderPhone,
          },
      client: {
        name: formData.clientName,
        email: formData.clientEmail,
        phoneNumber: formData.clientPhoneNumber,
        identificationType: formData.clientIdentificationType,
        identificationNumber: formData.clientIdentificationNumber,
        address: formData.clientAddress,
        rcNumber: formData.clientRcNumber || undefined,
      },
      ...(hasAssessorConsultant
        ? {
            organization: {
              assessorName: formData.assessorName,
              professionalBody: formData.professionalBody || undefined,
              professionalRegistrationNumber:
                formData.professionalRegistrationNumber,
              otherProfessionalBodyName:
                formData.professionalBody === "Other"
                  ? formData.otherProfessionalBodyName || undefined
                  : undefined,
              practiceLicenseNumber:
                formData.practiceLicenseNumber || undefined,
              niobRegNo: undefined,
              yearOfRegistration: new Date(formData.yearOfRegistration),
              areaOfSpecialization: formData.areaOfSpecialization,
              staffStrength: formData.staffStrength || undefined,
              noOfPermanentStaff: undefined,
              permanentStaffCount: undefined,
            },
          }
        : {}),
      membership: {
        MembershipStatusId: formData.membershipStatusId,
        MembershipName: formData.membershipName,
        MemberId: formData.memberId,
        MembershipNo: formData.membershipNumber,
        ProfessionalBodyName: formData.professionalBodyName,
      },
      workforce: {
        categoryOfWorkmen: formData.workmenCategories,
        professionals: formData.professionals,
        contractStaffCount: formData.contractStaffCount,
        bloodRelationsCount: formData.bloodRelationsCount,
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
        PracticeOutsideNigeria: formData.practiceOutsideNigeria,
      },
      project: {
        coverTypeIdx: formData.coverTypeIndex,
        isStatutory: formData.coverTypeIndex,
        coverTypeIdxDetails: formData.coverTypeDetails,
        categoryOfContractorId: formData.isDirectLabor
          ? 0
          : formData.contractorCategoryId,
        contractorType: formData.isDirectLabor
          ? undefined
          : formData.contractorType || undefined,
        projectType: formData.projectType || undefined,
        extraHazardous: formData.extraHazardous,
        totalEstimateSumBand: formData.totalEstimateSumBand || undefined,
        totalEstimateSum: formData.totalEstimateSum,
        totalEstimatedSum: formData.totalEstimateSum,
        agisNo: formData.agisNo,
        plotNumber: formData.agisNo,
        projectTitle: formData.projectTitle,
        projectName: formData.projectTitle,
        workDetails: formData.workDetails,
        address: formData.projectAddress,
        projectAddress: formData.projectAddress,
        lga: formData.projectLga,
        projectLga: formData.projectLga,
        district: formData.projectDistrict,
        projectDistrict: formData.projectDistrict,
        cadastralZone: formData.cadastralZone,
      },
      meta: {
        ProductId: formData.productId,
        date: new Date(),
        salesOutlet: formData.salesOutlet,
        brokerOrAgentName: formData.brokerAgentName,
      },
      priority: formData.priority,
    } as BuilderLiabilityPolicyData;

    console.log("POLICY DATA SENT:", JSON.stringify(policyData, null, 2));

    const result = await createPolicy(policyData);
    if (result && onSuccess) {
      // Clear draft on successful submit
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      onSuccess(result.data.policyId);
    }
  };

  const tabTriggerClass =
    "relative h-11 px-4 sm:px-5 text-xs sm:text-sm font-medium text-slate-500 border-b-2 border-transparent rounded-none bg-transparent transition-all duration-200 hover:text-slate-800 hover:bg-slate-50/80 data-[state=active]:text-emerald-700 data-[state=active]:border-emerald-600 whitespace-nowrap flex items-center gap-1.5";
  const currentIndex = FORM_TABS.indexOf(activeTab);
  const progressPercentage = ((currentIndex + 1) / FORM_TABS.length) * 100;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col min-h-[calc(100vh-4rem)] bg-white border-x border-slate-200 shadow-sm">
      {/* Header with Progress */}
      <div className="bg-white border-b border-slate-200 pt-6 px-6 sm:px-10 pb-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                New Policy
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Builder Liability Application
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Complete all required sections to submit your application.
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => saveDraft()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full hover:bg-emerald-100 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Save Draft
            </button>
            {lastSaved && (
              <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                Auto-saved at {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="hidden sm:block">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
            <span>
              Step {currentIndex + 1} of {FORM_TABS.length}
            </span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 sm:px-10 py-8 bg-slate-50/30">
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

        {draftRestored && (
          <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span>
              Your previous draft has been restored. Continue where you left
              off.
            </span>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(DRAFT_KEY);
                window.location.reload();
              }}
              className="ml-auto text-xs text-green-600 underline hover:text-green-800"
            >
              Clear draft
            </button>
          </div>
        )}

        <p className="mb-4 text-sm text-gray-600">
          Fields marked with{" "}
          <span className="font-semibold text-red-600">*</span> are required.
        </p>

        {tabErrors[activeTab]?.length ? (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium mb-1">
                Please resolve the following in this section:
              </p>
              <ul className="list-disc list-inside space-y-1">
                {tabErrors[activeTab]?.map((err, index) => (
                  <li key={`${activeTab}-err-${index}`}>{err}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as FormTab)}
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="w-full border-b border-slate-200 bg-white top-[152px] z-10 px-6 sm:px-10 -mx-6 sm:-mx-10 mb-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
              <div className="overflow-x-auto no-scrollbar">
                <TabsList className="flex bg-transparent p-0 h-auto gap-0 w-max min-w-full">
                  <TabsTrigger value="client" className={tabTriggerClass}>
                    Client
                  </TabsTrigger>
                  <TabsTrigger value="builder" className={tabTriggerClass}>
                    Contractor
                  </TabsTrigger>
                  <TabsTrigger value="organization" className={tabTriggerClass}>
                    Assessors / Consultants
                  </TabsTrigger>
                  <TabsTrigger value="membership" className={tabTriggerClass}>
                    Membership
                  </TabsTrigger>
                  <TabsTrigger value="workforce" className={tabTriggerClass}>
                    Workforce
                  </TabsTrigger>
                  <TabsTrigger value="compliance" className={tabTriggerClass}>
                    Compliance
                  </TabsTrigger>
                  <TabsTrigger value="project" className={tabTriggerClass}>
                    Project
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="client" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">
                    Client/Individual Name or Company Name *
                  </Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) =>
                      handleInputChange("clientName", e.target.value)
                    }
                    placeholder="Enter client name or company name"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Input the property owner or client requiring the insurance
                    cover.
                  </p>
                </div>
                <div>
                  <Label htmlFor="clientEmail">Client Email Address *</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) =>
                      handleInputChange("clientEmail", e.target.value)
                    }
                    placeholder="Enter client email address"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    This email will be used for client-facing communication and
                    documentation.
                  </p>
                </div>
                <div>
                  <Label htmlFor="clientPhoneNumber">
                    Client Phone Number *
                  </Label>
                  <Input
                    id="clientPhoneNumber"
                    value={formData.clientPhoneNumber}
                    onChange={(e) =>
                      handleInputChange("clientPhoneNumber", e.target.value)
                    }
                    placeholder="Enter client phone number"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Use a valid Nigerian or international phone number for the
                    client.
                  </p>
                </div>
                <div>
                  <Label htmlFor="clientIdentificationType">
                    Client Identification Type *
                  </Label>
                  <Select
                    value={formData.clientIdentificationType}
                    onValueChange={(value) =>
                      handleInputChange("clientIdentificationType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select identification type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLIENT_IDENTIFICATION_TYPES.map((identificationType) => (
                        <SelectItem
                          key={identificationType}
                          value={identificationType}
                        >
                          {identificationType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-sm text-gray-500">
                    Select the client&apos;s primary identification document.
                  </p>
                </div>
                <div>
                  <Label htmlFor="clientIdentificationNumber">
                    Client Identification Number *
                  </Label>
                  <Input
                    id="clientIdentificationNumber"
                    value={formData.clientIdentificationNumber}
                    onChange={(e) =>
                      handleInputChange(
                        "clientIdentificationNumber",
                        e.target.value,
                      )
                    }
                    placeholder="Enter identification number"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="clientRcNumber">Client RC Number</Label>
                  <Input
                    id="clientRcNumber"
                    value={formData.clientRcNumber}
                    onChange={(e) =>
                      handleInputChange("clientRcNumber", e.target.value)
                    }
                    placeholder="Enter RC number if client is a registered company"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Optional for incorporated companies only.
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="clientAddress">Client Address *</Label>
                <Textarea
                  id="clientAddress"
                  value={formData.clientAddress}
                  onChange={(e) =>
                    handleInputChange("clientAddress", e.target.value)
                  }
                  placeholder="Enter client address"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter the mailing or registered address of the client/property
                  owner.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="builder" className="space-y-4">
              {/* Direct Labor Toggle */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <Label
                      htmlFor="isDirectLabor"
                      className="text-base font-semibold text-amber-900"
                    >
                      Is this a direct labor construction?
                    </Label>
                    <p className="mt-1 text-sm text-amber-700">
                      Select &apos;Yes&apos; if the project is not assigned to a
                      commercial general contractor and you are managing or
                      building it yourself.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      type="button"
                      id="isDirectLabor"
                      onClick={() =>
                        handleDirectLaborChange(!formData.isDirectLabor)
                      }
                      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${
                        formData.isDirectLabor ? "bg-amber-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                          formData.isDirectLabor
                            ? "translate-x-8"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span
                      className={`text-sm font-semibold ${
                        formData.isDirectLabor
                          ? "text-amber-900"
                          : "text-gray-500"
                      }`}
                    >
                      {formData.isDirectLabor ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
                {formData.isDirectLabor && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-100 rounded-md border border-amber-300">
                    <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                    <p className="text-sm text-amber-800">
                      Contractor details below are not required for direct labor
                      projects and have been cleared.
                    </p>
                  </div>
                )}
              </div>

              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${formData.isDirectLabor ? "opacity-50 pointer-events-none" : ""}`}
              >
                <div>
                  <Label htmlFor="builderName">
                    Builder/Company Name {!formData.isDirectLabor && "*"}
                  </Label>
                  <Input
                    id="builderName"
                    value={formData.builderName}
                    onChange={(e) =>
                      handleInputChange("builderName", e.target.value)
                    }
                    required={!formData.isDirectLabor}
                    disabled={formData.isDirectLabor}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Enter the contractor or construction company handling the
                    work.
                  </p>
                </div>
                <div>
                  <Label htmlFor="builderEmail">
                    Email Address {!formData.isDirectLabor && "*"}
                  </Label>
                  <Input
                    id="builderEmail"
                    type="email"
                    value={formData.builderEmail}
                    onChange={(e) =>
                      handleInputChange("builderEmail", e.target.value)
                    }
                    required={!formData.isDirectLabor}
                    disabled={formData.isDirectLabor}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Provide the contractor&apos;s primary email address for
                    project communication.
                  </p>
                </div>
                <div>
                  <Label htmlFor="rcNumber">
                    RC Number {!formData.isDirectLabor && "*"}
                  </Label>
                  <Input
                    id="rcNumber"
                    value={formData.rcNumber}
                    onChange={(e) =>
                      handleInputChange("rcNumber", e.target.value)
                    }
                    required={!formData.isDirectLabor}
                    disabled={formData.isDirectLabor}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Input the organization&apos;s registered company number.
                  </p>
                </div>
                <div>
                  <Label htmlFor="builderPhone">
                    Phone Number {!formData.isDirectLabor && "*"}
                  </Label>
                  <Input
                    id="builderPhone"
                    value={formData.builderPhone}
                    onChange={(e) =>
                      handleInputChange("builderPhone", e.target.value)
                    }
                    required={!formData.isDirectLabor}
                    disabled={formData.isDirectLabor}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Enter a valid Nigerian or international contact number.
                  </p>
                </div>
                <div>
                  <Label htmlFor="directorOfCompany">
                    Director of the company {!formData.isDirectLabor && "*"}
                  </Label>
                  <Input
                    id="directorOfCompany"
                    value={formData.directorOfCompany}
                    onChange={(e) =>
                      handleInputChange("directorOfCompany", e.target.value)
                    }
                    required={!formData.isDirectLabor}
                    disabled={formData.isDirectLabor}
                    placeholder="Enter director of the company"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Provide the name of the director of the contractor company.
                  </p>
                </div>
                <div>
                  <Label htmlFor="identificationType">
                    Identification Type {!formData.isDirectLabor && "*"}
                  </Label>
                  <Select
                    value={formData.identificationType.toString()}
                    onValueChange={(value) =>
                      handleInputChange("identificationType", parseInt(value))
                    }
                    disabled={formData.isDirectLabor}
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
                  <Label htmlFor="identificationNumber">
                    Director's Identification Number{" "}
                    {!formData.isDirectLabor && "*"}
                  </Label>
                  <Input
                    id="identificationNumber"
                    value={formData.identificationNumber}
                    onChange={(e) =>
                      handleInputChange("identificationNumber", e.target.value)
                    }
                    required={!formData.isDirectLabor}
                    disabled={formData.isDirectLabor}
                    placeholder="Enter director's identification number"
                  />
                  {!formData.isDirectLabor &&
                    !formData.identificationNumber && (
                      <p className="text-sm text-red-600 mt-1">
                        Director's identification number is required
                      </p>
                    )}
                </div>

                <div>
                  <Label htmlFor="contractorCategoryId">
                    Contractor Category {!formData.isDirectLabor && "*"}
                  </Label>
                  <Select
                    value={formData.contractorCategoryId.toString()}
                    onValueChange={(value) =>
                      handleInputChange("contractorCategoryId", parseInt(value))
                    }
                    disabled={formData.isDirectLabor}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTRACTOR_CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          <div className="flex flex-col items-start py-1">
                            <span>{option.label}</span>
                            {/* <span className="text-xs text-slate-500 mt-0.5">
                              {option.description}
                            </span> */}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!formData.isDirectLabor && (
                    <p className="mt-2 text-sm text-slate-600">
                      {selectedContractorCategory.description}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contractorType">
                    Contractor Type {!formData.isDirectLabor && "*"}
                  </Label>
                  <Select
                    value={formData.contractorType}
                    onValueChange={(value) =>
                      handleInputChange("contractorType", value)
                    }
                    disabled={formData.isDirectLabor}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTRACTOR_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div
                className={
                  formData.isDirectLabor ? "opacity-50 pointer-events-none" : ""
                }
              >
                <Label htmlFor="builderAddress">
                  Location / Address {!formData.isDirectLabor && "*"}
                </Label>
                <Textarea
                  id="builderAddress"
                  value={formData.builderAddress}
                  onChange={(e) =>
                    handleInputChange("builderAddress", e.target.value)
                  }
                  required={!formData.isDirectLabor}
                  disabled={formData.isDirectLabor}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Provide the contractor&apos;s location and address (e.g.
                  Headquarters address if different from project site).
                </p>
              </div>
            </TabsContent>

            <TabsContent value="organization" className="space-y-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <Label
                      htmlFor="hasAssessorConsultant"
                      className="text-base font-semibold text-amber-900"
                    >
                      Has an Assessor / Consultant been engaged for this
                      project?
                    </Label>

                    <p className="mt-1 text-sm text-amber-700">
                      Select <strong>Yes</strong> if an assessor or consultant
                      has been appointed for this project. Select{" "}
                      <strong>No</strong> if the project does not currently have
                      one.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      type="button"
                      id="hasAssessorConsultant"
                      onClick={() =>
                        handleAssessorConsultantEngagementChange(
                          !hasAssessorConsultant,
                        )
                      }
                      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${
                        hasAssessorConsultant ? "bg-amber-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                          hasAssessorConsultant
                            ? "translate-x-8"
                            : "translate-x-1"
                        }`}
                      />
                    </button>

                    <span
                      className={`text-sm font-semibold ${
                        hasAssessorConsultant
                          ? "text-amber-900"
                          : "text-gray-500"
                      }`}
                    >
                      {hasAssessorConsultant ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                {!hasAssessorConsultant && (
                  <div className="mt-3 flex items-center gap-2 rounded-md border border-amber-300 bg-amber-100 px-3 py-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-700" />

                    <p className="text-sm text-amber-800">
                      No Assessor / Consultant has been assigned. The details
                      below are not required and have been cleared.
                    </p>
                  </div>
                )}
              </div>

              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!hasAssessorConsultant ? "opacity-50 pointer-events-none" : ""}`}
              >
                <div>
                  <Label htmlFor="assessorName">
                    Assessors / Consultants Name *
                  </Label>
                  <Input
                    id="assessorName"
                    value={formData.assessorName}
                    onChange={(e) =>
                      handleInputChange("assessorName", e.target.value)
                    }
                    placeholder="Enter assessor or consultant name"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Enter the assessor or consultant&apos;s full name for this
                    organization.
                  </p>
                </div>
                <div>
                  <Label htmlFor="professionalBody">Regulatory Body *</Label>
                  <Select
                    value={formData.professionalBody}
                    onValueChange={(value) =>
                      handleInputChange("professionalBody", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select regulatory body" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROFESSIONAL_BODY_OPTIONS.map((professionalBody) => (
                        <SelectItem
                          key={professionalBody}
                          value={professionalBody}
                        >
                          {professionalBody}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-sm text-gray-500">
                    Select the assessor or consultant&apos;s recognized
                    regulatory body.
                  </p>
                </div>
                <div>
                  <Label htmlFor="professionalRegistrationNumber">
                    Registration Number *
                  </Label>
                  <Input
                    id="professionalRegistrationNumber"
                    value={formData.professionalRegistrationNumber}
                    onChange={(e) =>
                      handleInputChange(
                        "professionalRegistrationNumber",
                        e.target.value,
                      )
                    }
                    placeholder="Enter assessor or consultant registration number"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Enter the registration number issued by the selected
                    regulatory body.
                  </p>
                </div>
                {formData.professionalBody === "Other" && (
                  <div>
                    <Label htmlFor="otherProfessionalBodyName">
                      Other Regulatory Body Name *
                    </Label>
                    <Input
                      id="otherProfessionalBodyName"
                      value={formData.otherProfessionalBodyName}
                      onChange={(e) =>
                        handleInputChange(
                          "otherProfessionalBodyName",
                          e.target.value,
                        )
                      }
                      placeholder="Enter regulatory body name"
                      required
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="practiceLicenseNumber">
                    Valid Practice License Number
                  </Label>
                  <Input
                    id="practiceLicenseNumber"
                    value={formData.practiceLicenseNumber || ""}
                    onChange={(e) =>
                      handleInputChange("practiceLicenseNumber", e.target.value)
                    }
                    placeholder="Enter valid practice license number"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Provide the assessor or consultant&apos;s current and valid
                    practice license number, if applicable.
                  </p>
                </div>
                <div>
                  <Label htmlFor="yearOfRegistration">
                    Year of Registration *
                  </Label>
                  <Input
                    id="yearOfRegistration"
                    type="date"
                    value={formData.yearOfRegistration}
                    onChange={(e) =>
                      handleInputChange("yearOfRegistration", e.target.value)
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="areaOfSpecialization">
                    Area of Specialization
                  </Label>
                  <Input
                    id="areaOfSpecialization"
                    value={formData.areaOfSpecialization}
                    onChange={(e) =>
                      handleInputChange("areaOfSpecialization", e.target.value)
                    }
                    placeholder="e.g. Structural engineering"
                  />
                </div>
                <div>
                  <Label htmlFor="staffStrength">Staff Strength *</Label>
                  <Select
                    value={formData.staffStrength}
                    onValueChange={(value) =>
                      handleInputChange("staffStrength", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff strength" />
                    </SelectTrigger>
                    <SelectContent>
                      {STAFF_STRENGTH_OPTIONS.map((strength) => (
                        <SelectItem key={strength} value={strength}>
                          {strength}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-sm text-gray-500">
                    Select the primary staff strength classification for this
                    assessor or consultant.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="membership" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="membershipStatusId">
                    Is the Applicant a Nigerian Insurers Association (NIA)
                    Member? *
                  </Label>
                  <Select
                    value={formData.membershipStatusId.toString()}
                    onValueChange={(value) =>
                      handleInputChange("membershipStatusId", parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">
                        Yes, applicant is a Nigerian Insurers Association member
                      </SelectItem>
                      <SelectItem value="2">
                        No, applicant is not a Nigerian Insurers Association
                        member
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-sm text-gray-500">
                    Select whether the contractor or firm currently holds active
                    membership with the Nigerian Insurers Association (NIA).
                  </p>
                </div>
                <div>
                  <Label htmlFor="memberId">
                    Nigerian Insurers Association (NIA) Member ID
                  </Label>
                  <Input
                    id="memberId"
                    value={formData.memberId}
                    onChange={(e) => {
                      handleInputChange("memberId", e.target.value);
                      handleInputChange("membershipNumber", e.target.value);
                    }}
                    placeholder="Enter the applicant's NIA member ID"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Provide the member ID issued by the Nigerian Insurers
                    Association (NIA). Leave blank if the applicant is not a
                    Nigerian Insurers Association (NIA) member.
                  </p>
                </div>
                <div>
                  <Label htmlFor="professionalBodyName">
                    Regulatory Body Name
                  </Label>
                  <Input
                    id="professionalBodyName"
                    value={formData.professionalBodyName}
                    onChange={(e) =>
                      handleInputChange("professionalBodyName", e.target.value)
                    }
                    placeholder="e.g. COREN"
                  />
                </div>
                <div>
                  <Label htmlFor="membershipName">Membership Description</Label>
                  <Input
                    id="membershipName"
                    value={formData.membershipName}
                    onChange={(e) =>
                      handleInputChange("membershipName", e.target.value)
                    }
                    placeholder="e.g. Corporate Member"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="workforce" className="space-y-6">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">
                  Workforce Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contractStaffCount">
                      Contract Staff Count *
                    </Label>
                    <Input
                      id="contractStaffCount"
                      type="number"
                      value={formData.contractStaffCount}
                      onChange={(e) =>
                        handleInputChange(
                          "contractStaffCount",
                          parseInt(e.target.value, 10) || 0,
                        )
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="bloodRelationsCount">
                      Blood Relations Count *
                    </Label>
                    <Input
                      id="bloodRelationsCount"
                      type="number"
                      value={formData.bloodRelationsCount}
                      onChange={(e) =>
                        handleInputChange(
                          "bloodRelationsCount",
                          parseInt(e.target.value, 10) || 0,
                        )
                      }
                      required
                    />
                  </div>
                </div>
              </Card>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    Categories of Workmen
                  </h3>
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
                            handleInputChange("workmenCategories", updated);
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
                            handleInputChange("workmenCategories", updated);
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
                            handleInputChange("workmenCategories", updated);
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
                            handleInputChange("professionals", updated);
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
                            handleInputChange("professionals", updated);
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
                            handleInputChange("professionals", updated);
                          }}
                          required
                        />
                        {professional.age > 0 &&
                          (professional.age < 18 || professional.age > 100) && (
                            <p className="text-sm text-red-600 mt-1">
                              Age must be between 18 and 100
                            </p>
                          )}
                      </div>
                      <div>
                        <Label>Gender *</Label>
                        <Select
                          value={professional.gender}
                          onValueChange={(value) => {
                            const updated = [...formData.professionals];
                            updated[index].gender = value as
                              | "Male"
                              | "Female"
                              | "Other";
                            handleInputChange("professionals", updated);
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
                            handleInputChange("professionals", updated);
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
                            handleInputChange("professionals", updated);
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
                            handleInputChange("professionals", updated);
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
                            updated[index].yearsInEmployment =
                              parseInt(e.target.value) || 0;
                            handleInputChange("professionals", updated);
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
              <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-800">
                    Insurance Information
                  </h3>
                </div>
                <div className="space-y-5">
                  <div
                    className={`flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer select-none ${formData.hasInsurance ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}`}
                    onClick={() =>
                      handleInputChange("hasInsurance", !formData.hasInsurance)
                    }
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border ${formData.hasInsurance ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white"}`}
                      >
                        {formData.hasInsurance && (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-slate-900 cursor-pointer pointer-events-none">
                        Do you currently have insurance coverage? *
                      </Label>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Check this box if there is an existing insurance policy
                        related to this application.
                      </p>
                    </div>
                  </div>
                  {formData.hasInsurance && (
                    <div className="mt-4">
                      <Label htmlFor="insuranceDetails">
                        Insurance Details *
                      </Label>
                      <Textarea
                        id="insuranceDetails"
                        value={formData.insuranceDetails}
                        onChange={(e) =>
                          handleInputChange("insuranceDetails", e.target.value)
                        }
                        placeholder="Provide details about your current insurance coverage"
                        required={formData.hasInsurance}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <AlertCircle className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-800">
                    Investigation & Disciplinary Status
                  </h3>
                </div>
                <div className="space-y-5">
                  <div
                    className={`flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer select-none ${formData.underInvestigation ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}`}
                    onClick={() =>
                      handleInputChange(
                        "underInvestigation",
                        !formData.underInvestigation,
                      )
                    }
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border ${formData.underInvestigation ? "bg-rose-600 border-rose-600 text-white" : "border-slate-300 bg-white"}`}
                      >
                        {formData.underInvestigation && (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-slate-900 cursor-pointer pointer-events-none">
                        Currently under investigation? *
                      </Label>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Check this box if you or your firm are currently under
                        any official investigation.
                      </p>
                    </div>
                  </div>
                  {formData.underInvestigation && (
                    <div className="mt-4">
                      <Label htmlFor="investigationDetails">
                        Investigation Details *
                      </Label>
                      <Textarea
                        id="investigationDetails"
                        value={formData.investigationDetails}
                        onChange={(e) =>
                          handleInputChange(
                            "investigationDetails",
                            e.target.value,
                          )
                        }
                        placeholder="Provide details about the investigation"
                        required={formData.underInvestigation}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <AlertCircle className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-800">
                    Disciplinary Action
                  </h3>
                </div>
                <div className="space-y-5">
                  <div
                    className={`flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer select-none ${formData.disciplinaryAction ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}`}
                    onClick={() =>
                      handleInputChange(
                        "disciplinaryAction",
                        !formData.disciplinaryAction,
                      )
                    }
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border ${formData.disciplinaryAction ? "bg-rose-600 border-rose-600 text-white" : "border-slate-300 bg-white"}`}
                      >
                        {formData.disciplinaryAction && (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-slate-900 cursor-pointer pointer-events-none">
                        Subject to disciplinary action? *
                      </Label>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Check this box if you have faced disciplinary actions
                        from regulatory bodies.
                      </p>
                    </div>
                  </div>
                  {formData.disciplinaryAction && (
                    <div className="mt-4">
                      <Label htmlFor="disciplinaryDetails">
                        Disciplinary Action Details *
                      </Label>
                      <Textarea
                        id="disciplinaryDetails"
                        value={formData.disciplinaryDetails}
                        onChange={(e) =>
                          handleInputChange(
                            "disciplinaryDetails",
                            e.target.value,
                          )
                        }
                        placeholder="Provide details about the disciplinary action"
                        required={formData.disciplinaryAction}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <AlertCircle className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-800">
                    Pre-Employment Checks
                  </h3>
                </div>
                <div className="space-y-5">
                  <div
                    className={`flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer select-none ${formData.preEmploymentCheck ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}`}
                    onClick={() =>
                      handleInputChange(
                        "preEmploymentCheck",
                        !formData.preEmploymentCheck,
                      )
                    }
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border ${formData.preEmploymentCheck ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white"}`}
                      >
                        {formData.preEmploymentCheck && (
                          <CheckCircle className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-slate-900 cursor-pointer pointer-events-none">
                        Pre-employment checks conducted? *
                      </Label>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Check this box if background checks were conducted on
                        employees.
                      </p>
                    </div>
                  </div>
                  {formData.preEmploymentCheck && (
                    <div className="mt-4">
                      <Label htmlFor="preEmploymentDetails">
                        Pre-Employment Check Details *
                      </Label>
                      <Textarea
                        id="preEmploymentDetails"
                        value={formData.preEmploymentDetails}
                        onChange={(e) =>
                          handleInputChange(
                            "preEmploymentDetails",
                            e.target.value,
                          )
                        }
                        placeholder="Describe the pre-employment checks conducted"
                        required={formData.preEmploymentCheck}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <AlertCircle className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-800">
                    Legal Information
                  </h3>
                </div>
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="legalSuitDetails">
                      Legal Suit Details (if any)
                    </Label>
                    <Textarea
                      id="legalSuitDetails"
                      value={formData.legalSuitDetails}
                      onChange={(e) =>
                        handleInputChange("legalSuitDetails", e.target.value)
                      }
                      placeholder="Provide details of any legal suits or claims"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <AlertCircle className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-800">
                    Practice Outside Nigeria
                  </h3>
                </div>
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="practiceOutsideNigeria">
                      Do you practice outside Nigeria? *
                    </Label>
                    <Select
                      value={formData.practiceOutsideNigeria}
                      onValueChange={(value) =>
                        handleInputChange("practiceOutsideNigeria", value)
                      }
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
              </div>
            </TabsContent>

            <TabsContent value="project" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="coverTypeIndex">
                    Is the Project Seeking Statutory Cover?*
                  </Label>
                  <Select
                    value={String(formData.coverTypeIndex)}
                    onValueChange={(value) =>
                      handleInputChange("coverTypeIndex", value === "true")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">
                        Yes, statutory cover is required
                      </SelectItem>
                      <SelectItem value="false">
                        No, this is not statutory
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose yes when the policy is being obtained to satisfy a
                    statutory or regulatory requirement for the project.
                  </p>
                </div>
                <div>
                  <Label htmlFor="coverTypeDetails">Coverage Type *</Label>
                  <Select
                    value={formData.coverTypeDetails}
                    onValueChange={(value) =>
                      handleInputChange(
                        "coverTypeDetails",
                        value as BuilderLiabilityCoverageType,
                      )
                    }
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
                  <Label htmlFor="projectType">Project Type *</Label>
                  <Select
                    value={formData.projectType}
                    onValueChange={(value) =>
                      handleInputChange("projectType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalEstimateSumBand">
                    Estimated Sum Range *
                  </Label>
                  <Select
                    value={formData.totalEstimateSumBand || undefined}
                    onValueChange={handleEstimateBandChange}
                  >
                    <SelectTrigger id="totalEstimateSumBand">
                      <SelectValue placeholder="Select estimated project sum range" />
                    </SelectTrigger>
                    <SelectContent>
                      {TOTAL_ESTIMATE_SUM_BANDS.map((band) => (
                        <SelectItem key={band} value={band}>
                          {band}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-sm text-gray-500">
                    Select the project&apos;s estimated sum band. The matching
                    ceiling value is stored automatically for premium
                    calculation.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="extraHazardous"
                    checked={formData.extraHazardous}
                    onChange={(e) =>
                      handleInputChange("extraHazardous", e.target.checked)
                    }
                    placeholder="Extra Hazardous"
                  />
                  <Label htmlFor="extraHazardous">
                    Extra Hazardous Work? *
                  </Label>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="projectTitle">Property Title *</Label>
                  <Input
                    id="projectTitle"
                    value={formData.projectTitle}
                    onChange={(e) =>
                      handleInputChange("projectTitle", e.target.value)
                    }
                    placeholder="Enter property title"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Enter the name on conveyance / approval.
                  </p>
                </div>

                <div>
                  <Label htmlFor="agisNo">Plot Number</Label>
                  <Input
                    id="agisNo"
                    value={formData.agisNo}
                    onChange={(e) =>
                      handleInputChange("agisNo", e.target.value)
                    }
                    placeholder="Enter plot number"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="projectLga">Project LGA *</Label>
                  <Select
                    value={formData.projectLga}
                    onValueChange={(value) => {
                      handleInputChange("projectLga", value);
                      handleInputChange("projectDistrict", "");
                    }}
                  >
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
                  <Label htmlFor="cadastralZone">Cadastral Zone *</Label>
                  {!customZoneMode ? (
                    <Select
                      value={formData.cadastralZone}
                      onValueChange={(value) => {
                        if (value === "Other") {
                          setCustomZoneMode(true);
                          handleInputChange("cadastralZone", "");
                        } else {
                          handleInputChange("cadastralZone", value);
                        }
                      }}
                    >
                      <SelectTrigger id="cadastralZone">
                        <SelectValue placeholder="Select Cadastral Zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {CADASTRAL_ZONES.map((zone) => (
                          <SelectItem key={zone} value={zone}>
                            {zone}
                          </SelectItem>
                        ))}
                        <SelectItem value="Other">Other (Specify)</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        id="cadastralZone"
                        value={formData.cadastralZone}
                        onChange={(e) =>
                          handleInputChange("cadastralZone", e.target.value)
                        }
                        placeholder="Enter custom cadastral zone"
                        required
                        autoFocus
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setCustomZoneMode(false);
                          handleInputChange("cadastralZone", "");
                        }}
                      >
                        Back
                      </Button>
                    </div>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Provide the cadastral zone for the project site.
                  </p>
                </div>

                <div>
                  <Label htmlFor="projectAddress">Location / Address *</Label>
                  <Textarea
                    id="projectAddress"
                    value={formData.projectAddress}
                    onChange={(e) =>
                      handleInputChange("projectAddress", e.target.value)
                    }
                    placeholder="Full project/site location or address"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="projectDistrict">Project District *</Label>
                  <Select
                    value={formData.projectDistrict}
                    onValueChange={(value) =>
                      handleInputChange("projectDistrict", value)
                    }
                    disabled={!formData.projectLga}
                  >
                    <SelectTrigger disabled={!formData.projectLga}>
                      <SelectValue
                        placeholder={
                          formData.projectLga
                            ? "Select District"
                            : "Select LGA first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.projectLga &&
                        getDistrictsByLGA(formData.projectLga).map(
                          (district) => (
                            <SelectItem
                              key={district.value}
                              value={district.value}
                            >
                              {district.label}
                            </SelectItem>
                          ),
                        )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="workDetails">Work Details *</Label>
                <Textarea
                  id="workDetails"
                  value={formData.workDetails}
                  onChange={(e) =>
                    handleInputChange("workDetails", e.target.value)
                  }
                  placeholder="Describe the construction work to be covered..."
                  required
                />
              </div>
            </TabsContent>
          </Tabs>

          {isLastTab && !formIsComplete && (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    Application Incomplete
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Please review previous sections and ensure all required
                    fields are filled out before submitting.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 border-t border-slate-200 bg-white px-6 sm:px-10 py-5 -mx-6 sm:-mx-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="w-full sm:w-auto rounded-full px-6 border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Button>

            <div className="flex w-full sm:w-auto gap-3">
              {FORM_TABS.indexOf(activeTab) > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading}
                  className="flex-1 sm:flex-none rounded-full px-6 border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-1.5" />
                  Previous
                </Button>
              )}

              {!isLastTab ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                  className="flex-1 sm:flex-none rounded-full px-8 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                >
                  Next Step
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading || !formIsComplete}
                  className="flex-1 sm:flex-none rounded-full px-8 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4 mr-2" />
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
        </form>
      </div>
    </div>
  );
};

export default BuilderLiabilityPolicyForm;
