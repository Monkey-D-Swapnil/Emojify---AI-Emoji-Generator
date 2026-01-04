export type EmojiStyle = '3d' | 'flat' | 'pixel' | 'clay' | 'vaporwave' | 'sticker';

export interface EmojiResult {
  id: string;
  prompt: string;
  style: EmojiStyle;
  imageUrl?: string;
  combos?: string[];
  timestamp: number;
  isLoading?: boolean;
  error?: string;
}

export interface GenerateResponse {
  imageUrl?: string;
  combos: string[];
}

export type GenerationMode = 'image' | 'combo' | 'both';

export type ImageFilter = 'none' | 'grayscale' | 'sepia' | 'contrast';