import React, { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { generateEmojiImage, generateEmojiCombos } from './services/geminiService';
import { EmojiResult, EmojiStyle } from './types';
import { STYLES } from './config';
import EmojiDisplay from './components/EmojiDisplay';
import ImageEditor from './components/ImageEditor';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<EmojiStyle>('3d');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false); // Controls Editor Modal
  
  const [currentResult, setCurrentResult] = useState<EmojiResult | null>(null);
  const [history, setHistory] = useState<EmojiResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Image too large. Please upload an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setIsEditing(true); // Open editor immediately after upload
        setErrorMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEditorSave = (processedImage: string) => {
    setUploadedImage(processedImage);
    setIsEditing(false);
  };

  const handleEditorCancel = () => {
    setIsEditing(false);
  };

  const executeGeneration = async () => {
      setErrorMessage(null);
      const newId = uuidv4();
      setIsGenerating(true);
      
      const loadingState: EmojiResult = {
        id: newId,
        prompt: prompt || "Image Variation",
        style: selectedStyle,
        timestamp: Date.now(),
        isLoading: true
      };
      setCurrentResult(loadingState);
  
      try {
        const [imageUrl, combos] = await Promise.all([
          generateEmojiImage(prompt, selectedStyle, uploadedImage || undefined),
          generateEmojiCombos(prompt || "Visual emoji")
        ]);
  
        const finalResult: EmojiResult = {
          id: newId,
          prompt: prompt || "Image Variation",
          style: selectedStyle,
          imageUrl,
          combos,
          timestamp: Date.now(),
          isLoading: false
        };
  
        setCurrentResult(finalResult);
        setHistory(prev => [finalResult, ...prev].slice(0, 8));
      } catch (error: any) {
        console.error(error);
        const errorMsg = error.message || "Failed to generate emoji. Please try again.";
        setErrorMessage(errorMsg);
        setCurrentResult({
          ...loadingState,
          isLoading: false,
          error: errorMsg
        });
      } finally {
        setIsGenerating(false);
      }
  };

  const handleGenerate = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!prompt.trim() && !uploadedImage) || isGenerating) return;
    executeGeneration();
  }, [prompt, uploadedImage, isGenerating, selectedStyle]);

  // Retry Wrapper
  const handleRetry = useCallback(() => {
    executeGeneration();
  }, [prompt, uploadedImage, selectedStyle]);

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const restoreFromHistory = (item: EmojiResult) => {
    setCurrentResult(item);
    setPrompt(item.prompt);
    setSelectedStyle(item.style);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Editor Modal */}
      {isEditing && uploadedImage && (
          <ImageEditor 
            imageSrc={uploadedImage} 
            onCancel={handleEditorCancel} 
            onSave={handleEditorSave} 
          />
      )}

      {/* Navigation / Header */}
      <nav className="w-full bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-5xl mx-auto px-6 py-3 flex justify-between items-center">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="relative w-10 h-10 rounded-[10px] bg-gradient-to-br from-gray-900 to-gray-700 shadow-md flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105 duration-300 border border-white/10">
                {/* The Logo Concept: Spaceship + Sunglasses inside an App Icon shape */}
                <div className="text-xl transform -translate-y-[1px] translate-x-[1px] relative z-10">
                    🚀
                </div>
                <div className="absolute text-[10px] z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-0.5 ml-0.5 opacity-90">
                    🕶️
                </div>
                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50 pointer-events-none"></div>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Emojify</h1>
          </div>

          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-md tracking-wide">BETA 1.2</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-16 pb-32">
        
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-6 animate-pop-in">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight text-gray-900">
            Turn ideas into <br />
            <span className="text-gradient">memorable icons.</span>
          </h2>
          <p className="text-xl text-gray-500 max-w-xl mx-auto font-normal leading-relaxed">
            Create custom Apple-style emojis and stickers from text descriptions or photos using Gemini AI.
          </p>
        </div>

        {/* Input Section */}
        <div className="relative max-w-2xl mx-auto mb-12 animate-slide-up">
          <form onSubmit={handleGenerate} className="flex flex-col gap-5">
            
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-[20px] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative flex items-center bg-white rounded-[18px] shadow-sm ring-1 ring-gray-200 transition-shadow focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:shadow-md">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your emoji (e.g., 'Cyberpunk cat')"
                  className="w-full pl-6 pr-32 py-5 bg-transparent border-none rounded-[18px] focus:ring-0 text-lg font-medium placeholder-gray-400 text-gray-900"
                  disabled={isGenerating}
                />
                <div className="absolute right-2 top-2 bottom-2">
                    <button
                    type="submit"
                    disabled={(!prompt.trim() && !uploadedImage) || isGenerating}
                    className={`h-full px-6 rounded-xl font-semibold text-white transition-all transform active:scale-95 flex items-center justify-center ${
                        (!prompt.trim() && !uploadedImage) || isGenerating
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-black hover:bg-gray-800 shadow-md'
                    }`}
                    >
                    {isGenerating ? (
                        <svg className="animate-spin h-5 w-5 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        'Generate'
                    )}
                    </button>
                </div>
              </div>
            </div>

            {/* Controls Row: Style Selector & Photo Upload */}
            <div className="flex flex-wrap gap-4 justify-between items-center px-1">
              
              {/* Style Selector */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider text-[11px]">Style</span>
                <div className="relative">
                    <select 
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value as EmojiStyle)}
                    className="appearance-none bg-white pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-sm hover:border-gray-300 transition-colors"
                    disabled={isGenerating}
                    >
                    {Object.entries(STYLES).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                    ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
              </div>

              {/* Upload Photo Button */}
              <div className="flex items-center gap-3">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/webp" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                  id="image-upload"
                />
                {uploadedImage ? (
                  <div className="flex items-center gap-3 bg-white pl-2 pr-4 py-2 rounded-xl border border-blue-100 shadow-sm ring-2 ring-blue-50/50">
                    <img src={uploadedImage} alt="Upload preview" className="w-8 h-8 rounded-lg object-cover border border-gray-100" />
                    <div className="flex flex-col">
                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider leading-none mb-0.5">Photo Added</span>
                        <div className="flex gap-2">
                            <button 
                                type="button" 
                                onClick={() => setIsEditing(true)}
                                className="text-xs text-gray-500 font-medium hover:text-gray-900 transition-colors"
                            >
                                Edit
                            </button>
                            <button 
                                type="button" 
                                onClick={removeUploadedImage}
                                className="text-xs text-red-500 font-medium hover:text-red-700 transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                  </div>
                ) : (
                  <label 
                    htmlFor="image-upload" 
                    className="flex items-center gap-2 cursor-pointer bg-transparent hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm rounded-xl px-4 py-2.5 text-gray-500 hover:text-gray-900 transition-all text-sm font-semibold group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:scale-110 transition-transform text-gray-400 group-hover:text-blue-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    Use Photo
                  </label>
                )}
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center justify-between animate-pop-in border border-red-100">
                <div className="flex items-center gap-2 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    {errorMessage}
                </div>
                <button 
                    onClick={handleRetry}
                    className="ml-4 text-xs font-bold uppercase bg-white border border-red-100 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors text-red-600 shadow-sm"
                >
                    Retry
                </button>
              </div>
            )}
            
          </form>
        </div>

        {/* Results Area */}
        <div className="mb-20">
          <EmojiDisplay 
            result={currentResult} 
            onDownload={handleDownload} 
            onRetry={handleRetry} 
          />
        </div>

        {/* History / Recents */}
        {history.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-6">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Recent Creations</h3>
                <div className="h-px bg-gray-200 flex-grow"></div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => restoreFromHistory(item)}
                  className={`group relative bg-white p-2 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer duration-300 ${currentResult?.id === item.id ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:-translate-y-1'}`}
                >
                  <div className="aspect-square rounded-xl bg-gray-50 mb-2 overflow-hidden flex items-center justify-center relative">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.prompt} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                    ) : item.error ? (
                       <span className="text-2xl opacity-50">⚠️</span>
                    ) : (
                      <span className="text-3xl">{item.combos?.[0] || '❓'}</span>
                    )}
                    {/* Style Badge */}
                    <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm text-white text-[8px] px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.style}
                    </div>
                  </div>
                  <p className="text-[10px] font-semibold text-gray-500 truncate px-1 text-center group-hover:text-blue-600 transition-colors">{item.prompt}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Simple Footer */}
      <footer className="text-center py-8 text-gray-400 text-xs font-medium border-t border-gray-100 bg-white/50 backdrop-blur-sm">
        <p>© 2025 Emojify Inc. Crafted with <span className="text-red-400">♥</span> and AI.</p>
      </footer>
    </div>
  );
};

export default App;