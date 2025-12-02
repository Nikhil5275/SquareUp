import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { token, userEmail, userId } = req.body;

    if (!token || !userEmail || !userId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const inviteRef = doc(db, "invitations", token);
      const inviteSnap = await getDoc(inviteRef);

      if (!inviteSnap.exists()) {
        return res.status(404).json({ message: 'Invitation not found or invalid.' });
      }

      const inviteData = inviteSnap.data();

      if (inviteData.used) {
        return res.status(400).json({ message: 'This invitation has already been used.' });
      }

      if (inviteData.expiresAt < Date.now()) {
        return res.status(400).json({ message: 'This invitation has expired.' });
      }

      if (inviteData.invitedEmail !== userEmail) {
        return res.status(403).json({ message: 'You must log in with the invited email address to accept this invitation.' });
      }

      const serverRef = doc(db, "servers", inviteData.serverId);
      const serverSnap = await getDoc(serverRef);

      if (!serverSnap.exists()) {
        return res.status(404).json({ message: 'Server not found.' });
      }

      const serverData = serverSnap.data();
      if (serverData.members.includes(userEmail)) {
        // User is already a member, just mark invite as used and redirect
        await updateDoc(inviteRef, { used: true });
        return res.status(200).json({ message: 'You are already a member of this server.', serverName: serverData.name });
      }

      // Add member to the server
      await updateDoc(serverRef, {
        members: arrayUnion(userEmail),
      });

      // Mark invitation as used
      await updateDoc(inviteRef, { used: true });

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
