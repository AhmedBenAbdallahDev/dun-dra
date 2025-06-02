import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
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
    }    const body = {
      model: actualModel,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', errorText);
      return NextResponse.json(
        { error: `AI API request failed: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract the response content
    const content = data.choices?.[0]?.message?.content || '';
    
    return NextResponse.json({ content });

  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
