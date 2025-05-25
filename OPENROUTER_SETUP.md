# Mythic Maker - OpenRouter Setup Guide

## Overview
Mythic Maker now uses OpenRouter API to access various AI models including DeepSeek V3, Claude, GPT-4, and more for character generation and image creation.

## Getting Started

### 1. Get an OpenRouter API Key
1. Visit [OpenRouter](https://openrouter.ai/)
2. Sign up for an account
3. Go to [API Keys](https://openrouter.ai/keys)
4. Create a new API key
5. Copy your API key (keep it secure!)

### 2. Configure the Application
1. Run the application with `npm run dev`
2. Click the "⚙️ Settings" button in the top-right corner
3. Paste your OpenRouter API key
4. Select your preferred models:
   - **Text Model**: DeepSeek V3 Chat (recommended for character generation)
   - **Image Model**: FLUX 1.1 Pro (recommended for character art)
5. Click "Save Settings"

### 3. Available Models

#### Text Generation Models
- **DeepSeek V3 Chat** - Excellent for creative character generation
- **DeepSeek V3 Coder** - Good for structured character data
- **Claude 3.5 Sonnet** - High-quality creative writing
- **GPT-4o** - OpenAI's latest model
- **Llama 3.1 70B** - Open-source alternative

#### Image Generation Models
- **FLUX 1.1 Pro** - High-quality fantasy art generation
- **Stable Diffusion 3.5** - Great for character portraits
- **DALL-E 3** - OpenAI's image model
- **Midjourney** - Artistic character designs

### 4. Using the Application
1. Ensure your API is configured (green checkmark in settings)
2. Select character gender (Male/Female)
3. Enter a character class (e.g., "wizard", "rogue", "paladin")
4. Click "Generate Character" to create stats, appearance, personality, and backstory
5. Click "Generate Images" to create character artwork

### 5. Cost Information
- OpenRouter charges per API call
- Text generation: ~$0.001-0.01 per character
- Image generation: ~$0.05-0.20 per image set
- Check [OpenRouter pricing](https://openrouter.ai/docs#models) for current rates

### 6. Troubleshooting

#### "Please configure your API settings first"
- Make sure you've entered a valid OpenRouter API key
- Check that you've clicked "Save Settings"

#### "API request failed"
- Verify your API key is correct
- Check you have sufficient credits in your OpenRouter account
- Try a different model if one is experiencing issues

#### Images not generating
- Some image models may be temporarily unavailable
- Try switching to a different image model in settings
- Ensure your API key has image generation permissions

### 7. Security Notes
- API keys are stored locally in your browser
- Never share your API key with others
- You can clear settings at any time using the "Clear Settings" button

## Features

### Enhanced Character Generation
- Structured character profiles with sections for appearance, personality, backstory, and stats
- Formatted stat displays with visual indicators
- Error handling with retry options

### Model Flexibility
- Switch between different AI models for varied results
- Separate models for text and image generation
- Support for latest AI models through OpenRouter

### Improved UI
- Settings modal for easy configuration
- Error messages with retry functionality
- Visual feedback for API configuration status

Enjoy creating epic fantasy characters with AI!
