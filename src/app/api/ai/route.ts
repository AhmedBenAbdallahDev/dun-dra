import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  role: string;
  content: string;
}

interface APIRequestBody {
  model?: string;
  messages?: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  contents?: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
  generationConfig?: {
    temperature: number;
    maxOutputTokens: number;
  };
}

interface APIResponseData {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export async function POST(request: NextRequest) {
  let currentProvider = 'unknown';
  try {
    const { messages, config } = await request.json();    
    
    // Get AI configuration with proper defaults
    const {
      provider = 'openrouter',
      apiKey = '',
      baseURL = '',  // Remove default, will be set based on provider
      model = 'openrouter/cypher-alpha:free',
      useCustomModel = false,
      customModelName = ''
    } = config || {};
    
    currentProvider = provider;
    
    // Get API key - use user provided key if available, otherwise fallback to environment variables
    const getAPIKey = () => {
      if (apiKey && apiKey.trim() !== '') {
        return apiKey; // Use user-provided key
      }
      
      // Fallback to environment variables based on provider
      switch (provider) {
        case 'openrouter':
          return process.env.OPENROUTER_API_KEY || '';
        case 'openai':
          return process.env.OPENAI_API_KEY || '';
        case 'groq':
          return process.env.GROQ_API_KEY || '';
        case 'gemini':
          return process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '';
        case 'custom':
          return process.env.CUSTOM_AI_API_KEY || '';
        default:
          return '';
      }
    };
    
    const finalApiKey = getAPIKey();
    
    // Use custom model name if enabled
    const actualModel = useCustomModel && customModelName ? customModelName : model;

    if (!finalApiKey && provider !== 'local') {
      return NextResponse.json(
        { 
          error: `API key is required for ${provider}. Please provide an API key or set the environment variable: ${provider.toUpperCase()}_API_KEY`,
          provider,
          envVar: `${provider.toUpperCase()}_API_KEY`
        },
        { status: 400 }
      );
    }

    // Determine the correct baseURL and endpoint based on provider
    let url = '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Configure based on provider with proper URLs
    switch (provider) {
      case 'openrouter':
        url = baseURL || 'https://openrouter.ai/api/v1';
        url = `${url}/chat/completions`;
        headers['Authorization'] = `Bearer ${finalApiKey}`;
        headers['HTTP-Referer'] = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        headers['X-Title'] = 'Mythic Conjurer';
        break;
      
      case 'openai':
        url = baseURL || 'https://api.openai.com/v1';
        url = `${url}/chat/completions`;
        headers['Authorization'] = `Bearer ${finalApiKey}`;
        break;
      
      case 'groq':
        url = baseURL || 'https://api.groq.com/openai/v1';
        url = `${url}/chat/completions`;
        headers['Authorization'] = `Bearer ${finalApiKey}`;
        console.log('🔥 Groq API Request:', { url, model: actualModel, hasKey: !!finalApiKey });
        break;
      
      case 'gemini':
        // Gemini uses a different API structure
        const geminiBaseURL = baseURL || 'https://generativelanguage.googleapis.com/v1beta';
        url = `${geminiBaseURL}/models/${actualModel}:generateContent?key=${finalApiKey}`;
        delete headers['Authorization']; // Gemini uses key in URL
        break;
      
      case 'local':
        url = baseURL || 'http://localhost:11434';
        url = `${url}/api/chat`;
        break;
      
      case 'custom':
        url = baseURL || 'https://api.openai.com/v1';
        url = `${url}/chat/completions`;
        if (finalApiKey) {
          headers['Authorization'] = `Bearer ${finalApiKey}`;
        }
        break;
      
      default:
        return NextResponse.json(
          { error: 'Unsupported AI provider' },
          { status: 400 }
        );
    }    let body: APIRequestBody;
    
    if (provider === 'gemini') {
      // Gemini API format
      body = {
        contents: [{
          parts: [{
            text: messages.map((msg: ChatMessage) => `${msg.role}: ${msg.content}`).join('\n\n')
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        }
      };
    } else {
      // OpenAI-compatible format for other providers
      body = {
        model: actualModel,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI API Error for ${provider}:`, {
        status: response.status,
        statusText: response.statusText,
        url,
        error: errorText,
        model: actualModel,
        headers: provider === 'groq' ? headers : 'hidden',
        body: provider === 'groq' ? body : 'hidden'
      });
      
      // Enhanced Groq-specific error reporting
      if (provider === 'groq') {
        console.error('🔥 GROQ DETAILED ERROR:', {
          requestUrl: url,
          requestHeaders: headers,
          requestBody: body,
          responseStatus: response.status,
          responseText: errorText,
          model: actualModel
        });
      }
      
      return NextResponse.json(
        { 
          error: `${provider} API request failed: ${response.statusText}`,
          details: errorText,
          provider,
          model: actualModel,
          debug: provider === 'groq' ? { url, status: response.status, body } : undefined
        },
        { status: response.status }
      );
    }

    const data: APIResponseData = await response.json();
    
    // Enhanced response debugging for Groq
    if (provider === 'groq') {
      console.log('🔥 GROQ RESPONSE SUCCESS:', {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length,
        firstChoice: data.choices?.[0],
        fullResponse: data
      });
    }
    
    // Extract the response content based on provider
    let content = '';
    if (provider === 'gemini') {
      // Gemini response format
      content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!content) {
        console.error('Gemini API response missing content:', data);
        throw new Error('Gemini API response format error');
      }
    } else {
      // OpenAI-compatible response format (includes Groq)
      content = data.choices?.[0]?.message?.content || '';
      if (!content) {
        console.error(`${provider} API response missing content:`, data);
        
        // Enhanced Groq debugging
        if (provider === 'groq') {
          console.error('🔥 GROQ CONTENT EXTRACTION FAILED:', {
            data,
            hasChoices: !!data.choices,
            choicesLength: data.choices?.length,
            firstChoice: data.choices?.[0],
            messageContent: data.choices?.[0]?.message?.content
          });
        }
        
        throw new Error(`${provider} API response format error - no content found`);
      }
    }
    
    // Final success log for Groq
    if (provider === 'groq') {
      console.log('🔥 GROQ SUCCESS - Content extracted:', content.substring(0, 100) + '...');
    }
    
    return NextResponse.json({ content });

  } catch (error) {
    console.error(`AI API Error for ${currentProvider}:`, error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        provider: currentProvider,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
