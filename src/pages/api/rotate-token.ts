import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { Resend } from 'resend';
import rateLimit from 'express-rate-limit';
import { promisify } from 'util';

const resend = new Resend(process.env.RESEND_API_KEY);

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: 'Too many token rotation requests, please try again later.'
});

// Convert rate limiter to promise-based middleware
const rateLimitPromise = promisify(limiter);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Apply rate limiting
    await rateLimitPromise(req, res);

    const { dealId, userRole, email } = req.body;
    if (!dealId || !userRole || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch the deal
    const { data: deal, error } = await supabase
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .single();

    if (error || !deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Verify user role matches email
    if ((userRole === 'buyer' && email !== deal.buyer_email) ||
        (userRole === 'seller' && email !== deal.seller_email)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Generate new token and expiry
    const newToken = uuidv4();
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    let updateObj = {};
    let dealLink = '';
    if (userRole === 'buyer') {
      updateObj = { buyer_access_token: newToken, buyer_token_expires_at: newExpiry };
      dealLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://dealeeoo.com'}/deal/${dealId}?token=${newToken}`;
    } else if (userRole === 'seller') {
      updateObj = { seller_access_token: newToken, seller_token_expires_at: newExpiry };
      dealLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://dealeeoo.com'}/deal/${dealId}?token=${newToken}`;
    } else {
      return res.status(400).json({ error: 'Invalid user role' });
    }

    // Update the deal
    const { error: updateError } = await supabase
      .from('deals')
      .update(updateObj)
      .eq('id', dealId);

    if (updateError) {
      return res.status(500).json({ error: 'Failed to update token' });
    }

    // Log token rotation
    await supabase.from('token_audit_logs').insert({
      deal_id: dealId,
      user_role: userRole,
      user_email: email,
      action: 'rotate',
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      user_agent: req.headers['user-agent']
    });

    // Prepare email content
    const emailContent = {
      from: 'Dealeeoo <noreply@dealeeoo.com>',
      to: email,
      subject: 'Your New Dealeeoo Deal Access Link',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://dealeeoo.com/logo.png" alt="Dealeeoo Logo" style="max-width: 150px;">
          </div>
          <h1 style="color: #1e40af; margin-bottom: 20px; text-align: center;">New Access Link Generated</h1>
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <p style="margin: 0; color: #0369a1;">A new secure access link has been generated for your deal.</p>
          </div>
          <div style="margin-bottom: 20px;">
            <p>Hello ${userRole === 'buyer' ? 'Buyer' : 'Seller'},</p>
            <p>As requested, we've generated a new secure access link for your deal:</p>
            <p><strong>Deal Title:</strong> ${deal.title}</p>
            <p><strong>Amount:</strong> $${deal.amount}</p>
          </div>
          <div style="margin-bottom: 20px;">
            <p>Click the button below to access your deal:</p>
            <a href="${dealLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 10px 0;">Access Your Deal</a>
          </div>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #1e40af; margin-bottom: 10px;">Security Information</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>This link is unique to you and should not be shared</li>
              <li>The link will expire on ${new Date(newExpiry).toLocaleString()}</li>
              <li>For security reasons, we recommend accessing the deal immediately</li>
              <li>You can request a new link at any time if needed</li>
            </ul>
          </div>
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #dc2626; margin-bottom: 10px;">Important Security Notice</h3>
            <p style="margin: 0; color: #991b1b;">If you did not request this new access link, please contact our support team immediately.</p>
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
      return res.status(500).json({ error: 'Failed to send email', details: emailErr });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
} 