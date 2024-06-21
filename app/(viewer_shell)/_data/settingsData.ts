export const fontVariants: { [key: string]: string } = {
  default: "",
  sans: "font-sans",
  serif: "font-serif",
  mono: "font-mono",
  cursive: "font-[cursive]",
  fantasy: "font-[fantasy]",
};

export const fontSizeVariants: { [key: string]: string } = {
  "12": "text-xs",
  "14": "text-sm",
  "16": "",
  "18": "text-lg",
  "20": "text-xl",
  "24": "text-2xl",
  "30": "text-3xl",
  "36": "text-4xl",
};

export const themeVariants: { [key: string]: string } = {
  system: "bg-background text-foreground",
  light: "bg-white text-[hsl(240,10%,3.9%)]",
  dark: "bg-[hsl(20,14.3%,4.1%)] text-[hsl(0,0%,95%)]",
  sepia: "bg-yellow-100 text-yellow-900",
  retro: "bg-amber-200 text-green-800",
  night: "bg-gray-800 text-gray-300",
};
