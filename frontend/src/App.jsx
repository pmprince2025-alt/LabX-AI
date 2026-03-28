import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { Send, Globe, Cpu, Command, Mic, MicOff, Lock } from 'lucide-react';
import VoiceInterface from './components/VoiceInterface';
import InteractiveHexGrid from './components/HexGrid';

// Supabase Edge Function URLs
const SUPABASE_URL = 'https://stskaknjtybtabmsfbtr.supabase.co/functions/v1';
const QUERY_URL = `${SUPABASE_URL}/labx-query`;
const TRANSCRIBE_URL = `${SUPABASE_URL}/labx-transcribe`;


/* --- UI Components --- */
const TypingText = ({ text, onComplete, paused = false }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setDisplayedText('');
    setIndex(0);
  }, [text]);

  useEffect(() => {
    if (paused) return;
    
    if (text.length === 0) {
      if (onComplete) onComplete();
      return;
    }
    
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 25);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, onComplete, paused]);

  return <span className={index < text.length ? 'typing-cursor' : ''}>{displayedText}</span>;
};

const InlineTimeline = ({ steps }) => {
  return (
    <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-6 items-center">
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-center gap-3 group/step">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={step.status === 'active' ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`w-2 h-2 rounded-sm rotate-45 transition-colors duration-500 ${
            step.status === 'active' ? 'bg-white shadow-[0_0_12px_#ffffff]' : 
            step.status === 'completed' ? 'bg-zinc-700/50' : 'bg-zinc-800'
          }`} />
          <span className={`text-[10px] font-bold tracking-[0.2em] transition-colors duration-500 ${
            step.status === 'active' ? 'text-white blur-[0.2px]' : 'text-zinc-600'
          }`}>
            {step.label}
          </span>
          {idx < steps.length - 1 && <div className="w-6 h-[1px] bg-zinc-900 mx-2" />}
        </div>
      ))}
    </div>
  );
};

const InlineSources = ({ sources, setHoverState }) => {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="mt-6 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {sources.map((source, idx) => {
        let domain = "web";
        try { domain = new URL(source.url).hostname; } catch(e) {}
        
        return (
          <motion.a
            key={idx}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            layout
            onMouseEnter={() => setHoverState(true)}
            onMouseLeave={() => setHoverState(false)}
            whileHover={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.4)',
              boxShadow: '0 0 20px rgba(255, 255, 255, 0.08)'
            }}
            className="h-11 flex items-center gap-0 hover:gap-3 px-3 rounded-xl bg-zinc-900/40 border border-zinc-800/50 transition-all duration-300 cursor-pointer group/source overflow-hidden"
          >
            <div className="min-w-[20px] h-5 flex items-center justify-center relative">
               <img 
                  src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`} 
                  alt={domain}
                  className="w-4 h-4 grayscale opacity-40 group-hover/source:grayscale-0 group-hover/source:opacity-100 transition-all duration-500"
               />
            </div>
            <motion.span 
              initial={{ width: 0, opacity: 0 }}
              className="overflow-hidden whitespace-nowrap text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 group-hover/source:text-white group-hover/source:w-auto group-hover/source:opacity-100 transition-all duration-500"
            >
              {source.title || domain}
            </motion.span>
          </motion.a>
        );
      })}
    </div>
  );
};

const Message = ({ msg, setHoverState }) => {
  const [showTextDone, setShowTextDone] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: msg.type === 'user' ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className={`flex w-full mb-12 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div 
        onMouseEnter={() => setHoverState(true)}
        onMouseLeave={() => setHoverState(false)}
        className={`relative max-w-[85%] sm:max-w-[65%] p-8 rounded-[32px] glass transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.04)] ${
        msg.type === 'user' 
        ? 'glass-white bg-white/5' 
        : 'bg-zinc-950/40'
      }`}>
        
        {msg.type === 'user' ? (
          <div className="text-[15px] leading-relaxed text-zinc-200 font-normal tracking-tight">
            {msg.content}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="text-[15px] leading-relaxed text-zinc-200 font-normal tracking-tight min-h-[1.5em]">
              <TypingText 
                text={msg.content} 
                paused={false} 
                onComplete={() => setShowTextDone(true)} 
              />
            </div>
            {msg.imageUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group/img overflow-hidden rounded-2xl border border-white/10"
              >
                <img 
                  src={msg.imageUrl} 
                  alt="Neural Image" 
                  className="w-full h-auto object-cover max-h-[512px] hover:scale-[1.02] transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity" />
              </motion.div>
            )}
          </div>
        )}

        {msg.type === 'ai' && msg.steps && msg.steps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <InlineTimeline steps={msg.steps} />
          </motion.div>
        )}

        {msg.type === 'ai' && showTextDone && msg.sources && msg.sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <InlineSources sources={msg.sources} setHoverState={setHoverState} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

/* --- Main App Integration --- */
const App = () => {
  const [messages, setMessages] = useState([
    { 
      type: 'ai', 
      content: 'Welcome, I am LabX AI. Your neural assistant is primed and ready. How can I assist you today?',
      steps: [],
      isComplete: true,
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isHoveringInteractable, setIsHoveringInteractable] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [lastUserTranscript, setLastUserTranscript] = useState('');
  const [lastAIResponse, setLastAIResponse] = useState('');
  const voiceModeRef = useRef(false);
  
  // Conversation history for context (sent to edge function)
  const chatHistoryRef = useRef([]);
  
  const scrollRef = useRef(null);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [audioError, setAudioError] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [cursorX, cursorY]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const [isListening, setIsListening] = useState(false);
  const [isJarvisMode, setIsJarvisMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechDetected, setIsSpeechDetected] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const isJarvisModeRef = useRef(isJarvisMode);
  const isProcessingRef = useRef(isProcessing);
  const isSpeakingRef = useRef(isSpeaking);
  const isListeningRef = useRef(false);
  const silenceTimerRef = useRef(null);
  const analyserRef = useRef(null);
  const silenceCheckRef = useRef(null);
  const hasSpokenRef = useRef(false);

  useEffect(() => { isJarvisModeRef.current = isJarvisMode; }, [isJarvisMode]);
  useEffect(() => { isProcessingRef.current = isProcessing; }, [isProcessing]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);
  useEffect(() => { voiceModeRef.current = voiceMode; }, [voiceMode]);

  // --- SSE-based query to Supabase Edge Function ---
  const sendQuery = async (userMessage) => {
    setIsProcessing(true);

    // Add placeholder AI message
    setMessages(prev => [...prev, {
      type: 'ai',
      content: '',
      steps: [{ label: 'Connecting to Neural Network', status: 'active' }],
      sources: [],
      isComplete: false,
    }]);

    try {
      const response = await fetch(QUERY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMessage,
          history: chatHistoryRef.current.slice(-10),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';
      let currentSources = [];
      let currentSteps = [];
      let currentImageUrl = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);

            switch (event.type) {
              case 'status': {
                const stepData = event.data;
                const newStep = { label: stepData.step, status: stepData.status };
                
                setMessages(prev => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  const lastMsg = updated[lastIdx];
                  if (lastMsg && lastMsg.type === 'ai' && !lastMsg.isComplete) {
                    const steps = [...(lastMsg.steps || [])];
                    const existingIdx = steps.findIndex(s => s.label === newStep.label);
                    if (existingIdx >= 0) {
                      steps[existingIdx] = newStep;
                    } else {
                      steps.push(newStep);
                    }
                    currentSteps = steps;
                    updated[lastIdx] = { ...lastMsg, steps };
                  }
                  return updated;
                });
                break;
              }

              case 'sources': {
                currentSources = event.data;
                setMessages(prev => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  const lastMsg = updated[lastIdx];
                  if (lastMsg && lastMsg.type === 'ai' && !lastMsg.isComplete) {
                    updated[lastIdx] = { ...lastMsg, sources: currentSources };
                  }
                  return updated;
                });
                break;
              }

              case 'chunk': {
                fullContent += event.data;
                setMessages(prev => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  const lastMsg = updated[lastIdx];
                  if (lastMsg && lastMsg.type === 'ai' && !lastMsg.isComplete) {
                    updated[lastIdx] = { ...lastMsg, content: fullContent };
                  }
                  return updated;
                });
                break;
              }

              case 'image': {
                currentImageUrl = `data:image/png;base64,${event.data}`;
                setMessages(prev => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  const lastMsg = updated[lastIdx];
                  if (lastMsg && lastMsg.type === 'ai' && !lastMsg.isComplete) {
                    updated[lastIdx] = { ...lastMsg, imageUrl: currentImageUrl };
                  }
                  return updated;
                });
                break;
              }

              case 'done': {
                // Mark message as complete
                setMessages(prev => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  const lastMsg = updated[lastIdx];
                  if (lastMsg && lastMsg.type === 'ai' && !lastMsg.isComplete) {
                    updated[lastIdx] = { ...lastMsg, isComplete: true };
                  }
                  return updated;
                });
                break;
              }
            }
          } catch (parseError) {
            // Skip malformed SSE events
            console.warn('SSE parse error:', parseError);
          }
        }
      }

      // Update conversation history
      chatHistoryRef.current.push({ role: 'user', content: userMessage });
      chatHistoryRef.current.push({ role: 'assistant', content: fullContent });
      if (chatHistoryRef.current.length > 10) {
        chatHistoryRef.current = chatHistoryRef.current.slice(-10);
      }

      setLastAIResponse(fullContent);

      // Use browser TTS in voice mode
      if (voiceModeRef.current && fullContent) {
        speakBrowser(fullContent);
      }

    } catch (error) {
      console.error('Query Error:', error);
      setMessages(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        const lastMsg = updated[lastIdx];
        if (lastMsg && lastMsg.type === 'ai' && !lastMsg.isComplete) {
          updated[lastIdx] = { ...lastMsg, content: `⚠️ Neural processor error: ${error.message}`, isComplete: true };
        } else {
          updated.push({ type: 'ai', content: `⚠️ Neural processor error: ${error.message}`, isComplete: true });
        }
        return updated;
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Simple browser TTS fallback for voice mode
  const speakBrowser = (text) => {
    if (!('speechSynthesis' in window)) return;
    const cleanText = text
      .replace(/```[\s\S]*?```/g, " code snippet ")
      .replace(/[*#_`]/g, "")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
      .replace(/\n\s*\n/g, ". ")
      .replace(/\s+/g, " ")
      .trim();
    
    if (!cleanText) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    
    setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (voiceModeRef.current && !isListeningRef.current && !isProcessingRef.current) {
        setTimeout(() => startRecording(), 500);
      }
    };
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = (shouldRestartRecording = true) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    
    if (shouldRestartRecording && voiceModeRef.current) {
      startRecording();
    }
  };

  const startRecording = async () => {
    if (isListeningRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      hasSpokenRef.current = false;

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);
      analyserRef.current = { analyser, audioContext, source };

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const SILENCE_THRESHOLD = 10;
      const SILENCE_DURATION = 2000;
      let silenceStart = null;

      const checkSilence = () => {
        if (!isListeningRef.current) return;
        analyser.getByteTimeDomainData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const val = (dataArray[i] - 128) / 128;
          sum += val * val;
        }
        const rms = Math.sqrt(sum / dataArray.length) * 100;

        if (rms > SILENCE_THRESHOLD) {
          if (!hasSpokenRef.current) {
            setIsSpeechDetected(true);
          }
          hasSpokenRef.current = true;
          silenceStart = null;
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else if (hasSpokenRef.current) {
          if (!silenceStart) {
            silenceStart = Date.now();
          }
          const elapsed = Date.now() - silenceStart;
          if (elapsed >= SILENCE_DURATION) {
            stopRecording();
            return;
          }
        }

        silenceCheckRef.current = requestAnimationFrame(checkSilence);
      };
      silenceCheckRef.current = requestAnimationFrame(checkSilence);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        if (silenceCheckRef.current) cancelAnimationFrame(silenceCheckRef.current);
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        if (analyserRef.current) {
          try { analyserRef.current.audioContext.close(); } catch(e) {}
          analyserRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 0 && hasSpokenRef.current) {
          sendAudioToBackend(audioBlob);
        } else {
          if (voiceModeRef.current && !isSpeakingRef.current && !isProcessingRef.current) {
            setTimeout(() => startRecording(), 500);
          }
        }
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
      isListeningRef.current = true;
      setIsSpeechDetected(false);
    } catch (err) {
      console.error("Microphone Access Error:", err);
      let errorMsg = "Microphone Access Denied";
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        errorMsg = "HTTPS required for Microphone";
      } else if (err.name === 'NotAllowedError') {
        errorMsg = "Microphone Permission Blocked";
      } else if (err.name === 'NotFoundError') {
        errorMsg = "No Microphone Found";
      }
      setAudioError(errorMsg);
      setIsListening(false);
      isListeningRef.current = false;
    }
  };

  const stopRecording = () => {
    if (silenceCheckRef.current) cancelAnimationFrame(silenceCheckRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
    isListeningRef.current = false;
    setIsSpeechDetected(false);
  };

  // Send audio to Supabase Edge Function for transcription
  const sendAudioToBackend = async (blob) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append('audio', blob, 'audio.webm');

    try {
      const response = await fetch(TRANSCRIBE_URL, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.text && data.text.trim()) {
        const trimmed = data.text.trim();
        setLastUserTranscript(trimmed);
        setInputValue(trimmed);
        handleSend({ preventDefault: () => {} }, trimmed);
      } else {
        setIsProcessing(false);
        if ((voiceModeRef.current || isJarvisModeRef.current) && !isSpeakingRef.current) {
            setTimeout(() => startRecording(), 500);
        }
      }
    } catch (err) {
      console.error("Transcription Error:", err);
      setIsProcessing(false);
      if ((voiceModeRef.current || isJarvisModeRef.current) && !isSpeakingRef.current) {
          setTimeout(() => startRecording(), 500);
      }
    }
  };

  useEffect(() => {
    if (isJarvisMode && !isListening && !isProcessing && !isSpeaking) {
        startRecording();
    }
  }, [isJarvisMode]);

  const toggleListening = () => {
    if (isListeningRef.current) {
      stopRecording();
      setVoiceMode(false);
    } else {
      if (isSpeaking) {
        stopSpeaking(false);
      }
      const greeting = "Welcome, I am LabX AI. How can I help you today?";
      setLastAIResponse(greeting);
      setLastUserTranscript("");
      setVoiceMode(true);
      setAudioError(null);
      speakBrowser(greeting);
    }
  };

  const closeVoiceMode = () => {
    stopRecording();
    stopSpeaking(false);
    setVoiceMode(false);
  };

  const getOrbState = () => {
    if (isSpeaking) return 'speaking';
    if (isProcessing) return 'processing';
    if (isListening) return 'listening';
    return 'idle';
  };

  const getVoiceStatusText = () => {
    if (isSpeaking) return 'LabX AI Speaking...';
    if (isProcessing) return 'Neural Processing...';
    if (isSpeechDetected) return 'Neural Speech Detected...';
    if (isListening) return 'Neural Link Listening...';
    return 'LabX AI Ready';
  };

  const handleSend = (e, overridenValue = null) => {
    if (e) e.preventDefault();
    const finalValue = overridenValue || inputValue;
    if (!finalValue.trim() || isProcessing) return;

    const userMsg = { type: 'user', content: finalValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    
    // Send via SSE to Supabase Edge Function
    sendQuery(finalValue);
  };

  return (
    <div className="flex flex-col h-screen bg-transparent text-white font-sans selection:bg-white/25 overflow-hidden relative">
      <InteractiveHexGrid cursorX={cursorX} cursorY={cursorY} isHoveringInteractable={isHoveringInteractable} />

    <AnimatePresence mode="wait">
      {!voiceMode && (
        <motion.div
          key="chat-interface"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col h-full w-full"
        >
          {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-24 flex items-center justify-between px-16 z-50 pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto hover:scale-105 transition-transform">
          <div className="relative group">
              <div className="absolute inset-0 bg-white blur-xl opacity-10 group-hover:opacity-30 transition-opacity" />
              <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center relative z-10 border border-white/20 overflow-hidden">
                  <img src="/logo.png" alt="LabX AI Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]" />
              </div>
          </div>
          <div>
              <h1 className="text-sm font-black uppercase tracking-[0.5em] text-white">LabX <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">AI</span></h1>
              <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 bg-white animate-pulse rounded-full" />
                  <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">
                    Neural Link Active
                  </span>
              </div>
          </div>
        </div>
        
        <div className="flex items-center gap-12 pointer-events-auto">
             <div className="flex gap-8 items-center">
                <div 
                  onClick={() => setIsJarvisMode(!isJarvisMode)}
                  onMouseEnter={() => setIsHoveringInteractable(true)}
                  onMouseLeave={() => setIsHoveringInteractable(false)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all cursor-pointer group ${
                    isJarvisMode 
                      ? 'bg-white/10 border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                      : 'bg-transparent border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${isJarvisMode ? 'bg-white animate-pulse' : 'bg-white/20'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isJarvisMode ? 'text-white' : 'text-white/40'}`}>
                    Jarvis Mode
                  </span>
                </div>
                <div className="w-[1px] h-8 bg-zinc-900" />
                <div className="flex flex-col items-end">
                    <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest leading-none mb-1">Processing Power</span>
                    <span className="text-xs font-mono text-white/70 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">98.4 TFLOPS</span>
                </div>
                <div className="w-[1px] h-8 bg-zinc-900" />
                <div className="flex flex-col items-end">
                    <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest leading-none mb-1">Latency Layer</span>
                    <span className="text-xs font-mono text-white/70 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">0.02 MS</span>
                </div>
              </div>
             <div className="flex gap-4">
               <Command 
                  onMouseEnter={() => setIsHoveringInteractable(true)}
                  onMouseLeave={() => setIsHoveringInteractable(false)}
                  className="w-5 h-5 text-zinc-600 hover:text-white hover:drop-shadow-[0_0_8px_#ffffff] transition-all cursor-pointer" 
               />
             </div>
        </div>
      </header>

      {/* Chat Area */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto pt-44 pb-64 px-[15%] sm:px-[25%] space-y-4">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <Message key={i} msg={msg} setHoverState={setIsHoveringInteractable} />
          ))}
        </AnimatePresence>
      </main>

      {/* Input Area */}
      <footer className="fixed bottom-0 left-0 right-0 p-16 bg-gradient-to-t from-[#050505] via-[#050505]/90 to-transparent z-50 pointer-events-none">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative group pointer-events-auto">
          <div className="absolute inset-x-0 -top-24 h-24 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000" />
           <button
            onMouseEnter={() => setIsHoveringInteractable(true)}
            onMouseLeave={() => setIsHoveringInteractable(false)}
            type="button"
            onClick={toggleListening}
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-[22px] flex items-center justify-center transition-all duration-300 z-20 overflow-hidden border ${
              isListening 
                ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]' 
                : 'bg-white/5 text-white/40 border-white/10 hover:border-white/30'
            }`}
          >
            {isListening ? (
              <div className="relative">
                <Mic className="w-6 h-6 relative z-10 animate-pulse" />
                <div className="absolute inset-0 bg-black/10 blur-md animate-ping scale-150" />
              </div>
            ) : <MicOff className="w-6 h-6" />}
          </button>
          <input
            onMouseEnter={() => setIsHoveringInteractable(true)}
            onMouseLeave={() => setIsHoveringInteractable(false)}
            onFocus={() => setIsHoveringInteractable(true)}
            onBlur={() => setIsHoveringInteractable(false)}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isListening ? "Listening..." : "Initialize Neural Search Query..."}
            className="w-full bg-zinc-950/80 border-[1.5px] border-zinc-800/80 hover:border-white/20 rounded-[28px] py-6 px-28 pr-24 focus:outline-none focus:border-white/30 focus:bg-zinc-950 transition-all text-base placeholder:text-zinc-700 placeholder:italic backdrop-blur-2xl relative z-10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] focus:shadow-[0_0_30px_rgba(255,255,255,0.06)]"
          />
          <button
            onMouseEnter={() => setIsHoveringInteractable(true)}
            onMouseLeave={() => setIsHoveringInteractable(false)}
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-white/10 hover:bg-white text-white/60 hover:text-black border border-white/20 hover:border-white rounded-[22px] flex items-center justify-center transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] active:scale-90 z-20 group/btn overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
            <Send className="w-6 h-6 relative z-10 -rotate-12 group-hover/btn:rotate-0 transition-transform" />
          </button>
        </form>
      </footer>
    </motion.div>
  )}
</AnimatePresence>

      {/* Voice Interface Overlay */}
      <AnimatePresence>
        {voiceMode && (
          <VoiceInterface
            orbState={getOrbState()}
            statusText={getVoiceStatusText()}
            onClose={closeVoiceMode}
            isListening={isListening}
            cursorX={cursorX}
            cursorY={cursorY}
            isHoveringInteractable={isHoveringInteractable}
            setIsHoveringInteractable={setIsHoveringInteractable}
            userTranscript={lastUserTranscript}
            aiResponse={lastAIResponse}
            imageUrl={messages.findLast(m => m.type === 'ai')?.imageUrl}
            toggleListening={toggleListening}
            isSpeaking={isSpeaking}
            stopSpeaking={stopSpeaking}
            audioError={audioError}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
