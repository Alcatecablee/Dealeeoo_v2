import { createClient } from '@supabase/supabase-js';
import { hash } from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function setupAdmin() {
  try {
    // Check if admin credentials already exist
    const { data: existingAdmin } = await supabase
      .from('admin_credentials')
      .select('id')
      .single();

    if (existingAdmin) {
      console.log('Admin credentials already exist. Use the change-password script to update the password.');
      process.exit(0);
    }

    // Get password from command line or use default
    const password = process.argv[2] || 'admin123';
    
    // Hash password
    const saltRounds = 12;
    const passwordHash = await hash(password, saltRounds);

    // Insert admin credentials
    const { error } = await supabase
      .from('admin_credentials')
      .insert({ password_hash: passwordHash });

    if (error) {
      throw error;
    }

    console.log('Admin credentials created successfully.');
    console.log('Please change the password immediately after first login.');
  } catch (error) {
    console.error('Error setting up admin:', error);
    process.exit(1);
  }
}

setupAdmin(); 