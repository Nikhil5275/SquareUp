import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

// Configure your email transporter
// For development, you can use Ethereal Email: https://ethereal.email/
// For production, use a service like SendGrid, Mailgun, or AWS SES
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'your_ethereal_user',
    pass: process.env.EMAIL_PASS || 'your_ethereal_pass',
  },
});

interface SendInviteEmailProps {
  to: string;
  inviteLink: string;
  serverName: string;
  senderName: string;
}

const sendInviteEmail = async ({ to, inviteLink, serverName, senderName }: SendInviteEmailProps) => {
  // For testing purposes, send a simple email if proper config isn't set up
  const hasProperConfig = process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_ethereal_user';

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"SquareUp" <no-reply@squareup.com>',
    to,
    subject: hasProperConfig ? `You're invited to join ${serverName} on SquareUp!` : 'Test',
    html: hasProperConfig ? `
      <p>Hello,</p>
      <p><b>${senderName}</b> has invited you to join the server <b>${serverName}</b> on SquareUp.</p>
      <p>To join, please click on the link below:</p>
      <p><a href="${inviteLink}">${inviteLink}</a></p>
      <p>If you don't have an account, you will be prompted to create one.</p>
      <p>Thanks,</p>
      <p>The SquareUp Team</p>
    ` : `
      <p>Hello,</p>
      <p>This is a test invitation email from SquareUp.</p>
      <p>Invite link: <a href="${inviteLink}">${inviteLink}</a></p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return { success: true, previewUrl: nodemailer.getTestMessageUrl(info) };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: (error as Error).message };
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { to, inviteLink, serverName, senderName } = req.body;

    if (!to || !inviteLink || !serverName || !senderName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const result = await sendInviteEmail({ to, inviteLink, serverName, senderName });

    if (result.success) {
      res.status(200).json({ message: 'Invitation email sent successfully', previewUrl: result.previewUrl });
    } else {
      res.status(500).json({ message: 'Failed to send invitation email', error: result.error });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}