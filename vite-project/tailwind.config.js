/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Bangers", "cursive"],
        body: ["DM Sans", "sans-serif"],
      },

      colors: {
        uno: {
          red: "#E8001C",
          blue: "#0066CC",
          green: "#00A550",
          yellow: "#FFD700",
          black: "#1A1A2E",
        },
        arena: {
          bg: "#0D0D1A",
          surface: "#16213E",
          card: "#1A2550",
          border: "#2A3A6A",
          glow: "#4A6CF7",
        },
      },

      animation: {
        float: "float 3s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "card-flip": "cardFlip 0.4s ease-in-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "slide-in": "slideIn 0.3s ease-out",
        shake: "shake 0.4s ease-in-out",
        "spin-slow": "spin 3s linear infinite",
        "bounce-card": "bounceCard 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        deal: "deal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
      },

      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(74, 108, 247, 0.4)" },
          "50%": { boxShadow: "0 0 40px rgba(74, 108, 247, 0.8)" },
        },
        cardFlip: {
          "0%": { transform: "rotateY(0deg)" },
          "50%": { transform: "rotateY(90deg)" },
          "100%": { transform: "rotateY(0deg)" },
        },
        slideUp: {
          "0%": { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        bounceCard: {
          "0%": { transform: "scale(0.8) translateY(20px)", opacity: "0" },
          "100%": { transform: "scale(1) translateY(0)", opacity: "1" },
        },
        deal: {
          "0%": {
            transform: "translateX(-100px) rotate(-20deg)",
            opacity: "0",
          },
          "100%": {
            transform: "translateX(0) rotate(0deg)",
            opacity: "1",
          },
        },
      },

      backgroundImage: {
        "arena-grid":
          "radial-gradient(circle at 1px 1px, rgba(74,108,247,0.15) 1px, transparent 0)",
        "card-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
      },

      backgroundSize: {
        grid: "40px 40px",
      },

      dropShadow: {
        card: "0 10px 30px rgba(0,0,0,0.5)",
        "glow-red": "0 0 20px rgba(232, 0, 28, 0.6)",
        "glow-blue": "0 0 20px rgba(0, 102, 204, 0.6)",
        "glow-green": "0 0 20px rgba(0, 165, 80, 0.6)",
        "glow-yellow": "0 0 20px rgba(255, 215, 0, 0.6)",
      },
    },
  },
  plugins: [],
};