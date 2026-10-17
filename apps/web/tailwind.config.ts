import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mentor: {
          bg: '#090a0f',
          surface: '#12141c',
          border: '#1f2433',
          accent: '#e69d00', // Gold / Amber
          danger: '#f43f5e', // Rose / Red
          success: '#10b981', // Emerald
          muted: '#8b949e',
        },
      },
    },
  },
  plugins: [],
};

export default config;
