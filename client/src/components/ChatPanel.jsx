import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { User, Cpu } from 'lucide-react';

const ChatPanel = ({ messages }) => {
  const containerRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 w-full overflow-y-auto px-2 md:px-4 py-4 md:py-6 scroll-smooth"
    >
      <div className="max-w-3xl mx-auto flex flex-col gap-4 md:gap-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50 space-y-4 pt-10 md:pt-20">
             <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center p-2 mb-2">
                <img src="/logo.png" alt="LabX AI Logo" className="w-full h-full object-contain grayscale opacity-80" />
              </div>
            <p className="text-white/70 text-sm md:text-base">What would you like to know?</p>
          </div>
        )}
        
        {messages.map((message) => {
          const isUser = message.role === 'user';
          
          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`flex gap-2 md:gap-4 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`
                flex-shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center 
                ${isUser ? 'bg-white/10' : 'bg-black border border-white/40 glow-neon text-white p-1'}
              `}>
                {isUser ? <User size={16} className="text-white/80" /> : <img src="/logo.png" alt="AI" className="w-full h-full object-contain" />}
              </div>
              
              {/* Message Bubble */}
              <div className="flex flex-col gap-2 max-w-[90%] md:max-w-[85%]">
                <div className={`
                  rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm md:text-base
                  ${isUser 
                    ? 'bg-white/10 text-white rounded-tr-sm border border-white/5' 
                    : 'bg-black border border-white/20 text-white/90 rounded-tl-sm shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
                  }
                `}>
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <div className="prose prose-sm md:prose-base prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-code:text-white prose-a:text-neon-white prose-a:underline">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                      {/* Pulsing cursor block if streaming */}
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-4 bg-white/80 ml-1 animate-pulse" />
                      )}
                    </div>
                  )}
                </div>

                {/* Source Favicons attached to AI message */}
                {!isUser && message.sources && message.sources.length > 0 && (
                  <div className="flex items-center gap-2 px-1 mt-1">
                    {message.sources.map((src, i) => (
                      <a 
                        key={i} 
                        href={src.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        title={src.title || src.url} 
                        className="w-7 h-7 rounded-sm border border-white/10 shadow-lg flex items-center justify-center hover:border-white/50 hover:bg-white/10 transition-all hover:scale-110 opacity-70 hover:opacity-100"
                      >
                        <img 
                          src={`https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(src.url)}`} 
                          alt="Favicon" 
                          className="w-4 h-4 rounded-sm object-contain"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatPanel;
