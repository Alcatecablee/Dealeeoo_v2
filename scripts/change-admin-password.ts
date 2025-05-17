import { createClient } from '@supabase/supabase-js';
import { hash } from 'bcryptjs';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function changeAdminPassword() {
  try {
    // Check if admin credentials exist
    const { data: existingAdmin } = await supabase
      .from('admin_credentials')
      .select('id')
      .single();

    if (!existingAdmin) {
      console.log('No admin credentials found. Please run setup-admin script first.');
      process.exit(1);
    }

    // Get new password
    const newPassword = await new Promise<string>((resolve) => {
      rl.question('Enter new admin password: ', (password) => {
        resolve(password);
      });
    });

    if (!newPassword) {
      console.log('Password cannot be empty.');
      process.exit(1);
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await hash(newPassword, saltRounds);

    // Update admin credentials
    const { error } = await supabase
      .from('admin_credentials')
      .update({ password_hash: passwordHash })
      .eq('id', existingAdmin.id);

    if (error) {
      throw error;
    }

    console.log('Admin password updated successfully.');
  } catch (error) {
    console.error('Error changing admin password:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

changeAdminPassword(); 