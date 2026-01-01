import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { adminDb } from '../../../firebaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Check if adminDb is initialized
    if (!adminDb) {
      return res.status(500).json({ error: 'Firebase Admin SDK not initialized' });
    }

    // Get user's Stripe account ID
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(200).json({
        hasAccount: false,
        status: 'none',
      });
    }

    const userData = userDoc.data();
    const accountId = userData?.stripeAccountId;

    if (!accountId) {
      return res.status(200).json({
        hasAccount: false,
        status: 'none',
      });
    }

    // Check account status with Stripe
    const account = await stripe.accounts.retrieve(accountId);

    // Update status in Firestore
    const status = account.details_submitted && account.charges_enabled ? 'active' : 'pending';
    await userRef.update({
      stripeAccountStatus: status,
    });

    res.status(200).json({
      hasAccount: true,
      accountId: accountId,
      status: status,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    });
  } catch (error: any) {
    console.error('Stripe account status error:', error);
    res.status(500).json({ error: error.message || 'Failed to check account status' });
  }
}

