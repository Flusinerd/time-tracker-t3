import { type Config } from "tailwindcss";
import * as daisyui from "daisyui";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary-light": "#4de7a8",
        "primary-dark": "#009a5b",
        "secondary-light": "#72ece5",
        "secondary-dark": "#26a099",
        "accent-light": "#4dbdfe",
        "accent-dark": "#0070b1",
      }
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#00dc82",
          "secondary": "#36e4da",
          "secondary-light": "#72ece5",
          "secondary-dark": "#26a099",
          "accent": "#00A0FD",
          "accent-light": "#4dbdfe",
          "accent-dark": "#0070b1",
          "neutral": "#2b3136",
          "base-100": "#090a11",
          "info": "#91d1de",
          "success": "#13773b",
          "warning": "#cf7b0c",
          "error": "#ed5050",
        },
      },
    ],
  }
} satisfies Config;
