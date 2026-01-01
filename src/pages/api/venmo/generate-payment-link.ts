import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../../firebaseAdmin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, recipientUserId, recipientName, note } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!recipientUserId && !recipientName) {
      return res.status(400).json({ error: 'Recipient is required' });
    }

    let venmoUsername: string | null = null;

    // Try to find recipient's Venmo username
    if (recipientUserId && adminDb) {
      try {
        const userRef = adminDb.collection('users').doc(recipientUserId);
        const userDoc = await userRef.get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          venmoUsername = userData?.venmoUsername || null;
        }
      } catch (error) {
        console.error('Error fetching recipient Venmo username:', error);
      }
    }

    // If no username found, try to find by name
    if (!venmoUsername && recipientName && adminDb) {
      try {
        const usersQuery = await adminDb.collection('users')
          .where('name', '==', recipientName)
          .limit(1)
          .get();

        if (!usersQuery.empty) {
          const userData = usersQuery.docs[0].data();
          venmoUsername = userData?.venmoUsername || null;
        }
      } catch (error) {
        console.error('Error finding user by name:', error);
      }
    }

    // Generate Venmo payment link
    // Venmo URL format: venmo://paycharge?txn=pay&recipients=USERNAME&amount=AMOUNT&note=NOTE
    let venmoLink: string | null = null;
    let venmoWebLink: string | null = null;

    if (venmoUsername) {
      // Deep link for mobile app
      venmoLink = `venmo://paycharge?txn=pay&recipients=${encodeURIComponent(venmoUsername)}&amount=${amount}&note=${encodeURIComponent(note || 'SquareUp payment')}`;
      
      // Web link as fallback
      venmoWebLink = `https://venmo.com/${encodeURIComponent(venmoUsername)}?txn=pay&amount=${amount}&note=${encodeURIComponent(note || 'SquareUp payment')}`;
    }

    res.status(200).json({
      venmoLink,
      venmoWebLink,
      venmoUsername,
      hasVenmoUsername: !!venmoUsername,
      amount,
      note: note || 'SquareUp payment',
    });
  } catch (error: any) {
    console.error('Venmo link generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate Venmo link' });
  }
}

