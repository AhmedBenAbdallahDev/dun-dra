'use client';

import { User, Bot, AlertTriangle } from 'lucide-react';

interface ChatMessageProps {
  message: {
    content: string;
    type?: 'user' | 'ai' | 'system';
  };
  isLast?: boolean;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  // Simplified version - no typing effect to prevent infinite loops
  const displayedText = message.content;
  const isTyping = false;
  const getMessageStyle = () => {
    switch (message.type) {
      case 'user':
        return 'bg-gradient-to-r from-blue-600 to-blue-700 ml-auto max-w-[80%] shadow-lg';
      case 'system':
        return 'bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border border-amber-500/40 backdrop-blur-sm shadow-lg';
      default:
        return 'bg-slate-700/80 backdrop-blur-sm border border-slate-600/40 shadow-lg';
    }
  };

  const getMessageIcon = () => {
    switch (message.type) {
      case 'user':
        return <User className="w-4 h-4 text-blue-100" />;
      case 'system':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <Bot className="w-4 h-4 text-slate-300" />;
    }
  };

  return (
    <div className={`p-4 rounded-xl transition-all duration-200 ${getMessageStyle()}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {getMessageIcon()}
        </div>
        <div className="prose prose-invert max-w-none flex-1">
          <div className="text-slate-100 leading-relaxed">
            {displayedText}
            {isTyping && <span className="animate-pulse ml-1 text-purple-400">▋</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
