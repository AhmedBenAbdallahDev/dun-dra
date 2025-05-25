# Mythic Maker - AI-Powered Fantasy Character Generator

This is a [Next.js](https://nextjs.org/) project that generates fantasy RPG characters using AI models through OpenRouter API.

## ✨ Features

- **AI Character Generation**: Create detailed RPG characters with names, stats, appearance, personality, and backstories
- **Multiple AI Models**: Support for DeepSeek V3, Claude, GPT-4, Llama, and more via OpenRouter
- **Character Artwork**: Generate fantasy character portraits using FLUX, Stable Diffusion, DALL-E, or Midjourney
- **Medieval Fantasy Theme**: Beautiful UI with custom fonts and medieval styling
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ and npm
- OpenRouter API key ([Get one here](https://openrouter.ai/keys))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mythic-maker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser

### Setup
1. Click the "⚙️ Settings" button
2. Enter your OpenRouter API key
3. Select your preferred AI models
4. Start generating characters!

## 🎮 How to Use

1. **Configure API**: Set up your OpenRouter API key and select models
2. **Choose Gender**: Select male or female character
3. **Enter Class**: Type a character class (wizard, rogue, paladin, etc.)
4. **Generate**: Create your character with AI
5. **Create Art**: Generate character portraits (optional)

## 🤖 Supported AI Models

### Text Generation
- DeepSeek V3 Chat (Recommended)
- Claude 3.5 Sonnet
- GPT-4o
- Llama 3.1 70B
- Qwen 2.5 72B

### Image Generation
- FLUX 1.1 Pro (Recommended)
- Stable Diffusion 3.5 Large
- DALL-E 3
- Midjourney

## 📖 Documentation

- [OpenRouter Setup Guide](./OPENROUTER_SETUP.md) - Detailed setup instructions
- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API

## 🛠️ Tech Stack

- **Frontend**: React.js, Next.js 13
- **AI Integration**: OpenRouter API
- **Styling**: CSS Modules
- **Fonts**: Custom medieval fonts

## 💰 Costs

Using OpenRouter API incurs small costs:
- Text generation: ~$0.001-0.01 per character
- Image generation: ~$0.05-0.20 per image set

Check [OpenRouter pricing](https://openrouter.ai/docs#models) for current rates.

## 🚀 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
