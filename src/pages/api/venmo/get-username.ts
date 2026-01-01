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
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if adminDb is initialized
    if (!adminDb) {
      return res.status(500).json({ error: 'Firebase Admin SDK not initialized' });
    }

    // Get user's Venmo username
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(200).json({
        username: null,
        hasUsername: false,
      });
    }

    const userData = userDoc.data();
    const username = userData?.venmoUsername || null;

    res.status(200).json({
      username,
      hasUsername: !!username,
    });
  } catch (error: any) {
    console.error('Error fetching Venmo username:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch username' });
  }
}

