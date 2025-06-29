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
      model: 'anthropic/claude-3.5-sonnet',
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
      <div className="max-w-4xl mx-auto flex gap-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="What do you do next? Describe your actions..."
          className="flex-1 min-h-[60px] bg-slate-700/80 border-slate-600/60 text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
          disabled={isLoading}
        />
        <Button 
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
          className="px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-none shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Thinking...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
