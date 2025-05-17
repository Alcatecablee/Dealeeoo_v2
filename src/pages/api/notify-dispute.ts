import { Resend } from 'resend';
import { supabase } from '@/integrations/supabase/client';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { dealId, disputeReason, userRole, userEmail } = req.body;

  if (!dealId || !disputeReason || !userRole || !userEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Fetch deal details
    const { data: deal, error } = await supabase
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .single();

    if (error || !deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@dealeeoo.com';
    const dealLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://dealeeoo.com'}/deal/${dealId}`;
    const disputeDate = new Date().toLocaleString();

    // Prepare email content
    const emailContent = {
      subject: `Dispute Filed: ${deal.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://dealeeoo.com/logo.png" alt="Dealeeoo Logo" style="max-width: 150px;">
          </div>
          <h2 style="color: #dc2626; margin-bottom: 20px;">Dispute Filed</h2>
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <p style="margin: 0; color: #991b1b;">A dispute has been filed for the following deal:</p>
          </div>
          <div style="margin-bottom: 20px;">
            <p><strong>Deal Title:</strong> ${deal.title}</p>
            <p><strong>Amount:</strong> $${deal.amount}</p>
            <p><strong>Filed By:</strong> ${userRole} (${userEmail})</p>
            <p><strong>Date Filed:</strong> ${disputeDate}</p>
            <p><strong>Reason for Dispute:</strong></p>
            <div style="background-color: #f3f4f6; padding: 10px; border-radius: 4px; margin-top: 5px;">
              ${disputeReason}
            </div>
          </div>
          <div style="margin-bottom: 20px;">
            <p>You can view the full details of this deal and the dispute at:</p>
            <a href="${dealLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Deal</a>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
            <p>This is an automated message from Dealeeoo. Please do not reply to this email.</p>
            <p>If you need assistance, please contact our support team.</p>
          </div>
        </div>
      `
    };

    // Send emails to all parties
    const emailPromises = [
      // Notify buyer
      resend.emails.send({
        from: 'Dealeeoo <noreply@dealeeoo.com>',
        to: deal.buyer_email,
        ...emailContent
      }),
      // Notify seller
      resend.emails.send({
        from: 'Dealeeoo <noreply@dealeeoo.com>',
        to: deal.seller_email,
        ...emailContent
      }),
      // Notify admin
      resend.emails.send({
        from: 'Dealeeoo <noreply@dealeeoo.com>',
        to: adminEmail,
        subject: `[ADMIN] ${emailContent.subject}`,
        html: emailContent.html + `
          <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-radius: 6px;">
            <h3 style="color: #1e40af; margin-bottom: 10px;">Admin Actions Required</h3>
            <p>Please review this dispute and take appropriate action:</p>
            <ol>
              <li>Review the dispute reason and deal details</li>
              <li>Contact both parties if additional information is needed</li>
              <li>Update the deal status in the admin dashboard</li>
              <li>Document your resolution process</li>
            </ol>
            <a href="${process.env.ADMIN_DASHBOARD_URL || 'https://dealeeoo.com/admin'}" style="display: inline-block; background-color: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Go to Admin Dashboard</a>
          </div>
        `
      })
    ];

    // Add notifications for dispute
    const notifications = [];
    if (deal.buyer_email !== userEmail) {
      notifications.push(supabase.from('notifications').insert({
        user_email: deal.buyer_email,
        type: 'dispute',
        message: `A dispute has been filed on your deal by the ${userRole}.`,
        deal_id: dealId,
        link: `/deal/${dealId}`
      }));
    }
    if (deal.seller_email !== userEmail) {
      notifications.push(supabase.from('notifications').insert({
        user_email: deal.seller_email,
        type: 'dispute',
        message: `A dispute has been filed on your deal by the ${userRole}.`,
        deal_id: dealId,
        link: `/deal/${dealId}`
      }));
    }
    notifications.push(supabase.from('notifications').insert({
      user_email: adminEmail,
      type: 'dispute',
      message: `A dispute has been filed for deal: ${deal.title}.`,
      deal_id: dealId,
      link: `/admin/deals/${dealId}`
    }));
    await Promise.all([...emailPromises, ...notifications]);

    // Update deal status to disputed
    await supabase
      .from('deals')
      .update({
        status: 'disputed',
        dispute_reason: disputeReason,
        disputed_at: new Date().toISOString(),
        disputed_by: userEmail
      })
      .eq('id', dealId);

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to process dispute notification' });
  }
} 