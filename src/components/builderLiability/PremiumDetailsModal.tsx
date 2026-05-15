"use client";

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BuilderLiabilityPolicy } from '@/types/builderLiabilityPolicy.types';
import { getProjectEstimateBand } from '@/utils/builderLiability';
import { Building2, Copy, CreditCard, FileText, Mail, Phone, Receipt, ShieldCheck, Sparkles, User } from 'lucide-react';
import { toast } from 'sonner';

interface PremiumDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    premiumDetails: any;
    policy: BuilderLiabilityPolicy | null;
    onProceed: (payload: {
        reference: string;
        amount: number;
        email: string;
    }) => void;
    loading?: boolean;
}

export const PremiumDetailsModal: React.FC<PremiumDetailsModalProps> = ({
    isOpen,
    onClose,
    premiumDetails,
    policy,
    onProceed,
    loading = false
}) => {
    const [reference, setReference] = useState('');
    const [amount, setAmount] = useState<number>(0);
    const [email, setEmail] = useState('');
    const hasData = Boolean(premiumDetails && policy);
    const premiumAmount = premiumDetails?.amount ?? premiumDetails?.premiumAmount ?? 0;
    const currency = premiumDetails?.currency || 'NGN';
    const defaultEmail = premiumDetails?.builder?.email || policy?.builder.customerEmail || '';
    const defaultReference = premiumDetails?.transactionReference || premiumDetails?.invoiceNumber || '';

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(value);

    useEffect(() => {
        setAmount(Number(premiumAmount) || 0);
        setEmail(defaultEmail);
        const generatedReference = String(defaultReference || `TXN_${Date.now()}`);
        setReference(generatedReference.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50));
    }, [premiumAmount, defaultEmail, defaultReference, policy?._id, policy?.policyNumber, isOpen]);

    if (!hasData || !policy || !premiumDetails) return null;

    const copyField = (label: string, value?: string | number | null) => {
        if (!value) return;
        navigator.clipboard.writeText(String(value));
        toast.success(`${label} copied`);
    };

    const builderName = premiumDetails.builder?.name || policy.builder.nameOfBuilder;
    const builderPhone = premiumDetails.builder?.phone || policy.builder.telNo || '-';
    const builderEmail = premiumDetails.builder?.email || policy.builder.customerEmail || '-';
    const projectEstimateBand = getProjectEstimateBand(policy.project) || '-';
    const projectValue = premiumDetails.estimates?.declaredProjectSum
        ? formatCurrency(premiumDetails.estimates.declaredProjectSum)
        : '-';

    const handleProceed = () => {
        if (!reference.trim()) {
            toast.error('Please enter a reference');
            return;
        }
        if (!amount || amount < 100) {
            toast.error('Amount must be at least N100');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email');
            return;
        }

        onProceed({
            reference: reference.trim().replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50),
            amount,
            email: email.trim()
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[92vh] w-[95vw] max-w-3xl overflow-y-auto border-0 bg-transparent p-0 shadow-none sm:w-full">
                <div className="overflow-hidden rounded-2xl border border-orange-100 bg-[radial-gradient(circle_at_top,#fff1e7,transparent_34%),linear-gradient(180deg,#fffdf9_0%,#fff7ef_100%)] shadow-[0_24px_80px_rgba(249,115,22,0.18)] sm:rounded-[28px]">
                    <DialogHeader className="border-b border-orange-100/80 px-6 pb-5 pt-6 sm:px-8">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Payment Review
                                </div>
                                <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-900 sm:text-3xl">
                                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff7916] text-white shadow-lg shadow-orange-200">
                                        <CreditCard className="h-6 w-6" />
                                    </span>
                                    Complete Premium Payment
                                </DialogTitle>
                                <DialogDescription className="max-w-2xl text-sm leading-6 text-slate-600">
                                    Review the premium and payer details below, then launch EgolePay from this same modal.
                                </DialogDescription>
                            </div>
                            <div className="grid gap-2 text-left text-sm text-slate-600 sm:text-right">
                                <span className="font-medium">Policy #{policy.policyNumber}</span>
                                <span>{builderName}</span>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-5 px-6 py-6 sm:px-8">
                        <Card className="overflow-hidden border-0 bg-white/90 shadow-sm ring-1 ring-orange-100">
                            <CardContent className="p-0">
                                <div className="grid gap-0 md:grid-cols-[1.2fr_0.8fr]">
                                    <div className="space-y-4 bg-[linear-gradient(135deg,#ff8b2b_0%,#ff6a00_100%)] p-6 text-white">
                                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-50">
                                            <ShieldCheck className="h-3.5 w-3.5" />
                                            Premium Ready
                                        </div>
                                        <div>
                                            <p className="text-sm text-orange-50/90">Amount payable</p>
                                            <p className="mt-2 text-3xl font-black sm:text-4xl">{formatCurrency(amount)}</p>
                                        </div>
                                        <p className="max-w-md text-sm leading-6 text-orange-50/90">
                                            This premium has been calculated for the approved builder liability policy and is ready for checkout.
                                        </p>
                                    </div>
                                    <div className="grid gap-4 p-6">
                                        <div className="rounded-2xl bg-orange-50 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">Currency</p>
                                            <p className="mt-2 text-lg font-bold text-slate-900">{currency}</p>
                                        </div>
                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Estimated Sum Range</p>
                                            <p className="mt-2 text-lg font-bold text-slate-900">{projectEstimateBand}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                            <Card className="border-0 bg-white/90 shadow-sm ring-1 ring-orange-100">
                                <CardContent className="space-y-4 p-5">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <Receipt className="h-4 w-4 text-orange-600" />
                                        Payment Snapshot
                                    </div>
                                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                                        <button
                                            type="button"
                                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-orange-200 hover:bg-orange-50"
                                            onClick={() => copyField('Invoice', premiumDetails.invoiceNumber)}
                                        >
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Invoice</p>
                                            <p className="mt-2 flex items-center gap-2 font-semibold text-slate-900">
                                                <FileText className="h-4 w-4 text-orange-600" />
                                                {premiumDetails.invoiceNumber || '-'}
                                            </p>
                                        </button>
                                        <button
                                            type="button"
                                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-orange-200 hover:bg-orange-50"
                                            onClick={() => copyField('Reference', premiumDetails.transactionReference)}
                                        >
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">NIIP Reference</p>
                                            <p className="mt-2 flex items-center gap-2 font-semibold text-slate-900">
                                                <Copy className="h-4 w-4 text-orange-600" />
                                                {premiumDetails.transactionReference || '-'}
                                            </p>
                                        </button>
                                    </div>
                                    <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4 text-sm text-slate-600">
                                        EgolePay will open from this modal using your configured merchant API key. The premium amount stays locked to avoid mismatches with the approved quote.
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 bg-white/90 shadow-sm ring-1 ring-orange-100">
                                <CardContent className="space-y-4 p-5">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <User className="h-4 w-4 text-orange-600" />
                                        Builder Details
                                    </div>
                                    <div className="grid gap-3 text-sm">
                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Name</p>
                                            <p className="mt-2 font-semibold text-slate-900">{builderName}</p>
                                        </div>
                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Phone</p>
                                            <p className="mt-2 flex items-center gap-2 font-semibold text-slate-900">
                                                <Phone className="h-4 w-4 text-orange-600" />
                                                {builderPhone}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Email</p>
                                            <p className="mt-2 flex items-center gap-2 font-semibold text-slate-900">
                                                <Mail className="h-4 w-4 text-orange-600" />
                                                {builderEmail}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Stored Ceiling</p>
                                            <p className="mt-2 flex items-center gap-2 font-semibold text-slate-900">
                                                <Building2 className="h-4 w-4 text-orange-600" />
                                                {projectValue}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-0 bg-white/90 shadow-sm ring-1 ring-orange-100">
                            <CardContent className="space-y-4 p-5">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                    <CreditCard className="h-4 w-4 text-orange-600" />
                                    Checkout Details
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="egolepay-reference" className="text-slate-700">Reference</Label>
                                        <Input
                                            id="egolepay-reference"
                                            value={reference}
                                            onChange={(e) => setReference(e.target.value)}
                                            maxLength={50}
                                            placeholder="Enter reference"
                                            className="h-12 rounded-xl border-slate-200 bg-white shadow-sm focus-visible:ring-[#ff7916]"
                                        />
                                        <p className="text-xs text-slate-500">Use a unique checkout reference for this EgolePay payment.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="egolepay-amount" className="text-slate-700">Amount (NGN)</Label>
                                        <Input
                                            id="egolepay-amount"
                                            type="number"
                                            value={amount}
                                            readOnly
                                            disabled
                                            className="h-12 rounded-xl border-orange-100 bg-orange-50 text-slate-700 disabled:opacity-100"
                                        />
                                        <p className="text-xs text-slate-500">This figure is fixed from the approved premium.</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="egolepay-email" className="text-slate-700">Billing Email</Label>
                                    <Input
                                        id="egolepay-email"
                                        type="email"
                                        value={email}
                                        readOnly
                                        disabled
                                        className="h-12 rounded-xl border-slate-200 bg-slate-50 text-slate-700 disabled:opacity-100"
                                        placeholder="name@example.com"
                                    />
                                    <p className="text-xs text-slate-500">EgolePay will use this email for the payment session.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <DialogFooter className="flex flex-col gap-3 border-t border-orange-100/80 px-6 pb-6 pt-2 sm:flex-row sm:justify-end sm:px-8">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                            className="h-12 rounded-xl border-slate-200 bg-white px-6 text-slate-700 hover:bg-slate-50"
                        >
                            Close
                        </Button>
                        <Button
                            onClick={handleProceed}
                            disabled={loading}
                            className="h-12 rounded-xl bg-[#ff7916] px-6 font-bold text-white shadow-lg shadow-orange-200 hover:bg-[#e66a00]"
                        >
                            {loading ? 'Opening EgolePay...' : 'Proceed to payment'}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PremiumDetailsModal;
