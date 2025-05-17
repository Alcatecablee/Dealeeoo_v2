-- Update messages table for new chat features
ALTER TABLE messages RENAME COLUMN message TO content;
ALTER TABLE messages ADD COLUMN user_email text;
ALTER TABLE messages ADD COLUMN file_url text;
ALTER TABLE messages ADD COLUMN reactions jsonb DEFAULT '[]'; 