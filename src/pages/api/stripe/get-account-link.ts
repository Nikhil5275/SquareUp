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
    const { userId, accountId } = req.body;

    if (!userId || !accountId) {
      return res.status(400).json({ error: 'Missing userId or accountId' });
    }

    // Check if adminDb is initialized
    if (!adminDb) {
      return res.status(500).json({ error: 'Firebase Admin SDK not initialized' });
    }

    // Verify the account belongs to this user
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    if (userData?.stripeAccountId !== accountId) {
      return res.status(403).json({ error: 'Account does not belong to user' });
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${req.headers.origin || 'http://localhost:3000'}/settings?stripe=refresh`,
      return_url: `${req.headers.origin || 'http://localhost:3000'}/settings?stripe=success`,
      type: 'account_onboarding',
    });

    res.status(200).json({
      url: accountLink.url,
    });
  } catch (error: any) {
    console.error('Stripe account link error:', error);
    res.status(500).json({ error: error.message || 'Failed to create account link' });
  }
}

