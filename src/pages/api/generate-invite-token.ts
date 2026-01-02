import type { NextApiRequest, NextApiResponse } from 'next';
// Removed client-side Firestore imports as we are using Admin SDK's Firestore
import { v4 as uuidv4 } from 'uuid';
import { adminAuth, adminDb } from '../../firebaseAdmin'; // Import adminAuth and adminDb directly

interface CreateInviteTokenRequest {
  invitedEmail: string;
  serverId: string;
  serverName: string;
  senderName: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { invitedEmail, serverId, serverName, senderName }: CreateInviteTokenRequest = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or invalid.' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    if (!invitedEmail || !serverId || !serverName || !senderName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    console.log("API Route: Received request to generate invite token.");
    console.log("API Route: Checking adminAuth and adminDb initialization.");

    try {
      if (!adminAuth || !adminDb) {
        console.error("API Route Error: Firebase Admin SDK components are not initialized. adminAuth: ", !!adminAuth, ", adminDb: ", !!adminDb);
        return res.status(500).json({
          message: "Firebase Admin SDK not initialized. Please check service account configuration.",
          error: "Firebase Admin SDK not initialized"
        });
      }

      console.log("API Route: adminAuth and adminDb are initialized.");

      // Verify the ID token
      let decodedToken;
      try {
        decodedToken = await adminAuth.verifyIdToken(idToken);
        console.log("API Route: ID Token verified. Sender UID:", decodedToken.uid);
      } catch (tokenError: any) {
        console.error("API Route: ID Token verification failed:", tokenError);
        return res.status(401).json({
          message: "Invalid authentication token.",
          error: tokenError.message
        });
      }

      const token = uuidv4();
      const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days from now

      const inviteRef = adminDb.collection("invitations").doc(token);
      console.log("API Route: Attempting to write invitation to Firestore...");

      try {
        console.log("API Route: Attempting to write invitation to Firestore...");
        await inviteRef.set({
          token,
          invitedEmail,
          serverId,
          serverName,
          senderName,
          senderId: decodedToken.uid,
          createdAt: Date.now(),
          expiresAt,
          used: false,
        });
        console.log("API Route: Invitation document successfully set in Firestore.");
      } catch (firestoreError: any) {
        console.error("API Route: Firestore write failed:", firestoreError);
        console.error("API Route: Error details:", {
          code: firestoreError.code,
          details: firestoreError.details,
          metadata: firestoreError.metadata,
          message: firestoreError.message
        });

        // Provide specific error messages based on the error type
        if (firestoreError.code === 16) {
          return res.status(500).json({
            message: "Firebase service account authentication failed. Please check service account permissions.",
            error: "Service account authentication error. Ensure the service account has Firestore access.",
            details: "Go to Firebase Console > Project Settings > Service Accounts and verify permissions."
          });
        } else if (firestoreError.code === 7) {
          return res.status(500).json({
            message: "Firestore permission denied. Service account lacks required permissions.",
            error: firestoreError.message
          });
        } else {
          return res.status(500).json({
            message: "Failed to save invitation to database.",
            error: firestoreError.message
          });
        }
      }

      // DEBUG: Hardcoding for Netlify bug test
      const baseUrl = 'https://square-up1.netlify.app';
      console.log('API INVITE: BASE_URL:', process.env.BASE_URL);
      console.log('API INVITE: NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);
      const inviteLink = `${baseUrl}/join?token=${token}`;

      res.status(200).json({ message: 'Invitation token generated (hardcoded BASE_URL)', inviteLink, token });
    } catch (error) {
      console.error('Error generating invite token:', error);
      if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/argument-error') {
        return res.status(401).json({ message: 'Invalid ID token.', error: (error as unknown as Error).message });
      }
      res.status(500).json({ message: 'Failed to generate invitation token', error: (error as unknown as Error).message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
