import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { compare } from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { promisify } from 'util';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later.'
});

// Convert rate limiter to promise-based middleware
const rateLimitPromise = promisify(limiter);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Apply rate limiting
    await rateLimitPromise(req, res);

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Get admin credentials from Supabase
    const { data: adminData, error: adminError } = await supabase
      .from('admin_credentials')
      .select('password_hash')
      .single();

    if (adminError || !adminData) {
      console.error('Error fetching admin credentials:', adminError);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Compare password with hash
    const isValid = await compare(password, adminData.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Log successful login
    await supabase.from('admin_audit_logs').insert({
      action: 'login',
      status: 'success',
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      user_agent: req.headers['user-agent']
    });

    // Return success
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    
    // Log failed login attempt
    try {
      await supabase.from('admin_audit_logs').insert({
        action: 'login',
        status: 'failed',
        ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        user_agent: req.headers['user-agent'],
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
    } catch (logError) {
      console.error('Failed to log login attempt:', logError);
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
} 