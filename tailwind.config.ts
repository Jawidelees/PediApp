import type { Config } from 'tailwindcss';

const config: Config = {
    darkMode: ['class'],
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Clínica Pediátrica Brand — Sky Blue & Navy Palette
                brand: {
                    50: '#f4f6f8',
                    100: '#e3e8f0',
                    200: '#c5d0e0',
                    300: '#99acc7',
                    400: '#6882a9',
                    500: '#47638d',
                    600: '#384d72',
                    700: '#2e3e5c',
                    800: '#28344e',
                    900: '#1e243b', // Deep Navy Blue
                    950: '#141726',
                },
                // Stitch UI Colors
                primary: {
                    DEFAULT: '#13a4ec',
                    50: '#eff9fd',
                    100: '#dff1fa',
                    200: '#b8e3f6',
                    300: '#7eceef',
                    400: '#3eb3e6',
                    500: '#13a4ec',
                    600: '#0883c5',
                    700: '#0769a1',
                    800: '#095885',
                    900: '#0d496e',
                },
                background: {
                    light: '#f6f7f8',
                    dark: '#101c22',
                },
                gold: {
                    50: '#fdfaee',
                    100: '#fbf3d3',
                    200: '#f6e4a6',
                    300: '#f1d070',
                    400: '#ebba42',
                    500: '#e3a11e',
                    600: '#c87c15', // Mustard Gold
                    700: '#a65b14',
                    800: '#874616',
                    900: '#703915',
                    950: '#411c07',
                },
                // Accent — Warm for CTAs
                accent: {
                    50: '#fff8f1',
                    100: '#feecdc',
                    200: '#fcd9bd',
                    300: '#fdba8c',
                    400: '#ff8a4c',
                    500: '#ff6b2b',
                    600: '#e8590c',
                    700: '#c2410c',
                    800: '#9a3412',
                    900: '#7c2d12',
                },
                // Surfaces
                surface: {
                    50: '#fafbfc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    700: '#1e293b',
                    800: '#0f172a',
                    900: '#0b1120',
                    950: '#060a14',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            borderRadius: {
                lg: '0.75rem',
                xl: '1rem',
                '2xl': '1.25rem',
            },
            boxShadow: {
                'glow': '0 0 20px rgba(227, 161, 30, 0.15)', // gold-500 hover glow
                'glow-lg': '0 0 40px rgba(227, 161, 30, 0.2)',
                'card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
                'card-hover': '0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.05)',
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-in-right': {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                'slide-in-left': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                'scale-in': {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                shimmer: {
                    '100%': { transform: 'translateX(100%)' },
                },
                pulse: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' },
                },
            },
            animation: {
                'fade-in': 'fade-in 0.5s ease-out',
                'slide-in-right': 'slide-in-right 0.3s ease-out',
                'slide-in-left': 'slide-in-left 0.3s ease-out',
                'scale-in': 'scale-in 0.2s ease-out',
                shimmer: 'shimmer 2s infinite',
                pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
        },
    },
    plugins: [require('tailwindcss-animate')],
};

export default config;
