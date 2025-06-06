import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'medieval': ['serif'], // Fallback to serif for now
        'signika': ['system-ui', 'sans-serif'], // Use system fonts as fallback
      },
      height: {
        'game-panel': 'calc(50% - 0.5rem)', // For two panels in a column with gap
      }
    }
  },
}

export default config
