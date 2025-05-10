import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Check, CheckCheck } from 'lucide-react';

interface Message {
  id: number;
  sender: 'you' | 'scammer';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

const chatScript: Message[] = [
  { id: 1, sender: 'scammer', text: "Hi! I saw your ad for the phone. Is it still available?", time: '14:02' },
  { id: 2, sender: 'you', text: "Yes, it's still available.", time: '14:03', status: 'read' },
  { id: 3, sender: 'scammer', text: "Great! Can I pay you now and send my courier to collect?", time: '14:04' },
  { id: 4, sender: 'you', text: "Sure, how do you want to pay?", time: '14:05', status: 'read' },
  { id: 5, sender: 'scammer', text: "I'll send you a payment link. Please check your email.", time: '14:06' },
  { id: 6, sender: 'you', text: "Got it, but it looks a bit strange. Is this safe?", time: '14:07', status: 'read' },
  { id: 7, sender: 'scammer', text: "100% safe! I use this for all my deals. Please confirm payment quickly.", time: '14:08' },
  { id: 8, sender: 'you', text: "I'll wait until the money clears in my account.", time: '14:09', status: 'read' },
  { id: 9, sender: 'scammer', text: "Trust me, it's instant. Please confirm now or I'll have to cancel.", time: '14:10' },
];

const WhatsAppChatSimulator = ({ cta, onCtaClick }: { cta?: string; onCtaClick?: () => void }) => {
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Detect user scroll to pause/resume auto-scroll
  useEffect(() => {
    const chatDiv = chatContainerRef.current;
    if (!chatDiv) return;
    const handleScroll = () => {
      // If user is at the bottom (within 10px), enable auto-scroll
      if (chatDiv.scrollHeight - chatDiv.scrollTop - chatDiv.clientHeight < 10) {
        setAutoScroll(true);
      } else {
        setAutoScroll(false);
      }
    };
    chatDiv.addEventListener('scroll', handleScroll);
    return () => chatDiv.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const displayMessages = async () => {
      setDisplayedMessages([]);
      for (let i = 0; i < chatScript.length; i++) {
        if (cancelled) break;
        const message = chatScript[i];
        if (message.sender === 'scammer') {
          setIsTyping(true);
          await new Promise(resolve => setTimeout(resolve, 2800));
          setIsTyping(false);
        }
        setDisplayedMessages(prev => [...prev, message]);
        if (i < chatScript.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2500));
        }
      }
    };
    displayMessages();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (autoScroll && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [displayedMessages, isTyping, autoScroll]);

  return (
    <div className="w-[320px] max-w-full mx-auto border-4 border-[#075E54] rounded-3xl overflow-hidden shadow-xl bg-[#E5DDD5]">
      {/* WhatsApp header */}
      <div className="bg-[#075E54] text-white p-3 flex items-center">
        <div className="bg-[#25D366] rounded-full w-10 h-10 flex items-center justify-center mr-3">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <p className="font-bold">Scammer</p>
          <p className="text-xs opacity-80">WhatsApp Chat</p>
        </div>
      </div>
      {/* Chat area */}
      <div 
        ref={chatContainerRef}
        className="h-[420px] p-3 overflow-y-auto flex flex-col space-y-2 bg-[#E5DDD5] bg-opacity-90 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAwIDEwMG0tOTggMGE5OCw5OCAwIDEsMCAxOTYsMGE5OCw5OCAwIDEsMCAtMTk2LDBNMTAwIDEwMG0tOTAgMGE5MCw5MCAwIDEsMCAxODAsMGE5MCw5MCAwIDEsMCAtMTgwLDBNMTAwIDEwMG0tNzAgMGE3MCw3MCAwIDEsMCAxNDAsMGE3MCw3MCAwIDEsMCAtMTQwLDBNMTAwIDEwMG0tMzAgMGEzMCwzMCAwIDEsMCA2MCwwYTMwLDMwIDAgMSwwIC02MCwwIiBmaWxsPSIjMDAwMDAwIiBvcGFjaXR5PSIwLjAyIi8+PC9zdmc+')] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
        {displayedMessages.map((message) => (
          <div 
            key={message.id} 
            className={
              "max-w-[80%] px-4 py-3 rounded-lg relative text-base " +
              (message.sender === 'you' 
                ? 'bg-[#F0FFF0] text-[#222E35] ml-auto rounded-tr-none border border-[#B2DFDB]'
                : 'bg-white text-[#222E35] mr-auto rounded-tl-none border border-gray-200')
            }
            style={{ fontSize: '1.08rem', lineHeight: '1.5' }}
          >
            <p>{message.text}</p>
            <div className="flex items-center justify-end gap-1 text-[11px] text-gray-500 mt-1">
              <span>{message.time}</span>
              {message.sender === 'you' && message.status && (
                message.status === 'read' ? (
                  <CheckCheck className="w-3 h-3 text-blue-500" />
                ) : (
                  <Check className="w-3 h-3" />
                )
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="bg-white max-w-[80%] p-3 rounded-lg rounded-tl-none mr-auto border border-gray-200">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
      </div>
      {/* Message input */}
      <div className="bg-[#F0F0F0] p-2 flex items-center">
        <input 
          type="text" 
          placeholder="Type a message"
          className="bg-white rounded-full py-2 px-4 flex-1 focus:outline-none"
          disabled
        />
        <button className="bg-[#25D366] rounded-full p-2 ml-2">
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
      {/* CTA button */}
      {cta && (
        <div className="p-4 text-center">
          <button
            className="bg-gradient-friendly text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:opacity-90 transition text-base"
            onClick={onCtaClick}
          >
            {cta}
          </button>
        </div>
      )}
      {/* Footer */}
      <div className="bg-[#075E54] text-white py-1 px-3 text-xs text-center">
        Scam Case Study
      </div>
    </div>
  );
};

export default WhatsAppChatSimulator; 