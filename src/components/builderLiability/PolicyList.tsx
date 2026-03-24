"use client";

import React, { useEffect, useState } from 'react';
import { useBuilderLiabilityPolicies } from '@/hooks/useBuilderLiabilityPolicy';
import { builderLiabilityPolicyAPI } from '@/services/builderLiabilityPolicyApi';
import { BuilderLiabilityPolicy, BuilderLiabilityPolicyStatus } from '@/types/builderLiabilityPolicy.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PolicyDetailsModal } from './PolicyDetailsModal';
import { PremiumDetailsModal } from './PremiumDetailsModal';
import {
    Eye,
    Search,
    Filter,
    Calendar,
    Building,
    User,
    MapPin,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    CreditCard
} from 'lucide-react';
import { toast } from "sonner"

// Load Egolepay SDK dynamically (singleton)
type SdkLoadError = Error & { tried?: string[] };
type PaymentEnvironment = 'test' | 'live';
type EgolePayResponse = {
    reference?: string;
    [key: string]: unknown;
};
type EgolePayConfig = {
    apiKey: string;
    reference: string;
    amount: number;
    email: string;
    customerName?: string;
    phone?: string;
    onSuccess: (response: EgolePayResponse) => void;
    onCancel?: (info: unknown) => void;
    onError?: (error: { message?: string }) => void;
    onClose?: (info?: unknown) => void;
    onStepChange?: (step: string) => void;
};
type EgolePayCtor = new (config: EgolePayConfig) => unknown;

declare global {
    interface Window {
        EgolePay?: EgolePayCtor;
    }
}

let sdkLoaderPromise: Promise<void> | null = null;
let loadedEgoleSdkUrl: string | null = null;
let loadingEgoleSdkUrl: string | null = null;
const EGOLEPAY_CUSTOMER_PATCH_VERSION = 5;
const EGOLEPAY_FETCH_PATCH_VERSION = 5;

type EgolePayRuntime = {
    __customerPatched?: boolean;
    __customerPatchVersion?: number;
    prototype?: {
        createTransaction?: () => Promise<void>;
    };
};

type FetchPatchedWindow = Window & {
    __egolepayFetchPatched?: boolean;
    __egolepayOriginalFetch?: typeof window.fetch;
    __egolepayFetchPatchVersion?: number;
    __egolepayForcedApiBaseUrl?: string;
};

type EgolePayPatchedInstance = {
    showOverlay: (message: string) => void;
    hideOverlay: () => void;
    showErrorModal: (message: string) => void;
    showPaymentOptionsPopup: () => void;
    baseUrl: string;
    apiKey: string;
    amount: number;
    reference: string;
    email: string;
    customerName?: string;
    phone?: string;
    transactionReference?: string;
    totalAmount?: number;
    serviceFee?: number;
};

const loadEgolePaySDK = (sdkUrl?: string) => {
    const resolvedSdkUrl = sdkUrl;

    return new Promise<void>((resolve, reject) => {
        if (!resolvedSdkUrl) {
            const err: SdkLoadError = Object.assign(new Error('Missing Egolepay SDK URL'), { tried: [] });
            reject(err);
            return;
        }

        const existingScript = document.querySelector(`script[src="${resolvedSdkUrl}"]`) as HTMLScriptElement | null;

        if (window.EgolePay && existingScript && loadedEgoleSdkUrl === resolvedSdkUrl) {
            resolve();
            return;
        }

        if (sdkLoaderPromise && loadingEgoleSdkUrl === resolvedSdkUrl) {
            sdkLoaderPromise.then(resolve).catch(reject);
            return;
        }

        // If switching SDK URLs (test <-> live), clear previous runtime and script
        if (window.EgolePay && loadedEgoleSdkUrl && loadedEgoleSdkUrl !== resolvedSdkUrl) {
            delete window.EgolePay;
            const previousScript = document.querySelector(`script[src="${loadedEgoleSdkUrl}"]`);
            previousScript?.remove();
        }

        sdkLoaderPromise = new Promise<void>((innerResolve, innerReject) => {
            const script = document.createElement('script');
            script.src = resolvedSdkUrl;
            script.async = true;
            script.dataset.egolepaySdk = "true";
            script.onload = () => {
                if (window.EgolePay) {
                    loadedEgoleSdkUrl = resolvedSdkUrl;
                    innerResolve();
                    return;
                }
                script.remove();
                const err: SdkLoadError = Object.assign(new Error('Egolepay SDK loaded without EgolePay global'), { tried: [resolvedSdkUrl] });
                innerReject(err);
            };
            script.onerror = () => {
                script.remove();
                const err: SdkLoadError = Object.assign(new Error('Failed to load Egolepay SDK'), { tried: [resolvedSdkUrl] });
                innerReject(err);
            };
            document.body.appendChild(script);
        });
        loadingEgoleSdkUrl = resolvedSdkUrl;

        sdkLoaderPromise
            .then(() => resolve())
            .catch((error) => reject(error))
            .finally(() => {
                sdkLoaderPromise = null;
                loadingEgoleSdkUrl = null;
            });
    });
};

const getForcedEgolePayApiBaseUrl = (sdkUrl?: string) => {
    if (!sdkUrl) return '';
    try {
        const parsed = new URL(sdkUrl);
        if (/apigateway-test\.egolepay\.com$/i.test(parsed.hostname)) {
            return `${parsed.origin}/api/StandardPaymentGateway`;
        }
        if (/apigateway\.egolepay\.com$/i.test(parsed.hostname)) {
            return `${parsed.origin}/api/v1`;
        }
        return '';
    } catch {
        return '';
    }
};

const patchEgolePayCustomerPayloadToObject = () => {
    const EgolePay = window.EgolePay as unknown as EgolePayRuntime | undefined;
    if (!EgolePay) return;
    if (EgolePay.__customerPatchVersion === EGOLEPAY_CUSTOMER_PATCH_VERSION) return;
    const proto = EgolePay.prototype;
    if (!proto?.createTransaction) return;

    proto.createTransaction = async function (this: EgolePayPatchedInstance) {
        this.showOverlay("Creating transaction...");
        const normalizedEmail = String(this.email || '').trim();
        const normalizedName =
            String(this.customerName || '').trim() ||
            (normalizedEmail ? normalizedEmail.split('@')[0] : 'customer');
        const normalizedPhone = String(this.phone || '').trim();

        const payload = {
            amount: this.amount,
            reference: this.reference,
            customer: {
                email: normalizedEmail,
                name: normalizedName,
                phone: normalizedPhone
            }
        };

        try {
            const response = await fetch(`${this.baseUrl}/transactions`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.Message || data?.message || "Failed to create transaction");
            }
            if (!(data?.Status === true || data?.status === true)) {
                throw new Error(data?.Message || data?.message || "Transaction creation failed");
            }

            const responseData = data?.Data || data?.data;
            if (!responseData) {
                throw new Error("No data returned from API");
            }

            this.transactionReference = responseData.reference || responseData.Reference;
            this.totalAmount = responseData.totalAmount || responseData.TotalAmount || this.amount;
            this.serviceFee = responseData.fee || responseData.Fee || 0;
            this.hideOverlay();
            this.showPaymentOptionsPopup();
        } catch (error: unknown) {
            this.hideOverlay();
            const message = error instanceof Error ? error.message : "Failed to initialize payment. Please try again.";
            this.showErrorModal(message);
        }
    };

    EgolePay.__customerPatched = true;
    EgolePay.__customerPatchVersion = EGOLEPAY_CUSTOMER_PATCH_VERSION;
};

const patchEgolePayTransactionFetchPayload = () => {
    const win = window as FetchPatchedWindow;
    if (win.__egolepayFetchPatchVersion === EGOLEPAY_FETCH_PATCH_VERSION) return;

    if (win.__egolepayFetchPatched && win.__egolepayOriginalFetch) {
        window.fetch = win.__egolepayOriginalFetch;
    }

    const originalFetch = (win.__egolepayOriginalFetch || window.fetch.bind(window)).bind(window);
    win.__egolepayOriginalFetch = originalFetch;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        let rewrittenInput: RequestInfo | URL = input;
        try {
            const urlValue =
                typeof input === 'string'
                    ? input
                    : input instanceof URL
                        ? input.toString()
                        : input.url;

            const method =
                (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
            const parsedUrl = new URL(urlValue, window.location.origin);
            const isEgoleTransactionCreate =
                /egolepay\.com/i.test(parsedUrl.hostname) &&
                /\/transactions\/?$/.test(parsedUrl.pathname) &&
                method === 'POST';
            const forcedApiBaseUrl = win.__egolepayForcedApiBaseUrl || '';

            if (forcedApiBaseUrl && /paywebbackoffice-test\.egolepay\.com$/i.test(parsedUrl.hostname)) {
                const forcedBase = new URL(forcedApiBaseUrl);
                const rewrittenUrl = `${forcedBase.origin}${parsedUrl.pathname}${parsedUrl.search}`;
                rewrittenInput =
                    typeof input === 'string'
                        ? rewrittenUrl
                        : input instanceof URL
                            ? new URL(rewrittenUrl)
                            : new Request(rewrittenUrl, input);
            }

            if (isEgoleTransactionCreate && typeof init?.body === 'string') {
                const rawPayload = JSON.parse(init.body) as Record<string, unknown>;
                const customer = rawPayload.customer;
                const parsedAmount = Number(rawPayload.amount);
                const normalizedAmount = Number.isFinite(parsedAmount) ? parsedAmount : 0;
                const normalizedReference =
                    typeof rawPayload.reference === 'string' && rawPayload.reference.trim()
                        ? rawPayload.reference.trim()
                        : `TXN_${Date.now()}`;

                let normalizedEmail = '';
                let normalizedName = '';
                let normalizedPhone = '';
                if (typeof customer === 'string' && customer.trim()) {
                    normalizedEmail = customer.trim();
                } else if (customer && typeof customer === 'object' && !Array.isArray(customer)) {
                    const customerObject = customer as Record<string, unknown>;
                    normalizedEmail =
                        (typeof customerObject.email === 'string' && customerObject.email.trim()) || '';
                    normalizedName =
                        (typeof customerObject.name === 'string' && customerObject.name.trim()) || '';
                    normalizedPhone =
                        (typeof customerObject.phone === 'string' && customerObject.phone.trim()) || '';
                }

                if (!normalizedEmail && typeof rawPayload.email === 'string') {
                    normalizedEmail = rawPayload.email.trim();
                }
                if (!normalizedName) {
                    normalizedName =
                        (typeof rawPayload.customerName === 'string' && rawPayload.customerName.trim()) ||
                        (normalizedEmail ? normalizedEmail.split('@')[0] : 'customer');
                }
                if (!normalizedPhone && typeof rawPayload.phone === 'string') {
                    normalizedPhone = rawPayload.phone.trim();
                }

                if (normalizedEmail) {
                    const canonicalPayload = {
                        amount: normalizedAmount,
                        reference: normalizedReference,
                        customer: {
                            email: normalizedEmail,
                            name: normalizedName,
                            phone: normalizedPhone
                        }
                    };
                    const nextInit: RequestInit = {
                        ...init,
                        body: JSON.stringify(canonicalPayload)
                    };
                    return originalFetch(rewrittenInput, nextInit);
                }
            }
        } catch (error) {
            console.warn('Egolepay fetch payload patch warning:', error);
        }

        return originalFetch(rewrittenInput, init);
    };

    win.__egolepayFetchPatched = true;
    win.__egolepayFetchPatchVersion = EGOLEPAY_FETCH_PATCH_VERSION;
};

interface PolicyListProps {
    isAdmin?: boolean;
    onPolicySelect?: (policy: BuilderLiabilityPolicy) => void;
}

export const BuilderLiabilityPolicyList: React.FC<PolicyListProps> = ({
    isAdmin = false,
    onPolicySelect
}) => {
    const { policies, loading, error, fetchPolicies } = useBuilderLiabilityPolicies(isAdmin);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [selectedPolicy, setSelectedPolicy] = useState<BuilderLiabilityPolicy | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [premiumState, setPremiumState] = useState<Record<string, {
        premiumDetails: any;
        nextAction?: { url: string; method: string; label?: string; type?: string };
    }>>({});
    const [calculatingPremium, setCalculatingPremium] = useState<string | null>(null);
    const [processingPayment, setProcessingPayment] = useState<string | null>(null);
    const [premiumModalPolicyId, setPremiumModalPolicyId] = useState<string | null>(null);

    // Seed premium state from already-calculated policies so buttons don't regress on reload
    useEffect(() => {
        setPremiumState((prev) => {
            const next = { ...prev };
            policies.forEach((policy) => {
                const calculatedAmount = (policy as any)?.paymentInfo?.amount;
                if (calculatedAmount && !next[policy._id]) {
                    next[policy._id] = {
                        premiumDetails: {
                            amount: calculatedAmount,
                            currency: 'NGN',
                            invoiceNumber: (policy as any)?.paymentInfo?.niipInvoice || (policy as any)?.niipPayload?.invoiceNumber || null,
                            transactionReference: (policy as any)?.paymentInfo?.niipReference || (policy as any)?.niipPayload?.transactionReference || null,
                            builder: {
                                name: policy.builder.nameOfBuilder,
                                email: policy.builder.customerEmail,
                                phone: policy.builder.telNo
                            },
                            estimates: {
                                declaredProjectSum: policy.project.totalEstimateSum,
                                surveyorEstimate: (policy as any)?.surveyorEstimatedValue || null
                            }
                        },
                        nextAction: {
                            label: 'Proceed to payment',
                            method: 'POST',
                            url: `/payment/Egolepay/initialize/${policy._id}`
                        }
                    };
                }
            });
            return next;
        });
    }, [policies]);

    const handleCalculatePremium = async (policy: BuilderLiabilityPolicy) => {
        try {
            setCalculatingPremium(policy._id);

            console.log('💳 Calculating premium via NIIP...');

            const api = (await import('@/services/api')).default;

            // Step 1–2: calculate premium via NIIP
            const premiumResponse = await api.post(`/payment/calculate-premium/${policy._id}`);
            const premiumData = premiumResponse.data;

            console.log('Premium Response:', premiumData);

            if (!premiumData.success || !premiumData.data) {
                throw new Error(premiumData.message || 'Premium calculation failed');
            }

            const premiumDetails = premiumData.data.premiumDetails || { amount: premiumData.data.premiumAmount };
            const nextAction = premiumData.data.nextAction
                ? { ...premiumData.data.nextAction, url: normalizeApiPath(premiumData.data.nextAction.url) }
                : undefined;

            setPremiumState(prev => ({
                ...prev,
                [policy._id]: {
                    premiumDetails,
                    nextAction
                }
            }));

            setPremiumModalPolicyId(policy._id);
            setShowPremiumModal(true);
        } catch (error: any) {
            console.error('Payment error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to process payment';
            toast.error(`❌ Payment Error\n\n${errorMessage}\n\nPlease try again or contact support.`);
        } finally {
            setCalculatingPremium(null);
        }
    };

    const normalizeApiPath = (path?: string) => {
        if (!path) return '';
        // Remove any leading /api/v1 since the axios baseURL already includes it
        const cleaned = path.replace(/^\/?api\/v1/, '');
        return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
    };

    const handleProceedToPayment = async (
        policy: BuilderLiabilityPolicy,
        payload?: {
            reference: string;
            amount: number;
            email: string;
            environment: PaymentEnvironment;
        }
    ) => {
        const state = premiumState[policy._id];
        const amount = payload?.amount || state?.premiumDetails?.amount || (policy as any)?.paymentInfo?.amount;
        const email = payload?.email || policy.builder.customerEmail;
        const rawReference = payload?.reference || `TXN_${Date.now()}`;
        const reference = rawReference.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
        const environment = payload?.environment || 'test';
        const testSdkUrl = process.env.NEXT_PUBLIC_EGOLEPAY_SDK_URL || process.env.NEXT_PUBLIC_EGOLEPAY_TEST_SDK_URL;
        const liveSdkUrl = process.env.NEXT_PUBLIC_EGOLEPAY_LIVE_SDK_URL;
        const sdkUrl = environment === 'test' ? testSdkUrl : liveSdkUrl;
        const testApiKey = process.env.NEXT_PUBLIC_EGOLEPAY_TEST_PUBLIC_KEY || process.env.NEXT_PUBLIC_EGOLEPAY_PUBLIC_KEY;
        const liveApiKey = process.env.NEXT_PUBLIC_EGOLEPAY_LIVE_PUBLIC_KEY;
        const apiKey = environment === 'test' ? testApiKey : liveApiKey;
        const isMethodNotAllowed = (message?: string) => /405|method not allowed/i.test(message || '');

        try {
            setProcessingPayment(policy._id);

            if (!amount || !email) {
                throw new Error('Premium amount or email missing; calculate premium first.');
            }
            if (!sdkUrl) {
                throw new Error('Egolepay SDK URL is not configured');
            }
            if (!apiKey) {
                throw new Error(`Egolepay ${environment} public key is not configured`);
            }
            if (apiKey.includes('...')) {
                throw new Error(`Egolepay ${environment} public key looks like a placeholder; set the full pk_${environment}_... key`);
            }
            if (apiKey.startsWith('sk_')) {
                throw new Error('Invalid Egolepay key for frontend: secret keys (sk_*) must not be used in browser');
            }
            if (environment === 'live' && !apiKey.includes('live')) {
                throw new Error('Live environment selected but key does not look like a live public key');
            }
            if (environment === 'live' && sdkUrl?.includes('-test')) {
                throw new Error('Live environment selected but test SDK URL detected');
            }
            if (environment === 'test' && sdkUrl?.includes('api.egolepay.com')) {
                throw new Error('Test environment selected but live SDK URL detected');
            }

            const api = (await import('@/services/api')).default;
            let runtimeReference = reference;
            let runtimeAmount = amount;
            let runtimeEmail = email;
            let runtimeSdkUrl = sdkUrl;
            let runtimeApiKey = apiKey;

            // Always initialize payment first so backend records are created even if SDK checks fail.
            try {
                const initializePath = normalizeApiPath(state?.nextAction?.url) || `/payment/Egolepay/initialize/${policy._id}`;
                const initializeResponse = await api.post(initializePath);
                const initializeData = initializeResponse?.data?.data || {};

                runtimeReference = String(initializeData.reference || initializeData.referenceNumber || runtimeReference);
                runtimeAmount = Number(initializeData.amount || runtimeAmount);
                runtimeEmail = String(initializeData.email || runtimeEmail);
                runtimeSdkUrl = String(initializeData.sdkUrl || runtimeSdkUrl);
                runtimeApiKey = String(initializeData.browserKey || initializeData.publicKey || runtimeApiKey);

                // Force test payments to use the configured frontend SDK URL.
                if (environment === 'test' && testSdkUrl) {
                    runtimeSdkUrl = testSdkUrl;
                }
            } catch (initializeError) {
                console.warn('Payment initialization warning:', initializeError);
                // Continue with local values as fallback.
            }

            (window as FetchPatchedWindow).__egolepayForcedApiBaseUrl = getForcedEgolePayApiBaseUrl(runtimeSdkUrl);

            await loadEgolePaySDK(runtimeSdkUrl);
            patchEgolePayTransactionFetchPayload();
            patchEgolePayCustomerPayloadToObject();

            const EgolePay = window.EgolePay;
            if (!EgolePay) {
                throw new Error('Egolepay SDK failed to load');
            }

            new EgolePay({
                apiKey: runtimeApiKey,
                reference: runtimeReference,
                amount: runtimeAmount,
                email: runtimeEmail,
                customerName: (policy.builder.nameOfBuilder || runtimeEmail.split('@')[0]).slice(0, 80),
                phone: (policy.builder.telNo || '').replace(/[^\d+]/g, '') || '08000000000',
                onSuccess: async (response) => {
                    try {
                        const verifyReference = response?.reference || runtimeReference;
                        await api.post('/payment/Egolepay/verify', {
                            reference: verifyReference,
                            policyId: policy._id,
                            amount: runtimeAmount
                        });
                        toast.success('Payment completed!');
                        setShowPremiumModal(false);
                        fetchPolicies();
                    } catch (verifyErr: any) {
                        const msg = verifyErr?.response?.data?.message || verifyErr?.message || 'Verification failed';
                        toast.error(`Verification error\n\n${msg}`);
                    }
                },
                onCancel: () => {
                    toast.error('Payment cancelled');
                },
                onError: (sdkError) => {
                    const sdkMessage = sdkError?.message || 'Egolepay checkout failed';
                    if (isMethodNotAllowed(sdkMessage)) {
                        toast.info('Payment initialization saved. Gateway transaction check returned 405, please retry or confirm with Egolepay support.');
                        setShowPremiumModal(false);
                        fetchPolicies();
                        return;
                    }
                    toast.error(sdkMessage);
                },
                onClose: () => {
                    toast.info('Payment window closed');
                },
                onStepChange: (step) => {
                    console.log('EgolePay step changed:', step);
                }
            });
        } catch (error: any) {
            console.error('Payment error:', error);
            const attempted = error?.tried ? `\nTried: ${error.tried.join(', ')}` : '';
            const errorMessage = error.response?.data?.message || error.message || 'Failed to process payment';
            if (isMethodNotAllowed(errorMessage)) {
                toast.info('Payment initialization completed, but gateway transaction check returned 405. Please retry shortly.');
                setShowPremiumModal(false);
                fetchPolicies();
                return;
            }
            toast.error(`Payment Error\n\n${errorMessage}${attempted ? '\n\n' + attempted : ''}\n\nPlease try again or contact support.`);
        } finally {
            setProcessingPayment(null);
        }
    };

    const handleViewDetails = async (policy: BuilderLiabilityPolicy) => {
        try {
            // Fetch the complete policy data by ID to get all fields
            const response = await builderLiabilityPolicyAPI.getPolicyById(policy._id);
            const fullPolicy = response.data.policy;

            setSelectedPolicy(fullPolicy);
            setShowDetailsModal(true);
            if (onPolicySelect) {
                onPolicySelect(fullPolicy);
            }
        } catch (error) {
            console.error('Failed to fetch full policy details:', error);
            // Fallback to showing partial data if fetch fails
            setSelectedPolicy(policy);
            setShowDetailsModal(true);
            if (onPolicySelect) {
                onPolicySelect(policy);
            }
        }
    };

    const handleCloseModal = () => {
        setShowDetailsModal(false);
        setSelectedPolicy(null);
    };

    // Helper function to get the actual current status from statusHistory if available
    const getActualStatus = (policy: BuilderLiabilityPolicy): string => {
        // If statusHistory exists and has entries, use the most recent status
        if (policy.statusHistory && policy.statusHistory.length > 0) {
            const latestStatus = policy.statusHistory[policy.statusHistory.length - 1];
            return latestStatus.status;
        }
        // Otherwise, use the policy status field
        return policy.status || 'draft';
    };

    // Filter policies based on search and filters
    const filteredPolicies = policies.filter(policy => {
        const matchesSearch = !searchQuery ||
            policy.builder.nameOfBuilder.toLowerCase().includes(searchQuery.toLowerCase()) ||
            policy.builder.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            policy.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            policy.builder.rcNumber.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || getActualStatus(policy) === statusFilter;
        const matchesPriority = priorityFilter === 'all' || policy.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    const getStatusBadge = (status: BuilderLiabilityPolicyStatus) => {
        const statusConfig = {
            draft: { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Draft' },
            submitted: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Submitted' },
            assigned: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, label: 'Assigned' },
            surveyed: { color: 'bg-purple-100 text-purple-800', icon: Eye, label: 'Surveyed' },
            approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
            payment_pending: { color: 'bg-orange-100 text-orange-800', icon: CreditCard, label: 'Payment Pending' },
            rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
            requires_more_info: { color: 'bg-amber-100 text-amber-800', icon: AlertCircle, label: 'Needs Info' },
            revision_required: { color: 'bg-amber-100 text-amber-800', icon: AlertCircle, label: 'Needs Info' },
            completed: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Completed' },
            sent_to_user: { color: 'bg-cyan-100 text-cyan-800', icon: CheckCircle, label: 'Sent to User' }
        };

        const config = statusConfig[status] || statusConfig.submitted;
        const Icon = config.icon;

        return (
            <Badge className={`${config.color} flex items-center gap-1`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const priorityConfig = {
            low: 'bg-green-100 text-green-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-orange-100 text-orange-800',
            urgent: 'bg-red-100 text-red-800'
        };

        return (
            <Badge className={priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium}>
                {priority?.toUpperCase() || 'MEDIUM'}
            </Badge>
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-2">
                                    <div className="h-5 bg-gray-300 rounded w-1/3"></div>
                                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                                </div>
                                <div className="h-6 bg-gray-300 rounded w-20"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Policies</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={() => fetchPolicies()}>Try Again</Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Builder Liability Policies</h2>
                    <p className="text-gray-600">
                        {isAdmin ? 'Manage all Builder Liability Policy applications' : 'Your Builder Liability Policy applications'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">
                        {filteredPolicies.length} of {policies.length} policies
                    </Badge>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by builder name, email, policy number, or RC number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="submitted">Submitted</SelectItem>
                                <SelectItem value="assigned">Assigned</SelectItem>
                                <SelectItem value="surveyed">Surveyed</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="payment_pending">Payment Pending</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Filter by priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priorities</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Policy List */}
            {filteredPolicies.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                                ? 'No matching policies found'
                                : 'No policies yet'}
                        </h3>
                        <p className="text-gray-600">
                            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Builder Liability Policy applications will appear here'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredPolicies.map((policy) => (
                        <Card key={policy._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex-1 min-w-0 space-y-3">
                                        {/* Header */}
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0">
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                                                    {policy.builder.nameOfBuilder}
                                                </h3>
                                                <p className="text-xs sm:text-sm text-gray-600 break-words">
                                                    Policy #{policy.policyNumber}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 justify-end sm:flex-none">
                                                {getStatusBadge(getActualStatus(policy) as BuilderLiabilityPolicyStatus)}
                                                {getPriorityBadge(policy.priority || 'medium')}
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                                            <div className="flex items-start gap-2 min-w-0">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <div className="min-w-0">
                                                    <p className="text-gray-600">Builder</p>
                                                    <p className="font-medium break-words">
                                                        {policy.builder.nameOfBuilder}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 min-w-0">
                                                <Building className="w-4 h-4 text-gray-400" />
                                                <div className="min-w-0">
                                                    <p className="text-gray-600">Project Value</p>
                                                    <p className="font-medium break-words">
                                                        {formatCurrency(policy.project.totalEstimateSum)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 min-w-0">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <div className="min-w-0">
                                                    <p className="text-gray-600">Location</p>
                                                    <p className="font-medium break-words">
                                                        {policy.builder.address}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 min-w-0">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <div className="min-w-0">
                                                    <p className="text-gray-600">Submitted</p>
                                                    <p className="font-medium break-words">
                                                        {new Date(policy.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional Info */}
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-gray-100">
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                                <span className="break-all">RC: {policy.builder.rcNumber}</span>
                                                <span className="break-words">
                                                    Coverage: {policy.project.coverTypeIdxDetails}
                                                </span>
                                                {policy.project.extraHazardous && (
                                                    <Badge variant="outline" className="text-[10px] sm:text-xs">
                                                        Extra Hazardous
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 justify-end">
                                                {/* Show payment button only if survey is completed and approved */}
                                                {getActualStatus(policy) === 'completed' && (policy as any).surveyorRecommendation === 'approve' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700"
                                                            onClick={() => {
                                                                if (premiumState[policy._id]) {
                                                                    setPremiumModalPolicyId(policy._id);
                                                                    setShowPremiumModal(true);
                                                                } else {
                                                                    handleCalculatePremium(policy);
                                                                }
                                                            }}
                                                            disabled={processingPayment === policy._id || calculatingPremium === policy._id}
                                                        >
                                                            <CreditCard className="w-4 h-4 mr-2" />
                                                            {processingPayment === policy._id
                                                                ? 'Processing...'
                                                                : premiumState[policy._id]
                                                                    ? 'Proceed to Payment'
                                                                    : calculatingPremium === policy._id
                                                                        ? 'Calculating...'
                                                                        : 'Calculate Premium'}
                                                        </Button>
                                                        {premiumState[policy._id] && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setPremiumModalPolicyId(policy._id);
                                                                    setShowPremiumModal(true);
                                                                }}
                                                            >
                                                                View Premium
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                                {/* Show rejection message if rejected */}
                                                {getActualStatus(policy) === 'completed' && (policy as any).surveyorRecommendation === 'reject' && (
                                                    <Badge className="bg-red-100 text-red-800">
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                        Policy Rejected
                                                    </Badge>
                                                )}
                                                {/* Show info needed message */}
                                                {getActualStatus(policy) === 'completed' && (policy as any).surveyorRecommendation === 'request_more_info' && (
                                                    <Badge className="bg-amber-100 text-amber-800">
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        More Info Required
                                                    </Badge>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleViewDetails(policy)}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Policy Details Modal */}
            <PolicyDetailsModal
                policy={selectedPolicy}
                isOpen={showDetailsModal}
                onClose={handleCloseModal}
            />
            <PremiumDetailsModal
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
                premiumDetails={premiumModalPolicyId ? premiumState[premiumModalPolicyId]?.premiumDetails : null}
                policy={premiumModalPolicyId ? policies.find(p => p._id === premiumModalPolicyId) || null : null}
                onProceed={(payload) => {
                    if (!premiumModalPolicyId) return;
                    const policy = policies.find(p => p._id === premiumModalPolicyId);
                    if (policy) {
                        handleProceedToPayment(policy, payload);
                    }
                }}
                loading={processingPayment === premiumModalPolicyId}
            />
        </div>
    );
};

export default BuilderLiabilityPolicyList;

