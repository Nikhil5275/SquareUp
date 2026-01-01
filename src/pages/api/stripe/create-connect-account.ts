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
    const { userId, email, name } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'Missing userId or email' });
    }

    // Check if adminDb is initialized
    if (!adminDb) {
      return res.status(500).json({ error: 'Firebase Admin SDK not initialized' });
    }

    // Check if user already has a connected account
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData?.stripeAccountId) {
        return res.status(200).json({
          accountId: userData.stripeAccountId,
          message: 'Account already exists',
        });
      }
    }

    // Create Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US', // You can make this dynamic
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        userId: userId,
        name: name || email,
      },
    });

    // Save account ID to Firestore
    await userRef.set({
      userId,
      email,
      name: name || email,
      stripeAccountId: account.id,
      stripeAccountStatus: 'pending',
      createdAt: Date.now(),
    }, { merge: true });

    res.status(200).json({
      accountId: account.id,
      message: 'Account created successfully',
    });
  } catch (error: any) {
    console.error('Stripe Connect error:', error);
    res.status(500).json({ error: error.message || 'Failed to create account' });
  }
}

