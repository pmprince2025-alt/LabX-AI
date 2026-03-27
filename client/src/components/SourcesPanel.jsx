import React from 'react';
import { Globe } from 'lucide-react';

const SourcesPanel = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="w-full animate-fade-in-up mt-6">
      <h3 className="text-white/70 text-sm font-medium mb-3 pl-2 flex items-center gap-2">
        <Globe size={14} />
        Sources Found
      </h3>
      <div className="flex flex-wrap gap-3">
        {sources.map((source, idx) => {
          // Extract base domain for display
          let domain = source.url;
          try {
            domain = new URL(source.url).hostname.replace('www.', '');
          } catch (e) {
            // Ignore invalid URLs
          }

          return (
            <a
              key={idx}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col p-3 rounded-xl border border-white/10 bg-black/60 backdrop-blur-md hover:border-white/50 hover:bg-white/5 hover:-translate-y-1 hover:glow-neon transition-all duration-300 max-w-[200px]"
            >
              <div className="flex items-center gap-2 mb-1">
                {/* Fallback globe if no favicon available */}
                <Globe size={12} className="text-white/50 group-hover:text-white/80 transition-colors" />
                <span className="text-xs text-white/50 truncate group-hover:text-white/80 transition-colors">{domain}</span>
              </div>
              <span className="text-sm text-white/90 line-clamp-2 leading-tight group-hover:text-white transition-colors">
                {source.title}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default SourcesPanel;
