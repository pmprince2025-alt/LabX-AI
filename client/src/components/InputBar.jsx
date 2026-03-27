import React, { useState } from 'react';
import { Send } from 'lucide-react';

const InputBar = ({ onSend, disabled }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !disabled) {
      onSend(query.trim());
      setQuery('');
    }
  };

  return (
    <div className="w-full relative max-w-4xl mx-auto px-2 md:px-4 pb-4 md:pb-8 pt-2 md:pt-4">
      <form 
        onSubmit={handleSubmit}
        className={`relative flex items-center bg-black/80 backdrop-blur-md rounded-xl md:rounded-2xl border transition-all duration-300 ${
          isFocused ? 'border-neon-white/80 glow-neon-strong' : 'border-white/10 hover:border-white/30 glow-neon'
        }`}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask me anything..."
          disabled={disabled}
          className="w-full bg-transparent text-white placeholder-white/40 px-4 md:px-6 py-3 md:py-4 text-sm md:text-base outline-none rounded-xl md:rounded-2xl disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !query.trim()}
          className="absolute right-2 md:right-3 p-1.5 md:p-2 text-white/70 hover:text-white hover:glow-neon transition-all duration-300 disabled:opacity-50 disabled:hover:glow-none"
        >
          <Send size={18} className={query.trim() ? "translate-x-0" : "-translate-x-1 md:-translate-x-0 transition-transform"} />
        </button>
      </form>
    </div>
  );
};

export default InputBar;
