"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BuilderLiabilityPolicy } from '@/types/builderLiabilityPolicy.types';
import { CreditCard, FileText, User, Phone, Mail, Building2, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface PremiumDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    premiumDetails: any;
    policy: BuilderLiabilityPolicy | null;
    onProceed: () => void;
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
    if (!premiumDetails || !policy) return null;

    const copyField = (label: string, value?: string | number | null) => {
        if (!value) return;
        navigator.clipboard.writeText(String(value));
        toast.success(`${label} copied`);
    };

    const amount = premiumDetails.amount ?? premiumDetails.premiumAmount;
    const currency = premiumDetails.currency || 'NGN';

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(value);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-green-600" />
                        Premium calculated
                    </DialogTitle>
                    <DialogDescription>
                        Review the premium before proceeding to Egolepay payment.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <Card>
                        <CardContent className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Premium amount</p>
                                    <p className="text-2xl font-semibold text-gray-900">{formatCurrency(amount)}</p>
                                </div>
                                <Badge variant="secondary">{currency}</Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Invoice #</span>
                                    <button
                                        className="flex items-center gap-1 text-gray-900 font-medium hover:underline"
                                        onClick={() => copyField('Invoice', premiumDetails.invoiceNumber)}
                                    >
                                        <FileText className="w-4 h-4" /> {premiumDetails.invoiceNumber || '—'}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Reference</span>
                                    <button
                                        className="flex items-center gap-1 text-gray-900 font-medium hover:underline"
                                        onClick={() => copyField('Reference', premiumDetails.transactionReference)}
                                    >
                                        <Copy className="w-4 h-4" /> {premiumDetails.transactionReference || '—'}
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 space-y-3 text-sm">
                            <div className="flex items-center gap-2 font-semibold text-gray-900">
                                <User className="w-4 h-4" />
                                Builder
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <p className="text-gray-600">Name</p>
                                    <p className="font-medium">{premiumDetails.builder?.name || policy.builder.nameOfBuilder}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-600">Phone</p>
                                    <p className="font-medium flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        {premiumDetails.builder?.phone || policy.builder.telNo || '—'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-600">Email</p>
                                    <p className="font-medium flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        {premiumDetails.builder?.email || policy.builder.customerEmail || '—'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-600">Project value</p>
                                    <p className="font-medium flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-gray-500" />
                                        {premiumDetails.estimates?.declaredProjectSum
                                            ? formatCurrency(premiumDetails.estimates.declaredProjectSum)
                                            : '—'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="border-t pt-3 flex items-center justify-between text-sm text-gray-700">
                        <span>Proceeding will redirect you to Egolepay to complete payment.</span>
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Close
                    </Button>
                    <Button onClick={onProceed} disabled={loading} className="bg-green-600 hover:bg-green-700">
                        {loading ? 'Processing...' : 'Proceed to payment'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PremiumDetailsModal;
