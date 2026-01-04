// Configuration for the application

export const GEMINI_API_KEY = process.env.API_KEY || '';

// Model Constants
export const IMAGE_MODEL_NAME = 'gemini-2.5-flash-image'; 
export const TEXT_MODEL_NAME = 'gemini-3-flash-preview';

export const STYLES: Record<string, { label: string; prefix: string; suffix: string }> = {
  '3d': {
    label: '3D (Apple Style)',
    prefix: "Create a high-quality, 3D, Apple-style emoji icon representing: ",
    suffix: ". Isolated on a pure white background, soft lighting, glossy finish, minimalist design."
  },
  'flat': {
    label: 'Flat Design',
    prefix: "Create a flat, 2D vector art style emoji icon representing: ",
    suffix: ". Minimalist, solid colors, thick outlines, sticker style, white background."
  },
  'pixel': {
    label: 'Pixel Art',
    prefix: "Create a pixel art style emoji icon representing: ",
    suffix: ". 16-bit, retro game style, crisp edges, limited color palette, white background."
  },
  'clay': {
    label: 'Clay / Plasticine',
    prefix: "Create a claymation style emoji icon representing: ",
    suffix: ". Plasticine texture, soft rounded edges, handcrafted look, stop-motion aesthetic, white background."
  },
  'vaporwave': {
    label: 'Vaporwave',
    prefix: "Create a vaporwave aesthetic emoji icon representing: ",
    suffix: ". Neon pink and purple color palette, glitch effects, retro 80s grid background, statue bust aesthetic, nostalgic."
  },
  'sticker': {
    label: 'Sticker Pack',
    prefix: "Create a die-cut sticker style emoji icon representing: ",
    suffix: ". Thick white border, subtle drop shadow, glossy vinyl texture, vibrant colors, isolated on white."
  }
};

export const APP_CONFIG = {
  maxHistory: 10,
  defaultStyle: '3d',
};