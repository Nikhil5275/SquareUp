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
    const { userId, username } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Clean username (remove @ and whitespace)
    const cleanUsername = username.trim().replace(/^@/, '').toLowerCase();

    // Validate username format (alphanumeric, hyphens, underscores)
    if (!/^[a-z0-9_-]+$/.test(cleanUsername)) {
      return res.status(400).json({ error: 'Invalid username format. Use only letters, numbers, hyphens, and underscores.' });
    }

    // Check if adminDb is initialized
    if (!adminDb) {
      return res.status(500).json({ error: 'Firebase Admin SDK not initialized' });
    }

    // Save to Firestore
    const userRef = adminDb.collection('users').doc(userId);
    await userRef.set({
      venmoUsername: cleanUsername,
      updatedAt: Date.now(),
    }, { merge: true });

    res.status(200).json({
      success: true,
      username: cleanUsername,
    });
  } catch (error: any) {
    console.error('Error saving Venmo username:', error);
    res.status(500).json({ error: error.message || 'Failed to save username' });
  }
}

