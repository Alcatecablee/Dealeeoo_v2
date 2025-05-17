const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { dealId, resolutionNote } = req.body;
  if (!dealId || !resolutionNote) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Fetch deal information
  const { data: deal, error } = await supabase
    .from('deals')
    .select('*')
    .eq('id', dealId)
    .single();

  if (error || !deal) {
    return res.status(404).json({ error: 'Deal not found' });
  }

  const dealLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/deal/${dealId}`;

  // Prepare email content
  const emailContent = {
    from: 'Dealeeoo <noreply@dealeeoo.com>',
    to: [deal.buyer_email, deal.seller_email, 'admin@dealeeoo.com'],
    subject: `Dispute Resolution: ${deal.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://dealeeoo.com/logo.png" alt="Dealeeoo Logo" style="max-width: 150px;">
        </div>
        <h1 style="color: #1e40af; margin-bottom: 20px; text-align: center;">Dispute Resolution Update</h1>
        
        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <p style="margin: 0; color: #0369a1;">A resolution has been reached for the disputed deal.</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="color: #1e40af; font-size: 18px; margin-bottom: 10px;">Deal Information</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Deal Title:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${deal.title}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Amount:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">$${deal.amount}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Buyer:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${deal.buyer_email}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;"><strong>Seller:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${deal.seller_email}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="color: #1e40af; font-size: 18px; margin-bottom: 10px;">Resolution Details</h2>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px;">
            <p style="margin: 0; white-space: pre-wrap;">${resolutionNote}</p>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <p>Click the button below to view the complete deal details:</p>
          <a href="${dealLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 10px 0;">View Deal Details</a>
        </div>

        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="color: #1e40af; margin-bottom: 10px;">Next Steps</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Review the resolution details carefully</li>
            <li>Contact our support team if you have any questions</li>
            <li>Complete any required actions as specified in the resolution</li>
            <li>Keep all communication within the Dealeeoo platform</li>
          </ul>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
          <p>This is an automated message from Dealeeoo. Please do not reply to this email.</p>
          <p>If you need assistance, please contact our support team.</p>
        </div>
      </div>
    `
  };

  // Send email
  try {
    await resend.emails.send(emailContent);
    return res.status(200).json({ success: true });
  } catch (emailErr) {
    console.error('Failed to send email:', emailErr);
    return res.status(500).json({ error: 'Failed to send email', details: emailErr });
  }
}; 