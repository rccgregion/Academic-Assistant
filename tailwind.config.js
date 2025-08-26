/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { 
          DEFAULT: 'hsl(217, 91%, 60%)', 
          foreground: 'hsl(0, 0%, 100%)'
        },
        secondary: { 
          DEFAULT: 'hsl(160, 70%, 45%)', 
          foreground: 'hsl(0, 0%, 100%)'
        },
        background: 'hsl(216, 50%, 98%)', // Lighter, cooler grey
        foreground: 'hsl(215, 28%, 17%)', 
        card: 'hsl(0, 0%, 100%)',         
        'card-foreground': 'hsl(215, 28%, 17%)', 
        muted: 'hsl(210, 40%, 94%)',      
        'muted-foreground': 'hsl(215, 20%, 65%)', 
        accent: { 
          DEFAULT: 'hsl(217, 91%, 60%)', 
          foreground: 'hsl(0, 0%, 100%)'
        },
        destructive: {
          DEFAULT: 'hsl(0, 84%, 60%)', 
          foreground: 'hsl(0, 0%, 100%)'
        },
        border: 'hsl(210, 30%, 88%)',      
        input: 'hsl(210, 30%, 92%)',       
        ring: 'hsl(217, 91%, 60%)',        

        // Refined Dark Mode Palette
        'dark-background': 'hsl(222, 47%, 12%)', // Deep Slate
        'dark-foreground': 'hsl(210, 40%, 96%)', 
        'dark-card': 'hsl(222, 45%, 16%)',      
        'dark-card-foreground': 'hsl(210, 40%, 96%)', 
        'dark-muted': 'hsl(222, 40%, 22%)',      
        'dark-muted-foreground': 'hsl(210, 25%, 75%)', 
        'dark-border': 'hsl(222, 30%, 28%)',   
        'dark-input': 'hsl(222, 30%, 25%)',    
        'dark-ring': 'hsl(217, 80%, 65%)',
        
        'dark-primary': {
          DEFAULT: 'hsl(217, 80%, 65%)', 
          foreground: 'hsl(217, 20%, 15%)' 
        },
        'dark-secondary': {
          DEFAULT: 'hsl(160, 60%, 50%)', 
          foreground: 'hsl(160, 20%, 10%)' 
        } 
      }, 
      fontFamily: {
        sans: ['Inter', 'sans-serif'] 
      },
      borderRadius: {
        DEFAULT: '0.75rem', 
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem', 
        xl: '1rem',
        full: '9999px'
      },
      boxShadow: { 
        'subtle': '0 1px 2px 0 hsla(0, 0%, 0%, 0.03)',
        'DEFAULT': '0 1px 3px 0 hsla(0, 0%, 0%, 0.07), 0 1px 2px 0 hsla(0, 0%, 0%, 0.04)', 
        'md': '0 4px 6px -1px hsla(0, 0%, 0%, 0.07), 0 2px 4px -1px hsla(0, 0%, 0%, 0.04)', 
        'lg': '0 10px 15px -3px hsla(0, 0%, 0%, 0.07), 0 4px 6px -2px hsla(0, 0%, 0%, 0.03)', 
        'xl': '0 20px 25px -5px hsla(0, 0%, 0%, 0.07), 0 10px 10px -5px hsla(0, 0%, 0%, 0.02)', 
        '2xl': '0 25px 50px -12px hsla(0, 0%, 0%, 0.15)',
        'inner-sm': 'inset 0 1px 2px 0 hsla(0,0%,0%,0.05)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
       keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        gradientPan: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        },
        blobFloat1: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        blobFloat2: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(-40px, 60px) scale(1.1)' },
          '66%': { transform: 'translate(30px, -20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        scaleIn: 'scaleIn 0.2s ease-out forwards',
        gradientPan: 'gradientPan 15s ease infinite',
        blobFloat1: 'blobFloat1 20s infinite ease-in-out',
        blobFloat2: 'blobFloat2 30s infinite ease-in-out',
      }
    }
  },
  plugins: [],
}