import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let currentProvider = 'unknown';
  try {
    const { messages, config } = await request.json();    // Get AI configuration
    const {
      provider = 'openrouter',
      apiKey = '',
      baseURL = 'https://openrouter.ai/api/v1',
      model = 'meta-llama/llama-3.1-8b-instruct:free',
      useCustomModel = false,
      customModelName = ''
    } = config || {};
    
    currentProvider = provider;
    
    // Use custom model name if enabled
    const actualModel = useCustomModel && customModelName ? customModelName : model;

    if (!apiKey && provider !== 'local') {
      return NextResponse.json(
        { error: 'API key is required for external providers' },
        { status: 400 }
      );
    }

    let url = baseURL;    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Configure based on provider
    switch (provider) {
      case 'openrouter':
        url = `${baseURL}/chat/completions`;
        headers['Authorization'] = `Bearer ${apiKey}`;
        headers['HTTP-Referer'] = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        headers['X-Title'] = 'Mythic Conjurer';
        break;
      
      case 'openai':
        url = `${baseURL}/chat/completions`;
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      
      case 'groq':
        url = `${baseURL}/chat/completions`;
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      
      case 'gemini':
        // Gemini uses a different API structure
        url = `${baseURL}/models/${actualModel}:generateContent?key=${apiKey}`;
        delete headers['Authorization']; // Gemini uses key in URL
        break;
      
      case 'local':
        url = `${baseURL}/api/chat`;
        break;
      
      case 'custom':
        url = `${baseURL}/chat/completions`;
        if (apiKey) {
          headers['Authorization'] = `Bearer ${apiKey}`;
        }
        break;
      
      default:
        return NextResponse.json(
          { error: 'Unsupported AI provider' },
          { status: 400 }
        );
    }    let body: any;
    
    if (provider === 'gemini') {
      // Gemini API format
      body = {
        contents: [{
          parts: [{
            text: messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n')
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
        model: actualModel
      });
      return NextResponse.json(
        { 
          error: `${provider} API request failed: ${response.statusText}`,
          details: errorText,
          provider,
          model: actualModel
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
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
      // OpenAI-compatible response format
      content = data.choices?.[0]?.message?.content || '';
      if (!content) {
        console.error(`${provider} API response missing content:`, data);
        throw new Error(`${provider} API response format error`);
      }
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
