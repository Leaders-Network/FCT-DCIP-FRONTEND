import { describe, expect, test } from 'vitest';
import { normalizeEgolePayCallback } from './egolePayCallback';

describe('normalizeEgolePayCallback', () => {
    test('promotes references from the production receipt callback shape', () => {
        const callback = normalizeEgolePayCallback({
            status: 'success',
            reference: 'MERCHANT-REFERENCE-001',
            transactionReference: 'GATEWAY-TRANSACTION-001',
            amount: 175000,
            fee: 2500,
            total: 177500,
            receipt: {
                merchantReference: 'MERCHANT-REFERENCE-001',
                gatewayReference: 'GATEWAY-TRANSACTION-001',
                paymentReference: 'PAYMENT-REFERENCE-001',
                status: 'success',
                amount: 175000
            }
        });

        expect(callback.transactionReference).toBe('GATEWAY-TRANSACTION-001');
        expect(callback.paymentReference).toBe('PAYMENT-REFERENCE-001');
        expect(callback.receipt).toMatchObject({
            paymentReference: 'PAYMENT-REFERENCE-001'
        });
    });

    test('preserves existing top-level references ahead of receipt fallbacks', () => {
        const callback = normalizeEgolePayCallback({
            transactionReference: 'TOP-TRANSACTION',
            paymentReference: 'TOP-PAYMENT',
            receipt: {
                gatewayReference: 'RECEIPT-TRANSACTION',
                paymentReference: 'RECEIPT-PAYMENT'
            }
        });

        expect(callback.transactionReference).toBe('TOP-TRANSACTION');
        expect(callback.paymentReference).toBe('TOP-PAYMENT');
    });
});
