# Emojify 🚀🕶️

**Turn ideas into memorable icons.**

Emojify is a modern web application that uses Gemini AI to generate custom, Apple-style emojis and stickers from text descriptions or uploaded photos. Whether you need a specific icon for a project or just want to visualize "a cyberpunk cat eating a taco," Emojify makes it happen in seconds.

## ✨ Features

- **Text-to-Emoji**: Generate high-quality emojis from simple text prompts.
- **Image Remixing**: Upload your own photos, crop/edit them, and transform them into emojis.
- **Built-in Image Editor**: Crop, rotate, zoom, and apply filters (Grayscale, Sepia, Contrast) before generation.
- **Multiple Art Styles**:
  - 🍎 **3D (Apple Style)**: Glossy, high-quality, minimalist.
  - 🎨 **Flat Design**: Vector art style.
  - 👾 **Pixel Art**: Retro 16-bit aesthetic.
  - 🧱 **Clay**: Plasticine/Stop-motion look.
  - 📼 **Vaporwave**: Neon, glitch, and retro 80s vibes.
  - 🏷️ **Sticker Pack**: Die-cut vinyl look with white borders.
- **Smart Combos**: Generates creative Unicode emoji combinations matching your prompt.
- **History**: Keeps track of your recent creations for easy access.
- **Responsive UI**: A polished, Apple-inspired interface built with Tailwind CSS.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI Model**: Gemini API (`gemini-2.5-flash-image` & `gemini-3-flash-preview`)
- **Image Processing**: HTML5 Canvas, `react-easy-crop`
- **Build**: Vite (Recommended) / ES Modules

## 🚀 Getting Started

### Prerequisites

- Node.js installed.
- A **Google Gemini API Key**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/emojify.git
   cd emojify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key**
   Create a `.env` file in the root directory (do not commit this file):
   ```bash
   API_KEY=your_actual_api_key_here
   ```

4. **Run the app**
   ```bash
   npm run dev
   ```

## 🔒 Security Note

This project uses `process.env.API_KEY` to access the Google Gemini API. **Never commit your `.env` file to GitHub.** Ensure `.env` is listed in your `.gitignore` file.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
