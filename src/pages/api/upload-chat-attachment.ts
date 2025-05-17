import { supabase } from '@/integrations/supabase/client';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const busboy = require('busboy');
  const bb = busboy({ headers: req.headers });
  let fileBuffer = Buffer.alloc(0);
  let fileName = '';
  let fileType = '';
  let fileSize = 0;
  let dealId = '';
  let uploadedBy = '';
  let messageId = null;

  bb.on('field', (fieldname, val) => {
    if (fieldname === 'dealId') dealId = val;
    if (fieldname === 'uploadedBy') uploadedBy = val;
    if (fieldname === 'messageId') messageId = val;
  });
  bb.on('file', (name, file, info) => {
    fileName = info.filename;
    fileType = info.mimeType;
    file.on('data', (data) => {
      fileBuffer = Buffer.concat([fileBuffer, data]);
      fileSize += data.length;
    });
  });
  bb.on('finish', async () => {
    try {
      const storagePath = `chat-attachments/${dealId}/${Date.now()}-${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(storagePath, fileBuffer, { contentType: fileType });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('attachments').getPublicUrl(storagePath);
      const fileUrl = urlData.publicUrl;
      const { error: dbError } = await supabase.from('chat_attachments').insert({
        deal_id: dealId,
        message_id: messageId,
        uploaded_by: uploadedBy,
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
      });
      if (dbError) throw dbError;
      res.status(200).json({ success: true, fileUrl });
    } catch (err) {
      res.status(500).json({ error: 'Failed to upload file', details: err.message });
    }
  });
  req.pipe(bb);
} 