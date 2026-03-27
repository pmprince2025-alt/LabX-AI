import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Cpu, WifiOff } from 'lucide-react';
// Components
import HexBackground from './components/HexBackground';
import CursorGlow from './components/CursorGlow';
import ChatPanel from './components/ChatPanel';
import InputBar from './components/InputBar';
import TimelinePanel from './components/TimelinePanel';
import { useSocket } from './hooks/useSocket';

function App() {
  const [messages, setMessages] = useState([]);
  const [activeAnswerId, setActiveAnswerId] = useState(null);
  
  const [status, setStatus] = useState({
    isProcessing: false,
    needsSearch: false,
    sources: []
  });

  const { isConnected, errorStatus, sendQuery, bindEvents } = useSocket();
  
  useEffect(() => {
    // Bind all socket events to state updates
    bindEvents({
      onQueryAcknowledged: (data) => {
        setStatus(prev => ({ ...prev, needsSearch: data.needsSearch, sources: [] }));
      },
      onSources: (sourcesData) => {
        setStatus(prev => ({ ...prev, sources: sourcesData }));
        setMessages(prev => prev.map(msg => 
          msg.id === activeAnswerId ? { ...msg, sources: sourcesData } : msg
        ));
      },
      onAnswerChunk: (chunkText) => {
        setMessages(prev => prev.map(msg => {
          if (msg.id === activeAnswerId) {
            return { ...msg, content: msg.content + chunkText };
          }
          return msg;
        }));
      },
      onAnswerDone: () => {
        setStatus(prev => ({ ...prev, isProcessing: false }));
        setMessages(prev => prev.map(msg => msg.id === activeAnswerId ? { ...msg, isStreaming: false } : msg));
        setActiveAnswerId(null);
      },
      onError: (errorMsg) => {
        setStatus(prev => ({ ...prev, isProcessing: false }));
        setMessages(prev => prev.map(msg => msg.id === activeAnswerId ? { ...msg, isStreaming: false, content: msg.content + `\n\n⚠️ **System Error:** ${errorMsg}` } : msg));
        setActiveAnswerId(null);
      }
    });
  }, [bindEvents, activeAnswerId]);

  const handleSend = (query) => {
    // 1. Add user message
    const userMsg = { id: uuidv4(), role: 'user', content: query };
    
    // 2. Prepare blank AI response message
    const answerId = uuidv4();
    const initialAiMsg = { id: answerId, role: 'assistant', content: '', isStreaming: true };
    
    setMessages((prev) => [...prev, userMsg, initialAiMsg]);
    setActiveAnswerId(answerId);
    
    // 3. Update status to trigger timeline animation and input lock
    setStatus({
      isProcessing: true,
      needsSearch: true, // Optimistically assume search until backend responds
      sources: []
    });
    
    // 4. Send via socket
    sendQuery(query);
  };

  return (
    <>
      <HexBackground />
      <CursorGlow />
      
      <div className="flex h-[100dvh] w-full relative z-10 text-white overflow-hidden p-2 md:p-4">
        
        {/* Full Screen Main Chat */}
        <div className="flex-1 flex flex-col w-full max-w-6xl mx-auto bg-transparent overflow-hidden relative">
          
          {/* Header */}
          <header className="px-4 md:px-6 py-3 md:py-4 border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center p-0.5">
                <img src="/logo.png" alt="LabX AI Logo" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              </div>
              <h1 className="font-semibold tracking-wide text-base md:text-xl text-white text-neon">LabX AI Assistant</h1>
            </div>
            <div className="flex items-center gap-4">
              {(!isConnected || errorStatus) && (
                <div className="flex items-center gap-2 text-red-400 text-xs md:text-sm bg-red-950/30 px-2 md:px-3 py-1 rounded-full border border-red-500/20">
                  <WifiOff size={14} />
                  <span className="hidden sm:inline">{errorStatus || "Disconnected"}</span>
                </div>
              )}
            </div>
          </header>

          {/* Floating Right/Top Overlay (Activity & Context) */}
          <div className="absolute top-16 md:top-20 right-4 left-4 md:left-auto w-auto md:w-[350px] lg:w-[400px] flex flex-col gap-4 z-40 pointer-events-none">
            <div className="pointer-events-auto max-w-sm ml-auto">
              <TimelinePanel isActive={status.isProcessing} needsSearch={status.needsSearch} />
            </div>
          </div>

          <main className="flex-1 overflow-hidden flex flex-col relative w-full pt-2 md:pt-4">
            <ChatPanel messages={messages} />
          </main>
          
          <footer className="shrink-0 bg-transparent mb-12 md:mb-0">
            <InputBar onSend={handleSend} disabled={status.isProcessing || !isConnected} />
          </footer>
        </div>

      </div>
    </>
  );
}

export default App;

