import { useState } from "react";
import { Debt } from "../types";

export const usePayment = () => {
    const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
    const [paymentProvider, setPaymentProvider] = useState<string>('stripe');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [venmoPaymentData, setVenmoPaymentData] = useState<{
        venmoLink: string | null;
        venmoWebLink: string | null;
        venmoUsername: string | null;
        hasVenmoUsername: boolean;
    } | null>(null);

    const initiatePayment = (debt: { from: string; to: string; amount: number }, index: number) => {
        setSelectedDebt({ ...debt, index });
    };

    const processStripePayment = async (debt: Debt, serverId: string | null, userId: string, recipientUserId?: string) => {
        const response = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: debt.amount,
                description: `Payment from ${debt.from} to ${debt.to}`,
                metadata: {
                    from: debt.from,
                    to: debt.to,
                    serverId: serverId || '',
                    userId: userId,
                    recipientUserId: recipientUserId || '',
                    debtIndex: debt.index.toString(),
                },
                successUrl: `${window.location.origin}/?payment=success&debtIndex=${debt.index}`,
                cancelUrl: `${window.location.origin}/?payment=cancelled`,
            }),
        });

        const { url, sessionId, error } = await response.json();

        if (error) {
            throw new Error(error);
        }

        if (!url) {
            throw new Error('Failed to create checkout session');
        }

        // Redirect to Stripe Checkout
        window.location.href = url;
    };

    const processVenmoPayment = async (
        debt: Debt,
        recipientUserId: string | null,
        generatePaymentLink: (amount: number, recipientUserId: string | null, recipientName: string, note?: string) => Promise<any>
    ) => {
        const paymentData = await generatePaymentLink(
            debt.amount,
            recipientUserId,
            debt.to,
            `Payment from ${debt.from} to ${debt.to}`
        );

        setVenmoPaymentData(paymentData);
        setIsProcessingPayment(false);
        return paymentData;
    };

    const processPayment = async (
        serverId: string | null,
        userId: string,
        onPaymentSuccess: (debtIndex: number) => void,
        generateVenmoLink?: (amount: number, recipientUserId: string | null, recipientName: string, note?: string) => Promise<any>,
        recipientUserId?: string | null
    ) => {
        if (!selectedDebt) return;

        setIsProcessingPayment(true);

        try {
            if (paymentProvider === 'stripe') {
                // For Stripe, redirect immediately - cleanup will happen via URL params on return
                await processStripePayment(selectedDebt, serverId, userId, recipientUserId || undefined);
                // Note: window.location.href redirect happens here, so code below won't execute
            } else if (paymentProvider === 'venmo') {
                // For Venmo, generate payment link and show modal
                if (generateVenmoLink) {
                    await processVenmoPayment(selectedDebt, recipientUserId || null, generateVenmoLink);
                } else {
                    throw new Error('Venmo link generator not available');
                }
            } else if (paymentProvider === 'paypal') {
                // For PayPal, simulate the process (to be implemented)
                setTimeout(() => {
                    onPaymentSuccess(selectedDebt.index);
                    setIsProcessingPayment(false);
                    setSelectedDebt(null);
                }, 2000);
            }
        } catch (error: any) {
            console.error('Payment error:', error);
            setIsProcessingPayment(false);
            throw error;
        }
    };

    const closePaymentModal = () => {
        setSelectedDebt(null);
        setIsProcessingPayment(false);
        setVenmoPaymentData(null);
    };

    const markVenmoAsPaid = (onPaymentSuccess: (debtIndex: number) => void) => {
        if (!selectedDebt) return;
        onPaymentSuccess(selectedDebt.index);
        closePaymentModal();
    };

    return {
        selectedDebt,
        paymentProvider,
        isProcessingPayment,
        venmoPaymentData,
        setPaymentProvider,
        initiatePayment,
        processPayment,
        closePaymentModal,
        markVenmoAsPaid,
    };
};
