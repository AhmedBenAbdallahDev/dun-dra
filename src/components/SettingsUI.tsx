'use client';

import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AIConfig {
  provider: 'openrouter' | 'custom' | 'openai' | 'groq' | 'gemini';
  apiKey: string;
  customEndpoint?: string;
  model: string;
  useCustomModel: boolean;
  customModelName: string;
  temperature: number;
  maxTokens: number;
}

export default function SettingsUI() {
  const { settingsWindow, toggleSettingsWindow } = useUIStore();
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'test'>('basic');
  const [aiConfig, setAIConfig] = useState<AIConfig>({
    provider: 'openrouter',
    apiKey: '',
    customEndpoint: '',
    model: 'openrouter/cypher-alpha:free',
    useCustomModel: false,
    customModelName: '',
    temperature: 0.7,
    maxTokens: 2000
  });

  const groqModels = [
    'llama3-70b-8192',
    'llama3-8b-8192',
    'mixtral-8x7b-32768',
    'gemma-7b-it',
    'llama2-70b-4096',
    'llama2-13b-4096',
    'llama2-7b-4096',
  ];
  const geminiModels = [
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
  ];

  // Function to get default model for each provider
  const getDefaultModel = (provider: string) => {
    switch (provider) {
      case 'openrouter':
        return 'openrouter/cypher-alpha:free';
      case 'openai':
        return 'gpt-4';
      case 'groq':
        return 'llama3-70b-8192';
      case 'gemini':
        return 'gemini-1.5-pro';
      case 'custom':
        return 'gpt-3.5-turbo';
      default:
        return 'openrouter/cypher-alpha:free';
    }
  };

  const [testResult, setTestResult] = useState<string>('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('mythic-conjurer-ai-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setAIConfig(parsed);
      } catch (error) {
        console.error('Failed to parse saved AI config:', error);
      }
    }
  }, []);
  // Remove the old localStorage logic
  const handleSaveSettings = () => {
    setIsSaving(true);
    try {
      localStorage.setItem('mythic-conjurer-ai-config', JSON.stringify(aiConfig));
      setTestResult('✅ Settings saved successfully!');
      setTimeout(() => setTestResult(''), 3000);
    } catch (error) {
      setTestResult('❌ Failed to save settings');
      console.error('Failed to save settings:', error);
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setTestResult('Testing connection...');

    try {
      const testPayload = {
        messages: [{ role: 'user', content: 'Say "AI connection test successful" if you can read this.' }],
        config: {
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey,
          baseURL:
            aiConfig.provider === 'custom' ? aiConfig.customEndpoint :
            aiConfig.provider === 'openai' ? 'https://api.openai.com/v1' :
            aiConfig.provider === 'groq' ? 'https://api.groq.com/openai/v1' :
            aiConfig.provider === 'gemini' ? 'https://generativelanguage.googleapis.com/v1beta' :
            'https://openrouter.ai/api/v1',
          model: aiConfig.useCustomModel ? aiConfig.customModelName : aiConfig.model,
          useCustomModel: aiConfig.useCustomModel,
          customModelName: aiConfig.customModelName,
          temperature: 0.1,
          max_tokens: 50
        }
      };

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult(`✅ Connection successful! Response: ${data.content || 'AI responded successfully'}`);
      } else {
        const errorText = await response.text();
        setTestResult(`❌ Connection failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      setTestResult(`❌ Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTestingConnection(false);
    }
  };  const openRouterModels = [
    // Free models
    'openrouter/cypher-alpha:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'meta-llama/llama-3.1-70b-instruct:free',
    'meta-llama/llama-3-8b-instruct:free', 
    'meta-llama/llama-3-70b-instruct:free',
    'microsoft/wizardlm-2-8x22b:free',
    'deepseek-ai/deepseek-coder:free',
    'deepseek-ai/deepseek-llm:free',
    'deepseek/deepseek-chat-v3-0324:free',
    'mistralai/mistral-7b-instruct:free',
    'mistralai/mixtral-8x7b-instruct:free',
    'huggingfaceh4/zephyr-7b-beta:free',
    'openchat/openchat-7b:free',
    'gryphe/mythomix-l2-13b:free',
    'undi95/toppy-m-7b:free',
    'koboldai/psyfighter-13b-2:free'
  ];
  if (!settingsWindow) return null;

  const TabButton = ({ id, label, icon }: { id: 'basic' | 'advanced' | 'test', label: string, icon: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
        activeTab === id 
          ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl bg-gradient-to-br from-slate-900/95 to-slate-950/95 border-slate-700/70 shadow-2xl backdrop-blur-md h-[85vh] max-h-[600px] rounded-2xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-slate-700/70">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">⚙️</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">AI Configuration</h2>
                <p className="text-sm text-slate-400">Configure your AI models and settings</p>
              </div>
            </div>
            <Button
              onClick={toggleSettingsWindow}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-xl p-2"
            >
              ✕
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 p-4 border-b border-slate-700">
            <TabButton id="basic" label="Basic" icon="🔧" />
            <TabButton id="advanced" label="Advanced" icon="⚙️" />
            <TabButton id="test" label="Test" icon="🔍" />
          </div>

          {/* Content */}
          <div className="flex-1 p-4 overflow-hidden">
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* AI Provider */}
                  <div className="space-y-2">
                    <Label className="text-slate-200 text-sm font-medium">AI Provider</Label>                    <Select
                      value={aiConfig.provider}
                      onValueChange={(value) => setAIConfig({ 
                        ...aiConfig, 
                        provider: value as typeof aiConfig.provider,
                        model: getDefaultModel(value) // Set appropriate default model
                      })}
                    >
                      <SelectTrigger className="bg-slate-800/60 border-slate-700 text-slate-200 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="openrouter" className="text-slate-200 hover:bg-slate-700">
                          🌐 OpenRouter
                        </SelectItem>
                        <SelectItem value="openai" className="text-slate-200 hover:bg-slate-700">
                          🤖 OpenAI
                        </SelectItem>
                        <SelectItem value="groq" className="text-slate-200 hover:bg-slate-700">
                          ⚡ Groq
                        </SelectItem>
                        <SelectItem value="gemini" className="text-slate-200 hover:bg-slate-700">
                          🌟 Gemini
                        </SelectItem>
                        <SelectItem value="custom" className="text-slate-200 hover:bg-slate-700">
                          🔧 Custom
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* API Key */}
                  <div className="space-y-2">
                    <Label className="text-slate-200 text-sm font-medium">API Key</Label>
                    <Input
                      type="password"
                      value={aiConfig.apiKey}
                      onChange={(e) => setAIConfig({ ...aiConfig, apiKey: e.target.value })}
                      placeholder={
                        aiConfig.provider === 'openrouter' ? 'sk-or-v1-... (optional if OPENROUTER_API_KEY set)' :
                        aiConfig.provider === 'openai' ? 'sk-... (optional if OPENAI_API_KEY set)' :
                        aiConfig.provider === 'groq' ? 'gsk_... (optional if GROQ_API_KEY set)' :
                        aiConfig.provider === 'gemini' ? 'AIza... (optional if GEMINI_API_KEY set)' :
                        'Enter API key'
                      }
                      className="bg-slate-800/60 border-slate-700 text-slate-200 placeholder-slate-400 focus:border-amber-500 h-9"
                    />
                    <p className="text-xs text-slate-400">
                      {aiConfig.provider === 'openrouter' && (
                        <>Get from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">OpenRouter.ai</a> or set OPENROUTER_API_KEY env var</>
                      )}
                      {aiConfig.provider === 'openai' && (
                        <>Get from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">OpenAI</a> or set OPENAI_API_KEY env var</>
                      )}
                      {aiConfig.provider === 'groq' && (
                        <>Get from <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">Groq Console</a> or set GROQ_API_KEY env var</>
                      )}
                      {aiConfig.provider === 'gemini' && (
                        <>Get from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">Google AI Studio</a> or set GEMINI_API_KEY env var</>
                      )}
                      {aiConfig.provider === 'custom' && 'API key for your endpoint or set CUSTOM_AI_API_KEY env var'}
                    </p>
                    <div className="bg-slate-700/50 p-2 rounded text-xs text-slate-300">
                      💡 <strong>Tip:</strong> Leave empty to use environment variables. User keys override env vars.
                    </div>
                  </div>

                  {/* Custom Endpoint */}
                  {aiConfig.provider === 'custom' && (
                    <div className="space-y-2">
                      <Label className="text-slate-200 text-sm font-medium">Custom Endpoint</Label>
                      <Input
                        type="url"
                        value={aiConfig.customEndpoint || ''}
                        onChange={(e) => setAIConfig({ ...aiConfig, customEndpoint: e.target.value })}
                        placeholder="https://your-proxy.com/v1/chat/completions"
                        className="bg-slate-800/60 border-slate-700 text-slate-200 placeholder-slate-400 focus:border-amber-500 h-9"
                      />
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Model Selection */}
                  <div className="space-y-2">
                    <Label className="text-slate-200 text-sm font-medium">Model</Label>
                    {aiConfig.provider === 'openrouter' && !aiConfig.useCustomModel ? (
                      <Select
                        value={aiConfig.model}
                        onValueChange={(value) => setAIConfig({ ...aiConfig, model: value })}
                      >
                        <SelectTrigger className="bg-slate-800/60 border-slate-700 text-slate-200 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 max-h-48">
                          {openRouterModels.map((model) => (
                            <SelectItem key={model} value={model} className="text-slate-200 hover:bg-slate-700 text-xs">
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : aiConfig.provider === 'groq' ? (
                      <Select
                        value={aiConfig.model}
                        onValueChange={(value) => setAIConfig({ ...aiConfig, model: value })}
                      >
                        <SelectTrigger className="bg-slate-800/60 border-slate-700 text-slate-200 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 max-h-48">
                          {groqModels.map((model) => (
                            <SelectItem key={model} value={model} className="text-slate-200 hover:bg-slate-700 text-xs">
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : aiConfig.provider === 'gemini' ? (
                      <Select
                        value={aiConfig.model}
                        onValueChange={(value) => setAIConfig({ ...aiConfig, model: value })}
                      >
                        <SelectTrigger className="bg-slate-800/60 border-slate-700 text-slate-200 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 max-h-48">
                          {geminiModels.map((model) => (
                            <SelectItem key={model} value={model} className="text-slate-200 hover:bg-slate-700 text-xs">
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={aiConfig.useCustomModel ? aiConfig.customModelName : aiConfig.model}
                        onChange={(e) => 
                          aiConfig.useCustomModel 
                          ? setAIConfig({ ...aiConfig, customModelName: e.target.value })
                          : setAIConfig({ ...aiConfig, model: e.target.value })
                        }
                        placeholder={aiConfig.provider === 'openai' ? 'gpt-4' : 'Model name'}
                        className="bg-slate-800/60 border-slate-700 text-slate-200 placeholder-slate-400 focus:border-amber-500 h-9"
                      />
                    )}
                    
                    {/* Custom model checkbox */}
                    {aiConfig.provider === 'openrouter' && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="useCustomModel"
                          checked={aiConfig.useCustomModel}
                          onChange={(e) => setAIConfig({ 
                            ...aiConfig, 
                            useCustomModel: e.target.checked,
                            model: e.target.checked ? aiConfig.customModelName : aiConfig.model
                          })}
                          className="w-3 h-3 accent-amber-600"
                        />
                        <Label htmlFor="useCustomModel" className="text-xs text-slate-300 cursor-pointer">
                          Use custom model name
                        </Label>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-3 pt-4">                    <Button
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white h-10 disabled:opacity-50 rounded-xl font-medium"
                    >
                      {isSaving ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          Saving...
                        </div>
                      ) : (
                        '💾 Save Configuration'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                <div className="space-y-4">
                  <h3 className="text-slate-200 font-medium">Generation Settings</h3>
                  
                  <div className="space-y-3">
                    <Label className="text-slate-300 text-sm">
                      Temperature: {aiConfig.temperature}
                    </Label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={aiConfig.temperature}
                      onChange={(e) => setAIConfig({ ...aiConfig, temperature: parseFloat(e.target.value) })}
                      className="w-full accent-amber-500"
                    />
                    <p className="text-xs text-slate-400">Controls creativity (0 = focused, 2 = creative)</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 text-sm">Max Tokens</Label>
                    <Input
                      type="number"
                      value={aiConfig.maxTokens}
                      onChange={(e) => setAIConfig({ ...aiConfig, maxTokens: parseInt(e.target.value) })}
                      className="bg-slate-800/60 border-slate-700 text-slate-200 focus:border-amber-500 h-9"
                    />
                    <p className="text-xs text-slate-400">Maximum response length</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-slate-200 font-medium">Performance Tips</h3>
                  <div className="space-y-3 text-sm text-slate-300">
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <p className="font-medium text-amber-400">🚀 DeepSeek Models</p>
                      <p className="text-xs mt-1">Free models with good performance for RPG scenarios</p>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <p className="font-medium text-emerald-400">⚡ Temperature Guide</p>
                      <p className="text-xs mt-1">0.7 = balanced, 1.0+ = creative stories</p>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <p className="font-medium text-orange-400">🎯 Token Limit</p>
                      <p className="text-xs mt-1">2000-4000 for detailed responses</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'test' && (
              <div className="flex flex-col h-full">
                <div className="space-y-4 flex-1">
                  <h3 className="text-slate-200 font-medium">Connection Test</h3>
                  
                  <Button
                    onClick={handleTestConnection}
                    disabled={isTestingConnection || !aiConfig.apiKey}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white disabled:opacity-50 h-12 rounded-xl font-medium"
                  >
                    {isTestingConnection ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Testing Connection...
                      </div>
                    ) : (
                      '🚀 Test AI Connection'
                    )}
                  </Button>
                  
                  {testResult && (
                    <div className={`p-4 rounded-lg text-sm flex-1 overflow-auto ${
                      testResult.startsWith('✅') 
                        ? 'bg-green-900/50 text-green-300 border border-green-700' 
                        : 'bg-red-900/50 text-red-300 border border-red-700'
                    }`}>
                      {testResult}
                    </div>
                  )}

                  {!testResult && (
                    <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700 text-slate-300 text-sm">
                      <p className="font-medium mb-2">Test will verify:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• API key validity</li>
                        <li>• Model accessibility</li>
                        <li>• Response generation</li>
                        <li>• Custom endpoint (if applicable)</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
