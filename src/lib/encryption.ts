import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-fallback-encryption-key-min-32-chars!!';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

function getKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256');
}

export function encrypt(text: string): string {
  // Generate a random salt
  const salt = crypto.randomBytes(SALT_LENGTH);
  
  // Generate a random initialization vector
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Generate key using the salt
  const key = getKey(ENCRYPTION_KEY, salt);
  
  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  // Encrypt the text
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  
  // Get the auth tag
  const tag = cipher.getAuthTag();
  
  // Combine everything into a single buffer
  const result = Buffer.concat([salt, iv, tag, encrypted]);
  
  // Return as base64 string
  return result.toString('base64');
}

export function decrypt(encryptedData: string): string {
  // Convert from base64
  const buffer = Buffer.from(encryptedData, 'base64');
  
  // Extract the salt, iv, tag and encrypted data
  const salt = buffer.slice(0, SALT_LENGTH);
  const iv = buffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = buffer.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = buffer.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  
  // Generate key using the salt
  const key = getKey(ENCRYPTION_KEY, salt);
  
  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  // Decrypt the data
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  
  // Return as string
  return decrypted.toString('utf8');
} 