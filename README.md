# 🎮 Mythic Conjurer - AI-Powered Fantasy RPG

An immersive text-based fantasy RPG powered by AI, where your choices shape an ever-evolving adventure. Originally built in Svelte, now reimagined in Next.js with enhanced features and modern architecture.

![Mythic Conjurer](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.0-38bdf8)

## 🌟 Features

### 🎯 **Core Gameplay**
- **AI-Driven Storytelling**: Dynamic narratives that adapt to your choices
- **4 Character Classes**: Mage, Warrior, Rogue, and Archer with unique abilities
- **Strategic Combat**: Dice-based combat system with weapons and spells
- **Rich Inventory**: Weapons, spells, potions with detailed tooltips
- **Shop System**: Buy and sell items with dynamic pricing
- **Loot Collection**: Find treasures and magical items in your adventures

### 🎨 **Enhanced UI/UX**
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Map Navigation**: Quick travel to 6 different locations
- **Background Music**: Immersive audio controls (ready for audio files)
- **Fullscreen Mode**: Distraction-free gaming experience
- **Smooth Animations**: Polished transitions and visual feedback

### 🤖 **Advanced AI Integration**
- **Multi-Provider Support**: OpenRouter, OpenAI, Custom APIs, Local models
- **Intelligent Parsing**: Robust JSON response handling with fallbacks
- **Context Awareness**: AI remembers your character, inventory, and story progress
- **Error Recovery**: Graceful handling of API failures

### 💾 **Data Management**
- **Auto-Save**: Continuous progress preservation
- **Multiple Adventures**: Create and manage multiple characters
- **Cloud-Ready**: Easy export/import of game data
- **No Data Loss**: Robust persistence with Zustand

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Your AI API key (OpenRouter, OpenAI, or custom provider)

### Installation

```bash
# Clone the repository
git clone https://github.com/YourUsername/mythic-conjurer.git
cd mythic-conjurer

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start your adventure!

### First-Time Setup
1. Click **Settings** (gear icon) on the homepage
2. Configure your AI provider and API key
3. Click **Create New Adventure** 
4. Choose your character class and name
5. Begin your magical journey!

## 🎮 How to Play

### Character Creation
Choose from 4 balanced character classes:
- **🧙‍♂️ Mage**: 80 HP, 120 MP - Master of spells and elemental magic
- **⚔️ Warrior**: 120 HP, 60 MP - Powerful melee combat specialist  
- **🗡️ Rogue**: 100 HP, 80 MP - Agile fighter with balanced abilities
- **🏹 Archer**: 90 HP, 90 MP - Ranged combat expert

### Combat System
- Select weapons or spells from your inventory
- Throw dice to determine attack success
- Success depends on weapon damage and dice roll
- Manage HP and MP strategically

### Progression
- **Explore** different locations via the map
- **Shop** for better equipment and potions
- **Loot** treasures from defeated enemies
- **Choose** dialogue options that shape your story

## 🏗️ Technical Architecture

### Built With
- **⚡ Next.js 15**: React framework with App Router
- **🎨 Tailwind CSS**: Utility-first styling
- **📦 Zustand**: Lightweight state management with persistence  
- **🔤 TypeScript**: Type-safe development
- **🎯 Shadcn/ui**: Modern component library

### Project Structure
```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── ui/             # Reusable UI components  
│   ├── GamePanel.tsx   # Main inventory interface
│   ├── CombatUI.tsx    # Combat mechanics
│   ├── ShopUI.tsx      # Trading interface
│   └── ...
├── stores/             # Zustand state management
│   ├── gameStore.ts    # Game state, story, events
│   ├── characterStore.ts # HP, MP, inventory, spells
│   ├── adventureStore.ts # Multiple adventures
│   └── ...
├── lib/                # Utilities and game data
└── data/              # Game assets (weapons, spells, etc.)
```

## 🔧 Configuration

### AI Providers
Configure in Settings panel or via environment variables:

**OpenRouter (Recommended)**
- Get API key from [OpenRouter](https://openrouter.ai)
- Supports multiple models (GPT-4, Claude, Llama, etc.)
- Cost-effective with competitive pricing

**OpenAI**
- Direct OpenAI API integration
- Requires OpenAI API key
- Premium model access

**Groq**
- Ultra-fast inference speeds
- Get API key from [Groq Console](https://console.groq.com/keys)
- Supports Llama, Mixtral, and Gemma models

**Google Gemini**
- Google's latest AI models
- Get API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- Fast and capable responses

**Custom/Local**
- Bring your own API endpoint
- Local model support (Ollama, etc.)
- Complete control over AI backend

### Environment Variables
You can set API keys via environment variables (create `.env.local` file):
```bash
# AI Provider API Keys (optional - will fallback to user input)
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENAI_API_KEY=sk-your-openai-key-here
GROQ_API_KEY=gsk_your-groq-key-here
GEMINI_API_KEY=AIza-your-gemini-key-here
CUSTOM_AI_API_KEY=your-custom-key-here

# App configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Priority**: User-provided keys > Environment variables

Copy `.env.example` to `.env.local` and add your keys.

## 📱 Platform Support

- ✅ **Desktop**: Windows, macOS, Linux
- ✅ **Mobile**: iOS Safari, Android Chrome
- ✅ **Tablets**: iPad, Android tablets
- ✅ **Browsers**: Chrome, Firefox, Safari, Edge

## 🔄 Migration from Svelte

If migrating from the original Svelte version:
1. Export your character data from Svelte version
2. Install Next.js version 
3. Use the enhanced character creation to recreate characters
4. Enjoy the improved features and performance!

## 🤝 Contributing

Contributions are welcome! Areas for enhancement:
- Additional character classes
- New weapon types and spells
- Enhanced AI prompts
- UI/UX improvements
- Audio system integration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] **Audio Integration**: Background music and sound effects
- [ ] **Multiplayer**: Shared adventures with friends  
- [ ] **Campaign System**: Linked adventures with progression
- [ ] **Character Art**: AI-generated character portraits
- [ ] **Mod Support**: Custom content creation tools

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs via GitHub Issues
- **Discord**: Join our community for help and discussion

---

**Ready to embark on your magical journey? Your adventure awaits!** 🗡️✨
