type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord =>
    value !== null && typeof value === 'object' && !Array.isArray(value)
        ? value as UnknownRecord
        : {};

const pickReference = (...candidates: unknown[]): unknown => {
    for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
            const found = candidate.find((value) => value != null && String(value).trim() !== '');
            if (found != null && String(found).trim() !== '') return found;
            continue;
        }

        if (candidate != null && String(candidate).trim() !== '') return candidate;
    }

    return undefined;
};

export const normalizeEgolePayCallback = (response: unknown): UnknownRecord => {
    const responseObject = asRecord(response);
    const data = asRecord(responseObject.data);
    const upperData = asRecord(responseObject.Data);
    const receipt = asRecord(responseObject.receipt);
    const dataReceipt = asRecord(data.receipt);
    const upperDataReceipt = asRecord(upperData.Receipt ?? upperData.receipt);
    const transactionItems = responseObject.transactionItems;
    const firstItem = Array.isArray(transactionItems)
        ? asRecord(transactionItems[0])
        : {};

    return {
        ...responseObject,
        transactionReference: pickReference(
            responseObject.transactionReference,
            data.transactionReference,
            upperData.TransactionReference,
            responseObject.TxnRef,
            firstItem.TxnRef,
            firstItem.txnRef,
            receipt.gatewayReference,
            receipt.transactionReference,
            dataReceipt.gatewayReference,
            upperDataReceipt.GatewayReference,
            receipt.merchantReference
        ),
        paymentReference: pickReference(
            responseObject.paymentReference,
            data.paymentReference,
            upperData.PaymentRef,
            responseObject.PaymentRef,
            firstItem.PaymentRef,
            firstItem.paymentRef,
            receipt.paymentReference,
            receipt.PaymentReference,
            dataReceipt.paymentReference,
            upperDataReceipt.PaymentReference,
            upperDataReceipt.PaymentRef
        ),
        transactionItems: Array.isArray(transactionItems) ? transactionItems : undefined
    };
};
