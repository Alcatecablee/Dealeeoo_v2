import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Paperclip, Smile, ThumbsUp } from 'lucide-react';

interface DealChatProps {
  dealId: string;
  userEmail: string;
}

interface Message {
  id: string;
  deal_id: string;
  sender_email: string;
  message: string;
  file_url?: string;
  created_at: string;
}

interface TypingStatus {
  sender_email: string;
  is_typing: boolean;
}

const DealChat: React.FC<DealChatProps> = ({ dealId, userEmail }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [othersTyping, setOthersTyping] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Fetch error:', error);
      } else {
        const normalized = (data || []).map((msg: any) => ({
          ...msg,
          message: msg.message || '',
          sender_email: msg.sender_email || '',
        }));
        setMessages(normalized);
      }
    };

    fetchMessages();
  }, [dealId]);

  useEffect(() => {
    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `deal_id=eq.${dealId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [dealId]);

  useEffect(() => {
    const sub = supabase
      .channel('public:chat_typing')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_typing',
        filter: `deal_id=eq.${dealId}`,
      }, (payload) => {
        const updated = payload.new as TypingStatus;
        if (updated.sender_email !== userEmail) {
          setOthersTyping((prev) => {
            const isAlready = prev.includes(updated.sender_email);
            if (updated.is_typing && !isAlready) {
              return [...prev, updated.sender_email];
            } else if (!updated.is_typing && isAlready) {
              return prev.filter(e => e !== updated.sender_email);
            }
            return prev;
          });
        }
      })
      .subscribe();

    return () => supabase.removeChannel(sub);
  }, [dealId, userEmail]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const { error } = await supabase.from('messages').insert({
      deal_id: dealId,
      sender_email: userEmail,
      message: newMessage,
    });

    if (error) {
      console.error('Insert error:', error);
    } else {
      setNewMessage('');
      // Refresh messages
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: true });
      const normalized = (data || []).map((msg: any) => ({
        ...msg,
        message: msg.message || '',
        sender_email: msg.sender_email || '',
      }));
      setMessages(normalized);
    }
  };

  const handleTyping = async (text: string) => {
    setNewMessage(text);

    try {
      await supabase.from('chat_typing').upsert([
        { deal_id: dealId, sender_email: userEmail, is_typing: true },
      ]);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(async () => {
        await supabase.from('chat_typing').upsert([
          { deal_id: dealId, sender_email: userEmail, is_typing: false },
        ]);
      }, 3000);
    } catch (err) {
      console.error('Typing update failed:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const filePath = `${dealId}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('chat_attachments')
      .upload(filePath, file);

    if (error) return console.error('Upload error:', error);

    const { publicUrl } = supabase.storage.from('chat_attachments').getPublicUrl(filePath);

    await supabase.from('messages').insert([
      {
        deal_id: dealId,
        sender_email: userEmail,
        message: '[File Attachment]',
        file_url: publicUrl,
      },
    ]);
  };

  const onEmojiClick = (emojiData: any) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800" role="log" aria-live="polite">
        {messages.map((msg, i) => {
          const isMine = (msg.sender_email || msg.sender_email) === userEmail;
          return (
            <div
              key={i}
              className={`max-w-lg flex flex-col ${isMine ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <span className="text-xs text-gray-400 mb-1">
                {(msg.sender_email || msg.sender_email) || 'Unknown'}
              </span>
                  <div 
                className={`px-4 py-2 rounded-2xl shadow text-sm break-words ${
                  isMine
                    ? 'bg-teal-600 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-900 rounded-bl-none dark:bg-gray-800 dark:text-gray-100'
                    }`}
                  >
                    {msg.message}
                  </div>
              <span className="text-[10px] text-gray-400 mt-1">
                {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
                </div>
          );
        })}
        {othersTyping.length > 0 && (
          <div className="text-xs italic text-gray-500 flex items-center gap-2">
            <div className="flex space-x-1 animate-pulse">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              </div>
            Someone is typing...
        </div>
        )}
      </div>

      <div className="p-4 border-t flex items-center gap-2 relative">
        <button onClick={() => setShowEmojiPicker(prev => !prev)} className="text-gray-600 hover:text-gray-800">
          <Smile size={20} />
        </button>
        {showEmojiPicker && (
          <div className="absolute bottom-16 z-50">
            {/* EmojiPicker component would be rendered here if installed */}
          </div>
        )}

        <input
          className="flex-1 rounded border p-2 dark:bg-gray-800 dark:text-white"
          value={newMessage}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Type a message..."
          tabIndex={0}
          aria-label="Type a message"
        />

        <label className="text-gray-600 hover:text-gray-800 cursor-pointer">
          <Paperclip size={20} />
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        <button
          className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
          onClick={handleSend}
          tabIndex={0}
          aria-label="Send message"
        >
          Send
        </button>
      </div>
        </div>
  );
};

export default DealChat; 
