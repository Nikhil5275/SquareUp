import type { NextApiRequest, NextApiResponse } from 'next';
import { adminDb } from '../../firebaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { token, userEmail, userId } = req.body;

        if (!token || !userEmail || !userId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        try {
            // Check if adminDb is initialized
            if (!adminDb) {
                return res.status(500).json({
                    message: "Firebase Admin SDK not initialized. Please check service account configuration.",
                    error: "Firebase Admin SDK not initialized"
                });
            }

            const inviteRef = adminDb.collection("invitations").doc(token);
            const inviteSnap = await inviteRef.get();

            if (!inviteSnap.exists) {
                return res.status(404).json({ message: 'Invitation not found or invalid.' });
            }

            const inviteData = inviteSnap.data();

            // Check if inviteData exists (even after exists() check, data() can return undefined)
            if (!inviteData) {
                return res.status(404).json({ message: 'Invitation data not found.' });
            }

            if (inviteData.used) {
                return res.status(400).json({ message: 'This invitation has already been used.' });
            }

            if (inviteData.expiresAt < Date.now()) {
                return res.status(400).json({ message: 'This invitation has expired.' });
            }

            if (inviteData.invitedEmail !== userEmail) {
                return res.status(403).json({ message: 'You must log in with the invited email address to accept this invitation.' });
            }

            const serverRef = adminDb.collection("servers").doc(inviteData.serverId);
            const serverSnap = await serverRef.get();

            if (!serverSnap.exists) {
                return res.status(404).json({ message: 'Server not found.' });
            }

            const serverData = serverSnap.data();
            if (!serverData) {
                return res.status(404).json({ message: 'Server data not found.' });
            }

            if (serverData.members?.includes(userEmail)) {
                // User is already a member, just mark invite as used and redirect
                await inviteRef.update({ used: true });
                return res.status(200).json({ message: 'You are already a member of this server.', serverName: serverData.name });
            }

            // Add member to the server
            await serverRef.update({
                members: [...(serverData.members || []), userEmail],
            });

            // Mark invitation as used
            await inviteRef.update({ used: true });

            res.status(200).json({ message: 'Successfully joined server', serverName: serverData.name });

        } catch (error) {
            console.error('Error handling invite:', error);
            res.status(500).json({ message: 'Failed to process invitation', error: (error as Error).message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
