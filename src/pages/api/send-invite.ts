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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h1 style="color: #0070BA; text-align: center; margin-bottom: 20px;">🎉 You're Invited!</h1>
          <p style="font-size: 16px; line-height: 1.6;">Hello,</p>
          <p style="font-size: 16px; line-height: 1.6;"><b>${senderName}</b> has invited you to join the <b>"${serverName}"</b> group on SquareUp!</p>
          <p style="font-size: 16px; line-height: 1.6;">SquareUp is an expense management app that helps groups track and split expenses fairly with friends and family.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}"
               style="background-color: #0070BA; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(0,112,186,0.3);">
              🚀 Join "${serverName}"
            </a>
          </div>

          <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0070BA; margin-top: 0;">What happens when you join?</h3>
            <ul style="color: #333; padding-left: 20px;">
              <li>You'll be added to the shared "${serverName}" server</li>
              <li>You can track expenses and split costs with group members in real-time</li>
              <li>You can invite others to join this shared expense group</li>
              <li>Access to all SquareUp features for managing shared expenses</li>
            </ul>
          </div>

          <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
            Welcome to the SquareUp community! 🎉<br>
            <small>The SquareUp Team</small>
          </p>
        </div>
      </div>
    ` : `
      <p>Hello,</p>
      <p>This is a test invitation email from SquareUp.</p>
      <p>Invite link: <a href="${inviteLink}">${inviteLink}</a></p>
    `,
        text: hasProperConfig ? `
🎉 You're Invited to "${serverName}"!

${senderName} has invited you to join the "${serverName}" group on SquareUp!

SquareUp helps groups track and split expenses fairly with friends and family.

When you join, you'll get:
- Access to the shared "${serverName}" server
- Real-time expense tracking with group members
- Tools to split costs fairly
- Ability to invite others to join

Click here to join: ${inviteLink}

Welcome to the community! 🎉

The SquareUp Team
    ` : `
This is a test invitation email from SquareUp.
Invite link: ${inviteLink}
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