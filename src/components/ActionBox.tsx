'use client';

import { useState } from 'react';
import { useGameStore } from '@/stores';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ActionBox() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { gameData, updateGameData, addChatMessage } = useGameStore();

  // Load AI config from localStorage
  const getAIConfig = () => {
    try {
      const savedConfig = localStorage.getItem('mythic-conjurer-ai-config');
      if (savedConfig) {
        return JSON.parse(savedConfig);
      }
    } catch (error) {
      console.error('Failed to load AI config:', error);
    }
    
    // Default config if none saved
    return {
      provider: 'openrouter',
      apiKey: '',
      customEndpoint: '',
      model: 'openrouter/cypher-alpha:free',
      useCustomModel: false,
      customModelName: '',
      temperature: 0.7,
      maxTokens: 2000
    };
  };
  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      content: input,
      type: 'user' as const
    };

    // Add user message to chat
    addChatMessage(userMessage);
    
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    // Call AI with retry logic
    await makeAIRequest(currentInput);
    setIsLoading(false);
  };

  const makeAIRequest = async (userInput: string, retryCount = 0) => {
    const maxRetries = 3;
    
    try {
      // Prepare messages for AI with comprehensive system prompt
      const { getSystemPrompt } = await import('@/lib/aiPrompts');
      
      const messages = [
        {
          role: 'system',
          content: getSystemPrompt(gameData)
        },
        {
          role: 'user',
          content: userInput
        }
      ];

      const aiConfig = getAIConfig();

      // Get AI configuration from localStorage      const aiConfig = getAIConfig();
      
      // Prepare config object for API
      const config = {
        provider: aiConfig.provider,
        apiKey: aiConfig.apiKey,
        baseURL: aiConfig.provider === 'custom' ? aiConfig.customEndpoint : 
                 aiConfig.provider === 'openai' ? 'https://api.openai.com/v1' :
                 aiConfig.provider === 'groq' ? 'https://api.groq.com/openai/v1' :
                 aiConfig.provider === 'gemini' ? 'https://generativelanguage.googleapis.com/v1beta' :
                 'https://openrouter.ai/api/v1',
        model: aiConfig.useCustomModel ? aiConfig.customModelName : aiConfig.model,
        useCustomModel: aiConfig.useCustomModel,
        customModelName: aiConfig.customModelName,
        temperature: aiConfig.temperature,
        max_tokens: aiConfig.maxTokens
      };

      // Call AI API
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          config
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const { content } = await response.json();
      
      // Parse the AI response to extract gameData
      try {
        // Look for JSON in the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedData = JSON.parse(jsonMatch[0]);
          if (parsedData.gameData) {
            updateGameData(parsedData.gameData);
            addChatMessage({
              content: parsedData.gameData.story,
              type: 'ai'
            });
          } else {
            throw new Error('No gameData found in response');
          }
        } else {
          throw new Error('No JSON found in AI response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        
        if (retryCount < maxRetries) {
          console.log(`Retrying AI request (${retryCount + 1}/${maxRetries})`);
          toast.warning(`AI response failed, retrying... (${retryCount + 1}/${maxRetries})`);
          return await makeAIRequest(userInput, retryCount + 1);
        }
        
        toast.error('Failed to process AI response after multiple attempts');
        addChatMessage({
          content: content,
          type: 'ai'
        });
      }

    } catch (error) {
      console.error('Error calling AI:', error);
      
      if (retryCount < maxRetries) {
        console.log(`Retrying AI request (${retryCount + 1}/${maxRetries})`);
        toast.warning(`AI request failed, retrying... (${retryCount + 1}/${maxRetries})`);
        return await makeAIRequest(userInput, retryCount + 1);
      }
      
      // After 3 failed attempts, show a helpful error message
      toast.error('AI requests failed repeatedly. Please check your AI configuration in Settings.', {
        duration: 8000,
        action: {
          label: 'Open Settings',
          onClick: () => {
            const { toggleSettingsWindow } = useUIStore.getState();
            toggleSettingsWindow();
          }
        }
      });
        addChatMessage({
        content: 'Unable to connect to AI after multiple attempts. Please check your AI configuration in the Settings.',
        type: 'system'
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  return (
    <div className="p-4 bg-slate-800/95 backdrop-blur-sm border-t border-slate-700/60 shadow-2xl">
      {/* Header with enhanced guidance */}
      <div className="max-w-4xl mx-auto mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-sm font-medium">💭 Your Turn</span>
            <div className="h-1 w-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
          </div>
          <span className="text-gray-400 text-xs">
            ⌨️ Enter to send • 💡 Be creative!
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto flex gap-3">
        <div className="flex-1 relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="What do you do next? Describe your actions... (e.g., 'I search for hidden treasures', 'I attempt to negotiate')"
            className="w-full min-h-[80px] bg-slate-700/80 border-slate-600/60 text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 pr-16"
            disabled={isLoading}
          />
          
          {/* Character counter */}
          <div className="absolute bottom-3 right-3 text-xs text-gray-500">
            {input.length}/500
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className={`
              px-6 min-w-[120px] transition-all duration-200 transform
              ${isLoading 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105 active:scale-95 shadow-lg hover:shadow-purple-500/25'
              }
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span className="hidden sm:inline">Thinking...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Send</span>
                <span className="sm:hidden">Go</span>
              </>
            )}
          </Button>

          {/* Quick action buttons */}
          {!isLoading && (
            <div className="flex flex-col gap-1">
              {[
                { text: "🔍", action: "I look around carefully" },
                { text: "💬", action: "I try to negotiate" }
              ].map((quick, index) => (
                <button
                  key={index}
                  onClick={() => setInput(quick.action)}
                  className="text-xs bg-slate-600/50 hover:bg-slate-500/60 text-slate-300 hover:text-white px-2 py-1 rounded-md transition-all duration-200 border border-slate-500/50 hover:border-slate-400"
                  title={quick.action}
                >
                  {quick.text}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
