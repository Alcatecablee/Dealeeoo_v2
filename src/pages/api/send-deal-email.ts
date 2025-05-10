import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { buyerEmail, sellerEmail, dealLink } = req.body;

  if (!buyerEmail || !sellerEmail || !dealLink) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Send email to buyer
    await resend.emails.send({
      from: 'Dealeeoo <noreply@dealeeoo.com>',
      to: buyerEmail,
      subject: 'Your Dealeeoo Deal Has Been Created',
      html: `
        <h1>Your Dealeeoo Deal Has Been Created</h1>
        <p>Hello,</p>
        <p>Your deal has been created successfully. You can view and manage your deal at the following link:</p>
        <p><a href="${dealLink}">${dealLink}</a></p>
        <p>Thank you for using Dealeeoo!</p>
      `,
    });

    // Send email to seller
    await resend.emails.send({
      from: 'Dealeeoo <noreply@dealeeoo.com>',
      to: sellerEmail,
      subject: 'Your Dealeeoo Deal Has Been Created',
      html: `
        <h1>Your Dealeeoo Deal Has Been Created</h1>
        <p>Hello,</p>
        <p>Your deal has been created successfully. You can view and manage your deal at the following link:</p>
        <p><a href="${dealLink}">${dealLink}</a></p>
        <p>Thank you for using Dealeeoo!</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
} 