const express = require('express');
const { Resend } = require('resend');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.RESEND_API_KEY) {
  console.error('❌ Error: RESEND_API_KEY environment variable is not set');
  console.error('Please create a .env file in the server directory with your Resend API key');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Email endpoint
app.post('/api/send-deal-email', async (req, res) => {
  try {
    const { buyerEmail, sellerEmail, dealId, buyerToken, sellerToken } = req.body;
    
    // Validate required fields
    if (!buyerEmail || !sellerEmail || !dealId || !buyerToken || !sellerToken) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['buyerEmail', 'sellerEmail', 'dealId', 'buyerToken', 'sellerToken']
      });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    
    // Create deal links
    const buyerDealLink = `${baseUrl}/deal/${dealId}?token=${buyerToken}`;
    const sellerDealLink = `${baseUrl}/deal/${dealId}?token=${sellerToken}`;

    // Send emails in parallel
    await Promise.all([
      // Send to buyer
      resend.emails.send({
        from: 'Dealeeoo <deals@dealeeoo.com>',
        to: buyerEmail,
        subject: 'Your Dealeeoo Deal Link',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #14b8a6;">Your Dealeeoo Deal Is Ready</h2>
            <p>Click the secure link below to view and manage your deal:</p>
            <p>
              <a href="${buyerDealLink}" 
                 style="display: inline-block; 
                        padding: 10px 20px; 
                        background-color: #14b8a6; 
                        color: white; 
                        text-decoration: none; 
                        border-radius: 5px;">
                View Deal
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">
              Or copy this link: <br>
              ${buyerDealLink}
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              This link is unique to you. For security reasons, please don't share it unless absolutely necessary.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">
              — The Dealeeoo Team
            </p>
          </div>
        `
      }),
      // Send to seller
      resend.emails.send({
        from: 'Dealeeoo <deals@dealeeoo.com>',
        to: sellerEmail,
        subject: 'Your Dealeeoo Deal Link',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #14b8a6;">Your Dealeeoo Deal Is Ready</h2>
            <p>Click the secure link below to view and manage your deal:</p>
            <p>
              <a href="${sellerDealLink}" 
                 style="display: inline-block; 
                        padding: 10px 20px; 
                        background-color: #14b8a6; 
                        color: white; 
                        text-decoration: none; 
                        border-radius: 5px;">
                View Deal
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">
              Or copy this link: <br>
              ${sellerDealLink}
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              This link is unique to you. For security reasons, please don't share it unless absolutely necessary.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">
              — The Dealeeoo Team
            </p>
          </div>
        `
      })
    ]);

    res.json({ message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Failed to send emails:', error);
    res.status(500).json({ 
      error: 'Failed to send emails',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
