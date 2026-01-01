import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { adminDb } from '../../firebaseAdmin';

// Initialize Stripe with secret key
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
    const { amount, currency = 'usd', description, metadata, successUrl, cancelUrl } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Get recipient's Stripe account ID from metadata
    const recipientName = metadata?.to;
    const recipientUserId = metadata?.recipientUserId;

    let connectedAccountId: string | undefined;

    // Try to find recipient's Stripe account
    if (recipientUserId && adminDb) {
      try {
        const userRef = adminDb.collection('users').doc(recipientUserId);
        const userDoc = await userRef.get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          if (userData?.stripeAccountId && userData?.stripeAccountStatus === 'active') {
            connectedAccountId = userData.stripeAccountId;
          }
        }
      } catch (error) {
        console.error('Error fetching recipient account:', error);
      }
    }

    // If no connected account, try to find by name (fallback)
    if (!connectedAccountId && recipientName && adminDb) {
      try {
        const usersQuery = await adminDb.collection('users')
          .where('name', '==', recipientName)
          .limit(1)
          .get();

        if (!usersQuery.empty) {
          const userData = usersQuery.docs[0].data();
          if (userData?.stripeAccountId && userData?.stripeAccountStatus === 'active') {
            connectedAccountId = userData.stripeAccountId;
          }
        }
      } catch (error) {
        console.error('Error finding user by name:', error);
      }
    }

    // Calculate application fee (2.9% + $0.30, or you can customize)
    const applicationFeeAmount = Math.round(amount * 100 * 0.029 + 30); // 2.9% + $0.30

    // Create Checkout Session with Connect
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: description || 'SquareUp Expense Payment',
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${req.headers.origin || 'http://localhost:3000'}/?payment=success`,
      cancel_url: cancelUrl || `${req.headers.origin || 'http://localhost:3000'}/?payment=cancelled`,
      metadata: metadata || {},
    };

    // If recipient has a connected account, use destination charge
    // This sends the payment directly to the connected account
    if (connectedAccountId) {
      sessionParams.payment_intent_data = {
        application_fee_amount: applicationFeeAmount,
        on_behalf_of: connectedAccountId,
        transfer_data: {
          destination: connectedAccountId,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    res.status(200).json({
      sessionId: session.id,
      url: session.url,
      connectedAccountId: connectedAccountId || null,
      recipientHasAccount: !!connectedAccountId,
    });
  } catch (error: any) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message || 'Payment processing failed' });
  }
}

